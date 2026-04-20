import os
import google.generativeai as genai
from supabase import create_client, Client
from dotenv import load_dotenv

# Carrega as variáveis do arquivo .env
load_dotenv()

def setup_clients():
    """Configura as conexões com Google e Supabase"""
    google_key = os.getenv("GOOGLE_API_KEY")
    if not google_key:
        print("⚠️  Aviso: GOOGLE_API_KEY não configurada.")
    else:
        genai.configure(api_key=google_key)

    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_KEY")
    
    if not supabase_url or not supabase_key:
        return None
    try:
        supabase: Client = create_client(supabase_url.strip(), supabase_key.strip())
        return supabase
    except Exception as e:
        print(f"❌ Erro Supabase: {e}")
        return None

def buscar_contexto(supabase, texto_usuario, setor_escolhido):
    """Busca no Supabase filtrando pelo setor"""
    embedding_result = genai.embed_content(
        model="models/gemini-embedding-001",
        content=texto_usuario,
        task_type="retrieval_query"
    )
    vetor_pergunta = embedding_result['embedding']

    try:
        response = supabase.rpc(
            'buscar_processos', 
            {
                'query_embedding': vetor_pergunta,
                'match_threshold': 0.3,
                'match_count': 3,
                'filter_setor': setor_escolhido # Filtro enviado ao banco
            }
        ).execute()

        if response.data:
            contexto = "\n\n".join([f"Processo: {d['processo']}\nConteúdo: {d['conteudo']}" for d in response.data])
            return contexto
    except Exception as e:
        print(f"⚠️ Erro na busca: {e}")
    
    return "Nenhuma informação específica encontrada para este setor."

def start_chat(supabase):
    # Usando o nome exato da sua lista de modelos
    model = genai.GenerativeModel('gemini-flash-latest')
    print("\n🤖 Assistente Arthromed")
    print("-" * 30)
    setor = input("Para começar, qual é o seu setor? (ex: Financeiro, RH, Administrativo): ")
    print(f"\n✅ Setor '{setor}' selecionado. Como posso te ajudar hoje?")
    
    while True:
        user_input = input("\nVocê: ")
        if user_input.lower() in ["sair", "exit", "quit", "mudar setor"]:
            if user_input.lower() == "mudar setor":
                setor = input("Qual o novo setor?: ")
                print(f"Setor alterado para {setor}.")
                continue
            break
            
        # Busca contexto filtrado pelo setor escolhido
        contexto = buscar_contexto(supabase, user_input, setor)
        
        prompt = f"""
        Você é um assistente virtual da Arthromed especializado no setor {setor}.
        Use APENAS as informações do contexto abaixo para responder. 
        Se a pergunta não tiver relação com o setor {setor} ou não estiver no contexto, explique que sua base de conhecimento atual é limitada a esse setor.

        CONTEXTO:
        {contexto}

        PERGUNTA:
        {user_input}
        """

        try:
            response = model.generate_content(prompt)
            print(f"\nGemini: {response.text}")
        except Exception as e:
            print(f"❌ Erro: {e}")

if __name__ == "__main__":
    supabase_client = setup_clients()
    if supabase_client:
        start_chat(supabase_client)
    else:
        print("Erro de configuração. Verifique seu .env")
