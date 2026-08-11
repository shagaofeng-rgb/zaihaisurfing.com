# ZAIHAI 全站运行审计与修复记录 - 2026-08-11

## 范围与备份

- 代码库：`zaihaisurfing.com`，分支 `main`。
- 修改前快照：`C:\Users\Administrator\Documents\zaihaisurfing.com主站\zaihaisurfing.com-git\.audit-backups\full-audit-20260811-110250`。
- 快照包含部署配置、环境变量模板、存储/SEO/Webhook 代码、定时任务代码与本地数据副本；未复制任何真实密钥。
- 回滚方式：恢复上述快照中的对应文件，或将本次提交以前的 Git 提交部署回生产。数据迁移只追加缺失的遗留文章，并写入迁移标记，不删除任何记录。

## 已确认正常

| 项目 | 证据 |
| --- | --- |
| 生产部署基线 | Vercel 部署 `dpl_6C8HCz7E5SaufhXi38aVooNUWeaW` 为 `READY`，提交 `e2fcdb9`，正式别名包含 `zaihaisurfing.com` 与 `www.zaihaisurfing.com`。 |
| 最近运行时错误 | Vercel 2026-08-11 查询最近 24 小时返回 `No runtime errors found`。 |
| 产品数据 | 数据快照含 5 个已发布产品；抽查 X1=USD 3,699、X1 Pro=USD 4,099、Rage Shark X=USD 4,300，前端生产构建回读均为 200 且价格存在。 |
| Blog 路由 | `/en/blog` 和已发布详情页在生产构建加真实数据快照下均返回 200。 |
| News 路由与 sitemap | `/en/news`、`/sitemap.xml` 均返回 200；sitemap XML 校验测试 5/5 通过。 |
| 构建与测试 | `npm run lint` 通过；`npm test` 16/16 通过；`npm run build` 成功，生成 432 个静态页面并确认 Proxy、Blog、News、全部 API 路由已编译。 |

## 已发现并修复

### 1. 外部 Blog 插件根路径验证失败

**根因**：项目使用 Next.js 16 和 `src/app` 目录，但旧逻辑使用根目录 `middleware.ts`。Next.js 16 已采用 `proxy.ts` 约定，且该项目的 Proxy 文件必须位于 `src/proxy.ts`；因此插件对 `POST /` 的验证曾落到首页而非 Webhook。

**修复**：

- 删除旧 `middleware.ts`，新增 `src/proxy.ts`。
- 仅将 `POST /` 重写至 `/api/webhook/send_article`；首页 `GET /` 不变。
- 转发发生在国家/地区访问限制之前；没有放开整站，也没有取消中国大陆或印度的普通前台访问限制。
- 更新为 Next.js 16 官方支持的 `config` matcher，显式包含 `/`。

**隔离端到端验证**：

| 检查 | 结果 |
| --- | --- |
| `POST /` 仅带签名和栏目 | `200 {"code":1,"msg":"验证成功"}`，不创建文章。 |
| 首次完整发布 | `200 {"code":1,"msg":"发布成功"}`。 |
| 同一载荷重试 | `200 {"code":1,"msg":"文章已存在，无需重复发布"}`。 |
| 临时存储 | 同一测试标题只存在 1 条记录。 |
| `/en/blog` 与详情页 | 均为 200，且能读取测试标题。 |

### 2. Webhook 临时失败缺少受限重试与完整失败留痕

**修复**：封面解析和持久化写入各增加一次 150ms 的受限重试；成功与失败都写入 `blog-webhook-runs.jsonl`。审计日志失败不会把已成功发布的文章错误标为失败。

### 3. News 前台同时读取持久文章和静态数组

**风险**：同一文章可能由两条数据源渲染，后台修改或删除后前台仍可能出现静态旧内容。

**修复**：首次读取既有存储时，只将缺失的遗留文章一次性迁移入持久内容库并写入 `legacyEditorialMigrationCompletedAt`。之后 News 只读取已发布的持久记录。迁移不删除任何现有 Blog、News、产品或客户数据，也不会在用户手动删除文章后重新写入。

### 4. 客户表单详情未完整持久化

**根因**：询盘事件以前只记录产品、数量与来源摘要，姓名、邮箱、电话、公司和留言仅存在于邮件内容中。

**修复**：新表单事件持久化姓名、邮箱、电话、公司、目标市场、水域、OEM、目的港与留言；后台线索详情已有字段读取逻辑会直接展示这些信息。

