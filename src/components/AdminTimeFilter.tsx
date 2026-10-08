'use client';

import {useEffect, useState} from 'react';
import AdminIcon from '@/components/AdminIcon';

type QueryParams = Record<string, string | string[] | undefined>;

type AdminTimeFilterProps = {
  action: string;
  range: string;
  start: string;
  end: string;
  label: string;
  summary: string;
  params?: QueryParams;
};

const quickRanges = [
  {value: 'day', label: '今天'},
  {value: 'week', label: '本周'},
  {value: 'month', label: '本月'},
  {value: 'custom', label: '自定义'}
];

const reservedKeys = new Set(['range', 'start', 'end']);

function isPageKey(key: string) {
  return key === 'page' || key.endsWith('Page');
}

export default function AdminTimeFilter({action, range, start, end, label, summary, params = {}}: AdminTimeFilterProps) {
  const [selectedRange, setSelectedRange] = useState(range);
  const [isSubmitting, setIsSubmitting] = useState(false);
  useEffect(() => {
    setSelectedRange(range);
    setIsSubmitting(false);
  }, [action, range, start, end]);

  function applyQuickRange(value: string) {
    setSelectedRange(value);
  }

  return (
    <form className={`admin-time-filter${selectedRange === 'custom' ? ' is-custom' : ''}`} action={action} method="get" aria-label={`${label}筛选`} onSubmit={() => setIsSubmitting(true)}>
      {Object.entries(params).map(([key, value]) => {
        if (reservedKeys.has(key) || isPageKey(key) || key === 'perPage') return null;
        if (Array.isArray(value)) return value.map((item) => item ? <input key={`${key}-${item}`} name={key} type="hidden" value={item} /> : null);
        return value ? <input key={key} name={key} type="hidden" value={value} /> : null;
      })}
      {typeof params.perPage === 'string' ? <input name="perPage" type="hidden" value={params.perPage} /> : null}
      <input name="page" type="hidden" value="1" />
      <div className="admin-time-current"><AdminIcon name="calendar" size={20} /><div><span>{label}</span><small>{summary}</small></div></div>
      <div className="admin-time-presets" role="group" aria-label="快捷时间范围">
        {quickRanges.map((item) => (
          <button
            className={selectedRange === item.value ? 'active' : ''}
            key={item.value}
            type="button"
            aria-pressed={selectedRange === item.value}
            onClick={() => applyQuickRange(item.value)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <input name="range" type="hidden" value={selectedRange} />
      {selectedRange === 'custom' ? <div className="admin-custom-dates">
        <label><span>开始</span><input type="date" name="start" defaultValue={start} required /></label>
        <label><span>结束</span><input type="date" name="end" defaultValue={end} required /></label>
      </div> : null}
      <button className="admin-time-apply" type="submit" disabled={isSubmitting}>{isSubmitting ? '查询中' : '应用'}</button>
    </form>
  );
}
