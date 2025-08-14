#!/usr/bin/env bash
set -e
pip install -U pip
pip install -r requirements.txt
# IMPORTANT: Render injects $PORT at runtime; bind to it.
exec uvicorn app:app --host 0.0.0.0 --port "$PORT"
