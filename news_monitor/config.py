from __future__ import annotations

import os
from dataclasses import dataclass, field
from pathlib import Path


ROOT_DIR = Path(__file__).resolve().parents[1]


PRODUCT_KEYWORDS = [
    "surfing industry news",
    "surfboard market trends",
    "surfing gear trends",
    "surf accessories market",
    "paddle board industry",
    "SUP board market",
    "inflatable paddle board trends",
    "custom surfboard manufacturing",
    "electric surfboard",
    "e surfboard",
    "motorized surfboard",
    "jetboard",
    "electric jetboard",
    "powered surfboard",
    "gasoline surfboard",
    "fuel powered surfboard",
    "electric water kart",
    "electric kart boat",
    "water go kart",
    "water sports equipment",
    "beach sports equipment",
    "sports equipment export news",
]

APPLICATION_KEYWORDS = [
    "beach resort water sports",
    "water sports rental",
    "yacht club activities",
    "water park attractions",
    "coastal tourism",
    "lake tourism",
    "marine leisure",
    "outdoor adventure tourism",
    "resort entertainment",
    "tourist attraction water sports",
]

PAIN_POINT_KEYWORDS = [
    "no waves",
    "flat water sports",
    "water sports safety",
    "resort revenue",
    "tourism recovery",
    "rental business",
    "low maintenance water sports",
    "family water entertainment",
    "sustainable tourism",
    "electric marine mobility",
]

TREND_KEYWORDS = [
    "global surf market",
    "water sports e-commerce",
    "cross-border e-commerce outdoor sports",
    "water sports consumer trends",
    "surf lifestyle trends",
    "surfing tourism news",
    "outdoor sports retail trends",
    "summer outdoor product trends",
    "beach lifestyle products",
    "electric water sports",
    "marine electrification",
    "electric boats",
    "personal watercraft",
    "water tourism trends",
    "adventure tourism",
    "experiential travel",
    "sustainable recreation",
    "luxury resort amenities",
]

SOURCE_AUTHORITY = {
    "reuters": 95,
    "associated press": 92,
    "bbc": 90,
    "cnn": 82,
    "travel weekly": 80,
    "skift": 86,
    "blooloop": 80,
    "boating industry": 84,
    "marine industry news": 84,
    "powersports business": 82,
    "yachting": 78,
    "boat international": 80,
}


@dataclass(frozen=True)
class Settings:
    database_url: str = os.getenv("NEWS_MONITOR_DATABASE_URL", f"sqlite:///{ROOT_DIR / 'news_monitor.db'}")
    openai_api_key: str | None = os.getenv("OPENAI_API_KEY")
    openai_model: str = os.getenv("NEWS_MONITOR_OPENAI_MODEL", "gpt-4.1-mini")
    google_news_hl: str = os.getenv("NEWS_MONITOR_GOOGLE_HL", "en-US")
    google_news_gl: str = os.getenv("NEWS_MONITOR_GOOGLE_GL", "US")
    google_news_ceid: str = os.getenv("NEWS_MONITOR_GOOGLE_CEID", "US:en")
    min_total_score: float = float(os.getenv("NEWS_MONITOR_MIN_SCORE", "70"))
    daily_article_limit: int = int(os.getenv("NEWS_MONITOR_DAILY_LIMIT", "8"))
    export_dir: Path = Path(os.getenv("NEWS_MONITOR_EXPORT_DIR", str(ROOT_DIR / "exports")))
    log_dir: Path = Path(os.getenv("NEWS_MONITOR_LOG_DIR", str(ROOT_DIR / "news_monitor_logs")))
    request_timeout_seconds: int = int(os.getenv("NEWS_MONITOR_REQUEST_TIMEOUT_SECONDS", "10"))
    timezone: str = os.getenv("NEWS_MONITOR_TIMEZONE", "UTC")
    cron_hour: str = os.getenv("NEWS_MONITOR_CRON_HOUR", os.getenv("NEWS_MONITOR_RUN_HOUR_UTC", "*/4"))
    keyword_groups: dict[str, list[str]] = field(
        default_factory=lambda: {
            "product": PRODUCT_KEYWORDS,
            "application": APPLICATION_KEYWORDS,
            "pain_point": PAIN_POINT_KEYWORDS,
            "trend": TREND_KEYWORDS,
        }
    )

    @property
    def all_keywords(self) -> list[str]:
        seen: set[str] = set()
        keywords: list[str] = []
        for group in self.keyword_groups.values():
            for keyword in group:
                if keyword not in seen:
                    seen.add(keyword)
                    keywords.append(keyword)
        return keywords


settings = Settings()
