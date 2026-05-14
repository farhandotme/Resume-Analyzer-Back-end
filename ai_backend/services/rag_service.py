from langchain_community.document_loaders import PyPDFLoader
import requests
from pydantic import BaseModel
import os
from fastapi import APIRouter

router = APIRouter()

from dotenv import load_dotenv

load_dotenv()


class PdfData(BaseModel):
    pdf_url: str


@router.post("/pdf-data")
async def extract_data_from_pdf(req: PdfData):
    pdfUrl = req.pdf_url
    print("url :", pdfUrl)
    loader = PyPDFLoader(pdfUrl)
    data = loader.load()
    return {"data": data[0]}
