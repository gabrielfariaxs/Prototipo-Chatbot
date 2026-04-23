import os
from dotenv import load_dotenv

# Força o carregamento do .env do diretório raiz
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'), override=True)

class Config:
    SUPABASE_URL = os.getenv("SUPABASE_URL", "").strip()
    SUPABASE_KEY = os.getenv("SUPABASE_KEY", "").strip()
    OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "").strip()
    
    # Modelo de Embeddings (HuggingFace Local)
    EMBEDDING_MODEL = 'paraphrase-multilingual-MiniLM-L12-v2'
    
    # Modelo de Chat (OpenRouter)
    CHAT_MODEL = "google/gemini-2.0-flash-001"
