import AdminPagination from '@/components/AdminPagination';
import AdminShell from '@/components/AdminShell';
import Image from 'next/image';
import {paginate, parseAdminPagination} from '@/lib/adminPagination';
import {zhPublishStatus} from '@/lib/adminZh';
import {listAdminCategories, listAdminProducts} from '@/lib/backendStore';

export const dynamic = 'force-dynamic';

function usd(cents: number) {
  if (!cents) return '-';
  return `USD ${(cents / 100).toLocaleString()}`;
}

function discount(compareAt: number, sale: number) {
  if (!compareAt || !sale || sale >= compareAt) return '-';
  return `${Math.round(((compareAt - sale) / compareAt) * 100)}%`;
}

export default async function AdminProductsPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const {page, perPage} = parseAdminPagination(params);
  const [products, categories] = await Promise.all([listAdminProducts(), listAdminCategories()]);
  const paged = paginate(products, page, perPage);

  return (
    <AdminShell active="products">
      <div className="admin-title">
        <p className="eyebrow">商品</p>
        <h1>产品管理</h1>
        <p>按商城站逻辑管理产品草稿、发布状态、SKU、库存、价格、媒体图和 SEO 字段。只有已发布产品才建议同步到前台展示。</p>
      </div>

      <details className="admin-panel admin-create-panel">
        <summary>新增产品</summary>
        <form className="admin-form-grid admin-form-wide" action="/api/admin/products" method="post">
          <input name="name" placeholder="产品名称，例如 ZAIHAI X1 Pro Electric Surfboard" required />
          <input name="slug" placeholder="产品链接 slug，例如 x1-pro" required />
          <select name="categorySlug" required>
            {categories.map((category) => <option value={category.slug} key={category.id}>{category.name}</option>)}
          </select>
          <select name="status" defaultValue="draft">
            <option value="draft">草稿</option>
            <option value="published">已发布</option>
            <option value="unpublished">已下架</option>
            <option value="scheduled">定时发布</option>
            <option value="archived">已归档</option>
          </select>
          <input name="sku" placeholder="SKU / 型号，例如 ZH-X1-PRO" />
          <input name="stock" type="number" min="0" step="1" placeholder="库存数量" />
          <input name="price" type="number" min="0" step="1" placeholder="售价 USD" />
          <input name="compareAtPrice" type="number" min="0" step="1" placeholder="原价 / 划线价 USD" />
          <input name="moq" type="number" min="1" step="1" placeholder="MOQ，默认 1" />
          <input name="sortOrder" type="number" min="1" step="1" placeholder="排序权重" />
          <input name="coverImage" placeholder="产品主图路径，例如 /assets/catalog/x1/product.png" />
          <input name="weightDimension" placeholder="重量/尺寸/包装，例如 Export wooden crate by model" />
          <textarea name="galleryImages" placeholder="产品相册图片路径，每行一个，或用英文逗号分隔" />
          <textarea name="shortDescription" placeholder="产品短描述，用于产品卡片和详情页摘要" />
          <textarea name="fullDescription" placeholder="产品详细描述、应用场景、包装说明、交付说明" />
          <textarea name="shippingInfo" placeholder="物流说明，例如 sea freight / air freight / forwarder pickup" />
          <input name="seoTitle" placeholder="SEO Title" />
          <textarea name="seoDescription" placeholder="Meta Description" />
          <label className="admin-check"><input type="checkbox" name="showOnHome" /> 首页推荐</label>
          <label className="admin-check"><input type="checkbox" name="allowCart" defaultChecked /> 允许加入购物/询盘</label>
          <label className="admin-check"><input type="checkbox" name="allowDirectOrder" defaultChecked /> 允许 Buy Now 下单</label>
          <button type="submit">保存产品</button>
        </form>
      </details>

      <section className="admin-panel">
        <div>
          <p className="eyebrow">产品数据库</p>
          <h2>{products.length} 条产品记录</h2>
        </div>
        <p className="admin-product-swipe-hint">左右滑动表格，查看价格、库存、状态与 SEO。</p>
        <div className="admin-table-wrap">
          <table className="admin-products-table">
            <thead>
              <tr><th>产品</th><th>分类</th><th>价格</th><th>库存</th><th>媒体</th><th>状态</th><th>SEO</th></tr>
            </thead>
            <tbody>
              {paged.items.length ? paged.items.map((product) => {
                const sale = product.salePriceCents || product.priceCents;
                return (
                  <tr key={product.id}>
                    <td>
                      <div className="admin-product-identity">
                        {product.coverImage ? <Image className="admin-product-thumb" src={product.coverImage} alt={`${product.name} 主图`} width={58} height={58} unoptimized /> : <span className="admin-product-thumb admin-product-thumb-empty">无图</span>}
                        <div><strong>{product.name}</strong><small>{product.slug} | {product.sku || '未设置 SKU'}</small></div>
                      </div>
                    </td>
                    <td>{product.categoryName}</td>
                    <td>
                      <strong>{usd(sale)}</strong><br />
                      <small>原价 {usd(product.priceCents)} / 折扣 {discount(product.priceCents, sale)}</small>
                    </td>
                    <td>{product.stock}<br /><small>MOQ {product.moq}</small></td>
                    <td>{product.galleryImages.length + (product.coverImage ? 1 : 0)} 张</td>
                    <td><span className={`admin-status ${product.status}`}>{zhPublishStatus(product.status)}</span></td>
                    <td className="admin-product-seo"><strong>{product.seoTitle || '未填写 SEO 标题'}</strong><small>{product.seoDescription || '未填写 Meta Description'}</small></td>
                  </tr>
                );
              }) : <tr><td colSpan={7}>暂无产品数据。</td></tr>}
            </tbody>
          </table>
        </div>
        <AdminPagination basePath="/admin/products" params={params} page={paged.page} perPage={paged.perPage} total={paged.total} totalPages={paged.totalPages} />
      </section>
    </AdminShell>
  );
}
