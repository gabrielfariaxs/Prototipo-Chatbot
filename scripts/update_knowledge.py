
import os
import sys

# Ajusta path para importar do src
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from src.engine import ArthromedEngine
from src.ingestion.processors import DataProcessor

def find_file(filename, search_dirs):
    """Localiza um arquivo em uma lista de diretórios possíveis."""
    for d in search_dirs:
        path = os.path.join(d, filename)
        if os.path.exists(path):
            return path
    return None

def run_update():
    engine = ArthromedEngine()
    processor = DataProcessor()
    
    print("SISTEMA DE ATUALIZACAO UNIFICADO")
    print("----------------------------------")
    
    all_data = []
    search_dirs = ["data/raw", "Dados_Analisar", "."]
    
    # 1. Processos Internos (JSON)
    json_path = find_file("processos_internos.json", search_dirs)
    if json_path:
        print(f"[*] Lendo processos: {json_path}")
        data_json = processor.process_json(json_path)
        print(f"    -> {len(data_json)} registros encontrados.")
        all_data.extend(data_json)
    
    # 2. Materiais Extras
    extra_path = find_file("materiais_extras.json", search_dirs)
    if extra_path:
        print(f"[*] Lendo materiais extras: {extra_path}")
        data_extras = processor.process_extra_materials(extra_path)
        print(f"    -> {len(data_extras)} registros encontrados.")
        all_data.extend(data_extras)
    
    # 3. Materiais (Excel)
    excel_path = find_file("Produtos (3).xlsx", search_dirs)
    if excel_path:
        print(f"[*] Lendo Excel de materiais: {excel_path}")
        data_excel = processor.process_excel(excel_path)
        print(f"    -> {len(data_excel)} registros encontrados.")
        all_data.extend(data_excel)
    
    # 4. Histórico de Cirurgias (PDF)
    pdf_path = find_file("Relatorio de faturamento.pdf", search_dirs)
    if pdf_path:
        print(f"[*] Lendo PDF de faturamento: {pdf_path}")
        data_pdf = processor.process_pdf_faturamento(pdf_path)
        print(f"    -> {len(data_pdf)} registros encontrados.")
        all_data.extend(data_pdf)
    
    if not all_data:
        print("Nenhum dado encontrado para processar.")
        return

    print(f"\nSincronizando {len(all_data)} registros com o banco de dados...")
    
    try:
        # Limpa o banco atual
        engine.supabase.table("documentos_arthromed").delete().neq("id", 0).execute()
        
        # Prepara os textos para o embedding em lote (muito mais rápido)
        textos_para_vetor = [f"{item['processo']}: {item['conteudo']}" for item in all_data]
        
        print("[*] Gerando vetores em lote...")
        vetores = list(engine.model_embedding.embed(textos_para_vetor))
        
        # Prepara os dados finais com setor em MAIÚSCULO para facilitar a busca
        records = []
        for i, item in enumerate(all_data):
            records.append({
                **item,
                "setor": item.get("setor", "GERAL").upper(), # Normaliza o setor
                "embedding": vetores[i].tolist()
            })
        
        print("[*] Inserindo dados no Supabase...")
        for i in range(0, len(records), 50):
            batch = records[i:i+50]
            engine.supabase.table("documentos_arthromed").insert(batch).execute()

    except Exception as e:
        print(f"Erro na sincronizacao: {e}")
        return

    print("\nBANCO DE DADOS ATUALIZADO E ORGANIZADO!")

if __name__ == "__main__":
    run_update()
