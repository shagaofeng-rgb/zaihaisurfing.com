from __future__ import annotations

import hashlib
import re
from dataclasses import dataclass
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from urllib.parse import quote_plus, urlparse

import feedparser
import requests

from .config import settings


@dataclass
class CollectedNews:
    news_id: str
    original_title: str
    original_url: str
    source_media: str | None
    published_date: datetime | None
    retrieved_date: datetime
    summary: str | None
    author: str | None = None
    image_url: str | None = None
    image_source: str | None = None
    license_status: str = "unknown"


def clean_html(value: str | None) -> str | None:
    if not value:
        return None
    cleaned = re.sub(r"<[^>]+>", " ", value)
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    return cleaned or None


def parse_datetime(value: str | None) -> datetime | None:
    if not value:
        return None
    try:
        parsed = parsedate_to_datetime(value)
        if parsed.tzinfo:
            return parsed.astimezone(timezone.utc).replace(tzinfo=None)
        return parsed
    except Exception:
        return None


def source_from_entry(entry) -> str | None:
    source = entry.get("source")
    if isinstance(source, dict) and source.get("title"):
        return source.get("title")
    link = entry.get("link") or ""
    host = urlparse(link).netloc.replace("www.", "")
    return host or None


def image_from_entry(entry) -> str | None:
    media = entry.get("media_content") or entry.get("media_thumbnail") or []
    if media and isinstance(media, list):
        return media[0].get("url")
    links = entry.get("links") or []
    for link in links:
        if str(link.get("type", "")).startswith("image/"):
            return link.get("href")
    return None


def google_news_url(query: str) -> str:
    encoded = quote_plus(query)
    return (
        "https://news.google.com/rss/search?"
        f"q={encoded}&hl={settings.google_news_hl}&gl={settings.google_news_gl}&ceid={settings.google_news_ceid}"
    )


def collect_google_news(limit_per_keyword: int = 5, keywords: list[str] | None = None) -> list[CollectedNews]:
    items: dict[str, CollectedNews] = {}
    retrieved = datetime.utcnow()

    for keyword in keywords or settings.all_keywords:
        try:
            response = requests.get(
                google_news_url(keyword),
                timeout=settings.request_timeout_seconds,
                headers={"User-Agent": "Mozilla/5.0 ZAIHAI-NewsMonitor/1.0 (+https://www.zaihaisurfing.com)"},
            )
            response.raise_for_status()
        except Exception:
            continue
        feed = feedparser.parse(response.content)
        for entry in feed.entries[:limit_per_keyword]:
            url = entry.get("link")
            title = clean_html(entry.get("title"))
            if not url or not title:
                continue
            digest = hashlib.sha256(url.encode("utf-8")).hexdigest()[:32]
            if digest in items:
                continue
            image_url = image_from_entry(entry)
            items[digest] = CollectedNews(
                news_id=digest,
                original_title=title,
                original_url=url,
                source_media=source_from_entry(entry),
                published_date=parse_datetime(entry.get("published")),
                retrieved_date=retrieved,
                summary=clean_html(entry.get("summary")),
                author=entry.get("author"),
                image_url=image_url,
                image_source=source_from_entry(entry) if image_url else None,
                license_status="unknown" if image_url else None,
            )

    return list(items.values())
