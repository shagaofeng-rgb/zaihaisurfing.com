from __future__ import annotations

import json
from datetime import datetime

import requests

from .config import settings
from .scoring import slugify


def call_openai_json(prompt: str) -> dict | None:
    if not settings.openai_api_key:
        return None
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
            timeout=60,
        )
        response.raise_for_status()
        payload = response.json()
        text = payload["output"][0]["content"][0]["text"]
        return json.loads(text)
    except Exception:
        return None


def generate_article_payload(item, pain_points: str, recommended_products: str) -> dict:
    prompt = f"""
You are writing a premium international B2B article for ZAIHAI, a water sports equipment brand.
Use only the provided source facts. Do not invent facts, dates, sources, quotes, or data.
Do not copy more than 25 consecutive words from the source.

Source:
Title: {item.original_title}
URL: {item.original_url}
Source Media: {item.source_media}
Published Date: {item.published_date}
Summary: {item.summary}
Pain Point Analysis: {pain_points}
Recommended Products: {recommended_products}

Return JSON with keys: title, meta_title, meta_description, slug, article_markdown.
The article must include Source Information, Short News Summary, Why This Matters,
ZAIHAI Perspective, Recommended Product Fit, Main Article, CTA.
"""
    llm_payload = call_openai_json(prompt)
    if llm_payload:
        return llm_payload
    return fallback_article_payload(item, pain_points, recommended_products)


def fallback_article_payload(item, pain_points: str, recommended_products: str) -> dict:
    title = f"What {item.original_title} Means for Modern Water Sports Operators"
    slug = f"/insights/{slugify(item.original_title)}"
    retrieved = datetime.utcnow().strftime("%Y-%m-%d")
    products = json.loads(recommended_products)
    pain = json.loads(pain_points)
    summary = item.summary or "The source describes a recent development connected to water sports, tourism, recreation or marine leisure."

    article = f"""# {title}

## Source Information

- Source Media: {item.source_media or "Unknown"}
- Original Title: {item.original_title}
- Original URL: {item.original_url}
- Published Date: {item.published_date or "Unknown"}
- Author if available: {item.author or "Unknown"}
- Image Source if available: {item.image_source or item.image_url or "Not used"}
- Retrieved Date: {retrieved}

## Short News Summary

{summary}

This summary is rewritten for context and source attribution. It is not a full reproduction of the original article.

## Why This Matters

For water sports suppliers, resort operators and rental businesses, this story points to a familiar commercial question: how can venues create a premium water sports experience that is exciting, manageable and easy for guests to understand? The core pain points identified for this story are: {", ".join(pain.get("core_pain_points", []))}.

## ZAIHAI Perspective

From ZAIHAI's perspective, the opportunity is not simply to add more equipment. It is to choose the right type of water attraction for the operating environment. Electric surfboards can support wave-free riding and high-performance water recreation on lakes, bays and controlled water areas. Electric water karts can create an easy-to-operate water attraction for family-friendly venues. Gasoline surfboards may fit advanced riders and outdoor adventure operators who need longer riding sessions.

## Recommended Product Fit

- Electric Surfboard: {products.get("Electric Surfboard")}
- Electric Water Kart: {products.get("Electric Water Kart")}
- Gasoline Surfboard: {products.get("Gasoline Surfboard")}
- Best Use Scenario: {products.get("Best Use Scenario")}

## Main Article

Global water sports businesses are moving toward experiences that are visually strong, easy to explain and suitable for different guest profiles. The referenced news item from {item.source_media or "the source media"} highlights a market context that water recreation operators should watch closely: demand is no longer limited to traditional boating or beach activities. Customers increasingly expect modern marine leisure, premium water sports experiences and activities that can be promoted before the first ride.

For resorts, rental operators and yacht clubs, the business challenge is practical. A new attraction must be exciting enough to create interest, but it also needs a clear operating model. Buyers need to understand the product category, rider difficulty, maintenance requirements, training needs, safety preparation, battery or fuel planning and shipment details before they can make a confident purchase decision.

This is where product fit matters. A resort-ready water sports solution should match the site environment. Electric surfboards are relevant for operators who want high-performance riding without relying on waves. They can be positioned for premium guests, social media content, lake tourism and controlled water areas. Electric water karts are more accessible for family entertainment, water parks and scenic attractions because the seated driving format is easier to understand. Gasoline surfboards are better positioned for advanced users and performance-oriented water adventure programs.

ZAIHAI's role in this kind of market conversation is to provide structured product selection rather than exaggerated claims. The right solution depends on the buyer's country, water area, customer profile, operation team and commercial plan. For distributors, clear comparison between electric surfboards, electric kart boats and gasoline surfboards helps local customers make faster decisions. For resorts and rental operators, model recommendations, product videos, packing information and shipment preparation can reduce friction before launch.

The larger trend is clear: modern water entertainment is becoming part of the wider tourism and outdoor recreation business. Operators are looking for differentiated attractions that can create a memorable guest experience and a practical commercial model. Brands that can provide both product performance and buyer education will be better positioned as this category develops.

## CTA

Explore ZAIHAI electric surfboards, electric water karts and gasoline surfboards for resort-ready water sports solutions. Contact ZAIHAI to request specifications, model recommendations and OEM/ODM support.
"""

    return {
        "title": title[:110],
        "meta_title": title[:60],
        "meta_description": "ZAIHAI analyzes a water sports industry news item and explains product-fit ideas for resorts, rentals and distributors."[:160],
        "slug": slug,
        "article_markdown": article,
    }

