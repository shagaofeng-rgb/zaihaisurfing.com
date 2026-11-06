import {readAnalyticsEvents, readEmailLogs} from '@/lib/commerceStore';
import {inquiryReferencePattern, parseContactInquiry, type ContactInquiry} from '@/lib/contactInquiry';
import {mutateStoreObject, readStoreObject} from '@/lib/durableStore';
import {sendContactInquiryEmail, SmtpDeliveryUncertain} from '@/lib/emailService';

type NotificationStatus = 'sending' | 'sent' | 'skipped' | 'failed' | 'unknown';
type Notification = {status: NotificationStatus; attempts: number; updatedAt: string};

const maxAttempts = 5;
const firstRetryDelayMs = 30 * 60_000;

function notificationFile(reference: string) {
  return `inquiry-notifications/${reference}.json`;
}

export function readInquiryNotification(reference: string) {
  return inquiryReferencePattern.test(reference) ? readStoreObject<Notification>(notificationFile(reference)) : Promise.resolve(null);
}

export async function deliverInquiryNotification(reference: string, inquiry: ContactInquiry) {
  if (!inquiryReferencePattern.test(reference)) throw new Error('Invalid inquiry reference');
  const file = notificationFile(reference);
  let claimed = false;
  const notification = await mutateStoreObject<Notification>(file, (stored) => {
    const elapsed = stored ? Date.now() - Date.parse(stored.updatedAt) : Infinity;
    if (stored && (stored.status === 'sent' || stored.status === 'sending' || stored.status === 'unknown'
      || stored.attempts >= maxAttempts || elapsed < firstRetryDelayMs * 2 ** (stored.attempts - 1))) {
      return stored;
    }
    claimed = true;
    return {status: 'sending', attempts: (stored?.attempts || 0) + 1, updatedAt: new Date().toISOString()};
  });
  if (!claimed) return notification.status;

  let status: NotificationStatus;
  try {
    const result = await sendContactInquiryEmail(inquiry, reference);
    status = result.ok ? 'sent' : 'skipped';
  } catch (error) {
    status = error instanceof SmtpDeliveryUncertain ? 'unknown' : 'failed';
  }
  await mutateStoreObject<Notification>(file, () => ({...notification, status, updatedAt: new Date().toISOString()}));
  return status;
}

export async function retryInquiryNotifications() {
  const [events, logs] = await Promise.all([readAnalyticsEvents(), readEmailLogs()]);
  const sent = new Set(logs.filter((log) => log.templateType === 'contact_inquiry' && log.status === 'sent').map((log) => log.orderId));
  const cutoff = Date.now() - 72 * 60 * 60_000;
  const candidates = events.filter((event) => event.type === 'contact_inquiry'
    && inquiryReferencePattern.test(event.id) && !sent.has(event.id) && Date.parse(event.timestamp) >= cutoff);
  const recent = await Promise.all(candidates.slice(-25).map(async (event) => ({event, state: await readInquiryNotification(event.id)})));
  const due = recent.filter(({state}) => !state || (
    (state.status === 'failed' || state.status === 'skipped')
      && state.attempts < maxAttempts && Date.now() - Date.parse(state.updatedAt) >= firstRetryDelayMs * 2 ** (state.attempts - 1)
  ));
  return Promise.all(due.slice(0, 5).map(async ({event}) => ({
    reference: event.id,
    status: await deliverInquiryNotification(event.id, parseContactInquiry(event.payload))
  })));
}
