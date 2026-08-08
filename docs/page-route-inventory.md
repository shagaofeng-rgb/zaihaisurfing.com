# ZAIHAI Page Route Inventory

Base production URL: `https://www.zaihaisurfing.com`

Public multilingual pages use one locale from: `en`, `es`, `fr`, `de`, `ar`, `pt`, `ru`.

## Main browsing paths

| Page | Path pattern | English example |
| --- | --- | --- |
| Home | `/{locale}` | `/en` |
| Products | `/{locale}/products` | `/en/products` |
| Product details | `/{locale}/products/{slug}` | `/en/products/x1-pro` |
| Applications | `/{locale}/applications` | `/en/applications` |
| OEM and factory | `/{locale}/factory` | `/en/factory` |
| Projects | `/{locale}/projects` | `/en/projects` |
| News list | `/{locale}/news` | `/en/news` |
| News article | `/{locale}/news/{slug}` | `/en/news/example-article` |
| News category | `/{locale}/news/category/{category}` | `/en/news/category/industry-trend` |
| News tag | `/{locale}/news/tag/{tag}` | `/en/news/tag/safety-regulation` |
| Blog list | `/{locale}/blog` | `/en/blog`, `/es/blog` |
| Blog article | `/{locale}/blog/{slug}` | `/en/blog/electric-boating-growth-rental-fleets` |
| About | `/{locale}/about` | `/en/about` |
| Contact | `/{locale}/contact` | `/en/contact` |
| FAQ | `/{locale}/faq` | `/en/faq` |
| Shipping | `/{locale}/shipping` | `/en/shipping` |
| Warranty | `/{locale}/warranty` | `/en/warranty` |
| Returns | `/{locale}/returns` | `/en/returns` |
| Privacy | `/{locale}/privacy` | `/en/privacy` |
| Terms | `/{locale}/terms` | `/en/terms` |

## Customer account paths

| Page | Path |
| --- | --- |
| Account dashboard | `/account` |
| Sign in | `/account/login` |
| Register | `/account/register` |
| Password reset | `/account/forgot-password` |
| Profile | `/account/profile` |
| Orders | `/account/orders` |
| Order details | `/account/orders/{orderNo}` |

## Checkout paths

| Page | Path pattern |
| --- | --- |
| Checkout | `/{locale}/checkout` |
| Payment success | `/{locale}/checkout/success` |
| Payment failure | `/{locale}/checkout/failed` |

## Search and crawler paths

| Resource | Path |
| --- | --- |
| Main sitemap | `/sitemap.xml` |
| News sitemap | `/news-sitemap.xml` |
| Robots | `/robots.txt` |
| News RSS | `/news/rss.xml` |
| AI discovery | `/llms.txt`, `/llms-full.txt`, `/ai.txt` |

## Administrative paths

Administrative pages require a valid administrator session and are not public navigation paths.

| Area | Path |
| --- | --- |
| Admin home | `/admin` |
| Blog management | `/admin/blog` |
| News management | `/admin/news` |
| Product management | `/admin/products` |
| Orders | `/admin/orders` |
| Customers | `/admin/customers` |
| SEO | `/admin/seo` |
| Visitor records | `/admin/visitors` |
| Synchronization status | `/admin/sync` |
