import AdminShell from '@/components/AdminShell';
import {zhPublishStatus} from '@/lib/adminZh';
import {listAdminPosts} from '@/lib/backendStore';

export const dynamic = 'force-dynamic';

export default async function AdminBlogPage() {
  const posts = await listAdminPosts('blog');
  return (
    <AdminShell active="博客管理">
      <div className="admin-title">
        <p className="eyebrow">SEO / AIO 内容</p>
        <h1>博客管理</h1>
        <p>发布产品知识、应用方案、对比分析和采购决策内容。</p>
      </div>
      <section className="admin-panel">
        <div>
          <p className="eyebrow">新增草稿</p>
          <h2>新增博客</h2>
        </div>
        <form className="admin-form-grid" action="/api/admin/posts" method="post">
          <input type="hidden" name="type" value="blog" />
          <input name="title" placeholder="博客标题" required />
          <input name="slug" placeholder="博客链接 slug" required />
          <input name="coverImage" placeholder="/assets/banners/surfing-rider-01.png" />
          <input name="tags" placeholder="标签，用英文逗号分隔" />
          <textarea name="excerpt" placeholder="SEO 摘要" />
          <button type="submit">保存博客草稿</button>
        </form>
      </section>
      <section className="admin-panel">
        <div className="admin-table-wrap">
          <table>
            <thead><tr><th>标题</th><th>日期</th><th>标签</th><th>状态</th><th>SEO 描述</th></tr></thead>
            <tbody>
              {posts.length ? posts.map((post) => (
                <tr key={post.id}>
                  <td><strong>{post.title}</strong><br /><small>{post.slug}</small></td>
                  <td>{post.publishDate}</td>
                  <td>{post.tags.join(', ')}</td>
                  <td><span className={`admin-status ${post.status}`}>{zhPublishStatus(post.status)}</span></td>
                  <td>{post.seoDescription}</td>
                </tr>
              )) : <tr><td colSpan={5}>暂无博客数据。</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </AdminShell>
  );
}
