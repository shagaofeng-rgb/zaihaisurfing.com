from __future__ import annotations

import json
from pathlib import Path

from sqlalchemy.orm import Session

from .analyzer import analyze_pain_points
from .collector import CollectedNews, collect_google_news
from .config import settings
from .database import init_db
from .extractor import extract_article_context
from .generator import generate_article_payload
from .models import NewsItem
from .scoring import score_news


def upsert_collected_news(session: Session, collected: CollectedNews) -> NewsItem:
    existing = session.query(NewsItem).filter(NewsItem.original_url == collected.original_url).first()
    if existing:
        return existing
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
        license_status=collected.license_status,
        status="collected",
    )
    session.add(item)
    session.commit()
    session.refresh(item)
    return item


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
    item.status = "reviewed" if item.total_score >= settings.min_total_score else "rejected"
    session.commit()
    session.refresh(item)
    return item


def run_pipeline(session: Session, limit_per_keyword: int = 3, max_articles: int | None = None) -> dict:
    init_db()
    max_articles = max_articles or settings.daily_article_limit
    collected = collect_google_news(limit_per_keyword=limit_per_keyword)
    created = 0
    reviewed = 0
    generated = 0

    for news in collected:
        item = upsert_collected_news(session, news)
        if item.status == "collected":
            created += 1
        item = enrich_and_score(session, item)
        if item.status in {"reviewed", "needs_review"}:
            reviewed += 1
        if item.status == "reviewed" and generated < max_articles and not item.generated_article:
            generate_for_item(session, item)
            generated += 1

    return {
        "collected_from_feeds": len(collected),
        "new_items": created,
        "reviewed_or_needs_review": reviewed,
        "generated_articles": generated,
    }


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
        "license_status": item.license_status,
    }
    body = item.generated_article or "# Article not generated yet\n"
    content = "---\n" + json.dumps(frontmatter, ensure_ascii=True, indent=2) + "\n---\n\n" + body
    path.write_text(content, encoding="utf-8")
    return path

