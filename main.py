import os
from src.engine import ArthromedEngine

def clear_screen():
    os.system('cls' if os.name == 'nt' else 'clear')

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

    setor = ""
    while not setor.strip():
        entrada = input("\n🏢 Para começar, digite seu setor: ").strip()
        
        # Lógica especial para Orçamento (Arthromed ou Medic)
        if entrada.lower() == "orçamento":
            empresa = ""
            while empresa.lower() not in ["arthromed", "medic"]:
                empresa = input("   👉 É para Arthromed ou Medic?: ").strip()
                if empresa.lower() not in ["arthromed", "medic"]:
                    print("   ⚠️ Por favor, escolha entre 'Arthromed' ou 'Medic'.")
            setor = f"Orçamento - {empresa.capitalize()}"
        else:
            setor = entrada
    
    clear_screen()
    print(f"\n✅ Conectado: {setor.upper()}")
    print("─"*50)
    print(f"Olá! Sou o assistente do setor {setor}. Como posso ajudar?")
    print("(Digite 'sair' para encerrar ou 'setor' para trocar)")
    print("─"*50)
    
    while True:
        try:
            user_input = input("\n👤 Você: ").strip()
            
            if not user_input: continue
            if user_input.lower() in ["sair", "exit", "quit"]:
                print("\n👋 Até logo! Encerrando...")
                break
                
            # Comandos para mudar de setor
            comandos_mudar = ["mudar setor", "mudar de setor", "trocar setor", "trocar de setor", "setor"]
            if user_input.lower() in comandos_mudar:
                setor = ""
                while not setor.strip():
                    entrada = input("\n🏢 Qual o novo setor?: ").strip()
                    if entrada.lower() == "orçamento":
                        empresa = ""
                        while empresa.lower() not in ["arthromed", "medic"]:
                            empresa = input("   👉 É para Arthromed ou Medic?: ").strip()
                        setor = f"Orçamento - {empresa.capitalize()}"
                    else:
                        setor = entrada
                print(f"✅ Setor alterado para: {setor.upper()}")
                continue
                
            print("⏳ Pensando...", end="\r")
            contexto = engine.buscar_contexto(user_input, setor)
            resposta = engine.gerar_resposta(user_input, setor, contexto)
            
            # Limpa o 'Pensando...' e mostra a resposta
            print(" " * 20, end="\r")
            print(f"🤖 Assistente: {resposta}")
            print("─"*50)
            
        except KeyboardInterrupt:
            break
        except Exception as e:
            print(f"\n❌ Ocorreu um erro: {e}")

if __name__ == "__main__":
    start_chat()
