from __future__ import annotations

import json
import uuid
from datetime import datetime
from difflib import SequenceMatcher
from pathlib import Path

from sqlalchemy.orm import Session

from .analyzer import analyze_pain_points
from .collector import CollectedNews, collect_google_news
from .config import settings
from .database import init_db
from .extractor import extract_article_context
from .generator import generate_article_payload
from .models import NewsItem, NewsRunLog
from .scoring import score_news


def normalize_title(value: str | None) -> str:
    return " ".join((value or "").lower().split())


def is_similar_title(left: str | None, right: str | None) -> bool:
    left_title = normalize_title(left)
    right_title = normalize_title(right)
    if not left_title or not right_title:
        return False
    if left_title == right_title:
        return True
    return SequenceMatcher(None, left_title, right_title).ratio() >= 0.88


def classify_article(title: str, summary: str | None) -> tuple[str, list[str]]:
    text = f"{title} {summary or ''}".lower()
    tags: list[str] = []
    if "paddle" in text or "sup" in text:
        category = "Paddle Board News"
        tags.extend(["paddle board", "SUP", "water sports"])
    elif "wholesale" in text or "b2b" in text or "export" in text:
        category = "B2B Wholesale"
        tags.extend(["wholesale", "custom products", "water sports"])
    elif "surf" in text:
        category = "Surfing Trends"
        tags.extend(["surfing", "surfboard", "surf gear"])
    elif "market" in text or "trend" in text or "retail" in text:
        category = "Market Insights"
        tags.extend(["market trends", "outdoor sports", "e-commerce"])
    else:
        category = "Industry News"
        tags.extend(["water sports", "outdoor sports", "beach lifestyle"])
    return category, list(dict.fromkeys(tags[:8]))


def append_run_log_file(payload: dict) -> None:
    settings.log_dir.mkdir(parents=True, exist_ok=True)
    path = settings.log_dir / "news-monitor-runs.jsonl"
    path.write_text("", encoding="utf-8") if not path.exists() else None
    with path.open("a", encoding="utf-8") as handle:
        handle.write(json.dumps(payload, ensure_ascii=True, default=str) + "\n")


def upsert_collected_news(session: Session, collected: CollectedNews, batch_id: str) -> tuple[NewsItem, bool]:
    existing = session.query(NewsItem).filter(NewsItem.original_url == collected.original_url).first()
    if existing:
        return existing, False
    recent_items = session.query(NewsItem).order_by(NewsItem.retrieved_date.desc()).limit(200).all()
    for item in recent_items:
        if is_similar_title(item.original_title, collected.original_title):
            return item, False
    category, tags = classify_article(collected.original_title, collected.summary)
    item = NewsItem(
        news_id=collected.news_id,
        original_title=collected.original_title,
        original_url=collected.original_url,
        source_media=collected.source_media,
        published_date=collected.published_date,
        retrieved_date=collected.retrieved_date,
        author=collected.author,
        summary=collected.summary,
        image_url=collected.image_url,
        image_source=collected.image_source,
        image_source_url=collected.original_url if collected.image_url else None,
        image_usage_type="external_reference" if collected.image_url else "default_placeholder",
        image_copyright_note=(
            "External source image URL retained for reference only; do not download or treat as owned media without authorization."
            if collected.image_url
            else "No source image detected; use owned, AI-generated, or default placeholder artwork."
        ),
        license_status=collected.license_status,
        category=category,
        tags=json.dumps(tags, ensure_ascii=True),
        is_auto_generated="true",
        batch_id=batch_id,
        status="collected",
    )
    session.add(item)
    session.commit()
    session.refresh(item)
    return item, True


def enrich_and_score(session: Session, item: NewsItem) -> NewsItem:
    extracted = extract_article_context(item.original_url)
    if extracted.get("author") and not item.author:
        item.author = extracted.get("author")
    if extracted.get("image_url") and not item.image_url:
        item.image_url = extracted.get("image_url")
        item.image_source = item.source_media
        item.license_status = "unknown"

    score = score_news(item.original_title, item.summary or extracted.get("text"), item.source_media, item.published_date)
    for key, value in score.items():
        setattr(item, key, value)

    if extracted.get("error") and not item.summary:
        item.status = "needs_review"
    elif item.total_score < settings.min_total_score:
        item.status = "rejected"
    else:
        item.status = "reviewed"

    session.commit()
    session.refresh(item)
    return item


