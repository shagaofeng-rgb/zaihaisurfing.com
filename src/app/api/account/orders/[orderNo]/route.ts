import {findStoreOrder} from '@/lib/commerceStore';
import {customerOwnsOrder, getCustomerSession} from '@/lib/customerAuth';
import {hasOrderAccess, withoutOrderAccessHash} from '@/lib/orderAccess';
import {products} from '@/lib/site';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_request: Request, {params}: {params: Promise<{orderNo: string}>}) {
  const {orderNo} = await params;
  const order = await findStoreOrder(orderNo);
  if (!order) {
    return Response.json({message: 'Order not found'}, {status: 404, headers: {'Cache-Control': 'private, no-store'}});
  }
  const session = await getCustomerSession();
  if (!(session && customerOwnsOrder(order, session)) && !await hasOrderAccess(order)) {
    return Response.json({message: 'Order not found'}, {status: 404, headers: {'Cache-Control': 'private, no-store'}});
  }
  const publicOrder = withoutOrderAccessHash(order);
  return Response.json(
    {
      ok: true,
      order: {
        ...publicOrder,
        productImage: products[order.productSlug]?.image || '',
        paymentStatus: order.gatewayStatus,
        orderStatus: order.status,
        paymentAmount: order.total,
        paymentCurrency: order.currency,
        paymentReference: order.paymentId || order.transactionId,
        trackingUrl: order.trackingUrl,
        estimatedDeliveryAt: order.estimatedDeliveryAt,
        customerVisibleNote: order.customerVisibleNote
      }
    },
    {headers: {'Cache-Control': 'private, no-store'}}
  );
}
