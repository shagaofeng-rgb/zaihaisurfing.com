import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

test('local durable-store mutations serialize concurrent append and read-modify-write operations', async () => {
  const testDirectory = await fs.mkdtemp(path.join(os.tmpdir(), 'zaihai-store-test-'));
  process.env.COMMERCE_LOCAL_DATA_DIR = testDirectory;
  delete process.env.BLOB_READ_WRITE_TOKEN;
  delete process.env.KV_REST_API_URL;
  delete process.env.KV_REST_API_TOKEN;

  try {
    const {appendStoreLine, mutateStoreLines, mutateStoreObject, readStoreLines, readStoreObject, writeStoreObject} = await import('../src/lib/durableStore');
    await Promise.all(Array.from({length: 40}, (_, index) => appendStoreLine('events.jsonl', {index})));
    const events = await readStoreLines<{index: number}>('events.jsonl');
    assert.equal(events.length, 40);
    assert.equal(new Set(events.map((event) => event.index)).size, 40);

    await appendStoreLine('counter.jsonl', {value: 0});
    await Promise.all(Array.from({length: 20}, () => mutateStoreLines<{value: number}>('counter.jsonl', (values) => [
      {value: (values[0]?.value || 0) + 1}
    ])));
    assert.deepEqual(await readStoreLines('counter.jsonl'), [{value: 20}]);

    await writeStoreObject('counter.json', {value: 0});
    await Promise.all(Array.from({length: 20}, () => mutateStoreObject<{value: number}>('counter.json', (value) => ({
      value: (value?.value || 0) + 1
    }))));
    assert.deepEqual(await readStoreObject('counter.json'), {value: 20});
  } finally {
    await fs.rm(testDirectory, {recursive: true, force: true});
  }
});
