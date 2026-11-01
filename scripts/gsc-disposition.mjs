#!/usr/bin/env node

import {readFile, writeFile} from 'node:fs/promises';

const input = process.argv[2] || 'reports/gsc-2026-11-01-live.json';
const output = process.argv[3] || 'reports/gsc-2026-11-01-disposition.csv';
const rows = JSON.parse(await readFile(input, 'utf8')).rows;
const verification = {
  noindex: 'Not Started',
  '404': 'Not Started',
  duplicate: 'Not Started',
  redirect: 'Not Started',
  alternative: 'Not Started',
  google_canonical: 'Not Started',
  historical_validation: 'Passed 2026-10-20; 101 pending examples'
};

function disposition(row) {
  if (row.disposition === 'sensitive_path_not_fetched') return '保留排除：旧账户、结账或接口路径；未访问敏感内容';
  if (row.error) return `待复查：${row.error}`;
  const path = new URL(row.url).pathname;
  const noindex = /noindex/i.test(`${row.robots || ''},${row.headerRobots || ''}`);
  const redirect = (row.chain || []).length > 0;
  const finalCanonical = row.canonical === row.finalUrl;
  if (row.category === 'noindex') {
    if (noindex && /^\/(?:es|fr|de|ar|pt|ru)\/products\//.test(path)) return '有意排除：非英语产品详情复用英文主体内容，规范页为 /en/products/；不在站点地图';
    if (noindex && /\/news\/(?:tag|category)\//.test(row.finalUrl || path)) return '有意排除：文章数不足的分类/标签页；不在站点地图';
    if (noindex && /[?&](?:page|perPage)=/.test(row.finalUrl || row.url)) return '有意排除：列表分页，规范页为首屏';
    if (noindex) return '需人工复查：当前公开页仍有 noindex';
    if (row.status === 404) return '已删除：无等价内容，保持 404';
    if (redirect) return '已归一：跳转到英文或 www 规范页；待 Google 重抓';
    return '当前可索引：历史 noindex 已解除；待 Google 重抓';
  }
  if (row.category === '404') {
    if (path.startsWith('/policies/')) return redirect && row.status === 200 ? '已修复：旧政策地址永久跳转到现行政策页' : '待修复：旧政策地址需永久跳转';
    if (row.status === 404 && /\/news\/auto-202606/.test(path)) return '保留 404：已停止的旧自动新闻无等价替代';
    if (row.status === 404) return '保留 404：无效入口、已过期静态资源或不支持的语言';
    if (redirect && row.status === 200) return '已修复：等价内容可达；旧记录待 Google 重抓';
    return '需人工复查：404 分类当前响应异常';
  }
  if (row.category === 'duplicate' || row.category === 'google_canonical') {
    if (row.status === 200 && finalCanonical && !noindex) return redirect ? '当前已永久归一到自指规范页；待 Google 重抓' : '当前页面自指规范页且允许收录；待 Google 重抓';
    return '需人工复查：规范页信号不一致';
  }
  if (row.category === 'redirect') {
    if (row.status === 404 && /\/news\/auto-202606/.test(path)) return '已纠正：删除内容无等价替代，返回 404';
    if (row.status === 200 && redirect && row.chain.every((hop) => hop.status === 301 || hop.status === 308)) return '预期永久跳转：协议、域名、语言或旧内容归一';
    if (row.status === 200 && redirect) return '待修复：仍包含临时跳转或异常链';
    return '需人工复查：重定向状态改变';
  }
  if (row.category === 'alternative') {
    if (/\/checkout/.test(path)) return '有意排除：结账参数页 noindex；不入站点地图';
    if (row.status === 200 && (redirect || row.canonical)) return '当前规范页信号有效；参数或域名变体待重抓';
    return '需人工复查：替代页规范信号';
  }
  if (row.category === 'historical_validation') {
    return row.status === 200 && finalCanonical && !noindex
      ? '历史验证已通过；当前可抓取且自指规范页，实际收录仍待 Google 判定'
      : '需复查：历史验证页当前异常';
  }
  return '需人工复查';
}

const quote = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
const header = ['类别', 'GSC URL', '最近抓取', 'GSC 验证状态', '当前 HTTP', '跳转次数', '当前最终 URL', '当前 canonical', '当前 robots', '逐 URL 处置'];
const outputRows = rows.map((row) => [
  row.category, row.url, row.lastCrawled, verification[row.category] || row.gscStatus,
  row.status || row.disposition || row.error, row.chain?.length || 0, row.finalUrl || '', row.canonical || '',
  [row.robots, row.headerRobots].filter(Boolean).join('; '), disposition(row)
]);
await writeFile(output, [header, ...outputRows].map((line) => line.map(quote).join(',')).join('\n') + '\n');
const counts = {};
for (const row of rows) counts[disposition(row)] = (counts[disposition(row)] || 0) + 1;
console.log(JSON.stringify({rows: rows.length, output, counts}, null, 2));
