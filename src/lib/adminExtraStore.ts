import {appendStoreLine, mutateStoreLines, readStoreLines} from '@/lib/durableStore';

const PROMOTIONS_FILE = 'admin-promotions.jsonl';
const REVIEWS_FILE = 'admin-reviews.jsonl';
const AUDIT_FILE = 'admin-audit.jsonl';

export type PromotionRecord = {
  id: string;
  name: string;
  code: string;
  type: 'fixed' | 'percent' | 'quote_only';
  value: number;
  status: 'active' | 'paused' | 'expired';
  startsAt: string;
  endsAt: string;
  note: string;
  createdAt: string;
  updatedAt: string;
};

export type ReviewRecord = {
  id: string;
  productSlug: string;
  customerName: string;
  rating: number;
  content: string;
  status: 'pending' | 'published' | 'rejected';
  source: string;
  createdAt: string;
  updatedAt: string;
};

export type AuditRecord = {
  id: string;
  actor: string;
  action: string;
  target: string;
  detail: string;
  ip: string;
  createdAt: string;
};

export async function listPromotions() {
  return (await readStoreLines<PromotionRecord>(PROMOTIONS_FILE)).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function createPromotion(input: Omit<PromotionRecord, 'id' | 'createdAt' | 'updatedAt'>) {
  const now = new Date().toISOString();
  const record: PromotionRecord = {
    id: `promo-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    createdAt: now,
    updatedAt: now,
    ...input
  };
  await appendStoreLine(PROMOTIONS_FILE, record);
  return record;
}

export async function updatePromotionStatus(id: string, status: PromotionRecord['status']) {
  const now = new Date().toISOString();
  await mutateStoreLines<PromotionRecord>(PROMOTIONS_FILE, (records) => records.map((record) => (
    record.id === id ? {...record, status, updatedAt: now} : record
  )));
}

export async function listReviews() {
  return (await readStoreLines<ReviewRecord>(REVIEWS_FILE)).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function appendAuditLog(input: Omit<AuditRecord, 'id' | 'createdAt'>) {
  const record: AuditRecord = {
    id: `audit-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    ...input
  };
  await appendStoreLine(AUDIT_FILE, record);
  return record;
}

export async function listAuditLogs() {
  return (await readStoreLines<AuditRecord>(AUDIT_FILE)).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
