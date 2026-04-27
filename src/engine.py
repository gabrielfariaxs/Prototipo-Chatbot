import os
import sys
import logging
import re

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

    def buscar_contexto(self, texto_usuario, setor_escolhido, historico=""):
        """Busca no Supabase no setor escolhido E na base de materiais"""
        vetor_pergunta = self.gerar_embedding(texto_usuario)
        contextos = []

        try:
            # 1. Extrator Dinâmico de Assunto (Pega palavras em MAIÚSCULO da pergunta ou histórico)
            palavras_busca = re.findall(r'\b[A-Z]{4,}\b', texto_usuario + " " + str(historico))
            termos_foco = [p for p in palavras_busca if p not in ["ORÇAMENTO", "MEDIC", "ARTHROMED", "FINANCEIRO", "MATERIAIS"]]
            
            # Se não achou em maiúsculo, tenta pegar o que vem após palavras de ação (mais inclusivo)
            if not termos_foco:
                # Procura por palavras de 4+ letras após conectores comuns
                match = re.search(r'(?:cirurgia|procedimento|sobre|de|é|ser)\s+([a-zA-ZáéíóúÁÉÍÓÚñÑ]{4,})', texto_usuario + " " + str(historico), re.IGNORECASE)
                if match:
                    termos_foco = [match.group(1).upper()]

            # 2. Busca no Setor Específico
            res_setor = self.supabase.rpc(
                'buscar_processos', 
                {
                    'query_embedding': vetor_pergunta,
                    'match_threshold': 0.15, # Bem baixo para não perder nada
                    'match_count': 15,
                    'filter_setor': setor_escolhido.strip().upper()
                }
            ).execute()
            
            # 3. Busca Global em Materiais
            res_materiais = self.supabase.rpc(
                'buscar_processos', 
                {
                    'query_embedding': vetor_pergunta,
                    'match_threshold': 0.15,
                    'match_count': 15,
                    'filter_setor': '' 
                }
            ).execute()

            # Consolidação com Filtro de Prioridade Dinâmica
            todos_resultados = (res_setor.data or []) + (res_materiais.data or [])
            
            # Se identificamos um termo de foco (ex: METACARPO), filtramos TUDO por ele
            if termos_foco:
                foco = termos_foco[0] # Pega o termo mais recente/relevante
                for d in todos_resultados:
                    conteudo_upper = str(d.get('conteudo', '')).upper()
                    processo_upper = str(d.get('processo', '')).upper()
                    
                    if foco in conteudo_upper or foco in processo_upper:
                        contextos.append(f"INFORMAÇÃO SOBRE {foco}:\n{d['conteudo']}")
                
                # SUPER FALLBACK: Se a IA falhou, faz uma busca de texto direta (Ctrl+F) no banco
                if not contextos:
                    res_direto = self.supabase.table('conhecimento').select('*')\
                        .or_(f"conteudo.ilike.%{foco}%,processo.ilike.%{foco}%")\
                        .execute()
                    if res_direto.data:
                        for d in res_direto.data:
                            contextos.append(f"BUSCA DIRETA ({foco}):\n{d['conteudo']}")
            else:
                # Se não há foco claro, usa similaridade normal (fallback)
                for d in todos_resultados:
                    setor_item = str(d.get('setor', '')).upper()
                    if "MATERIAIS" in setor_item or setor_item == setor_escolhido.upper():
                        contextos.append(f"CONTEXTO {setor_item}:\n{d['conteudo']}")

            if contextos:
                # Remove duplicados e limita a 2 contextos para não misturar assuntos
                return "\n\n".join(list(dict.fromkeys(contextos))[:2])
        except Exception as e:
            print(f"Erro na busca: {e}")
            pass
        
        return "Nenhuma informação específica encontrada."

    def gerar_resposta(self, user_input, setor, contexto):
        """Gera resposta baseada no contexto via OpenRouter"""
        import time
        
        prompt = f"""
        Você é o Especialista Técnico da Arthromed/Medic.
        
        REGRAS DE OURO (Siga com RIGOR):
        1. PRIORIDADE TOTAL AO PDF: Se houver informações vindas do "PDF de Faturamento" ou "Histórico", use estas em vez de qualquer outra.
        2. MATERIAIS REAIS: Sempre liste os materiais que possuem CÓDIGOS (ex: 881220000) e MARCAS (ex: RAZEK, TAIMIN). Se o contexto tiver códigos, ignore materiais genéricos como "Parafuso" ou "Placa" sem código.
        3. FORMATO: Liste como: "- [CÓDIGO] [DESCRIÇÃO] - [MARCA]".
        4. DESAMBIGUAÇÃO: Não confunda "RÁDIO" (osso) com "RADIOFREQUÊNCIA" (ponteiras).
        5. Se a informação estiver no contexto, você DEVE mostrá-la. Não diga que não sabe se o dado estiver abaixo.
        
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
