import AdminPagination from '@/components/AdminPagination';
import AdminShell from '@/components/AdminShell';
import {formatAdminDate} from '@/lib/adminDataViews';
import {paginate, parseAdminPagination} from '@/lib/adminPagination';
import {listPromotions} from '@/lib/adminExtraStore';

export const dynamic = 'force-dynamic';

function zhPromotionType(type: string) {
  if (type === 'fixed') return '固定金额';
  if (type === 'percent') return '百分比';
  return '人工报价优惠';
}

function zhPromotionStatus(status: string) {
  if (status === 'paused') return '已暂停';
  if (status === 'expired') return '已过期';
  return '启用中';
}

export default async function AdminPromotionsPage({searchParams}: {searchParams: Promise<Record<string, string | string[] | undefined>>}) {
  const params = await searchParams;
  const {page, perPage} = parseAdminPagination(params);
  const promotions = await listPromotions();
  const paged = paginate(promotions, page, perPage);

  return (
    <AdminShell active="promotions">
      <div className="admin-title">
        <p className="eyebrow">优惠与促销</p>
        <h1>优惠码与报价优惠</h1>
        <p>促销记录写入独立持久化数据源。当前前台若未接入优惠码核销，本页会先作为运营配置与审计依据保留。</p>
      </div>
      <section className="admin-panel">
        <h2>新增促销</h2>
        <form className="admin-form-grid" action="/api/admin/promotions" method="post">
          <label><span>名称</span><input name="name" required placeholder="例如：夏季经销商专属优惠" /></label>
          <label><span>优惠码</span><input name="code" placeholder="SUMMER2026" /></label>
          <label><span>类型</span><select name="type"><option value="quote_only">人工报价优惠</option><option value="fixed">固定金额</option><option value="percent">百分比</option></select></label>
          <label><span>优惠值</span><input name="value" type="number" min="0" step="0.01" defaultValue="0" /></label>
          <label><span>开始日期</span><input name="startsAt" type="date" /></label>
          <label><span>结束日期</span><input name="endsAt" type="date" /></label>
          <label><span>状态</span><select name="status"><option value="active">启用中</option><option value="paused">暂停</option><option value="expired">过期</option></select></label>
          <label><span>备注</span><textarea name="note" placeholder="适用产品、国家、销售说明" /></label>
          <button type="submit">保存促销</button>
        </form>
      </section>
      <section className="admin-panel">
        <div className="admin-table-wrap">
          <table>
            <thead><tr><th>名称</th><th>优惠码</th><th>类型</th><th>优惠值</th><th>有效期</th><th>状态</th><th>备注</th><th>更新</th></tr></thead>
            <tbody>
              {paged.items.length ? paged.items.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.code || '-'}</td>
                  <td>{zhPromotionType(item.type)}</td>
                  <td>{item.value}</td>
                  <td>{item.startsAt || '-'} 至 {item.endsAt || '-'}</td>
                  <td>{zhPromotionStatus(item.status)}</td>
                  <td>{item.note || '-'}</td>
                  <td>{formatAdminDate(item.updatedAt)}</td>
                </tr>
              )) : <tr><td colSpan={8}>暂无真实促销数据。</td></tr>}
            </tbody>
          </table>
        </div>
        <AdminPagination basePath="/admin/promotions" params={params} page={paged.page} perPage={paged.perPage} total={paged.total} totalPages={paged.totalPages} />
      </section>
    </AdminShell>
  );
}
