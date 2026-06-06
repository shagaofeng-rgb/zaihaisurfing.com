import {redirect} from 'next/navigation';

export default async function LocalizedAccountOrderDetailPage({params}: {params: Promise<{orderNo: string}>}) {
  const {orderNo} = await params;
  redirect(`/account/orders/${encodeURIComponent(orderNo)}`);
}
