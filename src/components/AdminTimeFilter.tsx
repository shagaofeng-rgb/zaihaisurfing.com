type AdminTimeFilterProps = {
  range: string;
  start: string;
  end: string;
  label: string;
  summary: string;
};

export default function AdminTimeFilter({range, start, end, label, summary}: AdminTimeFilterProps) {
  return (
    <form className="admin-time-filter" action="/admin" method="get" aria-label={`${label}时间筛选`}>
      <div>
        <span>{label}</span>
        <small>{summary}</small>
      </div>
      <label>
        <span>周期</span>
        <select name="range" defaultValue={range}>
          <option value="day">今天</option>
          <option value="week">本周</option>
          <option value="month">本月</option>
          <option value="year">今年</option>
          <option value="custom">自定义</option>
        </select>
      </label>
      <label>
        <span>开始</span>
        <input type="date" name="start" defaultValue={start} />
      </label>
      <label>
        <span>结束</span>
        <input type="date" name="end" defaultValue={end} />
      </label>
      <button type="submit">应用</button>
    </form>
  );
}