**隔离验证**：有效表单返回 200；事件类型为 `contact_inquiry`，9 个关键字段全部存在。邮件状态为 `skipped`，因为隔离环境未配置 SMTP，未对生产邮箱发送测试邮件。

**历史限制**：旧事件没有保存这些原始字段，不能从摘要或邮件状态中可靠反推；历史记录仍保留并可继续查看已有信息。

## Blog 模块与第三方插件

- Blog 已存在，不重复创建：`src/app/[locale]/blog/page.tsx`、`src/app/[locale]/blog/[slug]/page.tsx`、`/admin/blog`、`/api/admin/posts`、`/api/webhook/send_article`。
- 前台只读取后台持久文章：`src/lib/blogFeed.ts` 调用 `listAdminPosts('blog')`。
- Webhook 接受 `application/x-www-form-urlencoded` 的 `sign`、`class_id`、`title`、`content`、`author_id`、`image_url`；签名来自服务端环境变量 `WEBHOOK_ARTICLE_SIGN` 或兼容变量 `BLOG_WEBHOOK_SIGN`，不写入前端或仓库。
- 当前代码无法识别第三方插件的供应商名称，只能确认它采用“自定义开发框架 Webhook”协议；外部插件无需内部 Blog Cron，而是主动向网站提交文章。
- `vercel.json` 未发现 Blog 自动发布 Cron、`publish-blog` 路由或第二个发布器，因此没有内部任务与插件重复发布。

## 定时任务与冲突检查

| 任务 | 生产配置 | 目的 | 冲突检查 |
| --- | --- | --- | --- |
| `/api/cron/sync-google-seo` | `30 2 */3 * *` UTC | 读取/同步 GSC 数据 | 代码另有 72 小时间隔保护；未发现第二个同类 Cron。 |
| `/api/cron/sitemap-health` | 每日 03:10 UTC | 生成、验证 sitemap；仅在符合间隔时提交 | 与 SEO 同步分工不同。 |
| `/api/cron/test-contact-form` | 每月 1 日 02:00 UTC | 检测表单邮件链路 | 仅测试，不发布内容。 |
| `/api/cron/news-autopilot` | 每日 02:55 UTC | News 自动发布 | 与 Blog Webhook 独立。 |
| `/api/cron/facebook-page-post` | 每小时触发一次 | 在配置时间执行 Facebook 发布器 | 内部按时区二次判断。 |

### Google SEO 主动任务

- 生产配置为每 3 个日历日 02:30 UTC 触发，文件：`vercel.json`。
- 路由：`src/app/api/cron/sync-google-seo/route.ts`。即使月末 cron 表达式触发间隔较短，代码也在距离上一次成功同步不足 72 小时时记录 `skipped_interval`，不会每日重复同步。
- 隔离环境验证：无 `Authorization` 返回 401；带正确 Cron 令牌可进入路由，因未配置 Google 服务账号返回受控 `not_configured` 200，并写入运行记录。
- sitemap 健康任务隔离验证为 200：101 个 URL 生成成功、robots 声明正确、所有 sitemap 子文件 HTTP 200、没有错误；未配置 Google 凭据时不会冒充提交成功。

## 待生产环境确认或无法自动检查

1. 当前工具无权读取 Vercel Production 环境变量明文或第三方插件后台，因此无法确认生产 `WEBHOOK_ARTICLE_SIGN`、`CRON_SECRET`、SMTP 与 Google Search Console 服务账号是否仍有效，也不能伪造成功结果。
2. 生产数据存储可为 KV REST 或 Vercel Blob，代码会根据环境变量选择。当前无数据库控制台读取权限，故未把它误报为可验证的关系型数据库表、索引或权限检查。
3. 本地真实数据快照没有 `contact_inquiry` 历史事件，无法完成“随机抽取三条历史表单”的四方核对；新表单隔离端到端已完成。
4. 真实 Google Search Console API 同步与正式插件发布必须在生产密钥仍配置且外部服务可用时执行。上线后可用无密钥根路径探针验证转发，真实文章发布应由插件发起，避免测试文章进入正式前台。
5. 本次记录了本机生产构建页面响应时间（首页 47ms、Blog 列表 93ms、详情 32ms），不是全球真实用户 Core Web Vitals；需继续以 Search Console / PageSpeed 的 RUM 数据为准。

## 修改文件

- `src/proxy.ts` 新增；`middleware.ts` 删除
- `src/app/api/webhook/send_article/route.ts`
- `src/lib/backendStore.ts`
- `src/lib/newsFeed.ts`
- `src/lib/durableStore.ts`
- `src/app/api/contact/inquiry/route.ts`

