import AdminShell from '@/components/AdminShell';
import {listAdminPosts} from '@/lib/backendStore';

export const dynamic = 'force-dynamic';

export default async function AdminNewsPage() {
  const posts = await listAdminPosts('news');
  return (
    <AdminShell active="News">
      <div className="admin-title">
        <p className="eyebrow">Industry news CMS</p>
        <h1>News Management</h1>
        <p>Publish market news, company views and source-attributed updates for overseas buyers.</p>
      </div>
      <section className="admin-panel">
        <div>
          <p className="eyebrow">New draft</p>
          <h2>Add News Post</h2>
        </div>
        <form className="admin-form-grid" action="/api/admin/posts" method="post">
          <input type="hidden" name="type" value="news" />
          <input name="title" placeholder="News title" required />
          <input name="slug" placeholder="news-url-slug" required />
          <input name="source" placeholder="Source name / URL" />
          <input name="coverImage" placeholder="/assets/banners/surfing-rider-01.png" />
          <textarea name="excerpt" placeholder="Short source-attributed summary" />
          <button type="submit">Save News Draft</button>
        </form>
      </section>
      <section className="admin-panel">
        <div className="admin-table-wrap">
          <table>
            <thead><tr><th>Title</th><th>Date</th><th>Source</th><th>Status</th><th>Excerpt</th></tr></thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id}>
                  <td><strong>{post.title}</strong><br /><small>{post.slug}</small></td>
                  <td>{post.publishDate}</td>
                  <td>{post.source || '-'}</td>
                  <td><span className={`admin-status ${post.status}`}>{post.status}</span></td>
                  <td>{post.excerpt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AdminShell>
  );
}
