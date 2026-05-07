# 🤖 MedIA - Assistente Virtual Inteligente
> A fusão da inteligência Arthromed + Medic.

O **MedIA** é uma plataforma de inteligência operacional centralizada, projetada para fornecer suporte técnico, fluxos de processos e consulta de materiais de forma instantânea para os colaboradores.

---

## 📂 Estrutura do Projeto

O projeto está organizado em módulos para facilitar a manutenção e escalabilidade:

### 1. 🌐 `web/` (Principal)
Aplicação web moderna construída com **TanStack Start (React 19)**, Tailwind CSS v4 e Lucide React. É aqui que reside a interface principal do chatbot e o portal administrativo.
- **Tecnologias:** Vite, TypeScript, Framer Motion.
- **Deploy:** Cloudflare Pages/Workers.

### 2. ⚙️ `backend/` (Legado e Ferramentas)
Contém a lógica original em Python utilizada para o protótipo inicial e ferramentas de manutenção de dados.
- **Scripts:** Ingestão de dados no Supabase, testes de embeddings.
- **Linguagem:** Python 3.10+.

### 3. 📊 `data/`
Repositório de dados brutos e definições de processos em formato JSON.
- `processos_internos.json`: A base de conhecimento do MedIA.

### 4. 🧩 `extension/` (Em Desenvolvimento)
Extensão para Google Chrome e Microsoft Edge que injeta o widget do MedIA em qualquer site externo.

---

## ⚡ Como Rodar o Projeto Web

1. Acesse a pasta `web`: `cd web`
2. Instale as dependências: `npm install`
3. Configure o `.env` com as chaves do Supabase e OpenRouter.
4. Inicie o servidor de desenvolvimento: `npm run dev`
5. Acesse: `http://localhost:3002`

---

## 💬 Funcionalidades Principais
- **Seleção Dinâmica de Setores:** Fluxos isolados por departamento (Financeiro, Comercial, etc).
- **RAG Robusto:** Busca semântica e por palavras-chave na base de conhecimento.
- **Identidade Visual Premium:** Design moderno com a fusão de cores Arthromed (Teal) e Medic (Pink/Blue).
- **Interação Natural:** Comando de voz e texto com suporte a troca de setor via comandos naturais.

---
Desenvolvido por **Gabriel Farias** para a **Arthromed & Medic** 🚀
