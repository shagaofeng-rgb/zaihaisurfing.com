from __future__ import annotations

from fastapi import Depends, FastAPI, HTTPException
from fastapi.responses import PlainTextResponse
from sqlalchemy.orm import Session

from .database import get_session, init_db
from .models import NewsItem
from .scheduler import create_scheduler
from .schemas import ArticleUpdate, NewsOut, StatusUpdate
from .service import export_markdown, generate_for_item, run_pipeline


app = FastAPI(title="ZAIHAI News Monitor", version="0.1.0")
scheduler = create_scheduler()


@app.on_event("startup")
def startup() -> None:
    init_db()
    if not scheduler.running:
        scheduler.start()


@app.on_event("shutdown")
def shutdown() -> None:
    if scheduler.running:
        scheduler.shutdown(wait=False)


@app.get("/health")
def health() -> dict:
    return {"ok": True, "service": "zaihai-news-monitor"}


@app.post("/run")
def run_now(limit_per_keyword: int = 3, max_articles: int = 8, session: Session = Depends(get_session)) -> dict:
    return run_pipeline(session, limit_per_keyword=limit_per_keyword, max_articles=max_articles)


@app.get("/news", response_model=list[NewsOut])
def list_news(status: str | None = None, limit: int = 50, session: Session = Depends(get_session)):
    query = session.query(NewsItem).order_by(NewsItem.total_score.desc(), NewsItem.retrieved_date.desc())
    if status:
        query = query.filter(NewsItem.status == status)
    return query.limit(limit).all()


@app.get("/news/{item_id}", response_model=NewsOut)
def get_news(item_id: int, session: Session = Depends(get_session)):
    item = session.get(NewsItem, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="News item not found")
    return item


@app.post("/news/{item_id}/generate", response_model=NewsOut)
def generate_article(item_id: int, session: Session = Depends(get_session)):
    item = session.get(NewsItem, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="News item not found")
    return generate_for_item(session, item)


@app.patch("/news/{item_id}/status", response_model=NewsOut)
def update_status(item_id: int, payload: StatusUpdate, session: Session = Depends(get_session)):
    item = session.get(NewsItem, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="News item not found")
    item.status = payload.status
    session.commit()
    session.refresh(item)
    return item


@app.patch("/news/{item_id}/article", response_model=NewsOut)
def update_article(item_id: int, payload: ArticleUpdate, session: Session = Depends(get_session)):
    item = session.get(NewsItem, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="News item not found")
    item.generated_article = payload.generated_article
    if payload.meta_title is not None:
        item.meta_title = payload.meta_title
    if payload.meta_description is not None:
        item.meta_description = payload.meta_description
    if payload.slug is not None:
        item.slug = payload.slug
    session.commit()
    session.refresh(item)
    return item


@app.get("/news/{item_id}/export.md", response_class=PlainTextResponse)
def export_item(item_id: int, session: Session = Depends(get_session)):
    item = session.get(NewsItem, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="News item not found")
    path = export_markdown(item)
    return path.read_text(encoding="utf-8")

