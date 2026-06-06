# ZAIHAI Global Water Sports News Monitor

## Goal

Build a controlled content automation system that monitors global water sports, resort, rental, tourism and marine leisure news, then turns selected items into reviewed ZAIHAI brand perspective articles.

The system must not copy full articles, invent facts, download unauthorized news images, or publish automatically without review.

## Architecture

1. News Collector
   - MVP source: Google News RSS.
   - Future sources: Bing News Search API, GDELT, NewsAPI, SerpAPI, industry RSS and custom media lists.
   - Uses keyword groups for products, applications, pain points and trends.

2. Extractor
   - Best-effort fetch of article text, author and `og:image`.
   - If blocked or incomplete, the item is marked `needs_review`.
   - News images are recorded as URLs only with `license_status = unknown`.

3. Scoring
   - Scores relevance, popularity, freshness, commercial value, content quality and brand fit.
   - Formula:
     `total_score = relevance * 0.30 + popularity * 0.20 + freshness * 0.15 + commercial * 0.20 + content_quality * 0.10 + brand_fit * 0.05`
   - Items below 70 are marked `rejected`.

4. Pain Point Analyzer
   - Extracts likely buyer type, operating pain point, product fit and recommended angle.
   - Keeps recommendations practical and avoids exaggerated product claims.

5. Article Generator
   - Uses OpenAI API when `OPENAI_API_KEY` is configured.
   - Falls back to a structured rule-based article template for local MVP testing.
   - Output includes source information, summary, trend analysis, ZAIHAI perspective, product fit and CTA.

6. Data Storage
   - MVP uses SQLite.
   - `NEWS_MONITOR_DATABASE_URL` can be switched to PostgreSQL later.

7. Admin Review
   - FastAPI endpoints list candidates, inspect scores, generate articles, edit articles, update status and export Markdown.
   - Status flow: `collected -> reviewed / needs_review / rejected -> approved -> published`.

8. Automation
   - APScheduler runs every 4 hours by default, equivalent to cron `0 */4 * * *`.
   - Manual run is available through `POST /run`.
   - Each run writes a database log row and a JSONL log entry under `NEWS_MONITOR_LOG_DIR`.

## Database Table

Table: `news_items`

| Column | Purpose |
|---|---|
| id | Internal primary key |
| news_id | Stable hash of original URL |
| original_title | Original source title |
| original_url | Source URL |
| source_media | Media / source name |
| published_date | Source published date |
| retrieved_date | Collection date |
| author | Author if available |
| summary | Rewritten or feed summary |
| extracted_keywords | Matching keywords as JSON |
| image_url | Image URL only |
| image_source | Image source |
| image_source_url | Original page URL for source image attribution |
| image_usage_type | `external_reference`, `own_image`, `ai_generated` or `default_placeholder` |
| image_copyright_note | Copyright and usage note |
| license_status | `unknown`, `open`, `owned`, etc. |
| relevance_score | Product/topic relevance |
| popularity_score | Source authority and popularity proxy |
| freshness_score | Recency |
| commercial_score | Business conversion value |
| content_quality_score | Usefulness of facts/context |
| brand_fit_score | Natural ZAIHAI angle |
| total_score | Weighted score |
| pain_points | JSON pain point analysis |
| recommended_products | JSON product fit |
| generated_article | Markdown article |
| meta_title | SEO meta title |
| meta_description | SEO meta description |
| slug | SEO URL path |
| category | SEO category |
| tags | JSON tag list |
| is_auto_generated | Marks automated content |
| batch_id | News run batch ID |
| status | Review workflow status |

Table: `news_run_logs`

| Column | Purpose |
|---|---|
| batch_id | Stable run batch ID |
| started_at / ended_at | Run timing |
| status | `running`, `success`, `partial_success`, `failed` |
| searched_keywords | Keyword list as JSON |
| collected_count | Feed items found |
| new_count | New articles inserted |
| duplicate_count | URL/title duplicate count |
| reviewed_count | Items passing review threshold or needing review |
| rejected_count | Low-quality or weak-fit items |
| generated_count | Articles generated as reviewed drafts |
| published_count | Published count, currently 0 in review-first mode |
| failed_count | Failed item count |
| failure_reason | Pipeline failure reason |

## File Structure

```text
news_monitor/
  config.py        Keyword strategy and settings
  collector.py     Google News RSS collector
  extractor.py     Article metadata/text extraction
  scoring.py       Scoring and slug logic
  analyzer.py      Pain point and product-fit analysis
  generator.py     OpenAI/fallback article generator
  models.py        SQLAlchemy table
  schemas.py       Pydantic API schemas
  service.py       Pipeline orchestration and export
  scheduler.py     Every-4-hours scheduled job
  main.py          FastAPI app
  run_once.py      Manual CLI run
```

## Run MVP

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements-news-monitor.txt
uvicorn news_monitor.main:app --reload --port 8088
```

Manual run:

```bash
python -m news_monitor.run_once
```

API:

- `GET /health`
- `POST /run`
- `GET /news`
- `GET /runs`
- `GET /news?status=reviewed`
- `GET /news/{id}`
- `POST /news/{id}/generate`
- `PATCH /news/{id}/status`
- `PATCH /news/{id}/article`
- `GET /news/{id}/export.md`

## Content Rules

- Do not invent facts, sources, dates or quotes.
- Do not reproduce full source articles.
- Do not download unauthorized news images.
- Always include source media and original URL.
- Clearly separate source facts from ZAIHAI perspective.
- Reject weak-fit news instead of forcing product promotion.
