import os
import json
import sys
import subprocess
from src.services.engine import ArthromedEngine

def clear_screen():
    """Limpa a tela do terminal."""
    os.system('cls' if os.name == 'nt' else 'clear')

def escolher_setor() -> str:
    """Função centralizada para escolher o setor e empresa."""
    setor = ""
    while not setor.strip():
        entrada = input("\n🏢 Para começar, digite seu setor: ").strip()
        if entrada.lower() == "orçamento":
            empresa = ""
            while empresa.lower() not in ["arthromed", "medic"]:
                empresa = input("   👉 É para Arthromed ou Medic?: ").strip()
            setor = f"Orçamento - {empresa.capitalize()}"
        else:
            setor = entrada
    return setor

def parse_material_input(user_input: str) -> dict:
    """Extrai os dados do material a partir da entrada do usuário."""
    # O padrão é: Adicionar material [Nome] [Ref] [Uso]
    text = user_input[18:].strip() # Remove "Adicionar material " independentemente de maiúsculas/minúsculas
    
    if "(codigo de referencia)" in text.lower():
        partes = text.lower().split("(codigo de referencia)")
        nome_ref = partes[0].strip().split(" ")
        ref = nome_ref[-1] if nome_ref else "S/Ref"
        nome = " ".join(nome_ref[:-1]) if len(nome_ref) > 1 else "".join(nome_ref)
        uso = partes[1].replace("para ", "").strip() if len(partes) > 1 else "Geral"
    else:
        partes = text.split(" ")
        nome = partes[0] if partes else "Desconhecido"
        ref = partes[1] if len(partes) > 1 else "S/Ref"
        uso = " ".join(partes[2:]) if len(partes) > 2 else "Geral"

    return {"nome": nome.title(), "referencia": ref.upper(), "uso": uso.capitalize()}

def salvar_material_extra(user_input: str) -> tuple[bool, str]:
    """Tenta extrair dados de material do input e salvar no JSON."""
    try:
        novo_material = parse_material_input(user_input)
        caminho = "data/raw/materiais_extras.json"
        dados = []
        
        if os.path.exists(caminho):
            with open(caminho, 'r', encoding='utf-8') as f:
                dados = json.load(f)
                
        dados.append(novo_material)
        
        with open(caminho, 'w', encoding='utf-8') as f:
            json.dump(dados, f, indent=4, ensure_ascii=False)
            
        return True, novo_material["nome"]
    except Exception as e:
        print(f"\n❌ Erro ao salvar material: {e}")
        return False, ""

def processar_adicao_material(user_input: str) -> None:
    """Processa a adição de um novo material e atualiza o conhecimento."""
    print("⏳ Aprendendo...", end="\r")
    sucesso, nome = salvar_material_extra(user_input)
    if sucesso:
        subprocess.run([sys.executable, "scripts/update_knowledge.py"], capture_output=True)
        print(f"✅ Material '{nome}' aprendido!")

def start_chat():
    """Inicia o loop principal do chatbot."""
    clear_screen()
    print("\n" + "═"*50)
    print("      🤖 ASSISTENTE VIRTUAL ARTHROMED")
    print("═"*50)
    
    try:
        engine = ArthromedEngine()
    except Exception as e:
        print(f"\n❌ Erro ao inicializar o sistema: {e}")
        return

    setor = escolher_setor()
    historico = []
    
    while True:
        clear_screen()
        print(f"\n✅ Conectado: {setor.upper()}")
        print("─"*50)
        print(f"Olá! Sou o assistente do setor {setor}. Como posso ajudar?")
        print("─"*50)
        
        while True:
            try:
                user_input = input("\n👤 Você: ").strip()
                if not user_input: 
                    continue
                    
                msg_lower = user_input.lower()
                
                if msg_lower in ["sair", "exit", "quit"]: 
                    return

                # Verifica se o usuário deseja trocar de setor
                if ("mudar" in msg_lower or "trocar" in msg_lower or "outro" in msg_lower) and "setor" in msg_lower:
                    setor = escolher_setor()
                    historico = [] 
                    break

                # Comando para adicionar novos materiais ao conhecimento
                if msg_lower.startswith("adicionar material"):
                    processar_adicao_material(user_input)
                    continue

                print("⏳ Pensando...", end="\r")
                
                # Constrói o contexto de busca incluindo as últimas interações
                contexto_busca = f"{' '.join(historico[-2:])} {user_input}" if historico else user_input
                historico_texto = " ".join(historico)
                
                # Busca contexto no Supabase
                contexto = engine.buscar_contexto(contexto_busca, setor, historico=historico_texto)
                resposta = engine.gerar_resposta(user_input, setor, contexto)
                
                historico.append(user_input)
                
                print(" " * 20, end="\r")
                print(f"🤖 Assistente: {resposta}")
                
                if "não consta no meu mapeamento técnico atual" in resposta.lower():
                    print("\n💡 Dica: Adicione este material usando: Adicionar material [Nome] [Ref] [Uso]...")
                
                print("─"*50)
                
            except KeyboardInterrupt: 
                return
            except Exception as e: 
                print(f"\n❌ Erro: {e}")

if __name__ == "__main__":
    start_chat()
