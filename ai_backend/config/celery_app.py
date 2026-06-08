from celery import Celery

celery_app = Celery(
    "ai_resume",
    broker="redis://localhost:6379/0",
    backend="redis://localhost:6379/0",
    include=["services.tasks"],  # IMPORTANT
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
