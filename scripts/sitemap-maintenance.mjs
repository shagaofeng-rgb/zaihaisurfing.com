const args = new Set(process.argv.slice(2));
const baseUrl = (process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://www.zaihaisurfing.com').replace(/\/$/, '');
const params = new URLSearchParams({trigger: 'manual'});
if (args.has('--force')) params.set('force', '1');
if (args.has('--dry-run')) params.set('dryRun', '1');
if (args.has('--submit')) params.set('submit', '1');

const headers = {};
if (process.env.CRON_SECRET) headers.Authorization = `Bearer ${process.env.CRON_SECRET}`;

const endpoint = `${baseUrl}/api/cron/sitemap-health?${params}`;
const response = await fetch(endpoint, {headers});
const payload = await response.json().catch(() => ({success: false, error: `Non-JSON response (${response.status})`}));

if (args.has('--verbose')) {
  console.log(JSON.stringify(payload, null, 2));
} else if (payload.data) {
  console.log(JSON.stringify({
    success: payload.success,
    processedUrls: payload.data.processedUrls,
    files: payload.data.files,
    changed: payload.data.changed,
    googleSubmission: payload.data.googleSubmission,
    errors: payload.data.errors
  }, null, 2));
} else {
  console.log(JSON.stringify(payload, null, 2));
}

if (!response.ok || !payload.success) process.exitCode = 1;
