import AdminShell from '@/components/AdminShell';
import {listAdminCategories} from '@/lib/backendStore';

export const dynamic = 'force-dynamic';

export default async function AdminCategoriesPage() {
  const categories = await listAdminCategories();
  return (
    <AdminShell active="Categories">
      <div className="admin-title">
        <p className="eyebrow">Product taxonomy</p>
        <h1>Categories</h1>
        <p>Manage product lines, page SEO and storefront filter order.</p>
      </div>
      <section className="admin-panel">
        <div>
          <p className="eyebrow">Quick add</p>
          <h2>Add Category</h2>
        </div>
        <form className="admin-form-grid" action="/api/admin/categories" method="post">
          <input name="name" placeholder="Category name" required />
          <input name="slug" placeholder="category-slug" required />
          <input name="coverImage" placeholder="/assets/catalog/x1/main.png" />
          <input name="seoTitle" placeholder="SEO title" />
          <button type="submit">Save Category</button>
        </form>
      </section>
      <section className="admin-panel">
        <div className="admin-grid-list">
          {categories.map((category) => (
            <article key={category.id}>
              <strong>{category.name}</strong>
              <span>{category.slug} | {category.status}</span>
              <small>{category.description}</small>
            </article>
          ))}
        </div>
      </section>
    </AdminShell>
  );
}
