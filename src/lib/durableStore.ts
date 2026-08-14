import fs from 'node:fs/promises';
import path from 'node:path';
import {BlobNotFoundError, del, get, put} from '@vercel/blob';

type RedisResult<T> = {
  result?: T;
  error?: string;
};

const LOCAL_DATA_DIR = process.env.COMMERCE_LOCAL_DATA_DIR || (process.env.VERCEL ? path.join('/tmp', 'zaihai-commerce') : path.join(process.cwd(), '.data'));
const KV_URL = (process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || '').replace(/\/$/, '');
const KV_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || '';
const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN || '';
const STORE_PREFIX = process.env.COMMERCE_STORE_PREFIX || 'zaihai-commerce';

export function durableStoreConfigured() {
  return Boolean((KV_URL && KV_TOKEN) || BLOB_TOKEN);
}

export function durableStoreStatus() {
  return {
    configured: durableStoreConfigured(),
    provider: KV_URL && KV_TOKEN ? 'kv_rest' : BLOB_TOKEN ? 'vercel_blob' : process.env.VERCEL ? 'serverless_tmp_fallback' : 'local_file',
    storePrefix: STORE_PREFIX
  };
}

export function durableStoreHasDistributedLock() {
  return Boolean((KV_URL && KV_TOKEN) || BLOB_TOKEN);
}

function storeKey(fileName: string) {
  return `${STORE_PREFIX}:${fileName.replace(/[^a-zA-Z0-9._-]/g, '-')}`;
}

function localFile(fileName: string) {
  return path.join(LOCAL_DATA_DIR, fileName);
}

function blobPath(fileName: string) {
  return `${STORE_PREFIX}/${fileName.replace(/[^a-zA-Z0-9._/-]/g, '-')}`;
}

function safeJson<T>(value: string | null | undefined): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

async function kvPipeline<T>(commands: string[][]) {
  const response = await fetch(`${KV_URL}/pipeline`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${KV_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(commands),
    cache: 'no-store'
  });
  if (!response.ok) {
    throw new Error(`Durable store request failed: ${response.status}`);
  }
  const payload = await response.json() as RedisResult<T>[];
  const error = payload.find((item) => item.error)?.error;
  if (error) throw new Error(`Durable store command failed: ${error}`);
  return payload.map((item) => item.result);
}

type StoreLease = {token: string; expiresAt: number};

async function readBlobLease(fileName: string) {
  return safeJson<StoreLease>(await readBlobText(fileName));
}

async function createBlobLease(fileName: string, lease: StoreLease) {
  try {
    await put(blobPath(fileName), JSON.stringify(lease), {
      access: 'private',
      addRandomSuffix: false,
      allowOverwrite: false,
      contentType: 'application/json; charset=utf-8',
      cacheControlMaxAge: 60,
      token: BLOB_TOKEN
    });
    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (/already exists|conflict|overwrite|409/i.test(message)) return false;
    throw error;
  }
}

/** Durable lease used by scheduled jobs that may execute in parallel. */
export async function acquireStoreLock(name: string, token: string, ttlMs: number) {
  if (!durableStoreHasDistributedLock()) return false;
  if (BLOB_TOKEN && !(KV_URL && KV_TOKEN)) {
    const fileName = `lock-${name}.json`;
    const lease = {token, expiresAt: Date.now() + Math.max(1_000, Math.floor(ttlMs))};
    if (await createBlobLease(fileName, lease)) return true;

    const existing = await readBlobLease(fileName);
    if (!existing || existing.expiresAt > Date.now()) return false;
    await del(blobPath(fileName), {token: BLOB_TOKEN});
    return createBlobLease(fileName, lease);
  }
  const [result] = await kvPipeline<string | null>([[
    'SET',
    storeKey(`lock-${name}`),
    token,
    'NX',
    'PX',
    String(Math.max(1_000, Math.floor(ttlMs)))
  ]]);
  return result === 'OK';
}

export async function releaseStoreLock(name: string, token: string) {
  if (!durableStoreHasDistributedLock()) return false;
  if (BLOB_TOKEN && !(KV_URL && KV_TOKEN)) {
    const fileName = `lock-${name}.json`;
    const existing = await readBlobLease(fileName);
    if (existing?.token !== token) return false;
    await del(blobPath(fileName), {token: BLOB_TOKEN});
    return true;
  }
  const script = "if redis.call('get', KEYS[1]) == ARGV[1] then return redis.call('del', KEYS[1]) else return 0 end";
  const [result] = await kvPipeline<number>([['EVAL', script, '1', storeKey(`lock-${name}`), token]]);
  return Number(result) === 1;
}

