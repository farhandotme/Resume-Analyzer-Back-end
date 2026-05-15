from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
import requests
from pydantic import BaseModel
import os
from fastapi import APIRouter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_qdrant import QdrantVectorStore
from qdrant_client import QdrantClient
import asyncio

router = APIRouter()

from dotenv import load_dotenv

load_dotenv()


class PdfData(BaseModel):
    pdf_url: str
    user_id: str


@router.post("/rag-pdf")
async def rag_storing_pdf(req: PdfData):
    pdfUrl = req.pdf_url
    user_id = req.user_id
    print("url :", pdfUrl)
    # loading the pdf---->

    loader = PyPDFLoader(pdfUrl)
    data = loader.load()

    # text splitter--->

    text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    texts = text_splitter.split_documents(data)

    # embedding Model -------
    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )

    # client = QdrantClient(host="localhost", port=6333)
    vector_store = QdrantVectorStore.from_documents(
        documents=texts,
        embedding=embeddings,
        url="http://localhost:6333",
        collection_name=f"resume_{user_id}",
    )
    return {"message": "Resume stored successfully", "collection": f"resume_{user_id}"}
