import AdminShell from '@/components/AdminShell';
import {formatAdminDate, getRetailAdminHealth} from '@/lib/adminDataViews';
import {readGoogleSeoSnapshot} from '@/lib/googleSeo';
import {readNewsAutopilotState} from '@/lib/newsAutopilot';
import {defaultNewsSite} from '@/lib/newsSiteConfig';
import {readSitemapState} from '@/lib/sitemapState';

export const dynamic = 'force-dynamic';

export default async function AdminSyncPage() {
  const [health, seo, sitemap, newsAutopilot] = await Promise.all([
    getRetailAdminHealth(),
    readGoogleSeoSnapshot(),
    readSitemapState(),
    readNewsAutopilotState()
  ]);
  const newsSite = defaultNewsSite();
  const newsState = newsSite ? newsAutopilot.sites[newsSite.site_id] : undefined;

  return (
    <AdminShell active="sync">
      <div className="admin-title">
        <p className="eyebrow">运营状态</p>
        <h1>业务服务状态</h1>
        <p>集中查看订单、客户咨询、内容发布和搜索表现的最近更新时间。</p>
      </div>
      <div className="admin-metrics">
        <article><span>订单</span><strong>{health.metrics.orders}</strong><small>当前业务订单</small></article>
        <article><span>客户访问</span><strong>{health.events.length}</strong><small>已记录的访问行为</small></article>
        <article><span>搜索页面</span><strong>{seo.pages.length}</strong><small>已同步的搜索表现页面</small></article>
        <article><span>新闻发布</span><strong>{newsState?.lastPublishedAt ? '正常' : '待更新'}</strong><small>最近一次前台发布状态</small></article>
      </div>
      <section className="admin-panel">
        <h2>业务更新情况</h2>
        <dl className="admin-config-list">
          <div><dt>站点地图</dt><dd>{sitemap.lastRun?.success ? `最近检查已完成，包含 ${sitemap.lastRun.processedUrls} 个页面。` : '等待最近一次检查结果。'}</dd></div>
          <div><dt>搜索表现</dt><dd>{seo.status === 'ok' ? `最近更新：${formatAdminDate(seo.syncedAt)}` : '等待新的搜索表现数据。'}</dd></div>
          <div><dt>新闻内容</dt><dd>{newsState?.lastPublishedAt ? `最近发布：${formatAdminDate(newsState.lastPublishedAt)}` : '暂无最近发布记录。'}</dd></div>
          <div><dt>客户咨询</dt><dd>{health.emails.length ? `最近通知：${formatAdminDate(health.emails[health.emails.length - 1]?.createdAt || '')}` : '暂无客户咨询通知记录。'}</dd></div>
        </dl>
      </section>
      <section className="admin-panel">
        <h2>最近业务记录</h2>
        <dl className="admin-config-list">
          <div><dt>最新订单</dt><dd>{formatAdminDate(health.orders[health.orders.length - 1]?.createdAt || '')}</dd></div>
          <div><dt>最近访问</dt><dd>{formatAdminDate(health.events[health.events.length - 1]?.timestamp || '')}</dd></div>
          <div><dt>最近客户通知</dt><dd>{formatAdminDate(health.emails[health.emails.length - 1]?.createdAt || '')}</dd></div>
          <div><dt>搜索表现更新</dt><dd>{formatAdminDate(seo.syncedAt || '')}</dd></div>
        </dl>
      </section>
    </AdminShell>
  );
}
