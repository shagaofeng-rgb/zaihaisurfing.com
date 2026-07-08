import AdminPagination from '@/components/AdminPagination';
import AdminShell from '@/components/AdminShell';
import {formatAdminDate, money} from '@/lib/adminDataViews';
import {paginate, parseAdminPagination} from '@/lib/adminPagination';
import {zhPublishStatus} from '@/lib/adminZh';
import {listAdminProducts} from '@/lib/backendStore';

export const dynamic = 'force-dynamic';

export default async function AdminInventoryPage({searchParams}: {searchParams: Promise<Record<string, string | string[] | undefined>>}) {
  const params = await searchParams;
  const {page, perPage} = parseAdminPagination(params);
  const products = await listAdminProducts();
  const paged = paginate(products, page, perPage);
  const lowStock = products.filter((item) => item.stock <= 5).length;

  return (
    <AdminShell active="inventory">
      <div className="admin-title">
        <p className="eyebrow">库存管理</p>
        <h1>商品库存与可售状态</h1>
        <p>当前库存读取后台商品真实库存字段。后续库存流水、入库、出库和锁定库存会继续在同一持久化数据层扩展。</p>
      </div>
      <div className="admin-metrics">
        <article><span>商品总数</span><strong>{products.length}</strong><small>后台商品数据</small></article>
        <article><span>低库存</span><strong>{lowStock}</strong><small>库存小于等于 5</small></article>
        <article><span>允许下单</span><strong>{products.filter((item) => item.allowDirectOrder).length}</strong><small>Buy Now 可用</small></article>
        <article><span>库存金额</span><strong>{money(products.reduce((sum, item) => sum + item.stock * (item.salePriceCents || item.priceCents) / 100, 0))}</strong><small>按当前售价估算</small></article>
      </div>
      <section className="admin-panel">
        <div className="admin-table-wrap">
          <table>
            <thead><tr><th>SKU</th><th>商品</th><th>分类</th><th>库存</th><th>MOQ</th><th>价格</th><th>状态</th><th>更新时间</th></tr></thead>
            <tbody>
              {paged.items.length ? paged.items.map((product) => (
                <tr key={product.id}>
                  <td>{product.sku}</td>
                  <td><strong>{product.name}</strong><br /><small>{product.slug}</small></td>
                  <td>{product.categoryName}</td>
                  <td><span className={product.stock <= 5 ? 'admin-status draft' : 'admin-status published'}>{product.stock}</span></td>
                  <td>{product.moq}</td>
                  <td>{money((product.salePriceCents || product.priceCents) / 100)}</td>
                  <td>{zhPublishStatus(product.status)}</td>
                  <td>{formatAdminDate(product.updatedAt)}</td>
                </tr>
              )) : <tr><td colSpan={8}>暂无商品库存数据。</td></tr>}
            </tbody>
          </table>
        </div>
        <AdminPagination basePath="/admin/inventory" params={params} page={paged.page} perPage={paged.perPage} total={paged.total} totalPages={paged.totalPages} />
      </section>
    </AdminShell>
  );
}
