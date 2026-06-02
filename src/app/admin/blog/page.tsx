import AdminShell from '@/components/AdminShell';
import {listAdminPosts} from '@/lib/backendStore';

export const dynamic = 'force-dynamic';

export default async function AdminBlogPage() {
  const posts = await listAdminPosts('blog');
  return (
    <AdminShell active="Blog">
      <div className="admin-title">
        <p className="eyebrow">SEO / AIO content</p>
        <h1>Blog Management</h1>
        <p>Publish product knowledge, application guides, comparisons and commercial buying advice.</p>
      </div>
      <section className="admin-panel">
        <div>
          <p className="eyebrow">New draft</p>
          <h2>Add Blog Post</h2>
        </div>
        <form className="admin-form-grid" action="/api/admin/posts" method="post">
          <input type="hidden" name="type" value="blog" />
          <input name="title" placeholder="Blog title" required />
          <input name="slug" placeholder="blog-url-slug" required />
          <input name="coverImage" placeholder="/assets/banners/surfing-rider-01.png" />
          <input name="tags" placeholder="tags, separated, by comma" />
          <textarea name="excerpt" placeholder="Meta-friendly excerpt" />
          <button type="submit">Save Blog Draft</button>
        </form>
      </section>
      <section className="admin-panel">
        <div className="admin-table-wrap">
          <table>
            <thead><tr><th>Title</th><th>Date</th><th>Tags</th><th>Status</th><th>SEO Description</th></tr></thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id}>
                  <td><strong>{post.title}</strong><br /><small>{post.slug}</small></td>
                  <td>{post.publishDate}</td>
                  <td>{post.tags.join(', ')}</td>
                  <td><span className={`admin-status ${post.status}`}>{post.status}</span></td>
                  <td>{post.seoDescription}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AdminShell>
  );
}
