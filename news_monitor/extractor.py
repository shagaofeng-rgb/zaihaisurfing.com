from __future__ import annotations

import re

import requests
from bs4 import BeautifulSoup


def extract_article_context(url: str, timeout: int = 12) -> dict[str, str | None]:
    """Best-effort extraction. If blocked, caller can mark the item needs_review."""
    try:
        response = requests.get(
            url,
            timeout=timeout,
            headers={
                "User-Agent": "Mozilla/5.0 ZAIHAI-NewsMonitor/1.0 (+https://www.zaihaisurfing.com)"
            },
        )
        response.raise_for_status()
    except Exception as exc:
        return {"text": None, "image_url": None, "author": None, "error": str(exc)}

    soup = BeautifulSoup(response.text, "html.parser")
    for tag in soup(["script", "style", "noscript", "svg"]):
        tag.decompose()

    image = soup.find("meta", property="og:image") or soup.find("meta", attrs={"name": "twitter:image"})
    author = soup.find("meta", attrs={"name": "author"})
    paragraphs = [re.sub(r"\s+", " ", p.get_text(" ", strip=True)) for p in soup.find_all("p")]
    text = "\n".join(p for p in paragraphs if len(p) > 40)
    if len(text) > 4500:
        text = text[:4500]

    return {
        "text": text or None,
        "image_url": image.get("content") if image else None,
        "author": author.get("content") if author else None,
        "error": None,
    }

