
import os
import sys
from fastembed import TextEmbedding
from supabase import create_client, Client

# Adiciona o diretorio raiz ao path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from src.config import Config

def atualizar():
    print("--- Adicionando dados do setor COMERCIAL ---")
    
    model = TextEmbedding(model_name=Config.EMBEDDING_MODEL)
    supabase: Client = create_client(Config.SUPABASE_URL, Config.SUPABASE_KEY)
    
    fluxogramas = [
        {
            "processo": "1. Processo de Negociacao de Orcamento / Novos Valores",
            "setor": "COMERCIAL",
            "sistema": "EMULTEC",
            "conteudo": """Setores envolvidos: Hospital/Convenio, Comercial Interno e Coordenacao. 
Objetivo: Ajustar e validar valores orcados atraves de negociacoes entre a empresa e o cliente.
Fluxo:
1. Observar orcamento
2. Entrar no Sistema Emultec em Movimentos > Cirurgias 
3. Procurar paciente, e apos isso, clicar em 'Material Utilizado Pos' e verificar.
4. Apertar as teclas de uma vez: Fn + Alt + F9 > Produtos > Pesquisar o codigo do material e ver o custo."""
        }
    ]

    print("Limpando registros antigos do setor COMERCIAL...")
    supabase.table("documentos_arthromed").delete().eq("setor", "COMERCIAL").execute()

    for item in fluxogramas:
        print(f"Processando: {item['processo']}...")
        texto_para_embedding = f"{item['processo']} {item['conteudo']}"
        embedding = list(model.embed([texto_para_embedding]))[0].tolist()
        
        data = {
            "processo": item["processo"],
            "conteudo": item["conteudo"],
            "setor": item["setor"],
            "sistema": item["sistema"],
            "embedding": embedding
        }
        supabase.table("documentos_arthromed").insert(data).execute()

    print("\n--- SUCESSO! Setor COMERCIAL adicionado ao banco de dados ---")

if __name__ == "__main__":
    atualizar()
