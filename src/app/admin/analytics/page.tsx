import AdminShell from '@/components/AdminShell';
import {zhDevice, zhEventType} from '@/lib/adminZh';
import {getAdminDashboardData} from '@/lib/backendStore';

export const dynamic = 'force-dynamic';

export default async function AdminAnalyticsPage() {
  const data = await getAdminDashboardData();
  return (
    <AdminShell active="访问统计">
      <div className="admin-title">
        <p className="eyebrow">访问行为</p>
        <h1>访问统计</h1>
        <p>这里显示前台异步埋点采集到的真实访问、产品浏览、CTA 点击和结账行为。</p>
      </div>
      <div className="admin-metrics">
        <article><span>UV</span><strong>{data.metrics.visitors}</strong><small>独立匿名访客</small></article>
        <article><span>PV</span><strong>{data.metrics.pageViews}</strong><small>页面访问事件</small></article>
        <article><span>产品浏览</span><strong>{data.metrics.productViews}</strong><small>产品详情页访问</small></article>
        <article><span>结账事件</span><strong>{data.metrics.checkoutEvents}</strong><small>结账或订单相关信号</small></article>
      </div>
      <section className="admin-panel">
        <div>
          <p className="eyebrow">来源与国家</p>
          <h2>需求分布</h2>
        </div>
        <div className="admin-two-col">
          <div className="admin-bar-list">{data.trafficSources.length ? data.trafficSources.map((row) => <p key={row.label}><span>{row.label}</span><strong>{row.value}</strong></p>) : <p><span>暂无真实来源数据</span><strong>0</strong></p>}</div>
          <div className="admin-bar-list">{data.countries.length ? data.countries.map((row) => <p key={row.label}><span>{row.label}</span><strong>{row.value}</strong></p>) : <p><span>暂无真实国家/地区数据</span><strong>0</strong></p>}</div>
        </div>
      </section>
      <section className="admin-panel">
        <div>
          <p className="eyebrow">最近行为</p>
          <h2>事件日志</h2>
        </div>
        <div className="admin-table-wrap">
          <table>
            <thead><tr><th>时间</th><th>事件</th><th>页面</th><th>设备</th><th>国家/地区</th><th>来源</th></tr></thead>
            <tbody>
              {data.events.length ? data.events.map((event) => (
                <tr key={event.id}>
                  <td>{event.timestamp.slice(0, 19).replace('T', ' ')}</td>
                  <td>{zhEventType(event.type)}</td>
                  <td>{event.page}</td>
                  <td>{zhDevice(event.device)} / {event.browser}</td>
                  <td>{event.country}</td>
                  <td>{event.referrer || '直接访问'}</td>
                </tr>
              )) : <tr><td colSpan={6}>暂无真实访问事件。前台页面打开后会异步记录。</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </AdminShell>
  );
}
