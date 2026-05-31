from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, Float, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from .database import Base


class NewsItem(Base):
    __tablename__ = "news_items"
    __table_args__ = (UniqueConstraint("original_url", name="uq_news_original_url"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    news_id: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    original_title: Mapped[str] = mapped_column(String(512))
    original_url: Mapped[str] = mapped_column(Text)
    source_media: Mapped[str | None] = mapped_column(String(255), nullable=True)
    published_date: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    retrieved_date: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    author: Mapped[str | None] = mapped_column(String(255), nullable=True)
    summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    extracted_keywords: Mapped[str | None] = mapped_column(Text, nullable=True)
    image_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    image_source: Mapped[str | None] = mapped_column(String(255), nullable=True)
    license_status: Mapped[str | None] = mapped_column(String(80), default="unknown")

    relevance_score: Mapped[float] = mapped_column(Float, default=0)
    popularity_score: Mapped[float] = mapped_column(Float, default=0)
    freshness_score: Mapped[float] = mapped_column(Float, default=0)
    commercial_score: Mapped[float] = mapped_column(Float, default=0)
    content_quality_score: Mapped[float] = mapped_column(Float, default=0)
    brand_fit_score: Mapped[float] = mapped_column(Float, default=0)
    total_score: Mapped[float] = mapped_column(Float, default=0)

    pain_points: Mapped[str | None] = mapped_column(Text, nullable=True)
    recommended_products: Mapped[str | None] = mapped_column(Text, nullable=True)
    generated_article: Mapped[str | None] = mapped_column(Text, nullable=True)
    meta_title: Mapped[str | None] = mapped_column(String(120), nullable=True)
    meta_description: Mapped[str | None] = mapped_column(String(220), nullable=True)
    slug: Mapped[str | None] = mapped_column(String(255), nullable=True)
    status: Mapped[str] = mapped_column(String(40), default="collected", index=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

