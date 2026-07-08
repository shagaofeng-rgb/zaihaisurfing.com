# B2C 零售后台优化计划

## 当前仓库情况

项目是 Next.js + TypeScript 单体应用，前台、多语言页面、结账、支付、新闻、SEO、后台管理都在同一仓库中。生产运行在 Vercel，数据层通过 `durableStore` 抽象，优先使用 Vercel Blob/KV/Redis 等持久化服务。

## 总体架构

- 前台：面向海外客户的英文零售和询盘网站。
- 后台：面向中国运营、销售、客服、仓库、财务和管理人员的中文管理后台。
- API：Next.js Route Handlers，后台 API 必须校验管理员会话。
- 数据：订单、支付、访客、邮件、CMS、促销、评价、审计分文件持久化，避免互相覆盖。

## 后台模块

- 数据概览：销售额、订单、访客、转化、库存、内容和同步状态。
- 商品管理：商品、分类、媒体、库存、促销。
- 订单管理：订单列表、订单详情、物流、退款、预授权。
- 支付与退款：支付状态、网关通知、退款记录。
- 发货与物流：物流状态、承运商、跟踪号。
- 客户管理：客户、表单、购物车与弃购、访客记录。
- 内容与 SEO：新闻、博客、Google Search Console 数据、媒体库。
- 系统：数据同步、用户权限、操作日志、系统设置。

## 数据设计

- `orders.jsonl`：订单主数据。
- `analytics-events.jsonl`：访客、来源、转化和支付相关事件。
- `payment-notifications.jsonl`：Oceanpayment 回调通知。
- `refunds.jsonl`：退款记录。
- `shipments.jsonl`：物流记录。
- `email-logs.jsonl`：邮件发送日志。
- `admin-store.json`：商品、分类、媒体、内容、系统设置。
- `admin-promotions.jsonl`：优惠与促销。
- `admin-reviews.jsonl`：评价。
- `admin-audit.jsonl`：后台操作日志。

## 支付架构

当前保留 Oceanpayment / 钱海支付适配层。订单创建、支付请求、支付返回和支付通知必须保持幂等，成功支付状态不得被失败通知覆盖。退款在订单详情发起并记录退款日志。

## 订单状态机

主状态：待付款、已付款、处理中、已发货、已送达、已完成、已取消、已退款、部分退款、失败。

支付状态：未提交、待处理、处理中、成功、失败、已退款、部分退款。

物流状态：未发货、已发货、运输中、已送达、已退回。

## 库存策略

当前后台先展示商品真实库存、MOQ、低库存和允许下单状态。后续库存流水、锁定库存、入库、出库、盘点和订单占用应继续接入同一持久化数据层。

## 数据同步策略

- 后台每次打开动态读取持久化数据。
- 新闻和 Google SEO 使用 Vercel Cron 同步。
- 表单邮件每月 1 日自动测试。
- 同步状态在 `/admin/sync` 汇总展示。

## 安全方案

- 管理员登录使用服务端签名 Cookie。
- 生产环境必须配置 `ADMIN_JWT_SECRET` 或 `SESSION_SECRET`。
- 推荐使用 `ADMIN_PASSWORD_HASH` 替代明文密码环境变量。
- 后台 API 使用 `requireAdminApiSession`。

## 测试方案

- TypeScript：`npm run lint`。
- 生产构建：`npm run build`。
- 关键后台页面部署后进行浏览器抽查。

## 部署方案

使用 Vercel CLI 生产部署，并将成功部署别名绑定到 `https://zaihaisurfing.com`。

## 风险与限制

- 多账号细粒度 RBAC 目前仍以角色模型和文档边界呈现，未新增用户数据库。
- 优惠码前台核销逻辑需要后续接入购物车/结账计算。
- 库存事务锁、仓库调拨和盘点流水需要下一阶段扩展。
- Google SEO 同步依赖 Search Console 服务账号授权和 Vercel 环境变量。
