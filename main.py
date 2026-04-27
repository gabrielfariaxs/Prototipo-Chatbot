
import os
import json
import sys
import subprocess
from src.engine import ArthromedEngine

def clear_screen():
    os.system('cls' if os.name == 'nt' else 'clear')

def escolher_setor():
    """Função centralizada para escolher o setor."""
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

def salvar_material_extra(user_input):
    """Tenta extrair dados de material do input e salvar no JSON."""
    try:
        text = user_input.replace("Adicionar material ", "")
        if "(codigo de referencia)" in text:
            partes = text.split("(codigo de referencia)")
            nome_ref = partes[0].strip().split(" ")
            ref = nome_ref[-1]
            nome = " ".join(nome_ref[:-1])
            uso = partes[1].replace("para ", "").strip()
        else:
            partes = text.split(" ")
            nome = partes[0]
            ref = partes[1] if len(partes) > 1 else "S/Ref"
            uso = " ".join(partes[2:]) if len(partes) > 2 else "Geral"

        novo_material = {"nome": nome, "referencia": ref, "uso": uso}
        caminho = "data/raw/materiais_extras.json"
        dados = []
        if os.path.exists(caminho):
            with open(caminho, 'r', encoding='utf-8') as f:
                dados = json.load(f)
        dados.append(novo_material)
        with open(caminho, 'w', encoding='utf-8') as f:
            json.dump(dados, f, indent=4, ensure_ascii=False)
        return True, nome
    except:
        return False, None

def start_chat():
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
    
    while True:
        clear_screen()
        print(f"\n✅ Conectado: {setor.upper()}")
        print("─"*50)
        print(f"Olá! Sou o assistente do setor {setor}. Como posso ajudar?")
        print("─"*50)
        
        historico = []
        while True:
            try:
                user_input = input("\n👤 Você: ").strip()
                if not user_input: continue
                if user_input.lower() in ["sair", "exit", "quit"]: return

                # Verifica se o usuário deseja trocar de setor
                msg = user_input.lower()
                if ("mudar" in msg or "trocar" in msg or "outro" in msg) and "setor" in msg:
                    setor = escolher_setor()
                    historico = [] 
                    break

                # Comando para adicionar novos materiais ao conhecimento
                if msg.startswith("adicionar material"):
                    print("⏳ Aprendendo...", end="\r")
                    sucesso, nome = salvar_material_extra(user_input)
                    if sucesso:
                        subprocess.run([sys.executable, "scripts/update_knowledge.py"], capture_output=True)
                        print(f"✅ Material '{nome}' aprendido!")
                    continue

                print("⏳ Pensando...", end="\r")
                
                # Constrói o contexto de busca incluindo as últimas interações
                contexto_busca = user_input
                if historico:
                    contexto_busca = f"{' '.join(historico[-2:])} {user_input}"
                
                contexto = engine.buscar_contexto(contexto_busca, setor)
                resposta = engine.gerar_resposta(user_input, setor, contexto)
                
                historico.append(user_input)
                
                print(" " * 20, end="\r")
                print(f"🤖 Assistente: {resposta}")
                
                if "não consta no meu mapeamento técnico atual" in resposta.lower():
                    print("\n💡 Dica: Adicione este material usando: Adicionar material [Nome] [Ref]...")
                
                print("─"*50)
                
            except KeyboardInterrupt: return
            except Exception as e: print(f"\n❌ Erro: {e}")

if __name__ == "__main__":
    start_chat()
