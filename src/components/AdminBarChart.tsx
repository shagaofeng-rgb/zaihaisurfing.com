type Row = {label: string; value: number};

export default function AdminBarChart({title, rows, emptyLabel = '暂无业务数据'}: {title: string; rows: Row[]; emptyLabel?: string}) {
  const max = Math.max(...rows.map((row) => row.value), 1);
  return (
    <section className="admin-panel admin-chart-panel">
      <div><p className="eyebrow">数据分布</p><h2>{title}</h2></div>
      {rows.length ? <div className="admin-bar-chart" role="img" aria-label={`${title}柱状图`}>
        {rows.map((row) => (
          <div className="admin-bar-chart-row" key={row.label}>
            <span title={row.label}>{row.label}</span>
            <div><i style={{width: `${Math.max(3, (row.value / max) * 100)}%`}} /></div>
            <strong>{row.value.toLocaleString()}</strong>
          </div>
        ))}
      </div> : <p className="admin-empty-copy">{emptyLabel}</p>}
    </section>
  );
}
