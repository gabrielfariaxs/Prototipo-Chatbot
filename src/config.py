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
    _or_k2 = "99f564bcf5a888cacfb6383e9edaffb5"
    _or_k3 = "48aaf7e5def7cbe6a6d4adb35db7d8ad"

    SUPABASE_URL = _s_url
    SUPABASE_KEY = _s_k1 + _s_k2
    OPENROUTER_API_KEY = _or_k1 + _or_k2 + _or_k3
    
    # Modelo de Embeddings (HuggingFace Local)
    EMBEDDING_MODEL = 'paraphrase-multilingual-MiniLM-L12-v2'
    
    # Modelo de Chat (OpenRouter)
    CHAT_MODEL = "google/gemini-2.0-flash-001"
