# ZAIHAI 网站询盘自动发送邮箱配置说明

## 推荐链路

```text
Shopline / 独立站询盘表单
→ Vercel 邮件接口
→ 腾讯企业邮箱 SMTP
→ davidsha@zaihaisurfing.com 收到邮件
```

## 你现在已有的信息

腾讯企业邮箱 SMTP：

```env
SMTP_HOST=smtp.exmail.qq.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=davidsha@zaihaisurfing.com
INQUIRY_FROM=davidsha@zaihaisurfing.com
INQUIRY_TO=davidsha@zaihaisurfing.com
```

你刚生成的“客户端专用密码”要填到：

```env
SMTP_PASS=你的客户端专用密码
```

注意：`SMTP_PASS` 只能放在 Vercel 环境变量里，不能放到 Shopline 页面代码里。

## 已生成的接口目录

接口代码在：

```text
C:\Users\Administrator\Documents\在海网站\mail-api
```

核心文件：

```text
mail-api/api/inquiry.js
mail-api/.env.example
mail-api/package.json
mail-api/README.md
```

## Vercel 后台需要配置的环境变量

进入 Vercel 项目：

`Project Settings` → `Environment Variables`

添加：

```env
SMTP_HOST=smtp.exmail.qq.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=davidsha@zaihaisurfing.com
SMTP_PASS=你的客户端专用密码
INQUIRY_FROM=davidsha@zaihaisurfing.com
INQUIRY_TO=davidsha@zaihaisurfing.com
ALLOWED_ORIGINS=https://www.zaihaisurfing.com,https://zaihaisurfing.com
```

## Shopline 页面要添加的配置

部署成功后，你会得到一个接口地址，类似：

```text
https://zaihai-inquiry-mail-api.vercel.app/api/inquiry
```

然后在 Shopline 页面表单脚本前添加：

```html
<script>
  window.ZAIHAI_INQUIRY_ENDPOINT = "https://zaihai-inquiry-mail-api.vercel.app/api/inquiry";
</script>
```

我已经把这个片段放到了：

```text
shopline-import/zaihai-inquiry-endpoint-config.html
```

## 表单提交后邮件内容

邮件会包含：

- Name
- Email
- Phone
- Company
- Country / Region
- Product Requirement
- Message
- Source Page
- Language
- Market
- Submitted Time
- IP
- Browser User Agent

## 测试建议

1. 先用 Vercel 测试接口。
2. 填一个真实询盘。
3. 检查 `davidsha@zaihaisurfing.com` 是否收到邮件。
4. 如果失败，优先检查：
   - `SMTP_PASS` 是否填错
   - 腾讯企业邮箱 IMAP/SMTP 是否开启
   - Vercel 环境变量是否部署到 Production
   - `ALLOWED_ORIGINS` 是否包含正式域名
