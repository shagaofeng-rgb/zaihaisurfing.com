import AdminShell from '@/components/AdminShell';
import {zhPublishStatus} from '@/lib/adminZh';
import {listAdminCategories, listAdminProducts} from '@/lib/backendStore';

export const dynamic = 'force-dynamic';

function usd(cents: number) {
  return `USD ${(cents / 100).toLocaleString()}`;
}

export default async function AdminProductsPage() {
  const [products, categories] = await Promise.all([listAdminProducts(), listAdminCategories()]);

  return (
    <AdminShell active="产品管理">
      <div className="admin-title">
        <p className="eyebrow">产品 CMS</p>
        <h1>产品管理</h1>
        <p>这里管理产品数据、价格、库存、SEO 和前台同步字段。当前列表来自已接入后台的真实产品数据。</p>
      </div>
      <section className="admin-panel">
        <div>
          <p className="eyebrow">快速新增</p>
          <h2>新增产品草稿</h2>
        </div>
        <form className="admin-form-grid" action="/api/admin/products" method="post">
          <input name="name" placeholder="产品名称" required />
          <input name="slug" placeholder="产品链接 slug" required />
          <select name="categorySlug" required>
            {categories.map((category) => <option value={category.slug} key={category.id}>{category.name}</option>)}
          </select>
          <input name="price" type="number" min="0" step="1" placeholder="价格 USD" />
          <input name="coverImage" placeholder="/assets/catalog/x1/main.png" />
          <button type="submit">保存草稿</button>
        </form>
      </section>
      <section className="admin-panel">
        <div>
          <p className="eyebrow">产品数据库</p>
          <h2>{products.length} 条产品记录</h2>
        </div>
        <div className="admin-table-wrap">
          <table>
            <thead>
              <tr><th>产品</th><th>分类</th><th>价格</th><th>库存</th><th>状态</th><th>SEO</th><th>排序</th></tr>
            </thead>
            <tbody>
              {products.length ? products.map((product) => (
                <tr key={product.id}>
                  <td><strong>{product.name}</strong><br /><small>{product.slug} | {product.sku}</small></td>
                  <td>{product.categoryName}</td>
                  <td>{usd(product.salePriceCents || product.priceCents)}</td>
                  <td>{product.stock}</td>
                  <td><span className={`admin-status ${product.status}`}>{zhPublishStatus(product.status)}</span></td>
                  <td>{product.seoTitle}</td>
                  <td>{product.sortOrder}</td>
                </tr>
              )) : <tr><td colSpan={7}>暂无产品数据。</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </AdminShell>
  );
}
