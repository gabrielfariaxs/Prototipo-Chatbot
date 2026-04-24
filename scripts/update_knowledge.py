
import os
import sys

# Ajusta path para importar do src
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from src.engine import ArthromedEngine
from src.ingestion.processors import DataProcessor

def find_file(filename, search_dirs):
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
        all_data.extend(processor.process_json(json_path))
    
    # 2. Materiais Extras
    extra_path = find_file("materiais_extras.json", search_dirs)
    if extra_path:
        print(f"[*] Lendo materiais extras: {extra_path}")
        all_data.extend(processor.process_extra_materials(extra_path))
    
    # 3. Materiais (Excel)
    excel_path = find_file("Produtos (3).xlsx", search_dirs)
    if excel_path:
        print(f"[*] Lendo Excel de materiais: {excel_path}")
        all_data.extend(processor.process_excel(excel_path))
    
    # 4. Histórico de Cirurgias (PDF)
    pdf_path = find_file("Relatorio de faturamento.pdf", search_dirs)
    if pdf_path:
        print(f"[*] Lendo PDF de faturamento: {pdf_path}")
        all_data.extend(processor.process_pdf_faturamento(pdf_path))
    
    if not all_data:
        print("Nenhum dado encontrado para processar.")
        return

    print(f"\nSincronizando {len(all_data)} registros com o banco de dados...")
    
    try:
        engine.supabase.table("documentos_arthromed").delete().neq("id", 0).execute()
    except:
        pass

    for item in all_data:
        try:
            texto = f"{item['processo']}: {item['conteudo']}"
            vetor = engine.gerar_embedding(texto)
            data = {**item, "embedding": vetor}
            engine.supabase.table("documentos_arthromed").insert(data).execute()
        except:
            pass

    print("\nBANCO DE DADOS ATUALIZADO E ORGANIZADO!")

if __name__ == "__main__":
    run_update()
