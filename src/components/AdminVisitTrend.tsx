import type {AnalyticsEvent} from '@/lib/commerceStore';

export default function AdminVisitTrend({events}: {events: AnalyticsEvent[]}) {
  const dates = new Map<string, number>();
  for (const event of events) {
    if (event.type !== 'page_view') continue;
    const day = event.timestamp.slice(0, 10);
    if (/^\d{4}-\d{2}-\d{2}$/.test(day) && Number.isFinite(Date.parse(day))) dates.set(day, (dates.get(day) || 0) + 1);
  }
  const activeDays = [...dates.keys()].sort();
  const lastDay = activeDays.at(-1);
  const series = lastDay ? Array.from({length: 14}, (_, index) => {
    const day = new Date(Date.parse(lastDay) - (13 - index) * 86_400_000).toISOString().slice(0, 10);
    return {day, count: dates.get(day) || 0};
  }).filter(({day}) => day >= activeDays[0]) : [];
  const maximum = Math.max(1, ...series.map(({count}) => count));
  const points = series.map(({count}, index) => {
    const x = series.length === 1 ? 240 : 10 + 460 * index / (series.length - 1);
    return `${x.toFixed(1)},${(139 - 118 * count / maximum).toFixed(1)}`;
  });
  const area = points.length > 1 ? `10,139 ${points.join(' ')} 470,139` : '';

  return <section className="admin-panel admin-visit-trend" aria-labelledby="admin-visit-trend-title">
    <div className="admin-panel-heading"><div><h2 id="admin-visit-trend-title">页面浏览趋势</h2><p>所选时段内最近 14 日 · UTC</p></div></div>
    {series.length ? <>
      <svg className="admin-trend-plot" viewBox="0 0 480 145" preserveAspectRatio="none" aria-hidden="true">
        <path d="M10 25H470 M10 63H470 M10 101H470 M10 139H470" fill="none" stroke="#dce7e4" />
        {area ? <polygon points={area} fill="#e3efd6" /> : null}
        {points.length > 1 ? <polyline points={points.join(' ')} stroke="#527e65" strokeWidth="2" fill="none" vectorEffect="non-scaling-stroke" /> : null}
        {points.map((point, index) => {
          const [cx, cy] = point.split(',');
          return <circle key={series[index].day} cx={cx} cy={cy} r="2.8" fill="#527e65" />;
        })}
      </svg>
      <ul className="sr-only" aria-label="按日期统计的页面浏览量">
        {series.map(({day, count}) => <li key={day}>{day}：{count} 次</li>)}
      </ul>
      <div className="admin-trend-axis"><time>{series[0].day}</time><time>{series.at(-1)?.day}</time></div>
    </> : <p className="admin-empty">该时段暂无浏览记录。</p>}
  </section>;
}
