# Blog Publishing Plugin Webhook

This endpoint accepts manual Blog publications from an external plugin. It is not a scheduled task and does not re-enable Blog auto publishing.

## Production configuration

Set the server-only Vercel Production environment variables before deployment:

```text
WEBHOOK_ARTICLE_SIGN=<high-strength-secret>
WEBHOOK_ARTICLE_CLASS_ID=blog
```

The secret must never be committed, exposed in client code, placed in a URL, or added to public documentation.

## Plugin configuration

### Custom developer webhook

Use these values when the plugin validates by sending `POST` to the domain root:

| Plugin field | Value |
| --- | --- |
| Website framework | Custom developer webhook |
| Domain | `https://www.zaihaisurfing.com` |
| API key | The exact `WEBHOOK_ARTICLE_SIGN` production value |
| Backend login account | `admin` |
| Remark | `blog新闻生成` |
| Verification class ID | `blog` |

`POST https://www.zaihaisurfing.com/` is internally rewritten to the server-only webhook handler. Homepage `GET /` is unchanged.

### Generic webhook

Use this endpoint if the plugin accepts a full URL:

```text
https://www.zaihaisurfing.com/api/webhook/send_article
```

## Request parameters

Use `POST` with `Content-Type: application/x-www-form-urlencoded`.

| Field | Required for publication | Notes |
| --- | --- | --- |
| `sign` | Yes | Exact, case-sensitive `WEBHOOK_ARTICLE_SIGN`. |
| `class_id` | Yes | `blog` unless the server-side class ID is changed. |
| `title` | Yes | 8 to 220 characters for publication. |
| `content` | Yes | At least 40 characters, maximum 20,000 characters. |
| `author_id` | No | Defaults to `admin`. |
| `image_url` | Yes | Reachable external HTTPS image URL. It is fetched and validated before publication. |

An authenticated request with only `sign` and `class_id`, or short placeholder article fields, is treated as a connection check. It returns exactly:

```json
{"code":1,"msg":"验证成功"}
```

It does not write any content or log a publication record.

## Publication behavior

- A complete authenticated request creates a `published` Blog post in the durable content store.
- The public Blog list and detail routes read only published Blog records from that store.
- The same title and content hash is idempotent. A retry returns `code: 1` and does not create a duplicate post.
- Blog pages and sitemap data are revalidated after a successful publication.

Success response:

```json
{"code":1,"msg":"发布成功"}
```

Failure response:

```json
{"code":0,"msg":"失败原因"}
```
