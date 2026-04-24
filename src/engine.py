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
        """Busca no Supabase no setor escolhido E na base de materiais"""
        vetor_pergunta = self.gerar_embedding(texto_usuario)
        contextos = []

        try:
            # 1. Busca no Setor Específico
            res_setor = self.supabase.rpc(
                'buscar_processos', 
                {
                    'query_embedding': vetor_pergunta,
                    'match_threshold': 0.1,
                    'match_count': 3,
                    'filter_setor': setor_escolhido.strip().upper()
                }
            ).execute()
            
            if res_setor.data:
                contextos.extend([f"SETOR {setor_escolhido.upper()}:\nProcesso: {d['processo']}\nConteúdo: {d['conteudo']}" for d in res_setor.data])

            # 2. Busca Global em Materiais (Excel e PDF de Faturamento)
            res_materiais = self.supabase.rpc(
                'buscar_processos', 
                {
                    'query_embedding': vetor_pergunta,
                    'match_threshold': 0.4,
                    'match_count': 5,
                    'filter_setor': '' 
                }
            ).execute()

            if res_materiais.data:
                # Filtra apenas o que for relacionado a MATERIAIS no resultado global
                for d in res_materiais.data:
                    if "MATERIAIS" in str(d.get('setor', '')).upper():
                        contextos.append(f"BASE TÉCNICA (Materiais/Emultec):\nItem: {d['processo']}\nInformação: {d['conteudo']}")

            if contextos:
                return "\n\n".join(contextos)
        except Exception as e:
            print(f"Erro na busca: {e}")
            pass
        
        return "Nenhuma informação específica encontrada."

    def gerar_resposta(self, user_input, setor, contexto):
        """Gera resposta usando OpenRouter"""
        import time
        
        prompt = f"""
        Você é o Especialista Técnico da Arthromed/Medic.
        
        REGRAS DE RESPOSTA:
        1. Seja EXTREMAMENTE DIRETO.
        2. RESPONDA APENAS com base no CONTEXTO fornecido. NÃO use seu conhecimento geral sobre medicina ou materiais.
        3. Se a informação NÃO estiver no contexto (mesmo que você saiba a resposta por fora), responda exatamente: "Este material ou procedimento não consta no meu mapeamento técnico atual."
        4. NUNCA invente referências ou nomes de materiais.
        
        CONTEXTO:
        {contexto}

        PERGUNTA DO USUÁRIO:
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
