
import os
import sys
from fastembed import TextEmbedding
from supabase import create_client, Client

# Adiciona o diretorio raiz ao path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from src.config import Config

def atualizar():
    print("--- Atualizando dados COMPLETOS no Financeiro ---")
    
    model = TextEmbedding(model_name=Config.EMBEDDING_MODEL)
    supabase: Client = create_client(Config.SUPABASE_URL, Config.SUPABASE_KEY)
    
    fluxogramas = [
        {
            "processo": "1. Gestao de Ponto (Jornada de Trabalho)",
            "setor": "FINANCEIRO",
            "sistema": "Plataforma Flash",
            "conteudo": """Objetivo: Garantir a exatidao das horas trabalhadas e o fechamento para folha de pagamento.
Abrir a plataforma Flash, e procurar na aba esquerda 'Controle de Jornada'
Procurar 'Espelho da equipe' e em cada funcionario 'Espelho de ponto'
Preencher planilha da contabilidade onde ha horas extras, beneficios 
Caso ha algo para ajustar, caso nao exportar planilha para logistica e comercial 
Fechar o ponto, caso tudo esteja ok, na opcao: Fechar espelho e calcular a hora."""
        },
        {
            "processo": "2. Homologacao de Admissao e Demissao",
            "setor": "FINANCEIRO",
            "sistema": "Contabilidade",
            "conteudo": """Objetivo: Padronizar a entrada e saida de colaboradores entre Gerencia, Financeiro e Contabilidade.
Acao do Financeiro:
Se Admissional: Solicita a abertura de vaga/registro a contabilidade.
Se Demissional: Solicita o calculo de rescisao a contabilidade."""
        },
        {
            "processo": "3. Analise de Fluxo de Caixa",
            "setor": "FINANCEIRO",
            "sistema": "EMULTEC",
            "conteudo": """Objetivo: Previsibilidade financeira para as proximas 4 semanas.
Abrir o EMULTEC
Clicar em Financeiro 
Ir em Movimentos > Conciliacao de Fundos
Selecionar o Fundos(Banco) e preencher a data inicial e data final
Clicar em conciliar, caso esteja tudo ok, exportar em excel no botao proprio"""
        },
        {
            "processo": "4. Gestao de Contas a Pagar",
            "setor": "FINANCEIRO",
            "sistema": "EMULTEC",
            "conteudo": """Objetivo: Organizacao e liquidacao de obrigacoes com fornecedores e governo.
Abrir o EMULTEC
Ir em Relatorios > Contas-Vencimento-Paisagem
Inserir a data (data semanal)
Ir em 'Nao-Pagos' e gerar o excel
Com o Excel baixado, organiza-lo 
Apos organizar, colocar na planilha Fluxograma_2026_mes(o mes correspondente que voce esta)
Em seguida, organizar as contas fisicas e mandar para Maria
Com os pagamentos realizados por Maria e o recebimento dos comprovantes, dar baixa das notas: Movimentos > Pagamento em lote
Colocar a data no Pagamento em lote, visualizar os Nao Pagos e selecionar titulo por titulo a ser pago e baixo em lote: Movimentos > Contas a pagar - Completo
Em contas a pagar - completo pesquisar por notas > entrar em cada nota > anexos > adicionar registro"""
        },
        {
            "processo": "5. Gestao de Contas a Receber",
            "setor": "FINANCEIRO",
            "sistema": "EMULTEC",
            "conteudo": """Objetivo: Monitoramento de entradas e controle de inadimplencia
Abrir o EMULTEC
Ir em Movimentos > Gerenciamento de Notas Faturadas
Selecionar nota (podendo ser por valor ou por clientes)
Ir em 'Parcelas', clica na parcela para preencha-la
Preencha as abas: datas, fundo, tipo de cobranca e caso tiver juros e desconto tambem"""
        },
        {
            "processo": "7. Gestao de Beneficios (Plataforma Flash)",
            "setor": "FINANCEIRO",
            "sistema": "Plataforma Flash",
            "conteudo": """Objetivo: Gestao do cartao de beneficios dos colaboradores.
Abrir a plataforma Flash 
Ir na aba beneficios > pedidos de beneficios 
Clicar em 'Fazer novo pedido' e deixar selecionado as opcoes: Beneficio padrao > Pedido por selecao ou plataforma
Selecionar o colaborador que vai receber > Adicionar o valor 
Clicar continuar e escolher forma de pagamento 
Colocar no fluxo para pagar"""
        },
        {
            "processo": "9. Gestao de Carta de Recomendacao",
            "setor": "FINANCEIRO",
            "sistema": "Pastas Fisicas",
            "conteudo": """Objetivo: Manter a conformidade das cartas de comercializacao de produtos.
Gestao por pastas de cada fornecedor"""
        }
    ]

    print("Limpando registros antigos do Financeiro...")
    supabase.table("documentos_arthromed").delete().eq("setor", "FINANCEIRO").execute()

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

    print("\n--- SUCESSO! Banco de dados atualizado com os textos completos ---")

if __name__ == "__main__":
    atualizar()
