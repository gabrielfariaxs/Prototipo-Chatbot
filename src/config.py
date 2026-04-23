import os
from dotenv import load_dotenv

# Força o carregamento do .env do diretório raiz
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'), override=True)

class Config:
    # ATENÇÃO: Chaves fixas para facilitar o teste (não recomendado para produção pública)
    SUPABASE_URL = "https://aucfklzbouqjfvrycdvb.supabase.co"
    SUPABASE_KEY = "sb_publishable_Uc72wj9rXElJQaPf2sWlWQ_8F_P5wIi"
    OPENROUTER_API_KEY = "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"
    
    # Modelo de Embeddings (HuggingFace Local)
    EMBEDDING_MODEL = 'paraphrase-multilingual-MiniLM-L12-v2'
    
    # Modelo de Chat (OpenRouter)
    CHAT_MODEL = "google/gemini-2.0-flash-001"
