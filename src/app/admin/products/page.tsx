import AdminShell from '@/components/AdminShell';
import {listAdminCategories, listAdminProducts} from '@/lib/backendStore';

export const dynamic = 'force-dynamic';

function usd(cents: number) {
  return `USD ${(cents / 100).toLocaleString()}`;
}

export default async function AdminProductsPage() {
  const [products, categories] = await Promise.all([listAdminProducts(), listAdminCategories()]);

  return (
    <AdminShell active="Products">
      <div className="admin-title">
        <p className="eyebrow">CMS product management</p>
        <h1>Products</h1>
        <p>Create, edit, publish, archive and prepare product data for storefront synchronization.</p>
      </div>
      <section className="admin-panel">
        <div>
          <p className="eyebrow">Quick add</p>
          <h2>Add Product Draft</h2>
        </div>
        <form className="admin-form-grid" action="/api/admin/products" method="post">
          <input name="name" placeholder="Product name" required />
          <input name="slug" placeholder="slug-url" required />
          <select name="categorySlug" required>
            {categories.map((category) => <option value={category.slug} key={category.id}>{category.name}</option>)}
          </select>
          <input name="price" type="number" min="0" step="1" placeholder="Price USD" />
          <input name="coverImage" placeholder="/assets/catalog/x1/main.png" />
          <button type="submit">Save Draft</button>
        </form>
      </section>
      <section className="admin-panel">
        <div>
          <p className="eyebrow">Product database</p>
          <h2>{products.length} Product Records</h2>
        </div>
        <div className="admin-table-wrap">
          <table>
            <thead>
              <tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th>SEO</th><th>Order</th></tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td><strong>{product.name}</strong><br /><small>{product.slug} | {product.sku}</small></td>
                  <td>{product.categoryName}</td>
                  <td>{usd(product.salePriceCents || product.priceCents)}</td>
                  <td>{product.stock}</td>
                  <td><span className={`admin-status ${product.status}`}>{product.status}</span></td>
                  <td>{product.seoTitle}</td>
                  <td>{product.sortOrder}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AdminShell>
  );
}