async function readLocalLines<T>(fileName: string) {
  try {
    const text = await fs.readFile(localFile(fileName), 'utf8');
    return text.split(/\r?\n/).map((line) => safeJson<T>(line)).filter(Boolean) as T[];
  } catch {
    return [];
  }
}

async function readBlobText(fileName: string) {
  try {
    const result = await get(blobPath(fileName), {
      access: 'private',
      token: BLOB_TOKEN,
      useCache: false
    });
    if (!result || result.statusCode !== 200) return '';
    return await new Response(result.stream).text();
  } catch (error) {
    if (error instanceof BlobNotFoundError) return '';
    throw error;
  }
}

async function writeBlobText(fileName: string, text: string, contentType = 'text/plain; charset=utf-8') {
  await put(blobPath(fileName), text, {
    access: 'private',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType,
    cacheControlMaxAge: 60,
    token: BLOB_TOKEN
  });
}

async function writeLocalLines(fileName: string, values: unknown[]) {
  await fs.mkdir(LOCAL_DATA_DIR, {recursive: true});
  await fs.writeFile(localFile(fileName), `${values.map((value) => JSON.stringify(value)).join('\n')}${values.length ? '\n' : ''}`, 'utf8');
}

export async function appendStoreLine(fileName: string, value: unknown) {
  if (durableStoreConfigured()) {
    if (KV_URL && KV_TOKEN) {
      await kvPipeline([['RPUSH', storeKey(fileName), JSON.stringify(value)]]);
      return;
    }
    const current = await readBlobText(fileName);
    await writeBlobText(fileName, `${current}${JSON.stringify(value)}\n`);
    return;
  }
  await fs.mkdir(LOCAL_DATA_DIR, {recursive: true});
  await fs.appendFile(localFile(fileName), `${JSON.stringify(value)}\n`, 'utf8');
}

export async function readStoreLines<T>(fileName: string) {
  if (durableStoreConfigured()) {
    if (KV_URL && KV_TOKEN) {
      const [items] = await kvPipeline<string[]>([['LRANGE', storeKey(fileName), '0', '-1']]);
      return (Array.isArray(items) ? items : []).map((item) => safeJson<T>(item)).filter(Boolean) as T[];
    }
    return (await readBlobText(fileName)).split(/\r?\n/).map((line) => safeJson<T>(line)).filter(Boolean) as T[];
  }
  return readLocalLines<T>(fileName);
}

export async function writeStoreLines(fileName: string, values: unknown[]) {
  if (durableStoreConfigured()) {
    if (KV_URL && KV_TOKEN) {
      const key = storeKey(fileName);
      const commands = values.length
        ? [['DEL', key], ['RPUSH', key, ...values.map((value) => JSON.stringify(value))]]
        : [['DEL', key]];
      await kvPipeline(commands);
      return;
    }
    await writeBlobText(fileName, `${values.map((value) => JSON.stringify(value)).join('\n')}${values.length ? '\n' : ''}`);
    return;
  }
  await writeLocalLines(fileName, values);
}

export async function readStoreObject<T>(fileName: string) {
  if (durableStoreConfigured()) {
    if (KV_URL && KV_TOKEN) {
      const [value] = await kvPipeline<string | null>([['GET', storeKey(fileName)]]);
      return safeJson<T>(value);
    }
    return safeJson<T>(await readBlobText(fileName));
  }
  try {
    return JSON.parse(await fs.readFile(localFile(fileName), 'utf8')) as T;
  } catch {
    return null;
  }
}

export async function writeStoreObject(fileName: string, value: unknown) {
  if (durableStoreConfigured()) {
    if (KV_URL && KV_TOKEN) {
      await kvPipeline([['SET', storeKey(fileName), JSON.stringify(value)]]);
      return;
    }
    await writeBlobText(fileName, JSON.stringify(value, null, 2), 'application/json; charset=utf-8');
    return;
  }
  await fs.mkdir(LOCAL_DATA_DIR, {recursive: true});
  await fs.writeFile(localFile(fileName), JSON.stringify(value, null, 2), 'utf8');
}
