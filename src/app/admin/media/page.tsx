import AdminShell from '@/components/AdminShell';
import {listAdminMedia} from '@/lib/backendStore';

export const dynamic = 'force-dynamic';

export default async function AdminMediaPage() {
  const media = await listAdminMedia();
  return (
    <AdminShell active="Media">
      <div className="admin-title">
        <p className="eyebrow">Media library</p>
        <h1>Images and Assets</h1>
        <p>Upload port, alt text management and product/news image assignment are prepared here.</p>
      </div>
      <section className="admin-panel">
        <div>
          <p className="eyebrow">Register asset</p>
          <h2>Add Existing Image</h2>
        </div>
        <form className="admin-form-grid" action="/api/admin/media" method="post">
          <input name="url" placeholder="/assets/catalog/x1/main.png" required />
          <input name="alt" placeholder="Descriptive ALT text" required />
          <input name="usage" placeholder="Product/news usage" />
          <button type="submit">Add to Library</button>
        </form>
      </section>
      <section className="admin-panel">
        <div className="admin-media-grid">
          {media.map((asset) => (
            <article key={asset.id}>
              <img src={asset.url} alt={asset.alt} />
              <strong>{asset.alt}</strong>
              <small>{asset.url}</small>
              <span>{asset.usage.join(', ') || 'Unused'}</span>
            </article>
          ))}
        </div>
      </section>
    </AdminShell>
  );
}
