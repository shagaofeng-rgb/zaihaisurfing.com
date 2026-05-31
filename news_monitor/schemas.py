from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ScorePayload(BaseModel):
    relevance_score: float = Field(ge=0, le=100)
    popularity_score: float = Field(ge=0, le=100)
    freshness_score: float = Field(ge=0, le=100)
    commercial_score: float = Field(ge=0, le=100)
    content_quality_score: float = Field(ge=0, le=100)
    brand_fit_score: float = Field(ge=0, le=100)
    total_score: float = Field(ge=0, le=100)


class NewsOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    news_id: str
    original_title: str
    original_url: str
    source_media: str | None
    published_date: datetime | None
    retrieved_date: datetime
    summary: str | None
    image_url: str | None
    image_source: str | None
    license_status: str | None
    relevance_score: float
    popularity_score: float
    freshness_score: float
    commercial_score: float
    content_quality_score: float
    brand_fit_score: float
    total_score: float
    pain_points: str | None
    recommended_products: str | None
    generated_article: str | None
    meta_title: str | None
    meta_description: str | None
    slug: str | None
    status: str


class StatusUpdate(BaseModel):
    status: str


class ArticleUpdate(BaseModel):
    generated_article: str
    meta_title: str | None = None
    meta_description: str | None = None
    slug: str | None = None

