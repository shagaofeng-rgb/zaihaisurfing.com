import AdminPagination from '@/components/AdminPagination';
import AdminShell from '@/components/AdminShell';
import AdminTimeFilter from '@/components/AdminTimeFilter';
import {formatAdminDate} from '@/lib/adminDataViews';
import {paginate, parseAdminPagination} from '@/lib/adminPagination';
import {isAdminTimestampInRange, parseAdminTimeFilter} from '@/lib/adminTimeFilter';
import {facebookPublisherStatus, listFacebookPosts, nextFacebookTopics} from '@/lib/facebookPagePublisher';

export const dynamic = 'force-dynamic';

export default async function FacebookPublisherPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const timeFilter = parseAdminTimeFilter(params);
  const {page, perPage} = parseAdminPagination(params);
  const [status, allPosts] = await Promise.all([facebookPublisherStatus(), listFacebookPosts()]);
  const posts = allPosts.filter((post) => isAdminTimestampInRange(post.createdAt || post.updatedAt, timeFilter.from, timeFilter.to));
  const paged = paginate(posts, page, perPage);
  const message = typeof params.facebook === 'string' ? params.facebook : typeof params.settings === 'string' ? params.settings : '';

  return <AdminShell active="facebook">
    <div className="admin-title">
      <p className="eyebrow">Facebook 公共主页</p>
      <h1>Facebook 自动发布</h1>
      <p>仅通过 Meta 官方接口管理已授权公共主页，使用经过核验的产品资料和 ZAIHAI 自有图片。</p>
      <AdminTimeFilter action="/admin/facebook" range={timeFilter.range} start={timeFilter.start} end={timeFilter.end} label="发布记录时间" summary={timeFilter.summary} params={params} />
    </div>
    {message ? <section className="admin-panel"><p>{message}</p></section> : null}

    <section className="admin-panel">
      <h2>授权与安全状态</h2>
      <div className="admin-metrics">
        <article><span>Meta 配置</span><strong>{status.configuredMeta ? '已就绪' : '未完成'}</strong><small>仅保存在服务器环境变量</small></article>
        <article><span>公共主页连接</span><strong>{status.connected ? '已连接' : '未连接'}</strong><small>{status.pageName || '需要管理员授权'}</small></article>
        <article><span>自动发布</span><strong>{status.settings.enabled ? '已启用' : '已暂停'}</strong><small>{status.settings.timezone} {status.settings.publishTime}</small></article>
        <article><span>令牌状态</span><strong>{status.tokenExpiresSoon ? '即将到期' : status.connected ? '监控中' : '不可用'}</strong><small>{status.tokenExpiresAt || '尚未保存 Page Token'}</small></article>
      </div>
      <div className="admin-action-row"><a className="admin-button" href="/api/admin/facebook/connect">连接 Meta 公共主页</a></div>
      <p><small>需要 pages_show_list、pages_read_engagement、pages_manage_posts、read_insights 权限。</small></p>
    </section>

    <section className="admin-panel">
      <h2>每日执行设置</h2>
      <form action="/api/admin/facebook/settings" method="post" className="admin-form-grid">
        <label>时区<input name="timezone" defaultValue={status.settings.timezone} required /></label>
        <label>发布时间<input name="publishTime" type="time" step="3600" defaultValue={status.settings.publishTime} required /></label>
        <label>发布状态<select name="enabled" defaultValue={String(status.settings.enabled)}><option value="false">暂停</option><option value="true">启用</option></select></label>
        <button type="submit">保存设置</button>
      </form>
    </section>

    <section className="admin-panel">
      <h2>未来 14 天选题</h2>
      <div className="admin-table-wrap"><table><thead><tr><th>日期</th><th>内容类型</th><th>产品</th><th>行业场景</th></tr></thead><tbody>{nextFacebookTopics().map((item) => <tr key={item.dayOffset}><td>第 {item.dayOffset + 1} 天</td><td>{item.contentType}</td><td>{item.product}</td><td>{item.industry}</td></tr>)}</tbody></table></div>
    </section>

    <section className="admin-panel">
      <div className="admin-panel-heading"><div><p className="eyebrow">发布历史</p><h2>Facebook 帖文记录</h2></div></div>
      <div className="admin-table-wrap"><table><thead><tr><th>创建时间</th><th>排期</th><th>状态</th><th>产品</th><th>主题</th><th>Facebook</th><th>失败原因</th></tr></thead><tbody>
        {paged.items.map((post) => <tr key={post.id}><td>{formatAdminDate(post.createdAt)}</td><td>{post.scheduledDate}</td><td>{post.status}</td><td>{post.productName || '-'}</td><td>{post.industry || '-'}</td><td>{post.facebookPostUrl ? <a href={post.facebookPostUrl} target="_blank" rel="noreferrer">打开帖文</a> : '-'}</td><td>{post.failureReason || '-'}</td></tr>)}
        {!paged.items.length ? <tr><td colSpan={7}>当前时间范围内没有 Facebook 发布记录。</td></tr> : null}
      </tbody></table></div>
      <AdminPagination basePath="/admin/facebook" params={params} page={paged.page} perPage={paged.perPage} total={paged.total} totalPages={paged.totalPages} />
    </section>
  </AdminShell>;
}
