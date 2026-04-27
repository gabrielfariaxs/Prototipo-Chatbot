
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
            
            # Divide por cirurgias
            chunks = re.split(r'ORTOPEDIA -', full_text)
            results = []
            
            for chunk in chunks[1:]:
                lines = chunk.split('\n')
                # Nome do procedimento (primeira linha do chunk)
                proc_header = lines[0].split('-')[0].strip()
                
                materials = []
                capturing = False
                for line in lines:
                    if "Código Produto" in line:
                        capturing = True
                        continue
                    if "PIS/COFINS" in line:
                        capturing = False
                        break
                    
                    if capturing and line.strip():
                        # Padrão: Código (letras/números/traços) seguido de espaço e texto
                        match = re.match(r'^([A-Z0-9.\-/]+)\s+(.*)', line.strip())
                        if match:
                            codigo = match.group(1)
                            # Tenta limpar a descrição (remove valores no final)
                            desc_completa = match.group(2)
                            # Remove marcas e valores (heurística simples: pega os primeiros termos)
                            desc_clean = re.sub(r'\d+,\d+.*', '', desc_completa).strip()
                            if len(codigo) > 3:
                                materials.append(f"- {desc_clean} (Ref: {codigo})")
                
                if materials:
                    # Remove duplicados e cria o registro
                    materials = sorted(list(set(materials)))
                    results.append({
                        "processo": f"Materiais para: {proc_header}",
                        "setor": "MATERIAIS - HISTÓRICO",
                        "sistema": "PDF Faturamento",
                        "conteudo": f"Procedimento: {proc_header}\nMateriais comumente utilizados:\n" + "\n".join(materials)
                    })
            return results
        except Exception as e:
            print(f"Erro no PDF: {e}")
            return []

    @staticmethod
    def get_body_part(procedure):
        """Mapeia o procedimento para a parte do corpo correspondente."""
        mapping = {
            "FIBULA": "Fibula", "RADIO": "Rádio", "METACARPO": "Metacarpo",
            "TIBIA": "Tibia", "CLAVICULA": "Clavícula", "JOELHO": "Joelho",
            "PE ": "Pé", "HALLUX": "Pé", "MAO": "Mão", "OMBRO": "Ombro"
        }
        for key, value in mapping.items():
            if key in procedure.upper():
                return value
        return "Diversos"
