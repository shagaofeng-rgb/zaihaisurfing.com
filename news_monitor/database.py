from __future__ import annotations

from sqlalchemy import create_engine
from sqlalchemy import text
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from .config import settings


class Base(DeclarativeBase):
    pass


connect_args = {"check_same_thread": False} if settings.database_url.startswith("sqlite") else {}
engine = create_engine(settings.database_url, connect_args=connect_args)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


def init_db() -> None:
    from . import models  # noqa: F401

    try:
        Base.metadata.create_all(bind=engine)
    except OperationalError as exc:
        if "already exists" not in str(exc).lower():
            raise
    if settings.database_url.startswith("sqlite"):
        with engine.begin() as connection:
            existing = {row[1] for row in connection.execute(text("PRAGMA table_info(news_items)")).fetchall()}
            columns = {
                "image_source_url": "TEXT",
                "image_usage_type": "VARCHAR(80) DEFAULT 'external_reference'",
                "image_copyright_note": "TEXT",
                "category": "VARCHAR(120)",
                "tags": "TEXT",
                "is_auto_generated": "VARCHAR(8) DEFAULT 'true'",
                "batch_id": "VARCHAR(80)",
            }
            for name, ddl in columns.items():
                if name not in existing:
                    connection.execute(text(f"ALTER TABLE news_items ADD COLUMN {name} {ddl}"))


def get_session():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()
