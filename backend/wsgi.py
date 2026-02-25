# wsgi.py — Production entry point for Gunicorn + Eventlet
# Eventlet MUST be monkey-patched before any other imports.
# Gunicorn start command: gunicorn --worker-class eventlet --workers 1 --bind 0.0.0.0:$PORT wsgi:app

import eventlet
eventlet.monkey_patch()  # noqa: E402 — must be first

from app import create_app, socketio  # noqa: E402

app = create_app()
