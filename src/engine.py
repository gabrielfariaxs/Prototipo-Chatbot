import os
import sys
import logging

# Silencia avisos do TensorFlow e HuggingFace
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
os.environ['TOKENIZERS_PARALLELISM'] = 'false'

from sentence_transformers import SentenceTransformer
from supabase import create_client, Client
from openai import OpenAI
from src.config import Config

# Desativa logs de bibliotecas externas
logging.getLogger("sentence_transformers").setLevel(logging.ERROR)
logging.getLogger("transformers").setLevel(logging.ERROR)

class ArthromedEngine:
    def __init__(self):
        # Redireciona o stdout temporariamente para esconder o relatório do BertModel
        old_stdout = sys.stdout
        sys.stdout = open(os.devnull, 'w')
        
        try:
            self.model_embedding = SentenceTransformer(Config.EMBEDDING_MODEL)
        finally:
            sys.stdout = old_stdout
            
        # Clientes
        self.supabase: Client = create_client(Config.SUPABASE_URL, Config.SUPABASE_KEY)
        self.chat_client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=Config.OPENROUTER_API_KEY,
        )

    def gerar_embedding(self, texto):
        """Gera o vetor usando SentenceTransformers"""
        return self.model_embedding.encode(texto).tolist()

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
        """Gera resposta usando OpenRouter"""
        prompt = f"""
        Você é um assistente virtual da Arthromed especializado no setor {setor}.
        Use APENAS as informações do contexto abaixo para responder. 
        Se a pergunta não tiver relação com o setor {setor} ou não estiver no contexto, explique que sua base de conhecimento atual é limitada a esse setor.

        CONTEXTO:
        {contexto}

        PERGUNTA:
        {user_input}
        """
        
        response = self.chat_client.chat.completions.create(
            model=Config.CHAT_MODEL,
            messages=[{"role": "user", "content": prompt}]
        )
        return response.choices[0].message.content
