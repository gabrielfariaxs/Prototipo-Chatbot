import os
import sys
import logging

# Silencia avisos do TensorFlow e HuggingFace
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
os.environ['TOKENIZERS_PARALLELISM'] = 'false'

from fastembed import TextEmbedding
from supabase import create_client, Client
from openai import OpenAI
from src.config import Config

# Desativa logs de bibliotecas externas
logging.getLogger("fastembed").setLevel(logging.ERROR)

class ArthromedEngine:
    def __init__(self):
        # Inicializa o modelo de embeddings (rápido e sem PyTorch)
        self.model_embedding = TextEmbedding(model_name=Config.EMBEDDING_MODEL)
            
        # Clientes
        self.supabase: Client = create_client(Config.SUPABASE_URL, Config.SUPABASE_KEY)
        self.chat_client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=Config.OPENROUTER_API_KEY,
            timeout=60.0
        )

    def gerar_embedding(self, texto):
        """Gera o vetor usando FastEmbed"""
        # O fastembed retorna um gerador, pegamos o primeiro resultado
        return list(self.model_embedding.embed([texto]))[0].tolist()

    def buscar_contexto(self, texto_usuario, setor_escolhido):
        """Busca no Supabase filtrando pelo setor"""
        vetor_pergunta = self.gerar_embedding(texto_usuario)

        try:
            response = self.supabase.rpc(
                'buscar_processos', 
                {
                    'query_embedding': vetor_pergunta,
                    'match_threshold': 0.1,
                    'match_count': 3,
                    'filter_setor': setor_escolhido.strip()
                }
            ).execute()

            if response.data:
                return "\n\n".join([f"Processo: {d['processo']}\nConteúdo: {d['conteudo']}" for d in response.data])
        except Exception as e:
            # Silencioso em produção
            pass
        
        return "Nenhuma informação específica encontrada para este setor."

    def gerar_resposta(self, user_input, setor, contexto):
        """Gera resposta usando OpenRouter com tentativa de reenvio em caso de erro"""
        import time
        
        prompt = f"""
        Você é um assistente virtual da Arthromed especializado no setor {setor}.
        Use APENAS as informações do contexto abaixo para responder. 
        Se a pergunta não tiver relação com o setor {setor} ou não estiver no contexto, explique que sua base de conhecimento atual é limitada a esse setor.

        CONTEXTO:
        {contexto}

        PERGUNTA:
        {user_input}
        """
        
        for tentativa in range(5):
            try:
                response = self.chat_client.chat.completions.create(
                    model=Config.CHAT_MODEL,
                    messages=[{"role": "user", "content": prompt}]
                )
                return response.choices[0].message.content
            except Exception as e:
                if tentativa < 4:
                    time.sleep(3) # Espera 3 segundos antes de tentar de novo
                    continue
                raise e
