# 🧠 Memória Contínua do Sistema MedIA (Active Memory Bank)

> **Este arquivo armazena as decisões arquiteturais, preferências do usuário, regras aprendidas e padrões consolidados a partir dos prompts recebidos.**
> Todos os agentes consultam esta memória antes de executar qualquer alteração no código.

---

## 📌 1. Memória de Preferências do Usuário (User Preferences)

- **Comportamento & Estilo**:
  - Respostas diretas, técnicas e sem prolixidade.
  - Idioma: Português do Brasil (PT-BR).
  - Nunca quebrar layout ou texto acidentalmente (`whitespace-nowrap shrink-0`).
- **Autenticação & Acesso**:
  - A Documentação Técnica (`DeveloperDocsModal`) só pode ser aberta por usuários **autenticados/logados**.
  - As senhas dos portais (`portal_passwords`) devem ter acesso restrito por RLS e setor (Comercial Interno, TI, Liderança).
- **Interface & Layout**:
  - Documentação técnica exibida como **link sutil/frase clicável no canto inferior** no onboarding, e não como um card grande na grade.
  - Toda a documentação técnica vive **exclusivamente dentro do modal da plataforma** (`DeveloperDocsModal`), dispensando arquivos `.md` externos na pasta `docs/`.
  - Módulo 2.5 (Outlook) removido da documentação técnica.
  - Ícone discreto no topo do cabeçalho (`<Terminal />`) para acesso rápido.

---

## 🛡️ 2. Memória de Arquitetura & Segurança (Backend & Edge)

- **Defesa em 4 Camadas**:
  1. Cookie `sb-access-token` sincronizado pelo Supabase.
  2. `requireAuth()` universal (suporte a Edge Server e Client Playground).
  3. PostgreSQL Row Level Security (RLS) habilitado em todas as tabelas.
  4. Log append-only em `document_access_log` (LGPD / CFM).
- **Performance & Cache**:
  - Catálogos cacheados em memória (TTL 1 hora).
  - Embeddings vetoriais em cache LRU (300 itens).
  - Web scraping condicional sob demanda.

---

## 🎨 3. Memória de UI/UX & Design System (Design Master)

- **Padrão de Cores**:
  - Primária: Azul corporativo vibrante (`#1f29de` / `#4338ca`).
  - Fundos: Alto contraste refinado (`#f8fafc`, `#fafbfe`, `#0c1222` em Dark Mode).
  - Bordas: Suaves (`border-slate-200/80` / `border-slate-800`).
- **Micro-interações**:
  - Botões e chevrons com animação suave de transição e escala (`whileHover`, `whileTap`).
  - Feedbacks visuais de clipboard com temporizador de 2 segundos.

---

## 🏥 4. Memória de Negócio & Domínio Clínico (Arthromed & Medic)

- **Setores Ativos**: Faturamento, Logística, Orçamento, Comercial Interno, Qualidade/GOP, Diretoria/Gestão, TI.
- **Módulo Clínico**: Solicitações médicas anti-glosa com justificativa técnica de OPME e conformidade CFM/ANS.
