import os
import json
import requests

# Este script processa cartilhas e documentos de texto (.txt, .md)
# e os insere no seu banco vetorial do Supabase. Dessa forma o MedIA
# passa a ter acesso às regras de convênios e processos dinamicamente.
#
# Pré-requisitos: pip install supabase openai

try:
    from supabase import create_client, Client
    import openai
except ImportError:
    print("Instale as bibliotecas necessárias primeiro:")
    print("pip install supabase openai")
    exit()

# CONFIGURAR SUAS CHAVES AQUI
SUPABASE_URL = "https://aucfklzbouqjfvrycdvb.supabase.co" # (Do seu wrangler.jsonc)
SUPABASE_KEY = "SUA_SUPABASE_SERVICE_ROLE_KEY" # Cuidado: use a chave Service Role para inserir!
OPENAI_API_KEY = "SUA_OPENAI_API_KEY"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
openai.api_key = OPENAI_API_KEY

def get_embedding(text):
    response = openai.embeddings.create(
        input=text,
        model="text-embedding-3-small"
    )
    return response.data[0].embedding

def process_and_upload(file_path, setor):
    if not os.path.exists(file_path):
        print(f"Arquivo não encontrado: {file_path}")
        return

    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Dividir em chunks (parágrafos longos)
    chunks = [c.strip() for c in content.split('\n\n') if len(c.strip()) > 50]

    for i, chunk in enumerate(chunks):
        print(f"Processando chunk {i+1}/{len(chunks)} do arquivo {file_path}...")
        try:
            embedding = get_embedding(chunk)
            
            # Ajuste o nome da tabela conforme o que você configurou no Supabase (ex: 'documents')
            data, count = supabase.table('documents').insert({
                "content": chunk,
                "embedding": embedding,
                "metadata": {"setor": setor, "source": os.path.basename(file_path)}
            }).execute()
            
            print(" Inserido com sucesso!")
        except Exception as e:
            print(" Erro ao inserir:", e)

if __name__ == "__main__":
    print("=== Upload de Base de Conhecimento RAG ===")
    file_path = input("Caminho do arquivo de texto (.txt, .md): ")
    setor = input("Setor correspondente (ex: Comercial, Orçamento - Arthromed, Geral): ")
    
    if SUPABASE_KEY == "SUA_SUPABASE_SERVICE_ROLE_KEY":
        print("ALERTA: Você precisa configurar as chaves no script (SUPABASE_KEY e OPENAI_API_KEY) antes de executar.")
    else:
        process_and_upload(file_path, setor)
        print("Finalizado!")
