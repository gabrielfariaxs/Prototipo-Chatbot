# 🤖 MedIA - Assistente Virtual & Plataforma Corporativa Inteligente

> A fusão da inteligência Arthromed + Medic. Uma plataforma completa de automação operacional, processos internos, suporte técnico T.I, gestão de chamados, módulo anti-glosa e consulta de materiais.

O **MedIA** é o ecossistema corporativo definitivo da **Arthromed & Medic**, combinando Inteligência Artificial de última geração, base de conhecimento RAG dinâmica, gestão de Não Conformidades (NOC), suporte a solicitações médicas (OPME) e central de chamados de T.I.

---

## 🎯 Módulos Corporativos Integrados

### 💬 1. Assistente Chatbot (MedIA)
- **Base de Conhecimento RAG:** Consulta automatizada a processos internos (Faturamento, Orçamentos, Estoque, Logística, Emultec, etc.).
- **Novo Processo Integrado:** *Faturamento Matriz Emultec - Transferência Filial para Matriz* (passo a passo detalhado de exportação XML, nota de transferência e importação no Emultec).
- **Extração Inteligente de Pedidos Médicos (PDF/Imagens):** Leitura de exames, pedidos médicos e cotações com formatação em cards interativos (Paciente, Médico, Hospital, Materiais e Data).
- **Interação por Voz (TTS & STT):** Transcrição de áudio via microfone e leitura das respostas em voz alta.

### 🖥️ 2. Suporte T.I (Gestão de Chamados Técnicos)
- **Fluxo Completo de Atendimento:** Abertura de solicitação, aprovação pelo gestor do setor responsável, fila de atendimento técnico T.I e finalização.
- **Histórico & Chat Interativo:** Troca de mensagens e evidências em tempo real diretamente dentro do chamado.
- **Resolução & SLA:** Registro de devolutiva técnica, tempo decorrido em aberto e cálculo de tempo total de atendimento.
- **Notificações:** Notificações em tempo real por setor e por usuário solicitante.

### ⚠️ 3. NOC (Não Conformidades Operacionais)
- Registro, acompanhamento e tratativas de Não Conformidades Operacionais (NCO).
- Indicadores e controle de qualidade nos fluxos logísticos e comerciais.

### 📄 4. Solicitação Médica (CFM / ANS Anti-Glosa)
- Módulo especializado para emissão e revisão de documentação clínica padronizada anti-glosa.
- Gerador de justificativas para OPME, solicitações cirúrgicas e recursos de negativa técnica.

### 📚 5. Catálogos e Portfólios de Produtos
- **Portfólio Arthromed:** Acesso rápido ao catálogo completo de implantes e produtos ortopédicos.
- **Portfólio Medic:** Soluções e catálogo especializado do ecossistema Medic.

---

## 🔔 Sistema de Notificações e Avisos Rápidos

- **Aviso Flutuante na Tela Inicial:** Banner animado em overlay (*bottom-up*) avisando os usuários sobre novos procedimentos e atualizações operacionais (com temporizador regressivo de 10 segundos).
- **Central de Notificações T.I:** Notificações instantâneas sobre aprovações pendentes, respostas de técnicos e conclusão de chamados.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend Web:** React 19, TanStack Start / Router, Tailwind CSS 4, Framer Motion, Lucide Icons.
- **Backend & Serverless:** Cloudflare Workers, Supabase (Autenticação, Database Postgres, Vector DB RAG).
- **Desktop Application:** Python (`pywebview`, `Pillow`, `pypdf`, `pymupdf`).
- **APIs de IA:** OpenRouter / OpenAI (`text-embedding-3-small` para RAG), Anthropic Claude 3.5 Sonnet.

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
- Node.js (v18+)
- Python 3.10+ (para a versão Desktop App)

### 1. Iniciar a Aplicação Web

```bash
cd web
npm install
npm run dev
```
Acesse no navegador: `http://localhost:3000`

### 2. Rodar Testes

```bash
cd web
npm run test
```

### 3. Deploy para Produção (Cloudflare Workers)

```bash
cd web
npm run deploy
```

### 4. Executar a Aplicação Desktop (Windows Widget)

```bash
pip install requests pywebview pillow pypdf pymupdf
python desktop_app.py --window
```

---

## 🔒 Segurança e Variáveis de Ambiente (`.env` / `.dev.vars`)

As credenciais do projeto são protegidas por variáveis de ambiente:
- `VITE_SUPABASE_URL` / `SUPABASE_URL`: URL da instância Supabase.
- `VITE_SUPABASE_KEY` / `SUPABASE_SERVICE_ROLE_KEY`: Chave de API Supabase.
- `AI_GATEWAY_API_KEY`: Chave de acesso aos modelos de IA (OpenRouter / Anthropic).

---

*Desenvolvido por Gabriel Farias para a Arthromed & Medic* 🚀
