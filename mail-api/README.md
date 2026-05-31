# ZAIHAI Inquiry Mail API

This small API receives Shopline or static website inquiry form submissions and sends them to `davidsha@zaihaisurfing.com` through Tencent Exmail SMTP.

## 1. Environment Variables

Create these variables in Vercel Project Settings, or copy `.env.example` to `.env.local` for local testing.

```env
SMTP_HOST=smtp.exmail.qq.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=davidsha@zaihaisurfing.com
SMTP_PASS=your-tencent-client-password
INQUIRY_FROM=davidsha@zaihaisurfing.com
INQUIRY_TO=davidsha@zaihaisurfing.com
ALLOWED_ORIGINS=https://www.zaihaisurfing.com,https://zaihaisurfing.com
```

Do not put `SMTP_PASS` into Shopline page code. It must only live in Vercel environment variables.

## 2. Deploy

```powershell
cd C:\Users\Administrator\Documents\在海网站\mail-api
npm install
npm run deploy
```

After deployment, the endpoint will look like:

```text
https://your-vercel-project.vercel.app/api/inquiry
```

## 3. Connect the Website Form

In the page where the form is used, add this before `script.js`:

```html
<script>
  window.ZAIHAI_INQUIRY_ENDPOINT = "https://your-vercel-project.vercel.app/api/inquiry";
</script>
<script src="./script.js"></script>
```

For Shopline, paste the same config script before the imported site script or before the inquiry form script.

## 4. Test

Submit a test inquiry with a real email and phone number. If Vercel logs show SMTP authentication errors, regenerate the Tencent Exmail client password and update `SMTP_PASS`.
