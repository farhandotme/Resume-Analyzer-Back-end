import logging

from fastapi import APIRouter
from pydantic import BaseModel
from dotenv import load_dotenv

from services.tasks import analyze_resume_task

load_dotenv()

router = APIRouter()
logger = logging.getLogger(__name__)


class AnalyzeRequest(BaseModel):
    job_title: str
    pdf_url: str


@router.post("/analyze")
async def analyze_resume(req: AnalyzeRequest):
    try:
        task = analyze_resume_task.delay(req.pdf_url, req.job_title)

        logger.info(f"Analyze job queued: {task.id} for job_title: {req.job_title}")

        return {"success": True, "job_id": task.id}

    except Exception as e:
        logger.exception("Failed to queue analysis task")

        return {"success": False, "error": str(e)}


@router.get("/analyze/status/{job_id}")
async def get_status(job_id: str):
    try:
        task = analyze_resume_task.AsyncResult(job_id)

        if task.state == "PENDING":
            return {
                "success": True,
                "status": "processing",
                "data": None,
            }

        elif task.state == "FAILURE":
            return {
                "success": False,
                "status": "failed",
                "error": str(task.result),
            }

        elif task.state == "SUCCESS":
            result = task.result

            if isinstance(result, dict) and result.get("success") is False:
                return {
                    "success": False,
                    "status": "failed",
                    "error": result.get("error"),
                }

            return {
                "success": True,
                "status": "done",
                "data": result,
            }

        return {
            "success": True,
            "status": task.state.lower(),
            "data": None,
        }

    except Exception as e:
        logger.exception("Status check failed")

        return {
            "success": False,
            "status": "failed",
            "error": str(e),
        }
