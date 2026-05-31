from __future__ import annotations

from apscheduler.schedulers.background import BackgroundScheduler

from .config import settings
from .database import SessionLocal
from .service import run_pipeline


def scheduled_run() -> None:
    session = SessionLocal()
    try:
        run_pipeline(session)
    finally:
        session.close()


def create_scheduler() -> BackgroundScheduler:
    scheduler = BackgroundScheduler(timezone=settings.timezone)
    scheduler.add_job(
        scheduled_run,
        trigger="cron",
        hour=settings.run_hour_utc,
        minute=0,
        id="daily_zaihai_news_monitor",
        replace_existing=True,
    )
    return scheduler

