
import pandas as pd
import os

excel_path = "Dados_Analisar/Produtos (3).xlsx"

if os.path.exists(excel_path):
    df = pd.read_excel(excel_path)
    print("Colunas:", df.columns.tolist())
    print("\nPrimeiras 10 linhas:")
    print(df.head(10).to_string())
else:
    print("Arquivo Excel não encontrado!")
