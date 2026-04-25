
import re
from pypdf import PdfReader
import json

pdf_path = "Dados_Analisar/Relatorio de faturamento.pdf"

def extract_pdf_data():
    reader = PdfReader(pdf_path)
    full_text = ""
    for page in reader.pages:
        full_text += page.extract_text() + "\n"

    # Regex para capturar o procedimento (Cirurgia)
    # Exemplo: ORTOPEDIA - FRATURA FIBULA ELETIVA - Cirurgia N: 193
    procedures = re.findall(r'ORTOPEDIA - (.*?) - Cirurgia', full_text)
    procedures = list(set([p.strip() for p in procedures]))

    # Tentar capturar a relação procedimento -> materiais
    # Isso é mais complexo pois depende da estrutura visual.
    # Vamos tentar quebrar por páginas ou blocos de cirurgia.
    
    chunks = re.split(r'Cirurgia N:', full_text)
    knowledge = []
    
    for chunk in chunks[1:]: # Pula o primeiro que é cabeçalho
        # Pega o nome do procedimento (está logo antes do split no regex anterior, mas aqui pegamos do início do chunk se necessário)
        # Na verdade, o nome do procedimento está ANTES de "Cirurgia N:".
        # Vamos tentar outra abordagem.
        pass

    print(f"Procedimentos encontrados ({len(procedures)}):")
    for p in procedures[:20]:
        print(f"- {p}")

    return procedures

if __name__ == "__main__":
    extract_pdf_data()
