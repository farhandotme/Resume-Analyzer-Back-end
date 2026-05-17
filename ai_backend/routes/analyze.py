import logging
import os
import json
import re

from fastapi import APIRouter
from pydantic import BaseModel
from dotenv import load_dotenv
from tavily import TavilyClient
from langchain_community.document_loaders import PyMuPDFLoader

from config.ai_models import llm
from prompts.prompt import scoring_resume

load_dotenv()

router = APIRouter()
logger = logging.getLogger(__name__)

tavily_client = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))


def extract_search_text(tavily_response: dict) -> str:
    results = tavily_response.get("results", [])
    combined = ""
    for result in results:
        title = result.get("title", "")
        content = result.get("content", "")
        combined += f"Source: {title}\n{content}\n\n"
    return combined.strip()


def extract_pdf_data(pdf_url: str) -> str:
    loader = PyMuPDFLoader(pdf_url)
    data = loader.load()
    return "\n".join([page.page_content for page in data])


class AnalyzeRequest(BaseModel):
    job_title: str
    pdf_url: str


@router.post("/analyze")
async def analyze_resume(req: AnalyzeRequest):

    # Step 1 — extract resume text from PDF
    try:
        resume_text = extract_pdf_data(pdf_url=req.pdf_url)
        if not resume_text or len(resume_text.strip()) == 0:
            return {
                "success": False,
                "error": "PDF has no readable text. It might be a scanned image.",
            }
    except Exception as e:
        logger.error(f"PDF extraction failed for url {req.pdf_url}: {e}")
        return {
            "success": False,
            "error": "Could not read the PDF. Check the URL and try again.",
        }

    # Step 2 — search market data from Tavily
    try:
        queries = [
            f"{req.job_title} required skills certifications experience 2026 hiring",
            f"{req.job_title} resume ATS keywords format tips to get hired 2026",
            f"{req.job_title} job market demand salary growth opportunities 2026",
        ]
        all_text = ""
        for query in queries:
            response = tavily_client.search(query=query, max_results=2)
            all_text += extract_search_text(response) + "\n"
    except Exception as e:
        logger.error(f"Tavily search failed for job_title {req.job_title}: {e}")
        return {
            "success": False,
            "error": "Market data search failed. Try again in a moment.",
        }

    # Step 3 — build prompt and call LLM
    try:
        final_prompt = scoring_resume(
            internet_data=all_text, resume_content=resume_text, job_title=req.job_title
        )
        response = llm.invoke(final_prompt)
    except Exception as e:
        logger.error(f"LLM call failed for job_title {req.job_title}: {e}")
        return {"success": False, "error": "AI analysis failed. Try again."}

    # Step 4 — parse JSON response
    try:
        cleaned = re.sub(r"```json|```", "", response.content).strip()
        result = json.loads(cleaned)
    except Exception as e:
        logger.error(f"JSON parsing failed: {e}")
        logger.error(f"Raw LLM response: {response.content}")
        return {"success": False, "error": "Could not parse AI response. Try again."}

    # Step 5 — return
    logger.info(f"Analyze success for job_title: {req.job_title}")
    return {"success": True, "data": result}
