from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
import requests
from pydantic import BaseModel
from fastapi import APIRouter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_qdrant import QdrantVectorStore
from qdrant_client import QdrantClient

router = APIRouter()

from dotenv import load_dotenv

load_dotenv()


class PdfData(BaseModel):
    pdf_url: str
    user_id: str


# this is the pdf storing function that used to first load the pdf , then split it , generate the embedding and then store ot into the qdrant db


@router.post("/rag-pdf")
async def rag_storing_pdf(req: PdfData):
    pdfUrl = req.pdf_url
    user_id = req.user_id
    print("url :", pdfUrl)
    # loading the pdf---->

    loader = PyPDFLoader(pdfUrl)
    data = loader.load()

    collection_name = f"resume_{user_id}"

    # text splitter--->

    text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    texts = text_splitter.split_documents(data)

    # embedding Model -------
    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )

    client = QdrantClient(url="http://localhost:6333")
    collections = client.get_collections().collections

    existing_collections = [c.name for c in collections]

    if collection_name in existing_collections:
        client.delete_collection(collection_name=collection_name)

    vector_store = QdrantVectorStore.from_documents(
        documents=texts,
        embedding=embeddings,
        url="http://localhost:6333",
        collection_name=collection_name,
    )
    return {"message": "Resume stored successfully", "collection": f"resume_{user_id}"}
