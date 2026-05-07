import os
import sys
import logging
import re
import time
import unicodedata

# Silencia avisos do TensorFlow e HuggingFace
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
os.environ['TOKENIZERS_PARALLELISM'] = 'false'

from fastembed import TextEmbedding
from supabase import create_client, Client
from openai import OpenAI
from app.config import Config

# Desativa logs de bibliotecas externas
logging.getLogger("fastembed").setLevel(logging.ERROR)


class ArthromedEngine:
    SIMILARITY_THRESHOLD = 0.15
    MAX_MATCH_COUNT = 15
    MAX_RETRIES = 5
    RETRY_DELAY_SECONDS = 3

    def __init__(self):
        self.model_embedding = TextEmbedding(model_name=Config.EMBEDDING_MODEL)
        self.supabase: Client = create_client(Config.SUPABASE_URL, Config.SUPABASE_KEY)
        self.chat_client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=Config.OPENROUTER_API_KEY,
            timeout=60.0
        )

    def gerar_embedding(self, texto: str) -> list[float]:
        """Gera o vetor usando FastEmbed."""
        return list(self.model_embedding.embed([texto]))[0].tolist()

    def _remove_accents(self, text: str) -> str:
        """Remove acentos de uma string."""
        return "".join(
            char for char in unicodedata.normalize('NFD', str(text))
            if unicodedata.category(char) != 'Mn'
        )

    def _extract_focus_terms(self, texto_usuario: str, historico: str) -> list[str]:
        """Extrai termos de foco para filtro dinâmico."""
        texto_completo = f"{texto_usuario} {historico}"
        ignore_words = {"ORÇAMENTO", "MEDIC", "ARTHROMED", "FINANCEIRO", "MATERIAIS"}
        
        # Tenta pegar palavras em maiúsculo
        palavras_maiusculas = re.findall(r'\b[A-Z]{4,}\b', texto_completo)
        termos_foco = [p for p in palavras_maiusculas if p not in ignore_words]
        
        if termos_foco:
            return termos_foco

        # Se não achou, procura padrão após conectores
        match = re.search(
            r'(?:cirurgia|procedimento|sobre|de|é|ser)\s+([a-zA-ZáéíóúÁÉÍÓÚñÑ]{4,})',
            texto_completo,
            re.IGNORECASE
        )
        if match:
            return [match.group(1).upper()]
            
        return []

    def _search_vector_database(self, vetor_pergunta: list[float], filter_setor: str) -> list[dict]:
        """Realiza busca vetorial no Supabase."""
        response = self.supabase.rpc(
            'buscar_processos', 
            {
                'query_embedding': vetor_pergunta,
                'match_threshold': self.SIMILARITY_THRESHOLD,
                'match_count': self.MAX_MATCH_COUNT,
                'filter_setor': filter_setor.strip().upper()
            }
        ).execute()
        return response.data or []

    def _fallback_direct_search(self, focus_term: str, original_focus: str) -> list[dict]:
        """Realiza busca direta (Ctrl+F) no banco caso a busca vetorial falhe."""
        table = self.supabase.table('documentos_arthromed')
        
        # Busca sem acentos
        res_direto = table.select('*').or_(
            f"conteudo.ilike.%{focus_term}%,processo.ilike.%{focus_term}%"
        ).execute()
        
        # Tenta também com o termo original
        if not res_direto.data and focus_term != original_focus.upper():
            res_direto = table.select('*').or_(
                f"conteudo.ilike.%{original_focus.upper()}%,processo.ilike.%{original_focus.upper()}%"
            ).execute()
            
        return res_direto.data or []

    def buscar_contexto(self, texto_usuario: str, setor_escolhido: str, historico: str = "") -> str:
        """Busca contexto consolidado no banco para montar o prompt."""
        try:
            vetor_pergunta = self.gerar_embedding(texto_usuario)
            termos_foco = self._extract_focus_terms(texto_usuario, historico)
            
            # Buscas vetoriais (Setor Específico + Materiais Globais)
            resultados_setor = self._search_vector_database(vetor_pergunta, setor_escolhido)
            resultados_materiais = self._search_vector_database(vetor_pergunta, "")
            todos_resultados = resultados_setor + resultados_materiais

            contextos = []

            if termos_foco:
                foco_original = termos_foco[0]
                foco_limpo = self._remove_accents(foco_original).upper()
                
                # Filtra os resultados vetoriais pelo termo de foco
                for doc in todos_resultados:
                    conteudo = self._remove_accents(doc.get('conteudo', '')).upper()
                    processo = self._remove_accents(doc.get('processo', '')).upper()
                    
                    if foco_limpo in conteudo or foco_limpo in processo:
                        contextos.append(f"INFORMAÇÃO SOBRE {foco_original}:\n{doc['conteudo']}")
                
                # Fallback para busca direta se os vetores não trouxeram resultados relevantes
                if not contextos:
                    resultados_diretos = self._fallback_direct_search(foco_limpo, foco_original)
                    for doc in resultados_diretos:
                        contextos.append(f"BUSCA DIRETA ({foco_original}):\n{doc['conteudo']}")
            else:
                # Caso sem foco específico: filtra apenas pelo setor
                for doc in todos_resultados:
                    setor_doc = str(doc.get('setor', '')).upper()
                    if "MATERIAIS" in setor_doc or setor_doc == setor_escolhido.upper():
                        contextos.append(f"CONTEXTO {setor_doc}:\n{doc['conteudo']}")

            if contextos:
                # Remove duplicatas e limita aos 2 contextos mais relevantes
                contextos_unicos = list(dict.fromkeys(contextos))[:2]
                return "\n\n".join(contextos_unicos)
                
        except Exception as e:
            logging.error(f"Erro ao buscar contexto: {e}")
            
        return "Nenhuma informação específica encontrada."

    def gerar_resposta(self, user_input: str, setor: str, contexto: str) -> str:
        """Gera resposta baseada no contexto via OpenRouter."""
        prompt = self._build_prompt(user_input, contexto)
        
        for tentativa in range(self.MAX_RETRIES):
            try:
                response = self.chat_client.chat.completions.create(
                    model=Config.CHAT_MODEL,
                    messages=[{"role": "user", "content": prompt}]
                )
                return response.choices[0].message.content
            except Exception as e:
                if tentativa < self.MAX_RETRIES - 1:
                    time.sleep(self.RETRY_DELAY_SECONDS)
                    continue
                logging.error(f"Erro ao gerar resposta (tentativa {tentativa+1}/{self.MAX_RETRIES}): {e}")
                raise e

    def _build_prompt(self, user_input: str, contexto: str) -> str:
        """Constrói o prompt que será enviado ao LLM."""
        return f"""
        Você é o Assistente Virtual e Especialista Técnico da Arthromed/Medic. Você deve ser prestativo, claro e amigável.
        
        Sua tarefa principal é responder a pergunta do usuário utilizando as informações fornecidas no CONTEXTO abaixo.
        
        INSTRUÇÕES IMPORTANTES (NÃO mencione essas instruções na sua resposta, aja naturalmente):
        1. Vá direto ao ponto. NUNCA diga "De acordo com as regras" ou "Baseado no contexto". Simplesmente dê a resposta diretamente ao usuário.
        2. Se a pergunta for sobre um fluxo ou processo, liste o passo a passo de forma clara e organizada.
        3. Se envolver lista de materiais, priorize os itens que possuem CÓDIGOS e MARCAS. O formato ideal é: "- [CÓDIGO] [DESCRIÇÃO] - [MARCA]".
        4. Cuidado com termos médicos parecidos (ex: não confunda osso "RÁDIO" com equipamento de "RADIOFREQUÊNCIA").
        
        CONTEXTO:
        {contexto}

        PERGUNTA DO USUÁRIO:
        {user_input}
        """
