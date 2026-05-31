from __future__ import annotations

import json
import re
from datetime import datetime

import requests

from .config import APPLICATION_KEYWORDS, PAIN_POINT_KEYWORDS, PRODUCT_KEYWORDS, SOURCE_AUTHORITY, TREND_KEYWORDS
from .config import settings


def normalize(text: str | None) -> str:
    return (text or "").lower()


def keyword_hits(text: str, keywords: list[str]) -> list[str]:
    return [keyword for keyword in keywords if keyword.lower() in text]


def clamp(value: float) -> float:
    return max(0, min(100, round(value, 2)))


def score_news(title: str, summary: str | None, source_media: str | None, published_date: datetime | None) -> dict:
    text = normalize(f"{title} {summary or ''}")
    product_hits = keyword_hits(text, PRODUCT_KEYWORDS)
    application_hits = keyword_hits(text, APPLICATION_KEYWORDS)
    pain_hits = keyword_hits(text, PAIN_POINT_KEYWORDS)
    trend_hits = keyword_hits(text, TREND_KEYWORDS)
    all_hits = product_hits + application_hits + pain_hits + trend_hits

    relevance = clamp(25 + len(product_hits) * 18 + len(application_hits) * 10 + len(trend_hits) * 8)
    commercial = clamp(20 + len(application_hits) * 14 + len(pain_hits) * 12 + len(product_hits) * 8)
    brand_fit = clamp(25 + len(product_hits) * 16 + len(pain_hits) * 10 + len(application_hits) * 8)
    content_quality = clamp(35 + min(len(summary or ""), 600) / 10 + len(all_hits) * 4)

    source = normalize(source_media)
    popularity = 45
    for media, value in SOURCE_AUTHORITY.items():
        if media in source:
            popularity = value
            break

    freshness = 45
    if published_date:
        age_hours = max(0, (datetime.utcnow() - published_date).total_seconds() / 3600)
        if age_hours <= 24:
            freshness = 100
        elif age_hours <= 72:
            freshness = 82
        elif age_hours <= 168:
            freshness = 62
        else:
            freshness = 40

    total = clamp(
        relevance * 0.30
        + popularity * 0.20
        + freshness * 0.15
        + commercial * 0.20
        + content_quality * 0.10
        + brand_fit * 0.05
    )

    heuristic = {
        "relevance_score": relevance,
        "popularity_score": clamp(popularity),
        "freshness_score": clamp(freshness),
        "commercial_score": commercial,
        "content_quality_score": content_quality,
        "brand_fit_score": brand_fit,
        "total_score": total,
        "extracted_keywords": json.dumps(all_hits, ensure_ascii=True),
    }
    llm_score = score_with_llm(title, summary, source_media, published_date, heuristic)
    return llm_score or heuristic


def score_with_llm(
    title: str,
    summary: str | None,
    source_media: str | None,
    published_date: datetime | None,
    fallback: dict,
) -> dict | None:
    if not settings.openai_api_key:
        return None
    prompt = f"""
Score this water sports industry news candidate for ZAIHAI.
Use only the provided title, summary, source and date. Do not invent facts.
Return JSON with numeric keys: relevance_score, popularity_score, freshness_score,
commercial_score, content_quality_score, brand_fit_score. Scores must be 0-100.

Title: {title}
Summary: {summary}
Source Media: {source_media}
Published Date: {published_date}
Heuristic score reference: {json.dumps(fallback)}
"""
    try:
        response = requests.post(
            "https://api.openai.com/v1/responses",
            headers={
                "Authorization": f"Bearer {settings.openai_api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": settings.openai_model,
                "input": prompt,
                "text": {"format": {"type": "json_object"}},
            },
            timeout=45,
        )
        response.raise_for_status()
        text = response.json()["output"][0]["content"][0]["text"]
        payload = json.loads(text)
        scored = {
            "relevance_score": clamp(float(payload.get("relevance_score", fallback["relevance_score"]))),
            "popularity_score": clamp(float(payload.get("popularity_score", fallback["popularity_score"]))),
            "freshness_score": clamp(float(payload.get("freshness_score", fallback["freshness_score"]))),
            "commercial_score": clamp(float(payload.get("commercial_score", fallback["commercial_score"]))),
            "content_quality_score": clamp(float(payload.get("content_quality_score", fallback["content_quality_score"]))),
            "brand_fit_score": clamp(float(payload.get("brand_fit_score", fallback["brand_fit_score"]))),
            "extracted_keywords": fallback["extracted_keywords"],
        }
        scored["total_score"] = clamp(
            scored["relevance_score"] * 0.30
            + scored["popularity_score"] * 0.20
            + scored["freshness_score"] * 0.15
            + scored["commercial_score"] * 0.20
            + scored["content_quality_score"] * 0.10
            + scored["brand_fit_score"] * 0.05
        )
        return scored
    except Exception:
        return None


def slugify(value: str) -> str:
    value = re.sub(r"[^a-zA-Z0-9]+", "-", value.lower()).strip("-")
    return re.sub(r"-+", "-", value)[:90] or "zaihai-water-sports-insight"
