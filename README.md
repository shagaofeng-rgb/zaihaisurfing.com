# ZAIHAI Surfing 主站

这是 `zaihaisurfing.com` 的 Next.js 生产站点，包含海外零售前台、结账支付、新闻内容系统、SEO 数据同步、客户行为分析和中文管理后台。

## 常用命令

```bash
npm run lint
npm run build
npm run dev
```

## 后台入口

- `/admin`：中文零售后台。
- `/pricing-admin`：独立计价后台。

## 核心数据源

- `src/lib/commerceStore.ts`：订单、支付、物流、退款、邮件和访客事件。
- `src/lib/backendStore.ts`：商品、分类、媒体、内容和系统设置。
- `src/lib/adminExtraStore.ts`：促销、评价和后台审计。
- `src/lib/googleSeo.ts`：Google Search Console 数据同步。

## 部署

生产部署在 Vercel。部署前必须通过 TypeScript 检查和生产构建，并确认没有误改 `.data` 或其他本地数据快照。
