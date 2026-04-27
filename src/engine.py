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
            # Aumentado threshold de 0.1 para 0.3 para evitar ruído
            res_setor = self.supabase.rpc(
                'buscar_processos', 
                {
                    'query_embedding': vetor_pergunta,
                    'match_threshold': 0.3,
                    'match_count': 3,
                    'filter_setor': setor_escolhido.strip().upper()
                }
            ).execute()
            
            if res_setor.data:
                for d in res_setor.data:
                    contextos.append(f"SETOR {setor_escolhido.upper()}:\nProcesso: {d['processo']}\nConteúdo: {d['conteudo']}")

            # 2. Busca Global em Materiais (Excel e PDF de Faturamento)
            res_materiais = self.supabase.rpc(
                'buscar_processos', 
                {
                    'query_embedding': vetor_pergunta,
                    'match_threshold': 0.35, # Ligeiramente maior para materiais técnicos
                    'match_count': 5,
                    'filter_setor': '' 
                }
            ).execute()

            if res_materiais.data:
                # Filtra apenas o que for relacionado a MATERIAIS no resultado global
                for d in res_materiais.data:
                    setor_item = str(d.get('setor', '')).upper()
                    if "MATERIAIS" in setor_item or "TÉCNICO" in setor_item:
                        contextos.append(f"BASE TÉCNICA (Materiais/Emultec):\nItem: {d['processo']}\nInformação: {d['conteudo']}")

            if contextos:
                # Remove duplicados mantendo a ordem
                return "\n\n".join(list(dict.fromkeys(contextos)))
        except Exception as e:
            print(f"Erro na busca: {e}")
            pass
        
        return "Nenhuma informação específica encontrada."

    def gerar_resposta(self, user_input, setor, contexto):
        """Gera resposta baseada no contexto via OpenRouter"""
        import time
        
        prompt = f"""
        Você é o Especialista Técnico da Arthromed/Medic.
        
        REGRAS:
        1. Seja EXTREMAMENTE DIRETO.
        2. RESPONDA APENAS com base no CONTEXTO fornecido.
        3. Se a informação NÃO estiver no contexto, responda exatamente: "Este material ou procedimento não consta no meu mapeamento técnico atual."
        4. NUNCA invente referências ou nomes.
        
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
                    time.sleep(3) 
                    continue
                raise e
