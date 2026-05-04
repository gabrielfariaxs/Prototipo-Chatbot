import os
import sys

# Ajusta path para importar do src
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from src.services.engine import ArthromedEngine
from src.ingestion.processors import DataProcessor

def find_file(filename: str, search_dirs: list[str]) -> str | None:
    """Localiza um arquivo em uma lista de diretórios possíveis."""
    for directory in search_dirs:
        path = os.path.join(directory, filename)
        if os.path.exists(path):
            return path
    return None

def extract_data_from_sources(processor: DataProcessor, search_dirs: list[str]) -> list[dict]:
    """Extrai os dados de todos os arquivos suportados de forma genérica."""
    all_data = []
    
    # Mapeamento de fontes e funções de processamento
    sources = [
        ("processos_internos.json", processor.process_json, "processos internos"),
        ("materiais_extras.json", processor.process_extra_materials, "materiais extras"),
        ("Produtos (3).xlsx", processor.process_excel, "Excel de materiais"),
        ("Relatorio de faturamento.pdf", processor.process_pdf_faturamento, "PDF de faturamento")
    ]
    
    for filename, process_func, description in sources:
        filepath = find_file(filename, search_dirs)
        if filepath:
            print(f"[*] Lendo {description}: {filepath}")
            try:
                data = process_func(filepath)
                print(f"    -> {len(data)} registros encontrados.")
                all_data.extend(data)
            except Exception as e:
                print(f"    -> Erro ao processar {filename}: {e}")
                
    return all_data

def sync_database(engine: ArthromedEngine, data: list[dict]) -> None:
    """Gera vetores e sincroniza os registros com o Supabase em lotes."""
    try:
        print("\n[*] Limpando o banco atual...")
        engine.supabase.table("documentos_arthromed").delete().neq("id", 0).execute()
        
        print("[*] Preparando textos para vetorização...")
        textos_para_vetor = [f"{item['processo']}: {item['conteudo']}" for item in data]
        
        print("[*] Gerando vetores em lote...")
        vetores = list(engine.model_embedding.embed(textos_para_vetor))
        
        records = [
            {
                **item,
                "setor": item.get("setor", "GERAL").upper(),
                "embedding": vetores[i].tolist()
            }
            for i, item in enumerate(data)
        ]
        
        print(f"[*] Inserindo {len(records)} registros no Supabase...")
        batch_size = 50
        for i in range(0, len(records), batch_size):
            batch = records[i:i+batch_size]
            engine.supabase.table("documentos_arthromed").insert(batch).execute()

        print("\n✅ BANCO DE DADOS ATUALIZADO E ORGANIZADO!")

    except Exception as e:
        print(f"\n❌ Erro na sincronização: {e}")

def run_update():
    """Fluxo principal de atualização do conhecimento."""
    print("\n" + "═"*50)
    print("      SISTEMA DE ATUALIZACAO UNIFICADO")
    print("═"*50)
    
    try:
        engine = ArthromedEngine()
        processor = DataProcessor()
    except Exception as e:
        print(f"\n❌ Erro na inicialização: {e}")
        return
    
    search_dirs = ["data/raw", "."]
    all_data = extract_data_from_sources(processor, search_dirs)
    
    if not all_data:
        print("\n⚠️ Nenhum dado encontrado para processar.")
        return

    print(f"\nSincronizando {len(all_data)} registros com o banco de dados...")
    sync_database(engine, all_data)

if __name__ == "__main__":
    run_update()
