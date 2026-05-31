$ErrorActionPreference = "Stop"

if (-not (Test-Path ".\.venv\Scripts\python.exe")) {
  Write-Host "Creating Python virtual environment..."
  python -m venv .venv
}

.\.venv\Scripts\python.exe -m pip install -r requirements-news-monitor.txt
.\.venv\Scripts\python.exe -m uvicorn news_monitor.main:app --reload --port 8088

