# Blog Publishing Plugin Webhook

This endpoint accepts manual publications from an external plugin. It is not a scheduled task and does not re-enable Blog auto publishing.

## Plugin configuration

| Plugin field | Value |
| --- | --- |
| Website framework | Custom developer webhook |
| Domain | `https://www.zaihaisurfing.com` |
| Request URL | `https://www.zaihaisurfing.com/api/webhook/send_article` |
| Request method | `POST` |
| Body format | `application/x-www-form-urlencoded` |
| API key | The value of the server-side `BLOG_WEBHOOK_SIGN` secret |
| Backend login account | `admin` |
| Remark | `ZAIHAI Blog webhook publishing` |
| Verification class ID | `blog` |

## Request parameters

| Field | Required | Notes |
| --- | --- | --- |
| `sign` | Yes | Exact value of `BLOG_WEBHOOK_SIGN`; case-sensitive. |
| `class_id` | Yes | Must be `blog` unless the server-side `BLOG_WEBHOOK_CLASS_ID` is changed. |
| `title` | Yes | Maximum 220 characters. |
| `content` | Yes | Article text, maximum 20,000 characters. |
| `author_id` | Yes | Author identifier displayed in the Blog data record. Use `admin` for the current plugin account. |
| `image_url` | Yes | Reachable external HTTPS image URL. The image is fetched and signature-validated before publication. |

## Responses

Success:

```json
{"code":1,"msg":"发布成功"}
```

Failure:

```json
{"code":0,"msg":"发布失败的具体原因"}
```

## Publication rules

- The same title and content hash is idempotent: a retry returns `code: 1` and does not create a duplicate Blog post.
- A valid request is immediately stored in the existing durable content store as a published Blog post, marks the sitemap as dirty, revalidates Blog pages, and records a sanitized webhook execution log.
- The secret is server-only. Do not put it in frontend code, URLs, screenshots, Git commits, or public documentation.
