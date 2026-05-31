from __future__ import annotations

import json


CUSTOMER_TYPES = {
    "resort": "resort operators",
    "hotel": "resort operators",
    "rental": "water sports rental companies",
    "water park": "water park operators",
    "yacht": "yacht clubs",
    "tourism": "tourism project operators",
    "marina": "marina operators",
}


def analyze_pain_points(title: str, summary: str | None) -> tuple[str, str]:
    text = f"{title} {summary or ''}".lower()
    customer_types = [label for key, label in CUSTOMER_TYPES.items() if key in text] or ["water sports operators"]

    pain_points: list[str] = []
    if "tourism" in text or "resort" in text:
        pain_points.append("need for fresh guest experiences and resort-ready water activities")
    if "rental" in text:
        pain_points.append("need for rental-friendly products and clear operation workflows")
    if "electric" in text or "sustainable" in text:
        pain_points.append("growing interest in cleaner and quieter electric water recreation")
    if "water park" in text or "family" in text:
        pain_points.append("need for easy-to-operate attractions for families and supervised venues")
    if not pain_points:
        pain_points.append("need for differentiated water entertainment products that can support local demand")

    products = {
        "Electric Surfboard": "Suitable when the story involves premium riding, wave-free water sports, lake tourism or resort activity upgrades.",
        "Electric Water Kart": "Suitable when the story involves family-friendly attractions, water parks, scenic areas or easy operation.",
        "Gasoline Surfboard": "Suitable when the story involves advanced riders, longer riding sessions or performance-focused outdoor adventure.",
        "Best Use Scenario": ", ".join(customer_types),
    }

    analysis = {
        "news_event": title,
        "involved_customer_types": customer_types,
        "core_pain_points": pain_points,
        "water_entertainment_need": "premium, differentiated and commercially practical water sports experiences",
        "recommended_angle": "industry observation plus practical product-selection advice",
    }
    return json.dumps(analysis, ensure_ascii=True, indent=2), json.dumps(products, ensure_ascii=True, indent=2)

