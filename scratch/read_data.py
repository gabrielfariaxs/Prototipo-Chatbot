
import pandas as pd
from pypdf import PdfReader
import os

excel_path = "Dados_Analisar/Produtos (3).xlsx"
pdf_path = "Dados_Analisar/Relatorio de faturamento.pdf"

print("--- Lendo Excel ---")
if os.path.exists(excel_path):
    df = pd.read_excel(excel_path)
    print("Colunas encontradas:", df.columns.tolist())
    print("\nPrimeiras 5 linhas:")
    print(df.head())
else:
    print("Arquivo Excel não encontrado!")

print("\n--- Lendo PDF ---")
if os.path.exists(pdf_path):
    reader = PdfReader(pdf_path)
    print(f"Total de páginas: {len(reader.pages)}")
    # Pega o texto da primeira página para inspeção
    text = reader.pages[0].extract_text()
    print("\nExemplo de texto da página 1:")
    print(text[:1000])
else:
    print("Arquivo PDF não encontrado!")
