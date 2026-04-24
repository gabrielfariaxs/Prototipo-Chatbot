
import os
import sys
from fastembed import TextEmbedding
from supabase import create_client, Client

# Adiciona o diretorio raiz ao path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from src.config import Config

def atualizar():
    print("--- Adicionando dados do setor ORÇAMENTO (MEDIC) ---")
    
    model = TextEmbedding(model_name=Config.EMBEDDING_MODEL)
    supabase: Client = create_client(Config.SUPABASE_URL, Config.SUPABASE_KEY)
    
    setor_medic = "ORÇAMENTO - MEDIC"
    
    fluxogramas = [
        {
            "processo": "Conferência de Cirurgias",
            "setor": setor_medic,
            "sistema": "Emultec",
            "conteudo": """Abrir o Emultec. 
Ir em Estoque > Cirurgia Agendadas > Filtrar por data(1 semana anterior).
Clicar em “Ver todos” e exportar em Excel.
Filtrar por representantes(vendedores).
Verificar comandas pelo fluxo de região, caso não teve material utilizado tira do sistema.
Caso tenha material utilizado ir em Movimentos > Cirurgias.
Coloca o nome do paciente > Anexos.
Anexar a comanda e encaminhar comanda impressa para logística para dar baixa."""
        },
        {
            "processo": "Orçamento Prévio",
            "setor": setor_medic,
            "sistema": "Whatsapp, Gmail, OMPnexo, Inpart, Gtplan, EMS",
            "conteudo": """Verificar plataformas(Whatsapp, Gmail, OMPnexo, Inpart, Gtplan, EMS).
No Gtplan ir em Cotações OPME > Limpar Filtros > Colocar UF > Pesquisar.
Se o status estiver em “aberto” cotar.
Copiar ID do paciente e seus dados.
Mandar para o representante da área para saber se vai cotar.
Se for para cotar: Abrir Emultec > Movimentos > Cirurgias > Cadastro > Clicar no ícone de papel (responsável pelo cadastramento de um novo) e preencher os dados com base no portal.
Ir em Orçamentos > Clicar no icone de papel > Gera o ID de Orçamento > Adicionar produtos avulsos ou conjunto > Sincronizar com SysWeb.
Colocar ID do produto no Gtplan.
Finalizar proposta."""
        },
        {
            "processo": "Orçamento Pós-Cirurgia",
            "setor": setor_medic,
            "sistema": "Emultec",
            "conteudo": """Copiar o ID do paciente do sistema.
Ir em Cadastro > Cirurgia > Procura pelos dados do paciente(nome ou ID) e verificar se tem baixa.
Ir em “Material Utilizado-Pós” se tiver a comanda pode-se valorizar.
Conferir comanda com a baixa.
Verificar os valores e apertar em Precificado.
Colocar no Porta do cliente, email."""
        },
        {
            "processo": "Fluxo de Cadastro (Hospital, Médico, Convênio)",
            "setor": setor_medic,
            "sistema": "Cadastro Emultec",
            "conteudo": "Hospital/Convênio: Cadastro > Clientes > Novo (usar CNPJ). Marcar 'Cliente Final' para faturamento direto. Médico: Lupa ao lado do campo Médico > Novo. Obrigatório: Nome, CRM, Cidade, Estado e Vendedor."
        },
        {
            "processo": "Fluxo de Agendamento de Cirurgias",
            "setor": setor_medic,
            "sistema": "Movimentos Comercial",
            "conteudo": "Caminho: Movimentos > Comercial > Novo. Inserir: Data, Hora, Parte do corpo, Médico, Hospital, Convênio e Representante. Eletiva: Conferir autorização, marcar Aprovado, confirmar e clicar no Capacete. Urgência: Criar cadastro com info disponível, marcar Aprovado, confirmar e Capacete. Markup baixo exige aprovação da coordenação."
        },
        {
            "processo": "Visualização de Nota Fiscal (DANFE)",
            "setor": setor_medic,
            "sistema": "Servidor / Emultec",
            "conteudo": "Opção 1: Movimentos > Visualização > Aba NF > Inserir número > Conectar Servidor > Visualizar DANFE. Opção 2: Pela Cirurgia > Aba Nota Fiscal > Clicar na Nota > Conectar Servidor > Gerar DANFE."
        }
    ]

    print(f"Limpando registros antigos do setor {setor_medic}...")
    supabase.table("documentos_arthromed").delete().eq("setor", setor_medic).execute()

    for item in fluxogramas:
        print(f"Processando: {item['processo']}...")
        texto_para_embedding = f"{item['processo']} {item['conteudo']}"
        embedding = list(model.embed([texto_para_embedding]))[0].tolist()
        
        data = {
            "processo": item["processo"],
            "conteudo": item["conteudo"],
            "setor": item["setor"],
            "sistema": item["sistema"],
            "embedding": embedding
        }
        supabase.table("documentos_arthromed").insert(data).execute()

    print(f"\n--- SUCESSO! Setor {setor_medic} adicionado ao banco de dados ---")

if __name__ == "__main__":
    atualizar()
