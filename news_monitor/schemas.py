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
    image_source_url: str | None = None
    image_usage_type: str | None = None
    image_copyright_note: str | None = None
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
    category: str | None = None
    tags: str | None = None
    is_auto_generated: str | None = None
    batch_id: str | None = None
    status: str


class NewsRunLogOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    batch_id: str
    started_at: datetime
    ended_at: datetime | None
    status: str
    searched_keywords: str | None
    collected_count: int
    new_count: int
    duplicate_count: int
    reviewed_count: int
    rejected_count: int
    generated_count: int
    published_count: int
    failed_count: int
    failure_reason: str | None
    detail_json: str | None


class StatusUpdate(BaseModel):
    status: str


class ArticleUpdate(BaseModel):
    generated_article: str
    meta_title: str | None = None
    meta_description: str | None = None
    slug: str | None = None
