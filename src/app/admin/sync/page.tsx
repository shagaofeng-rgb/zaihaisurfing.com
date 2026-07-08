import AdminShell from '@/components/AdminShell';
import {formatAdminDate, getRetailAdminHealth} from '@/lib/adminDataViews';
import {readGoogleSeoSnapshot} from '@/lib/googleSeo';

export const dynamic = 'force-dynamic';

function envReady(keys: string[]) {
  return keys.every((key) => Boolean(process.env[key]));
}

export default async function AdminSyncPage() {
  const [health, seo] = await Promise.all([getRetailAdminHealth(), readGoogleSeoSnapshot()]);
  const cronJobs = [
    {name: '新闻自动发布', path: '/api/cron/publish-news', status: '按 Vercel Cron 配置执行，每天补足至少 3 篇'},
    {name: '月度表单测试', path: '/api/cron/test-contact-form', status: '每月 1 日测试表单邮件发送'},
    {name: 'Google SEO 同步', path: '/api/admin/google-seo/sync', status: envReady(['GOOGLE_CLIENT_EMAIL', 'GOOGLE_PRIVATE_KEY']) ? '服务账号已配置' : '等待 Google 服务账号环境变量'}
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
