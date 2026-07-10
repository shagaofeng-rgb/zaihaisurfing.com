import AdminShell from '@/components/AdminShell';
import {formatAdminDate, getRetailAdminHealth} from '@/lib/adminDataViews';
import {listAdminPosts} from '@/lib/backendStore';
import {readGoogleSeoSnapshot} from '@/lib/googleSeo';
import {readSitemapState} from '@/lib/sitemapState';

export const dynamic = 'force-dynamic';

function googleSeoReady() {
  return Boolean(
    process.env.GOOGLE_SEARCH_CONSOLE_SERVICE_ACCOUNT_JSON ||
    (process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL && process.env.GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY)
  );
}

export default async function AdminSyncPage() {
  const [health, seo, sitemap, posts] = await Promise.all([getRetailAdminHealth(), readGoogleSeoSnapshot(), readSitemapState(), listAdminPosts()]);
  const today = new Date().toISOString().slice(0, 10);
  const newsToday = posts.filter((post) => post.type === 'news' && post.status === 'published' && post.publishDate === today).length;
  const blogToday = posts.filter((post) => post.type === 'blog' && post.status === 'published' && post.publishDate === today).length;
  const cronJobs = [
    {name: '站点地图健康检查', path: '/api/cron/sitemap-health', status: sitemap.lastRun?.success ? `正常，最近处理 ${sitemap.lastRun.processedUrls} 个 URL` : '等待首次检查或需要处理'},
    {name: '新闻自动发布', path: '/api/cron/publish-news', status: newsToday >= 3 ? `今日已发布 ${newsToday} 篇，已达标` : `今日已发布 ${newsToday} 篇，尚未达到 3 篇`},
    {name: '博客自动发布', path: '/api/cron/publish-blog', status: blogToday >= 1 ? `今日已发布 ${blogToday} 篇` : '今日尚未发布'},
    {name: '月度表单测试', path: '/api/cron/test-contact-form', status: '每月 1 日测试表单邮件发送'},
    {name: 'Google SEO 同步', path: '/api/cron/sync-google-seo', status: googleSeoReady() ? `服务账号已配置，最近同步 ${formatAdminDate(seo.syncedAt || '')}` : '等待 Google 服务账号环境变量'}
  ];

  return (
    <AdminShell active="sync">
      <div className="admin-title">
        <p className="eyebrow">数据同步</p>
        <h1>持久化、Cron 与外部数据同步</h1>
        <p>用于检查后台各类真实数据源是否正常：订单、访客、内容、邮件、Google SEO、新闻发布和表单测试任务。</p>
      </div>
      <div className="admin-metrics">
        <article><span>持久化存储</span><strong>{health.persistentStore ? '正常' : '待配置'}</strong><small>生产环境应启用 Vercel Blob/KV/Redis</small></article>
        <article><span>订单</span><strong>{health.metrics.orders}</strong><small>orders.jsonl</small></article>
        <article><span>访客事件</span><strong>{health.events.length}</strong><small>analytics-events.jsonl</small></article>
        <article><span>SEO 数据</span><strong>{seo.pages.length}</strong><small>Search Console 页面数据</small></article>
      </div>
      <section className="admin-panel">
        <h2>Cron 与同步任务</h2>
        <div className="admin-table-wrap">
          <table>
            <thead><tr><th>任务</th><th>接口</th><th>状态</th></tr></thead>
            <tbody>{cronJobs.map((job) => <tr key={job.path}><td>{job.name}</td><td>{job.path}</td><td>{job.status}</td></tr>)}</tbody>
          </table>
        </div>
      </section>
      <section className="admin-panel">
        <h2>最近数据更新时间</h2>
        <dl className="admin-config-list">
          <div><dt>最新订单</dt><dd>{formatAdminDate(health.orders[health.orders.length - 1]?.createdAt || '')}</dd></div>
          <div><dt>最新访客事件</dt><dd>{formatAdminDate(health.events[health.events.length - 1]?.timestamp || '')}</dd></div>
          <div><dt>最新邮件日志</dt><dd>{formatAdminDate(health.emails[health.emails.length - 1]?.createdAt || '')}</dd></div>
          <div><dt>Google SEO 同步时间</dt><dd>{formatAdminDate(seo.syncedAt || '')}</dd></div>
        </dl>
      </section>
    </AdminShell>
  );
}
