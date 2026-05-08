# 🤖 MedIA - Assistente Virtual Inteligente
> A fusão da inteligência Arthromed + Medic.

O **MedIA** é uma plataforma de inteligência operacional centralizada, projetada para fornecer suporte técnico, fluxos de processos e consulta de materiais de forma instantânea para os colaboradores da Arthromed e Medic.

---

## 🚀 Como Iniciar (Quick Start)

Se você já tem o ambiente configurado, basta executar o arquivo principal:
1. Localize o arquivo `MedIA.bat` na raiz do projeto.
2. Dê um duplo clique para iniciar.
3. O sistema irá:
   - Fechar processos antigos.
   - Iniciar o servidor Web (porta 3002).
   - Abrir o ícone flutuante no seu Desktop.

---

## 🛠️ Pré-requisitos e Instalação

Para rodar o projeto do zero em uma nova máquina, siga estes passos:

### 1. Requisitos de Software
- **Node.js** (v18 ou superior)
- **Python** (v3.10 ou superior)
- **Git**

### 2. Configuração do Ambiente
Clone o repositório e instale as dependências:

```powershell
# Instalar dependências da Web
cd web
npm install
cd ..

# Instalar dependências do Python
pip install requests pywebview pillow tkinter
```

### 3. Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto com as seguintes chaves:
```env
SUPABASE_URL=seu_url_do_supabase
SUPABASE_KEY=sua_chave_do_supabase
OPENROUTER_API_KEY=sua_chave_do_openrouter
```

---

## 🧠 Como Atualizar o Conhecimento (Sincronização)

O MedIA aprende com os arquivos JSON na pasta `data/raw/`. Sempre que você alterar um processo ou adicionar uma informação nova:

1. Edite o arquivo `data/raw/processos_internos.json`.
2. No terminal, execute o comando de sincronização:
   ```powershell
   python backend/app/maintenance.py
   ```
3. O script irá processar os textos, gerar vetores de inteligência e atualizar o banco de dados em nuvem.

---

## 📂 Estrutura do Projeto

- **`web/`**: Interface React 19 (TanStack Start). Onde o chat "mora".
- **`desktop_app.py`**: O ícone flutuante que fica no canto da sua tela.
- **`backend/app/`**: O motor de busca (RAG) e scripts de manutenção.
- **`data/raw/`**: Onde você edita as informações que a IA deve saber.
- **`extension/`**: Extensão para navegadores para usar o MedIA em sites externos.

---

## 📂 Funcionalidades
- **Modo Desktop Responsivo**: A janela do chat se adapta perfeitamente ao tamanho da tela do app.
- **Busca Inteligente**: Pesquisa que ignora acentos e entende o contexto do seu setor.
- **Instância Única**: O ícone flutuante gerencia a janela para não abrir várias abas repetidas.

---
Desenvolvido por **Gabriel Farias** para a **Arthromed & Medic** 🚀
