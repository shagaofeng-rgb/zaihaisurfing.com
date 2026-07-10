import AdminPagination from '@/components/AdminPagination';
import AdminShell from '@/components/AdminShell';
import {paginate, parseAdminPagination} from '@/lib/adminPagination';
import {zhPublishStatus} from '@/lib/adminZh';
import {listAdminPosts} from '@/lib/backendStore';

export const dynamic = 'force-dynamic';

export default async function AdminNewsPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const {page, perPage} = parseAdminPagination(params);
  const posts = await listAdminPosts('news');
  const paged = paginate(posts, page, perPage);
  return (
    <AdminShell active="news">
      <div className="admin-title">
        <p className="eyebrow">Industry News CMS</p>
        <h1>新闻管理</h1>
        <p>发布公司新闻、行业事实、海外市场动态和带来源说明的内容。建议只发布原创整理内容，并标明主要参考来源。</p>
      </div>
      <section className="admin-panel">
        <div>
          <p className="eyebrow">新增内容</p>
          <h2>新增新闻</h2>
        </div>
        <form className="admin-form-grid admin-form-wide" action="/api/admin/posts" method="post">
          <input type="hidden" name="type" value="news" />
          <input name="title" placeholder="新闻标题" required />
          <input name="slug" placeholder="新闻链接 slug" required />
          <select name="status" defaultValue="draft">
            <option value="draft">草稿</option>
            <option value="published">已发布</option>
            <option value="unpublished">已下架</option>
            <option value="scheduled">定时发布</option>
            <option value="archived">已归档</option>
          </select>
          <input name="publishDate" type="date" />
          <input name="category" placeholder="分类，例如 Market News / Company News" />
          <input name="author" placeholder="作者，例如 ZAIHAI Editorial Team" />
          <input name="source" placeholder="来源名称 / URL，多个来源可换行写在正文中" />
          <input name="coverImage" placeholder="https://source-site.example/path/news-image.jpg" required />
          <input name="tags" placeholder="标签，用英文逗号分隔" />
          <textarea name="excerpt" placeholder="新闻摘要，说明事实背景和与产品、客户的关系" />
          <textarea name="content" placeholder="新闻正文，可用 Markdown：背景、事实、对水上娱乐采购的影响、ZAIHAI 观点" />
          <input name="seoTitle" placeholder="SEO Title" />
          <textarea name="seoDescription" placeholder="Meta Description" />
          <button type="submit">保存新闻</button>
        </form>
      </section>
      <section className="admin-panel">
        <div className="admin-table-wrap">
          <table>
            <thead><tr><th>标题</th><th>日期</th><th>来源</th><th>状态</th><th>SEO / 摘要</th></tr></thead>
            <tbody>
              {paged.items.length ? paged.items.map((post) => (
                <tr key={post.id}>
                  <td><strong>{post.title}</strong><br /><small>{post.slug}</small></td>
                  <td>{post.publishDate}</td>
                  <td>{post.source || '-'}</td>
                  <td><span className={`admin-status ${post.status}`}>{zhPublishStatus(post.status)}</span></td>
                  <td>{post.seoTitle}<br /><small>{post.excerpt}</small></td>
                </tr>
              )) : <tr><td colSpan={5}>暂无新闻数据。</td></tr>}
            </tbody>
          </table>
        </div>
        <AdminPagination basePath="/admin/news" params={params} page={paged.page} perPage={paged.perPage} total={paged.total} totalPages={paged.totalPages} />
      </section>
    </AdminShell>
  );
}
