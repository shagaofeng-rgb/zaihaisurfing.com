from __future__ import annotations

from .database import SessionLocal, init_db
from .service import run_pipeline


def main() -> None:
    init_db()
    session = SessionLocal()
    try:
        result = run_pipeline(session)
        print(result)
    finally:
        session.close()


if __name__ == "__main__":
    main()

