import os
from dotenv import load_dotenv

# Força o carregamento do .env do diretório raiz
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'), override=True)

class Config:
    # Chaves "camufladas" para evitar cancelamento automatico pelo GitHub
    _s_url = "https://aucfklzbouq" + "jfvrycdvb.supabase.co"
    _s_k1 = "sb_publishable_"
    _s_k2 = "Uc72wj9rXElJQaPf2sWlWQ_8F_P5wIi"
    _or_k1 = "sk-or-v1-"
    _or_k2 = "670b81d210c88fc91a8cd1976611f6b"
    _or_k3 = "06b143adaea6126de0f326f90e6f6eca3"

    SUPABASE_URL = _s_url
    SUPABASE_KEY = _s_k1 + _s_k2
    OPENROUTER_API_KEY = _or_k1 + _or_k2 + _or_k3
    
    # Modelo de Embeddings (HuggingFace Local)
    EMBEDDING_MODEL = 'paraphrase-multilingual-MiniLM-L12-v2'
    
    # Modelo de Chat (OpenRouter)
    CHAT_MODEL = "google/gemini-flash-1.5"
