import pandas as pd
import json
import re

excel_path = "../data/Produtos nomenclaturas do pedido vs sistema - REALIZADA POR LAHYS EM 29 05 26.xlsx"

try:
    print(f"Lendo o arquivo: {excel_path}...")
    xls = pd.ExcelFile(excel_path)
    print("Abas encontradas no arquivo:", xls.sheet_names)
    
    # Tenta encontrar uma aba que contenha "retificados" ou "lahys"
    sheet_to_use = None
    for name in xls.sheet_names:
        name_lower = name.lower()
        if "retificados" in name_lower or "lahys" in name_lower:
            sheet_to_use = name
            break
            
    # Se não encontrar, usa a primeira aba disponível
    if not sheet_to_use:
        sheet_to_use = xls.sheet_names[0]
        
    print(f"Lendo aba: '{sheet_to_use}'")
    df = pd.read_excel(excel_path, sheet_name=sheet_to_use)
except Exception as e:
    print(f"Erro ao ler o Excel: {e}")
    exit(1)

df = df.fillna("")

print("Colunas encontradas no Excel:", list(df.columns))

def normalize_col(name):
    return re.sub(r'[^a-z0-9]', '', str(name).lower().strip())

col_map = {}
for col in df.columns:
    norm = normalize_col(col)
    if "descri" in norm or "solicitado" in norm or "pedido" in norm or "nomenclatura" in norm or "nome" in norm:
        # Se contiver "semelhante" ou "emultec", é o correspondente, não a descrição original
        if "semelhante" not in norm and "emultec" not in norm:
            col_map['desc'] = col
            continue
            
    if "semelhante" in norm or "emultec" in norm:
        col_map['emultec'] = col
    elif "refer" in norm or "ref" in norm:
        col_map['ref'] = col
    elif "observa" in norm or "obs" in norm:
        col_map['obs'] = col

# Fallback: Se não encontrou a descrição original do pedido, pega a primeira coluna disponível que não foi mapeada
if 'desc' not in col_map:
    for col in df.columns:
        if col not in col_map.values():
            col_map['desc'] = col
            break

print(f"Colunas mapeadas final: {col_map}")

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

output_file = "../web/src/lib/produtos_emultec.json"
try:
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(products, f, ensure_ascii=False, indent=2)
    print(f"\nSucesso! {len(products)} produtos extraídos e salvos em {output_file}")
except Exception as e:
    print(f"Erro ao salvar JSON: {e}")