def generate_for_item(session: Session, item: NewsItem) -> NewsItem:
    if item.status == "rejected":
        return item
    pain_points, recommended_products = analyze_pain_points(item.original_title, item.summary)
    item.pain_points = pain_points
    item.recommended_products = recommended_products
    article = generate_article_payload(item, pain_points, recommended_products)
    item.generated_article = article.get("article_markdown")
    item.meta_title = article.get("meta_title")
    item.meta_description = article.get("meta_description")
    item.slug = article.get("slug")
    if not item.category or not item.tags:
        category, tags = classify_article(item.original_title, item.summary)
        item.category = item.category or category
        item.tags = item.tags or json.dumps(tags, ensure_ascii=True)
    item.status = "reviewed" if item.total_score >= settings.min_total_score else "rejected"
    session.commit()
    session.refresh(item)
    return item


def run_pipeline(session: Session, limit_per_keyword: int = 3, max_articles: int | None = None, max_keywords: int | None = None) -> dict:
    init_db()
    batch_id = f"news-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}-{uuid.uuid4().hex[:8]}"
    started_at = datetime.utcnow()
    keywords = settings.all_keywords[:max_keywords] if max_keywords else settings.all_keywords
    run_log = NewsRunLog(
        batch_id=batch_id,
        started_at=started_at,
        status="running",
        searched_keywords=json.dumps(keywords, ensure_ascii=True),
    )
    session.add(run_log)
    session.commit()
    max_articles = max_articles or settings.daily_article_limit
    created = 0
    duplicates = 0
    reviewed = 0
    rejected = 0
    generated = 0
    failed = 0
    collected: list[CollectedNews] = []
    try:
        collected = collect_google_news(limit_per_keyword=limit_per_keyword, keywords=keywords)
        for news in collected:
            try:
                item, is_created = upsert_collected_news(session, news, batch_id)
                if is_created:
                    created += 1
                else:
                    duplicates += 1
                    continue
                item = enrich_and_score(session, item)
                if item.status in {"reviewed", "needs_review"}:
                    reviewed += 1
                if item.status == "rejected":
                    rejected += 1
                if item.status == "reviewed" and generated < max_articles and not item.generated_article:
                    generate_for_item(session, item)
                    generated += 1
            except Exception as exc:
                failed += 1
                append_run_log_file({"batch_id": batch_id, "event": "item_failed", "url": news.original_url, "error": str(exc)})

        result = {
            "batch_id": batch_id,
            "collected_from_feeds": len(collected),
            "new_items": created,
            "duplicate_items": duplicates,
            "reviewed_or_needs_review": reviewed,
            "rejected_items": rejected,
            "generated_articles": generated,
            "published_articles": 0,
            "failed_items": failed,
            "status": "success" if failed == 0 else "partial_success",
        }
        run_log.ended_at = datetime.utcnow()
        run_log.status = result["status"]
        run_log.collected_count = len(collected)
        run_log.new_count = created
        run_log.duplicate_count = duplicates
        run_log.reviewed_count = reviewed
        run_log.rejected_count = rejected
        run_log.generated_count = generated
        run_log.published_count = 0
        run_log.failed_count = failed
        run_log.detail_json = json.dumps(result, ensure_ascii=True)
        session.commit()
        append_run_log_file(result)
        return result
    except Exception as exc:
        run_log.ended_at = datetime.utcnow()
        run_log.status = "failed"
        run_log.failure_reason = str(exc)
        run_log.collected_count = len(collected)
        run_log.failed_count = failed + 1
        session.commit()
        result = {"batch_id": batch_id, "status": "failed", "failure_reason": str(exc)}
        append_run_log_file(result)
        raise


def export_markdown(item: NewsItem, export_dir: Path | None = None) -> Path:
    export_dir = export_dir or settings.export_dir
    export_dir.mkdir(parents=True, exist_ok=True)
    slug = (item.slug or f"/insights/{item.news_id}").rstrip("/").split("/")[-1]
    path = export_dir / f"{slug}.md"
    frontmatter = {
        "title": item.original_title,
        "meta_title": item.meta_title,
        "meta_description": item.meta_description,
        "slug": item.slug,
        "source_media": item.source_media,
        "original_url": item.original_url,
        "published_date": item.published_date.isoformat() if item.published_date else None,
        "retrieved_date": item.retrieved_date.isoformat() if item.retrieved_date else None,
        "status": item.status,
        "total_score": item.total_score,
        "image_url": item.image_url,
        "image_source": item.image_source,
        "image_source_url": item.image_source_url,
        "image_usage_type": item.image_usage_type,
        "image_copyright_note": item.image_copyright_note,
        "license_status": item.license_status,
        "category": item.category,
        "tags": json.loads(item.tags or "[]"),
        "is_auto_generated": item.is_auto_generated,
        "batch_id": item.batch_id,
    }
    body = item.generated_article or "# Article not generated yet\n"
    content = "---\n" + json.dumps(frontmatter, ensure_ascii=True, indent=2) + "\n---\n\n" + body
    path.write_text(content, encoding="utf-8")
    return path
