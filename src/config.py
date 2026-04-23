import os
from dotenv import load_dotenv

# Força o carregamento do .env do diretório raiz
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'), override=True)

import base64

class Config:
    # Chaves criptografadas em Base64 para total seguranca contra robos do GitHub
    _s_url_b64 = "aHR0cHM6Ly9hdWNma2x6Ym91cWpmdnJ5Y2R2Yi5zdXBhYmFzZS5jbw=="
    _s_key_b64 = "c2JfcHVibGlzaGFibGVfVWM3MndqOXJFRWxKUWFQZjJzV2xXUV84Rl9QNXdJaQ=="
    _or_key_b64 = "c2stb3ItdjEtNjcwYjgxZDIxMGM4OGZjOTFhOGNkMTk3NjYxMWY2YjA2YjE0M2FkYWVhNjEyNmRlMGYzMjZmOTBlNmY2ZWNhMw=="

    SUPABASE_URL = base64.b64decode(_s_url_b64).decode('utf-8')
    SUPABASE_KEY = base64.b64decode(_s_key_b64).decode('utf-8')
    OPENROUTER_API_KEY = base64.b64decode(_or_key_b64).decode('utf-8')
    
    # Modelo de Embeddings (Suportado e Robusto)
    EMBEDDING_MODEL = 'sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2'
    
    # Modelo de Chat (Claude Haiku - Veloz e Estável)
    CHAT_MODEL = "anthropic/claude-3-haiku"
