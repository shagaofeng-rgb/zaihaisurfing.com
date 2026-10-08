'use client';

import {useState} from 'react';

async function postForm(orderId: string, form: HTMLFormElement) {
  const endpoint = `/api/admin/orders/${encodeURIComponent(orderId)}/shipment`;
  const response = await fetch(endpoint, {method: 'POST', body: new FormData(form)});
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.message || '操作失败，请稍后重试');
  return result;
}

export default function AdminOrderActions({orderId, canShip}: {orderId: string; canShip: boolean}) {
  const [status, setStatus] = useState('');

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('正在保存…');
    try {
      await postForm(orderId, event.currentTarget);
      setStatus('已保存，正在更新订单数据…');
      window.location.reload();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : '操作失败，请稍后重试');
    }
  }

  return (
    <div className="admin-action-grid">
      {canShip ? <form onSubmit={handleSubmit}>
        <h3>物流信息</h3>
        <input name="logisticsProvider" aria-label="承运商" placeholder="承运商，例如 DHL / FedEx / 海运" required />
        <input name="trackingNumber" aria-label="物流跟踪号" placeholder="物流跟踪号或提单号" required />
        <input name="trackingUrl" type="url" aria-label="物流查询链接" placeholder="物流查询链接（可选）" />
        <select name="shipmentStatus" aria-label="物流状态" defaultValue="shipped">
          <option value="shipped">已发货</option>
          <option value="in_transit">运输中</option>
          <option value="delivered">已送达</option>
          <option value="returned">已退回</option>
        </select>
        <label>发货时间<input name="shippedAt" type="datetime-local" /></label>
        <label>预计送达<input name="estimatedDeliveryAt" type="datetime-local" /></label>
        <textarea name="customerVisibleNote" aria-label="客户可见物流备注" placeholder="客户可见的物流备注" />
        <textarea name="internalNote" aria-label="内部备注" placeholder="内部备注（客户不可见）" />
        <button className="button primary small" type="submit">保存物流</button>
      </form> : <article className="admin-action-unavailable"><h3>物流信息</h3><p>请先确认订单付款，再登记发货与物流信息。</p></article>}

      <article className="admin-action-unavailable"><h3>退款</h3><p>在线退款暂未开通。财务核实并完成退款后，再按正式流程同步订单状态。</p></article>
      <article className="admin-action-unavailable"><h3>预授权</h3><p>在线预授权暂未开通，历史记录可在下方查看。</p></article>
      {status && <p className="admin-action-status">{status}</p>}
    </div>
  );
}
