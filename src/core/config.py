import os
from dotenv import load_dotenv

# Força o carregamento do .env do diretório raiz
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'), override=True)

class Config:
    # Modelos de IA
    EMBEDDING_MODEL = 'sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2'
    CHAT_MODEL = "anthropic/claude-3-haiku"

    # Configurações de Acesso (Prioriza .env, depois usa valores fixos)
    SUPABASE_URL = os.getenv("SUPABASE_URL", "https://aucfklzbouqjfvrycdvb.supabase.co")
    SUPABASE_KEY = os.getenv("SUPABASE_KEY", "sb_publishable_Uc72wj9rXElJQaPf2sWlWQ_8F_P5wIi")
    OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
