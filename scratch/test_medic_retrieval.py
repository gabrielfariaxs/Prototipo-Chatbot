
import os
import sys

# Adiciona o diretorio raiz ao path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from src.engine import ArthromedEngine

def test_retrieval():
    engine = ArthromedEngine()
    setor = "Orçamento - Medic"
    pergunta = "Como funciona a conferência de cirurgias na Medic?"
    
    print(f"\n--- Testando busca para: {setor} ---")
    print(f"Pergunta: {pergunta}")
    
    contexto = engine.buscar_contexto(pergunta, setor)
    print("\n--- Contexto Recuperado ---")
    print(contexto)
    
    if "Conferência de Cirurgias" in contexto:
        print("\n[OK] SUCESSO: O contexto correto foi recuperado!")
    else:
        print("\n[ERRO] O contexto não contém as informações esperadas.")

if __name__ == "__main__":
    test_retrieval()
