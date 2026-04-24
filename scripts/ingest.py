import sys
import os

# Adiciona o diretório raiz ao path para encontrar o módulo 'src'
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from src.engine import ArthromedEngine

# Lista Completa de Processos (Arthromed + Medic)
processos_conhecimento = [
    # --- SETOR FINANCEIRO (ARTHROMED) ---
    {
        "processo": "Gestão de Ponto (Jornada de Trabalho)",
        "setor": "Financeiro",
        "sistema": "Plataforma Flash",
        "conteudo": "Objetivo: Garantir a exatidão das horas trabalhadas. Abrir a plataforma Flash, procurar na aba esquerda 'Controle de Jornada'. Procurar 'Espelho da equipe' e em cada funcionário 'Espelho de ponto'. Preencher planilha da contabilidade com horas extras e benefícios. Caso precise ajustar, realizar o ajuste; caso não, exportar para logística e comercial. Fechar o ponto na opção: Fechar espelho e calcular a hora."
    },
    {
        "processo": "Homologação de Admissão e Demissão",
        "setor": "Financeiro",
        "sistema": "Contabilidade",
        "conteudo": "Objetivo: Padronizar entrada e saída de colaboradores. Ação do Financeiro: Se Admissional, solicita a abertura de vaga/registro à contabilidade. Se Demissional, solicita o cálculo de rescisão à contabilidade."
    },
    {
        "processo": "Análise de Fluxo de Caixa",
        "setor": "Financeiro",
        "sistema": "EMULTEC",
        "conteudo": "Objetivo: Previsibilidade financeira para as próximas 4 semanas. Abrir o EMULTEC, clicar em Financeiro. Ir em Movimentos > Conciliação de Fundos. Selecionar o Fundos (Banco) e preencher data inicial e final. Clicar em conciliar. Se estiver ok, exportar em excel no botão próprio."
    },
    {
        "processo": "Gestão de Contas a Pagar",
        "setor": "Financeiro",
        "sistema": "EMULTEC / Pastas Físicas",
        "conteudo": "Objetivo: Organização e liquidação de obrigações. Abrir o EMULTEC > Relatórios > Contas-Vencimento-Paisagem. Inserir data semanal, ir em 'Não-Pagos' e gerar excel. Organizar e colocar na planilha Fluxograma_2026_mês correspondente. Mandar contas físicas para Maria. Com comprovantes em mãos, dar baixa: Movimentos > Pagamento em lote. Selecionar títulos e baixar. Para anexar notas: Movimentos > Contas a pagar - Completo > Pesquisar nota > Entrar na nota > Anexos > Adicionar registro."
    },
    {
        "processo": "Gestão de Contas a Receber",
        "setor": "Financeiro",
        "sistema": "EMULTEC",
        "conteudo": "Objetivo: Monitoramento de entradas e controle de inadimplência. Abrir o EMULTEC > Movimentos > Gerenciamento de Notas Faturadas. Selecionar nota (por valor ou cliente). Ir em 'Parcelas' e clicar na parcela para preencher abas: datas, fundo, tipo de cobrança, juros e desconto."
    },
    {
        "processo": "Gestão de Benefícios (Plataforma Flash)",
        "setor": "Financeiro",
        "sistema": "Plataforma Flash",
        "conteudo": "Objetivo: Gestão do cartão de benefícios. Abrir Flash > Benefícios > Pedidos de benefícios. Clicar em 'Fazer novo pedido' (Benefício padrão > Pedido por seleção ou plataforma). Selecionar colaborador, adicionar valor, clicar em continuar, escolher forma de pagamento e colocar no fluxo para pagar."
    },
    {
        "processo": "Gestão de Carta de Recomendação",
        "setor": "Financeiro",
        "sistema": "Pastas Físicas",
        "conteudo": "Objetivo: Manter conformidade das cartas de comercialização. Gestão organizada por pastas de cada fornecedor."
    },

    # --- SETOR DE ORÇAMENTO (ARTHROMED) ---
    {
        "processo": "Conferência de Cirurgias (Segunda-feira)",
        "setor": "Orçamento - Arthromed",
        "sistema": "Emultec / WhatsApp Waseler",
        "conteudo": "Objetivo: Garantir que todas as cirurgias do final de semana estejam lançadas. Abrir Emultec > Movimentos > Comercial > Visualização. Filtrar data do final de semana. Conferir nos grupos Arthromed PE e CE. Se não lançada, realizar lançamento imediato. Conferir comandas, salvar em 'Documentos Scaneados' e anexar no Emultec na aba Anexos."
    },
    {
        "processo": "Fluxo de Orçamento Prévio",
        "setor": "Orçamento - Arthromed",
        "sistema": "Emultec / WhatsApp / E-mail",
        "conteudo": "Objetivo: Registrar cotações antes da cirurgia. Verificar WhatsApp e e-mails. Registrar cotação para o vendedor e no Emultec (Movimentos > Comercial > Cadastro > Novo). Se não souber o médico, perguntar ao convênio/hospital. Se não souber a parte do corpo/cirurgia, confirmar com coordenação/vendedor. Conferir representante e gerente."
    },
    {
        "processo": "Regras Especiais Convênio Unimed",
        "setor": "Orçamento - Arthromed",
        "sistema": "Manual de Precificação",
        "conteudo": "Atenção: Unimed trabalha com preços abaixo da margem. Substituições obrigatórias: Parafuso ToolVIP por Parafuso Hallufix; Fresas BRM por Brocas Lamiquali; Lâmina especial por Lâmina de bisturi Razek. Sempre conferir parafusos cotados com fio incluso."
    },
    {
        "processo": "Identificação de Cirurgia por Material",
        "setor": "Orçamento - Arthromed",
        "sistema": "Conhecimento Técnico",
        "conteudo": "Joelho: Equipo, lâmina shaver, cânula microdebridação, kit sutura ou Precision MR. Pé: Fresa, parafuso chanfrado/ToolVIP, lâmina Beaver ou especial. Mão: Dissector, gancho, CT Surgery (Túnel do Carpo). Ligamentar: Âncoras (metálica, Anchorfix, Sinfix)."
    },
    {
        "processo": "Nomenclatura Técnica de Materiais",
        "setor": "Orçamento - Arthromed",
        "sistema": "Dicionário Interno",
        "conteudo": "Parafuso PLDL = interferência/bioabsorvível. Parafuso chanfrado = ToolVIP ou Hallufix. Lâmina de shaver = Cânula de microdebridação. Lâmina Beaver = Lâmina de bisturi. Ponteira Safe Cut = Flush Cut. Ponteira de rádio = Shell Razek / Kit de ablação."
    },
    {
        "processo": "Fluxo de Orçamento Pós-Cirurgia",
        "setor": "Orçamento - Arthromed",
        "sistema": "Emultec",
        "conteudo": "Objetivo: Finalizar cirurgias e baixar estoque. Movimentos > Comercial > Visualização. Cirurgias não realizadas: Estoque > Cirurgias consignadas > Finalizar e suspender. Doação: Marcar 'Sem faturamento' no Editar ID. Precificação: Eletiva (aba Orçamento), Urgência (puxar do Cifrão). Finalizar clicando em Precificar."
    },
    {
        "processo": "Regras de Implantes e ANVISA (SulAmérica/RHP)",
        "setor": "Orçamento - Arthromed",
        "sistema": "Portal ANVISA",
        "conteudo": "SulAmérica e RHP exigem ANVISA e referência compatíveis. Exemplo: Se o registro termina em 107, todos os parafusos devem corresponder. Sempre consultar o Portal da Anvisa para conferência rigorosa."
    },
    {
        "processo": "Convênios com Faturamento Direto e Datas",
        "setor": "Orçamento - Arthromed",
        "sistema": "Agenda de Faturamento",
        "conteudo": "Faturamento Direto: SulAmérica, Camed, CASSI, Amil. Datas Limite: GEAP (1 a 10), CASSI/CAMED (1 a 20). Pendências: Enviar planilha Português todo dia 10; Rede D'Or no início do mês para opme.pendencia@rededor."
    },
    {
        "processo": "Fluxo de Cadastro (Hospital, Médico, Convênio)",
        "setor": "Orçamento - Arthromed",
        "sistema": "Cadastro Emultec",
        "conteudo": "Hospital/Convênio: Cadastro > Clientes > Novo (usar CNPJ). Marcar 'Cliente Final' para faturamento direto. Médico: Lupa ao lado do campo Médico > Novo. Obrigatório: Nome, CRM, Cidade, Estado e Vendedor."
    },
    {
        "processo": "Fluxo de Agendamento de Cirurgias",
        "setor": "Orçamento - Arthromed",
        "sistema": "Movimentos Comercial",
        "conteudo": "Caminho: Movimentos > Comercial > Novo. Inserir: Data, Hora, Parte do corpo, Médico, Hospital, Convênio e Representante. Eletiva: Conferir autorização, marcar Aprovado, confirmar e clicar no Capacete. Urgência: Criar cadastro com info disponível, marcar Aprovado, confirmar e Capacete. Markup baixo exige aprovação da coordenação."
    },
    {
        "processo": "Visualização de Nota Fiscal (DANFE)",
        "setor": "Orçamento - Arthromed",
        "sistema": "Servidor / Emultec",
        "conteudo": "Opção 1: Movimentos > Visualização > Aba NF > Inserir número > Conectar Servidor > Visualizar DANFE. Opção 2: Pela Cirurgia > Aba Nota Fiscal > Clicar na Nota > Conectar Servidor > Gerar DANFE."
    },

    # --- SETOR DE ORÇAMENTO (MEDIC) ---
    {
        "processo": "Conferência de Cirurgias",
        "setor": "Orçamento - Medic",
        "sistema": "Emultec",
        "conteudo": "Abrir o Emultec. Ir em Estoque > Cirurgia Agendadas > Filtrar por data(1 semana anterior). Clicar em “Ver todos” e exportar em Excel. Filtrar por representantes(vendedores). Verificar comandas pelo fluxo de região, caso não teve material utilizado tira do sistema. Caso tenha material utilizado ir em Movimentos > Cirurgias. Coloca o nome do paciente > Anexos. Anexar a comanda e encaminhar comanda impressa para logística para dar baixa."
    },
    {
        "processo": "Orçamento Prévio",
        "setor": "Orçamento - Medic",
        "sistema": "Whatsapp, Gmail, OMPnexo, Inpart, Gtplan, EMS",
        "conteudo": "Verificar plataformas(Whatsapp, Gmail, OMPnexo, Inpart, Gtplan, EMS). No Gtplan ir em Cotações OPME > Limpar Filtros > Colocar UF > Pesquisar. Se o status estiver em “aberto” cotar. Copiar ID do paciente e seus dados. Mandar para o representante da área para saber se vai cotar. Se for para cotar: Abrir Emultec > Movimentos > Cirurgias > Cadastro > Clicar no ícone de papel (responsável pelo cadastramento de um novo) e preencher os dados com base no portal. Ir em Orçamentos > Clicar no icone de papel > Gera o ID de Orçamento > Adicionar produtos avulsos ou conjunto > Sincronizar com SysWeb. Colocar ID do produto no Gtplan. Finalizar proposta."
    },
    {
        "processo": "Orçamento Pós-Cirurgia",
        "setor": "Orçamento - Medic",
        "sistema": "Emultec",
        "conteudo": "Copiar o ID do paciente do sistema. Ir em Cadastro > Cirurgia > Procura pelos dados do paciente(nome ou ID) e verificar se tem baixa. Ir em “Material Utilizado-Pós” se tiver a comanda pode-se valorizar. Conferir comanda com a baixa. Verificar os valores e apertar em Precificado. Colocar no Portal do cliente, email."
    },
    {
        "processo": "Fluxo de Cadastro (Hospital, Médico, Convênio)",
        "setor": "Orçamento - Medic",
        "sistema": "Cadastro Emultec",
        "conteudo": "Hospital/Convênio: Cadastro > Clientes > Novo (usar CNPJ). Marcar 'Cliente Final' para faturamento direto. Médico: Lupa ao lado do campo Médico > Novo. Obrigatório: Nome, CRM, Cidade, Estado e Vendedor."
    },
    {
        "processo": "Fluxo de Agendamento de Cirurgias",
        "setor": "Orçamento - Medic",
        "sistema": "Movimentos Comercial",
        "conteudo": "Caminho: Movimentos > Comercial > Novo. Inserir: Data, Hora, Parte do corpo, Médico, Hospital, Convênio e Representante. Eletiva: Conferir autorização, marcar Aprovado, confirmar e clicar no Capacete. Urgência: Criar cadastro com info disponível, marcar Aprovado, confirmar e Capacete. Markup baixo exige aprovação da coordenação."
    },
    {
        "processo": "Visualização de Nota Fiscal (DANFE)",
        "setor": "Orçamento - Medic",
        "sistema": "Servidor / Emultec",
        "conteudo": "Opção 1: Movimentos > Visualização > Aba NF > Inserir número > Conectar Servidor > Visualizar DANFE. Opção 2: Pela Cirurgia > Aba Nota Fiscal > Clicar na Nota > Conectar Servidor > Gerar DANFE."
    }
]

def atualizar_conhecimento():
    engine = ArthromedEngine()
    print("\nLimpando dados antigos...")
    try:
        engine.supabase.table("documentos_arthromed").delete().neq("id", 0).execute()
    except Exception as e:
        print(f"Aviso ao limpar: {e}")
    
    for item in processos_conhecimento:
        print(f"Processando: {item['processo']} ({item['setor']})...")
        try:
            texto_para_embedding = f"{item['processo']}: {item['conteudo']}"
            vetor = engine.gerar_embedding(texto_para_embedding)
            
            data = {
                "processo": item['processo'],
                "setor": item['setor'],
                "sistema": item['sistema'],
                "conteudo": item['conteudo'],
                "embedding": vetor
            }
            engine.supabase.table("documentos_arthromed").insert(data).execute()
            print(f"  OK: Salvo com sucesso!")
        except Exception as e:
            print(f"  ERRO em {item['processo']}: {e}")

if __name__ == "__main__":
    print("--- Atualizando Conhecimento (Arthromed + Medic) ---")
    atualizar_conhecimento()
    print("--- Tudo pronto! ---")
