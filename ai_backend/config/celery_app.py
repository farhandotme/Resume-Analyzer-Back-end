import os
from celery import Celery
from dotenv import load_dotenv

load_dotenv()

# use environment variable so it works both locally and in Docker
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

celery_app = Celery(
    "ai_resume",
    broker=REDIS_URL,
    backend=REDIS_URL,
    include=["services.tasks"],
)

celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    redis_socket_keepalive=True,
    redis_retry_on_timeout=True,
    broker_connection_retry_on_startup=True,
    result_expires=3600,
)
