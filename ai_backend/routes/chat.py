import logging

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

from services.rag_service import rag_storing_pdf, retrive_resume_chanks
from prompts.prompt import resume_prompt
from config.ai_models import llm

router = APIRouter()
logger = logging.getLogger(__name__)


class ChatRequest(BaseModel):
    pdf_url: Optional[str] = None
    message: str
    user_id: str


@router.post("/chat")
async def chat(req: ChatRequest):

    # Step 1 — store PDF if provided
    if req.pdf_url:
        store_result = rag_storing_pdf(user_id=req.user_id, pdf_url=req.pdf_url)
        if not store_result["success"]:
            return store_result

    # Step 2 — retrieve chunks
    retrieve_result = retrive_resume_chanks(user_id=req.user_id, user_query=req.message)
    if not retrieve_result["success"]:
        return retrieve_result

    # Step 3 — build prompt and call LLM
    try:
        context = "\n\n".join(retrieve_result["chunks"])
        final_prompt = resume_prompt(context=context, question=req.message)
        response = llm.invoke(final_prompt)
    except Exception as e:
        logger.error(f"LLM call failed for user {req.user_id}: {e}")
        return {"success": False, "error": "AI response failed. Try again."}

    # Step 4 — return
    logger.info(f"Chat success for user {req.user_id}")
    return {
        "success": True,
        "answer": response.content,
        "retrieved_chunks": retrieve_result["chunks"],
    }
