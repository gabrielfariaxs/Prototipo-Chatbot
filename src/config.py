import os
from dotenv import load_dotenv

# Força o carregamento do .env do diretório raiz
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'), override=True)

class Config:
    # Configurações do Supabase
    SUPABASE_URL = os.getenv("SUPABASE_URL")
    SUPABASE_KEY = os.getenv("SUPABASE_KEY")
    
    # Configuração do OpenRouter
    OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
    
    # Modelo de Embeddings (Suportado e Robusto)
    EMBEDDING_MODEL = 'sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2'
    
    # Modelo de Chat (Claude Haiku - Veloz e Estável)
    CHAT_MODEL = "anthropic/claude-3-haiku"
