const fieldLimits = {
  name: 120,
  email: 160,
  phone: 80,
  country: 120,
  company: 160,
  buyerType: 120,
  product: 160,
  quantity: 80,
  targetMarket: 160,
  waterArea: 160,
  oem: 200,
  destinationPort: 160,
  message: 1200
} as const;

export type ContactInquiry = Record<keyof typeof fieldLimits, string>;
export type InquiryFeedback = 'received' | 'invalid' | 'rateLimited' | 'retry';

export const inquiryReferencePattern = /^contact-[a-f0-9]{32}$/;

export function parseContactInquiry(payload: Record<string, unknown>): ContactInquiry {
  const fields = Object.entries(fieldLimits).map(([key, limit]) => {
    const input = payload[key];
    const text = typeof input === 'string' ? input.trim() : '';
    const value = key === 'message' ? text : text.replace(/\s+/g, ' ');
    return [key, key === 'email' ? value.slice(0, limit).toLowerCase() : value.slice(0, limit)];
  });
  return Object.fromEntries(fields) as ContactInquiry;
}

export function validContactInquiry(inquiry: ContactInquiry) {
  return Boolean(inquiry.name && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inquiry.email)
    && inquiry.country && inquiry.buyerType && inquiry.product && inquiry.message);
}
