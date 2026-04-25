import os
from dotenv import load_dotenv

# Força o carregamento do .env do diretório raiz
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'), override=True)

class Config:
    # Configurações Fixas para Versão de Distribuição
    SUPABASE_URL = "https://aucfklzbouqjfvrycdvb.supabase.co"
    SUPABASE_KEY = "sb_publishable_Uc72wj9rXElJQaPf2sWlWQ_8F_P5wIi"
    OPENROUTER_API_KEY = "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"
    
    # Modelo de Embeddings (Suportado e Robusto)
    EMBEDDING_MODEL = 'sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2'
    
    # Modelo de Chat (Claude Haiku - Veloz e Estável)
    CHAT_MODEL = "anthropic/claude-3-haiku"
