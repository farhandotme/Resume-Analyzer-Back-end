from langchain_huggingface import HuggingFaceEmbeddings
from langchain_mistralai import ChatMistralAI

embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

# llm
llm = ChatMistralAI(model="mistral-small")
