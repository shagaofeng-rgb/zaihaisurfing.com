import {readAnalyticsEvents} from '@/lib/commerceStore';
import {inquiryReferencePattern} from '@/lib/contactInquiry';
import {readStoreObject, writeStoreObject} from '@/lib/durableStore';
import {siteUrl} from '@/lib/site';

const file = 'contact-form-health.json';

type ContactFormHealth = {
  checkedAt: string;
  endpointStatus: number;
  inquiryId: string;
  persisted: boolean;
  emailStatus: string;
};

export function readContactFormHealth() {
  return readStoreObject<ContactFormHealth>(file);
}

export async function runContactFormHealthCheck() {
  const checkedAt = new Date().toISOString();
  const date = checkedAt.slice(0, 10);
  const result: ContactFormHealth = {checkedAt, endpointStatus: 0, inquiryId: '', persisted: false, emailStatus: 'unknown'};

  try {
    const response = await fetch(new URL('/api/contact/inquiry', siteUrl), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'ZAIHAI-Contact-Form-Health-Check/1.0'
      },
      body: JSON.stringify({
        name: 'ZAIHAI Contact Form Health Check',
        email: 'monthly-form-check@zaihaisurfing.com',
        country: 'Automated Test',
        company: 'ZAIHAI SURFING Website Monitor',
        buyerType: 'Website health check',
        product: 'Contact form email delivery test',
        message: `Internal website form delivery check for ${date}.`,
        page: '/en/contact',
        visitorId: 'contact-form-health-check',
        sessionId: `contact-form-health-check-${date}`,
        submissionKey: `contact-form-health-check-${date}`
      }),
      cache: 'no-store',
      signal: AbortSignal.timeout(30_000)
    });
    result.endpointStatus = response.status;
    const payload = await response.json();
    if (response.ok && typeof payload.id === 'string' && inquiryReferencePattern.test(payload.id)) {
      result.inquiryId = payload.id;
      result.emailStatus = typeof payload.emailStatus === 'string' ? payload.emailStatus : 'unknown';
      result.persisted = (await readAnalyticsEvents()).some((event) => event.id === result.inquiryId
        && event.type === 'contact_inquiry' && event.visitorId === 'contact-form-health-check');
    }
  } catch {
    // A failed check still leaves an operational receipt for the administrator.
  }
  await writeStoreObject(file, result);
  return {ok: result.persisted && result.emailStatus === 'sent', ...result};
}
