
import os
import re
import pandas as pd
import json
from pypdf import PdfReader

class DataProcessor:
    @staticmethod
    def process_json(file_path):
        if not os.path.exists(file_path): return []
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)

    @staticmethod
    def process_extra_materials(file_path):
        if not os.path.exists(file_path): return []
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                results = []
                for item in data:
                    results.append({
                        "processo": f"Material (Extra): {item.get('nome')}",
                        "setor": "MATERIAIS - EXTRA",
                        "sistema": "Chat Learning",
                        "conteudo": f"Material: {item.get('nome')} | Ref: {item.get('referencia')} | Finalidade: {item.get('uso', 'Não informada')}"
                    })
                return results
        except: return []

    @staticmethod
    def process_excel(file_path):
        if not os.path.exists(file_path): return []
        df = pd.read_excel(file_path)
        results = []
        for _, row in df.iterrows():
            sol = str(row.get('DESC. NA SOLICITAÇÃO', '')).strip()
            emu = str(row.get('DESC NO EMULTEC', '')).strip()
            ref = str(row.get('REFERENCIA', '')).strip()
            if sol and emu and sol != 'nan' and emu != 'nan':
                results.append({
                    "processo": f"Material: {sol}",
                    "setor": "MATERIAIS - CADASTRO",
                    "sistema": "Excel",
                    "conteudo": f"Solicitação: {sol} -> Emultec: {emu} (Ref: {ref})"
                })
        return results

    @staticmethod
    def process_pdf_faturamento(file_path):
        if not os.path.exists(file_path): return []
        try:
            reader = PdfReader(file_path)
            full_text = "\n".join([page.extract_text() for page in reader.pages])
            
            # Divide por cirurgias usando "Hospital:" como marcador de início, que é mais confiável
            chunks = re.split(r'Hospital:', full_text)
            results = []
            
            for chunk in chunks[1:]:
                # Readiciona "Hospital:" ao início para manter a estrutura se necessário
                chunk = "Hospital:" + chunk
                lines = [line.strip() for line in chunk.split('\n') if line.strip()]
                if not lines: continue

                # Nome do procedimento: busca a linha que contém "ORTOPEDIA"
                proc_header = "Procedimento não identificado"
                for line in lines:
                    if "ORTOPEDIA" in line.upper():
                        parts = re.split(r'ORTOPEDIA\s*[-–]\s*', line, flags=re.IGNORECASE)
                        if len(parts) > 1:
                            proc_header = re.split(r'ELETIVA|URG[ÊE]NCIA|Cirurgia', parts[1])[0].strip()
                            break
                
                materials = []
                capturing = False
                for line in lines:
                    # Inicia captura após o cabeçalho da tabela (muito flexível para erros de encoding)
                    if "DIGO" in line.upper() and "PRODUTO" in line.upper():
                        capturing = True
                        continue
                    
                    # Para a captura ao chegar no resumo financeiro da página/cirurgia
                    if any(x in line.upper() for x in ["PIS/COFINS", "IRR/CSLL", "ICMS", "DESPESA"]):
                        capturing = False
                        continue
                    
                    if capturing:
                        # Padrão: Permite símbolos opcionais no início (ex: ?) e captura o código
                        match = re.search(r'([A-Z0-9.\-/]{4,})\s+(.*)', line)
                        if match:
                            codigo = match.group(1)
                            desc_raw = match.group(2)
                            # Limpa a descrição removendo marcas, quantidades e valores no final
                            desc_clean = re.split(r'\s{2,}|\d+,\d+', desc_raw)[0].strip()
                            materials.append(f"- {desc_clean} (Ref: {codigo})")
                
                if materials:
                    # Tenta detectar a parte do corpo com base no nome do procedimento
                    parte_corpo = DataProcessor.get_body_part(proc_header)
                    
                    materials = sorted(list(set(materials)))
                    results.append({
                        "processo": f"Materiais para: {proc_header}",
                        "setor": "MATERIAIS - HISTÓRICO",
                        "sistema": "PDF Faturamento",
                        "conteudo": f"Procedimento: {proc_header}\nParte do Corpo Relacionada: {parte_corpo}\nMateriais comumente utilizados:\n" + "\n".join(materials)
                    })
            return results
        except Exception as e:
            print(f"Erro no PDF: {e}")
            return []

    @staticmethod
    def get_body_part(procedure):
        """Mapeia o procedimento para a parte do corpo correspondente."""
        import unicodedata
        def remove_accents(s):
            return "".join(c for c in unicodedata.normalize('NFD', s) if unicodedata.category(c) != 'Mn')
        
        proc_clean = remove_accents(procedure).upper()
        
        mapping = {
            "FIBULA": "Fibula", "RADIO": "Rádio", "METACARPO": "Metacarpo",
            "TIBIA": "Tibia", "CLAVICULA": "Clavícula", "JOELHO": "Joelho",
            "PE ": "Pé", "HALLUX": "Pé", "MAO": "Mão", "OMBRO": "Ombro",
            "CALCANHAR": "Pé/Calcâneo", "FEMUR": "Fêmur", "UMERO": "Úmero",
            "OSTEOMELITE": "Osso (Infecção)", "OSTEOMIELITE": "Osso (Infecção)"
        }
        for key, value in mapping.items():
            if key in proc_clean:
                return value
        return "Diversos"
