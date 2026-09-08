'use client';

import {useRef, useState} from 'react';

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

const reservedKeys = new Set(['range', 'start', 'end', 'page']);

function appendPreserved(search: URLSearchParams, params: QueryParams) {
  Object.entries(params).forEach(([key, value]) => {
    if (reservedKeys.has(key)) return;
    if (Array.isArray(value)) value.forEach((item) => item && search.append(key, item));
    else if (value) search.set(key, value);
  });
}

export default function AdminTimeFilter({action, range, start, end, label, summary, params = {}}: AdminTimeFilterProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [selectedRange, setSelectedRange] = useState(range);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function submitSoon() {
    setIsSubmitting(true);
    window.setTimeout(() => formRef.current?.requestSubmit(), 0);
  }

  function applyQuickRange(value: string) {
    setSelectedRange(value);
    if (value === 'custom') return;
    setIsSubmitting(true);
    const search = new URLSearchParams();
    appendPreserved(search, params);
    search.set('range', value);
    search.set('page', '1');
    window.location.assign(`${action}?${search.toString()}`);
  }

  return (
    <form ref={formRef} className="admin-time-filter" action={action} method="get" aria-label={`${label}时间筛选`}>
      {Object.entries(params).map(([key, value]) => {
        if (reservedKeys.has(key) || key === 'perPage') return null;
        if (Array.isArray(value)) return value.map((item) => item ? <input key={`${key}-${item}`} name={key} type="hidden" value={item} /> : null);
        return value ? <input key={key} name={key} type="hidden" value={value} /> : null;
      })}
      {typeof params.perPage === 'string' ? <input name="perPage" type="hidden" value={params.perPage} /> : null}
      <input name="page" type="hidden" value="1" />
      <div>
        <span>{label}</span>
        <small>{summary}</small>
      </div>
      <div className="admin-time-presets" role="group" aria-label="快捷时间范围">
        {quickRanges.map((item) => (
          <button
            className={selectedRange === item.value ? 'active' : ''}
            key={item.value}
            type="button"
            onClick={() => applyQuickRange(item.value)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <label>
        <span>周期</span>
        <select
          name="range"
          value={selectedRange}
          onChange={(event) => {
            setSelectedRange(event.target.value);
            if (event.target.value !== 'custom') submitSoon();
          }}
        >
          <option value="day">今天</option>
          <option value="week">本周</option>
          <option value="month">本月</option>
          <option value="custom">自定义</option>
        </select>
      </label>
      <label>
        <span>开始</span>
        <input type="date" name="start" defaultValue={start} onChange={() => setSelectedRange('custom')} />
      </label>
      <label>
        <span>结束</span>
        <input type="date" name="end" defaultValue={end} onChange={() => setSelectedRange('custom')} />
      </label>
      <button type="submit" onClick={() => setIsSubmitting(true)}>{isSubmitting ? '查询中' : '应用'}</button>
    </form>
  );
}
