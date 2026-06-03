import AdminShell from '@/components/AdminShell';
import {zhPublishStatus} from '@/lib/adminZh';
import {listAdminPosts} from '@/lib/backendStore';

export const dynamic = 'force-dynamic';

export default async function AdminNewsPage() {
  const posts = await listAdminPosts('news');
  return (
    <AdminShell active="新闻管理">
      <div className="admin-title">
        <p className="eyebrow">行业新闻 CMS</p>
        <h1>新闻管理</h1>
        <p>发布行业新闻、公司观点和带来源标注的海外市场动态。</p>
      </div>
      <section className="admin-panel">
        <div>
          <p className="eyebrow">新增草稿</p>
          <h2>新增新闻</h2>
        </div>
        <form className="admin-form-grid" action="/api/admin/posts" method="post">
          <input type="hidden" name="type" value="news" />
          <input name="title" placeholder="新闻标题" required />
          <input name="slug" placeholder="新闻链接 slug" required />
          <input name="source" placeholder="来源名称 / URL" />
          <input name="coverImage" placeholder="/assets/banners/surfing-rider-01.png" />
          <textarea name="excerpt" placeholder="带来源说明的简短摘要" />
          <button type="submit">保存新闻草稿</button>
        </form>
      </section>
      <section className="admin-panel">
        <div className="admin-table-wrap">
          <table>
            <thead><tr><th>标题</th><th>日期</th><th>来源</th><th>状态</th><th>摘要</th></tr></thead>
            <tbody>
              {posts.length ? posts.map((post) => (
                <tr key={post.id}>
                  <td><strong>{post.title}</strong><br /><small>{post.slug}</small></td>
                  <td>{post.publishDate}</td>
                  <td>{post.source || '-'}</td>
                  <td><span className={`admin-status ${post.status}`}>{zhPublishStatus(post.status)}</span></td>
                  <td>{post.excerpt}</td>
                </tr>
              )) : <tr><td colSpan={5}>暂无新闻数据。</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </AdminShell>
  );
}
