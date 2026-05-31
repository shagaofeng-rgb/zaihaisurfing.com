from __future__ import annotations

from dataclasses import dataclass

from .models import NewsItem


@dataclass
class PublishResult:
    provider: str
    success: bool
    message: str
    remote_url: str | None = None


class CmsPublisher:
    """Extension point for WordPress, Strapi, Shopify/SHOPLINE blog or custom CMS publishing."""

    provider = "markdown-only"

    def publish(self, item: NewsItem) -> PublishResult:
        return PublishResult(
            provider=self.provider,
            success=False,
            message="Automatic CMS publishing is disabled in the MVP. Review and export Markdown first.",
        )

