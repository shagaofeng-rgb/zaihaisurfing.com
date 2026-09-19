'use client';

import {useState} from 'react';
import {useRouter} from 'next/navigation';

type RealtimePayload = {
  ok: boolean;
  generatedAt: string;
  version: string;
  state: {
    orders: number;
    events: number;
    leads: number;
    latestOrder: string;
    latestEvent: string;
  };
  store?: {
    configured: boolean;
    provider: string;
  };
};

function timeLabel(value: string) {
  if (!value) return '暂无同步';
  return new Date(value).toLocaleTimeString('zh-CN', {hour12: false});
}

export default function AdminRealtimeSync() {
  const router = useRouter();
  const [payload, setPayload] = useState<RealtimePayload | null>(null);
  const [status, setStatus] = useState<'ready' | 'syncing' | 'online' | 'offline'>('ready');

  async function sync() {
    setStatus('syncing');
    try {
      const response = await fetch('/api/admin/realtime', {cache: 'no-store', credentials: 'include'});
      if (!response.ok) throw new Error(`Sync failed: ${response.status}`);
      setPayload(await response.json() as RealtimePayload);
      setStatus('online');
      router.refresh();
    } catch {
      setStatus('offline');
    }
  }

  return (
    <div className={`admin-realtime-sync ${status}`} aria-live="polite">
      <span className="admin-sync-dot" />
      <div>
        <strong>{status === 'offline' ? '暂时无法更新' : status === 'syncing' ? '正在更新' : status === 'online' ? '数据已更新' : '数据概览'}</strong>
        <small>
          {payload ? `订单 ${payload.state.orders} / 客户咨询 ${payload.state.leads} / 最近更新 ${timeLabel(payload.state.latestOrder || payload.state.latestEvent || payload.generatedAt)}` : '按需更新，避免影响后台操作速度'}
        </small>
      </div>
      <button type="button" onClick={sync} disabled={status === 'syncing'}>{status === 'syncing' ? '更新中' : '刷新数据'}</button>
    </div>
  );
}
