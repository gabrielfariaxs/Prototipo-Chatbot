import pandas as pd
import json
import re

excel_path = "Produtos nomenclaturas do pedido vs sistema - REALIZADA POR LAHYS EM 29 05 26.xlsx"

try:
    print(f"Lendo o arquivo: {excel_path}...")
    df = pd.read_excel(excel_path, sheet_name="retificados por LAHYS")
except Exception as e:
    print(f"Erro ao ler o Excel: {e}")
    exit(1)

df = df.fillna("")

def normalize_col(name):
    return re.sub(r'[^a-z0-9]', '', str(name).lower().strip())

col_map = {}
for col in df.columns:
    norm = normalize_col(col)
    if "descri" in norm: col_map['desc'] = col
    elif "semelhante" in norm: col_map['emultec'] = col
    elif "refer" in norm: col_map['ref'] = col
    elif "observa" in norm: col_map['obs'] = col

print(f"Colunas mapeadas: {col_map}")

products = []
for index, row in df.iterrows():
    desc = str(row[col_map['desc']]) if 'desc' in col_map else ""
    emultec = str(row[col_map['emultec']]) if 'emultec' in col_map else ""
    ref = str(row[col_map['ref']]) if 'ref' in col_map else ""
    obs = str(row[col_map['obs']]) if 'obs' in col_map else ""
    
    if desc.strip():
        products.append({
            "descricao_solicitacao": desc.strip(),
            "semelhante_emultec": emultec.strip(),
            "referencia": ref.strip(),
            "observacao": obs.strip()
        })

output_file = "web/src/lib/produtos_emultec.json"
try:
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(products, f, ensure_ascii=False, indent=2)
    print(f"\nSucesso! {len(products)} produtos extraídos e salvos em {output_file}")
except Exception as e:
    print(f"Erro ao salvar JSON: {e}")
