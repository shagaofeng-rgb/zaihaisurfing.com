type AdminTimeFilterProps = {
  range: string;
  start: string;
  end: string;
  label: string;
  summary: string;
};

export default function AdminTimeFilter({range, start, end, label, summary}: AdminTimeFilterProps) {
  return (
    <form className="admin-time-filter" action="/admin" method="get" aria-label={`${label} time filter`}>
      <div>
        <span>{label}</span>
        <small>{summary}</small>
      </div>
      <label>
        <span>Period</span>
        <select name="range" defaultValue={range}>
          <option value="day">Today</option>
          <option value="week">This week</option>
          <option value="month">This month</option>
          <option value="year">This year</option>
          <option value="custom">Custom</option>
        </select>
      </label>
      <label>
        <span>From</span>
        <input type="date" name="start" defaultValue={start} />
      </label>
      <label>
        <span>To</span>
        <input type="date" name="end" defaultValue={end} />
      </label>
      <button type="submit">Apply</button>
    </form>
  );
}
