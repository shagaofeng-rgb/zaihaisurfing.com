import assert from 'node:assert/strict';
import test from 'node:test';
import {buildCustomerLeads} from '../src/lib/backendStore';
import type {AnalyticsEvent} from '../src/lib/commerceStore';

test('admin lead history keeps older submitted inquiries for pagination and detail links', () => {
  const events: AnalyticsEvent[] = Array.from({length: 35}, (_, index) => ({
    id: `inquiry-${index + 1}`,
    type: 'contact_inquiry',
    visitorId: `visitor-${index + 1}`,
    sessionId: `session-${index + 1}`,
    page: '/en/contact',
    pageTitle: 'Contact',
    referrer: '',
    country: '',
    city: '',
    device: 'desktop',
    browser: '',
    os: '',
    timestamp: new Date(Date.UTC(2026, 8, 1, 0, index)).toISOString(),
    payload: {name: `Customer ${index + 1}`, email: `customer-${index + 1}@example.com`}
  }));

  const leads = buildCustomerLeads([], events);
  assert.equal(leads.length, 35);
  assert.equal(leads.at(-1)?.id, 'inquiry-1');
  assert.equal(leads[0]?.id, 'inquiry-35');
});
