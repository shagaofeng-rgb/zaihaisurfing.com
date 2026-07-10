import {redirect} from 'next/navigation';
import AdminShell from '@/components/AdminShell';
import {requireAdminSession} from '@/lib/adminAuth';
import {googleSeoConfigStatus, readGoogleSeoSnapshot, syncGoogleSeoSnapshot, type GoogleSeoMetricRow} from '@/lib/googleSeo';
import {runSitemapMaintenance} from '@/lib/sitemapMaintenance';
import {readSitemapState} from '@/lib/sitemapState';
import {siteUrl} from '@/lib/site';

export const dynamic = 'force-dynamic';

async function syncGoogleSeoAction() {
  'use server';
  await requireAdminSession();
  await syncGoogleSeoSnapshot();
  redirect('/admin/seo?synced=1');
}

async function refreshSitemapAction() {
  'use server';
  await requireAdminSession();
  await runSitemapMaintenance({trigger: 'manual', origin: siteUrl, force: true, submit: true});
  redirect('/admin/seo?sitemap=1');
}

function percent(value: number) {
  return `${(value * 100).toFixed(2)}%`;
}

function position(value: number) {
  return value ? value.toFixed(1) : '-';
}

function MetricTable({title, rows, keyLabel}: {title: string; rows: GoogleSeoMetricRow[]; keyLabel: string}) {
  return (
    <section className="admin-panel">
      <div>
        <p className="eyebrow">Google Search Console</p>
        <h2>{title}</h2>
      </div>
      <div className="admin-table-wrap">
        <table>
          <thead>
            <tr>
              <th>{keyLabel}</th>
              <th>点击</th>
              <th>展示</th>
              <th>CTR</th>
              <th>平均排名</th>
            </tr>
          </thead>
          <tbody>
            {rows.length ? rows.map((row) => (
              <tr key={row.key}>
                <td>{row.key}</td>
                <td>{row.clicks}</td>
                <td>{row.impressions}</td>
                <td>{percent(row.ctr)}</td>
                <td>{position(row.position)}</td>
              </tr>
            )) : (
              <tr><td colSpan={5}>暂无数据。请先完成 Google Search Console 同步，或检查当前日期范围内是否有搜索表现。</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default async function AdminSeoPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const [snapshot, config, sitemap] = await Promise.all([readGoogleSeoSnapshot(), googleSeoConfigStatus(), readSitemapState()]);
  const synced = params.synced === '1';

  return (
    <AdminShell active="seo">
      <div className="admin-title">
        <p className="eyebrow">Google SEO 数据</p>
        <h1>Search Console 搜索表现</h1>
        <p>这里同步 Google Search Console 的真实搜索点击、展示、CTR、平均排名、页面、关键词、国家和设备数据。</p>
      </div>

      <section className="admin-panel">
        <div>
          <p className="eyebrow">同步状态</p>
          <h2>{snapshot.status === 'ok' ? 'Google 数据已连接' : snapshot.status === 'not_configured' ? '等待配置 Google 凭据' : '同步需要处理'}</h2>
          <p>站点资源：{config.siteUrl}</p>
          <p>凭据状态：{config.configured ? `已配置（${config.credentialSource}）` : '未配置服务账号凭据'}</p>
          <p>数据范围：{snapshot.range.startDate} 至 {snapshot.range.endDate}</p>
          <p>最近同步：{snapshot.syncedAt ? snapshot.syncedAt.slice(0, 19).replace('T', ' ') : '-'}</p>
          {synced ? <p>已执行一次手动同步，请查看下方结果。</p> : null}
          {snapshot.error ? <p>提示：{snapshot.error}</p> : null}
        </div>
        <form action={syncGoogleSeoAction} className="admin-actions">
          <button className="button primary small" type="submit">立即同步 Google 数据</button>
        </form>
      </section>

      <section className="admin-panel">
        <div>
          <p className="eyebrow">Sitemap 状态</p>
          <h2>{sitemap.lastRun?.success ? '站点地图运行正常' : sitemap.lastRun ? '站点地图需要处理' : '等待首次站点地图检查'}</h2>
          <p>正式地址：{config.sitemapUrl}</p>
          <p>最近检查：{sitemap.lastRun?.finishedAt ? sitemap.lastRun.finishedAt.slice(0, 19).replace('T', ' ') : '-'}</p>
          <p>URL 数量：{sitemap.lastRun?.processedUrls || sitemap.snapshot.length}</p>
          <p>文件数量：{sitemap.lastRun?.files.length || 0}</p>
          <p>Google 提交：{sitemap.lastRun?.googleSubmission.success ? '已由 API 接受' : sitemap.lastRun?.googleSubmission.message || '尚未提交'}</p>
          {sitemap.lastRun?.errors.length ? <p>错误：{sitemap.lastRun.errors.join('；')}</p> : null}
        </div>
        <form action={refreshSitemapAction} className="admin-actions">
          <button className="button primary small" type="submit">检查 Sitemap 并提交 Google</button>
        </form>
      </section>

      <div className="admin-metrics">
        <article><span>点击</span><strong>{snapshot.totals.clicks}</strong><small>来自 Google 自然搜索</small></article>
        <article><span>展示</span><strong>{snapshot.totals.impressions}</strong><small>Search Console impressions</small></article>
        <article><span>CTR</span><strong>{percent(snapshot.totals.ctr)}</strong><small>点击率</small></article>
        <article><span>平均排名</span><strong>{position(snapshot.totals.position)}</strong><small>数值越低越靠前</small></article>
      </div>

      {!config.configured ? (
        <section className="admin-panel">
          <div>
            <p className="eyebrow">需要配置</p>
            <h2>连接真实 Google SEO 数据需要服务账号</h2>
            <p>请在 Vercel 环境变量中配置 GOOGLE_SEARCH_CONSOLE_SERVICE_ACCOUNT_JSON，或分别配置 GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL 与 GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY，并把该服务账号邮箱加入 Google Search Console 对应资源的用户权限。</p>
          </div>
        </section>
      ) : null}

      <MetricTable title="搜索页面表现" keyLabel="页面" rows={snapshot.pages} />
      <MetricTable title="搜索关键词表现" keyLabel="关键词" rows={snapshot.queries} />
      <MetricTable title="国家/地区表现" keyLabel="国家/地区" rows={snapshot.countries} />
      <MetricTable title="设备表现" keyLabel="设备" rows={snapshot.devices} />
    </AdminShell>
  );
}
