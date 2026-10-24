import assert from 'node:assert/strict';
import test from 'node:test';
import {isBusinessAnalyticsEvent, isBusinessOrder} from '../src/lib/adminBusinessData';
import type {AnalyticsEvent, StoreOrder} from '../src/lib/commerceStore';

test('marked contact-form health checks do not appear in business metrics', () => {
  const event = {
    id: 'contact-123',
    visitorId: 'test-contact-form-20261024',
    sessionId: 'test-contact-form-20261024',
    type: 'contact_inquiry'
  } as AnalyticsEvent;
  assert.equal(isBusinessAnalyticsEvent(event), false);
  assert.equal(isBusinessAnalyticsEvent({...event, visitorId: 'visitor-123', sessionId: 'session-123'}), true);
  assert.equal(isBusinessAnalyticsEvent({...event, type: 'payment_notice', visitorId: 'visitor-123', sessionId: 'session-123'}), false);
});

test('marked internal orders are excluded without hiding ordinary customers', () => {
  const order = {
    id: 'order-123',
    userId: 'local-test-123',
    customer: {email: 'customer@example.com'}
  } as StoreOrder;
  assert.equal(isBusinessOrder(order), false);
  assert.equal(isBusinessOrder({...order, userId: 'customer-123'}), true);
});
