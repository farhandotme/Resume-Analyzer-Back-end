from langchain_community.document_loaders import PyMuPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_qdrant import QdrantVectorStore
from qdrant_client import QdrantClient

# import the ONE shared embedding model - same model for storing AND retrieving
from config.ai_models import embeddings

from dotenv import load_dotenv

load_dotenv()


def rag_storing_pdf(user_id: str, pdf_url: str):

    print("Loading PDF from url:", pdf_url)

    loader = PyMuPDFLoader(pdf_url)
    data = loader.load()

    collection_name = f"resume_{user_id}"

    text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=100)
    texts = text_splitter.split_documents(data)

    print(f"Total chunks created: {len(texts)}")
    for i, t in enumerate(texts):
        print(f"  Chunk {i}: {t.page_content[:80]}...")

    client = QdrantClient(url="http://localhost:6333")
    collections = client.get_collections().collections
    existing_collections = [c.name for c in collections]

    if collection_name in existing_collections:
        print(f"Deleting old collection: {collection_name}")
        client.delete_collection(collection_name=collection_name)

    vector_store = QdrantVectorStore.from_documents(
        documents=texts,
        embedding=embeddings,  # <-- shared model from ai_models.py
        url="http://localhost:6333",
        collection_name=collection_name,
    )

    print("Resume stored successfully!")
    return {"message": "Resume stored successfully", "collection": collection_name}


def retrive_resume_chanks(user_id: str, user_query: str):


    # Connect to the existing collection for this user
    vector_store = QdrantVectorStore.from_existing_collection(
        embedding=embeddings,  # <-- same shared model, so vectors match
        url="http://localhost:6333",
        collection_name=f"resume_{user_id}",
    )

    docs = vector_store.similarity_search(query=user_query, k=4)

    print(f"\nRetrieved {len(docs)} chunks for query: '{user_query}'")
    for i, doc in enumerate(docs):
        print(f"  Retrieved chunk {i}: {doc.page_content[:100]}...")

    retrieved_chunks = [doc.page_content for doc in docs]

    return retrieved_chunks
