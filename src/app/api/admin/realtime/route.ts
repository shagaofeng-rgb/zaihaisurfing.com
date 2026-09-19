import crypto from 'node:crypto';
import {requireAdminApiSession} from '@/lib/adminAuth';
import {buildCustomerLeads} from '@/lib/backendStore';
import {readAdminBusinessData} from '@/lib/adminBusinessData';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function latest(values: string[]) {
  return values.filter(Boolean).sort().at(-1) || '';
}

function hash(value: unknown) {
  return crypto.createHash('sha256').update(JSON.stringify(value), 'utf8').digest('hex').slice(0, 16);
}

export async function GET() {
  const {response} = await requireAdminApiSession();
  if (response) return response;

  const {orders, events} = await readAdminBusinessData();
  const leads = buildCustomerLeads(orders, events);
  const state = {
    orders: orders.length,
    events: events.length,
    leads: leads.length,
    latestOrder: latest(orders.map((order) => order.updatedAt || order.createdAt)),
    latestEvent: latest(events.map((event) => event.timestamp)),
    latestLead: latest(leads.map((lead) => lead.lastActiveTime))
  };

  return Response.json(
    {
      ok: true,
      generatedAt: new Date().toISOString(),
      version: hash(state),
      state,
      recent: {
        orders: orders.slice(-5).reverse(),
        events: events.slice(-5).reverse(),
        leads: leads.slice(0, 5)
      }
    },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate'
      }
    }
  );
}
