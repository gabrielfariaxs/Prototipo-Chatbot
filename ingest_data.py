import os
import google.generativeai as genai
from supabase import create_client
from dotenv import load_dotenv

# Carrega as chaves do seu arquivo .env
load_dotenv()

# Configuração das APIs
SUPABASE_URL = os.getenv("SUPABASE_URL", "").strip()
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "").strip()
GOOGLE_KEY = os.getenv("GOOGLE_API_KEY", "").strip()

print(f"DEBUG: Tentando conectar em: {SUPABASE_URL}")
if len(SUPABASE_KEY) > 10:
    print(f"DEBUG: Chave Supabase encontrada (Inicia com: {SUPABASE_KEY[:5]}...)")

genai.configure(api_key=GOOGLE_KEY)
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Lista de processos da Arthromed
processos_arthromed = [
    {
        "processo": "Gestão de Ponto (Jornada de Trabalho)",
        "setor": "Financeiro/RH",
        "sistema": "Sistema VR",
        "conteudo": "Garantir a exatidão das horas trabalhadas. O ciclo ocorre entre os dias 21 e 22. O financeiro acessa o Sistema VR. Inconsistências geram notificação (B1) e ajuste manual. A folha é validada pelo colaborador (A1) e assinada (C1) antes de ir para a contabilidade."
    },
    {
        "processo": "Homologação de Admissão e Demissão",
        "setor": "Gerência/Financeiro",
        "sistema": "Contabilidade",
        "conteudo": "Padronizar entrada e saída. Gerência envia documentos (A1). Financeiro solicita registro (B1) ou rescisão (C1) à contabilidade. A contabilidade emite parecer técnico (D1). Finaliza com assinaturas e exames."
    },
    {
        "processo": "Análise de Fluxo de Caixa",
        "setor": "Financeiro",
        "sistema": "Sistema Emultec",
        "conteudo": "Previsibilidade para 4 semanas. Realizado ao final do mês. Extração de relatórios de Contas a Pagar/Receber no Emultec. Elaboração de planilha projetada e envio para a gerência."
    },
    {
        "processo": "Gestão de Contas a Pagar",
        "setor": "Financeiro",
        "sistema": "Sistema Emultec",
        "conteudo": "Organização de obrigações. Notas chegam via e-mail (A1/B1). Lançamento no Emultec após conferência. Organização em pastas físicas. Toda sexta, gera-se relatório para autorização de pagamento pela gerência."
    },
    {
        "processo": "Gestão de Contas a Receber",
        "setor": "Financeiro",
        "sistema": "Sistema Emultec",
        "conteudo": "Monitoramento de entradas. Toda sexta, a gerência envia o extrato (A1). O financeiro concilia o extrato com o relatório do Emultec. Se pago, baixa o título. Se não, inicia cobrança."
    },
    {
        "processo": "Fechamento Financeiro (Conciliação Bancária)",
        "setor": "Financeiro",
        "sistema": "Sistema Emultec",
        "conteudo": "Prestação de contas mensal. Inicia no 1º dia útil. Gerência envia extrato completo (A1). Financeiro garante que o saldo do Emultec bata com o extrato real. Envio digital e físico para a contabilidade."
    },
    {
        "processo": "Gestão de Benefícios (Plataforma Flash)",
        "setor": "Financeiro",
        "sistema": "Plataforma Flash",
        "conteudo": "Gestão do cartão de benefícios. Cálculo por dias úteis e regiões. Solicitação de ajuste e boleto na Flash (A1). Emissão do boleto (B1) e envio para pagamento pela gerência."
    },
    {
        "processo": "Gestão de Caixinha (Fundo Fixo)",
        "setor": "Financeiro",
        "sistema": "Planilha Interna",
        "conteudo": "Pequenos gastos. Gerência aporta valor (A1). Colaborador solicita (B1). Financeiro analisa e entrega (D1). Obrigatória devolução de cupom fiscal e troco. Registro na planilha (E1)."
    },
    {
        "processo": "Gestão de Carta de Recomendação",
        "setor": "Financeiro",
        "sistema": "Pasta Física",
        "conteudo": "Conformidade de comercialização. Gerência entrega cartas (A1). Arquivamento em pasta específica. Revisão mensal de validades. Alerta à gerência para renovações próximas do vencimento."
    }
]

def gerar_embedding(texto):
    """Gera o vetor usando o modelo do Google"""
    result = genai.embed_content(
        model="models/gemini-embedding-001",
        content=texto,
        task_type="retrieval_document"
    )
    return result['embedding']

def subir_para_supabase():
    for item in processos_arthromed:
        print(f"Processando: {item['processo']}...")
        
        try:
            vetor = gerar_embedding(item['conteudo'])
            data = {
                "processo": item['processo'],
                "setor": item['setor'],
                "sistema": item['sistema'],
                "conteudo": item['conteudo'],
                "embedding": vetor
            }
            supabase.table("documentos_arthromed").insert(data).execute()
            print(f"  OK: Salvo com sucesso!")
        except Exception as e:
            print(f"  ERRO em {item['processo']}: {e}")

if __name__ == "__main__":
    print("--- Iniciando Upload Arthromed ---")
    subir_para_supabase()
    print("--- Processo Encerrado ---")
