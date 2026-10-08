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
  - Ícone de terminal no topo do cabeçalho completamente removido a pedido do usuário; acesso mantido apenas de forma sutil no rodapé da tela inicial.

---

## 🛡️ 2. Memória de Arquitetura & Segurança (Backend & Edge)

- **Defesa em 4 Camadas**:
  1. Cookie `sb-access-token` sincronizado pelo Supabase.
  2. `requireAuth()` universal (suporte a Edge Server e Client Playground).
  3. PostgreSQL Row Level Security (RLS) habilitado em todas as tabelas.
  4. Log append-only em `document_access_log` (LGPD / CFM).
- **Catálogo de Treinamentos (Capacitação Interna)**:
  - Header estilizado com identidade visual corporativa Holding Grupo Medic (gradiente escuro Navy `#121d2b` / `#1b497d` / Teal `#17a398`, ícone de vídeo executivo, badge `CAPACITAÇÃO`).
  - Barra de filtros rápidos por setor com chips horizontais em azul holding (`#1f29de`) para o item ativo e slate com alto contraste para inativos.
  - Botões de ação primária com fundo sólido explícito (`#1f29de`) e texto branco para blindagem total contra sobreposição de CSS em Tailwind v4.
  - **Motor de Thumbnails Cinematográficas**:
    - Geração automática de capas visuais ricas por setor com gradientes premium, grid tech, ambient glow e marca d'água corporativa.
    - Captura automática de thumbnail em alta resolução para links do YouTube (`img.youtube.com`).
    - Suporte a campo de URL de capa personalizada (`thumbnailUrl`) no formulário de criação/edição.
    - Botão Play central em efeito vidro com iluminação azul (`#1f29de`), badges de Setor e Módulo no topo e duração no rodapé da capa.
  - Auto-preenchimento inteligente: ao colar o link da gravação (Teams/OneDrive/Drive/YouTube), o sistema extrai o título, detecta o setor por palavras-chave e gera a descrição automaticamente.
  - Setores oficiais (sincronizados com `LoginScreen`): `Comercial interno`, `Comercial externo`, `Instrumentação`, `T.I`, `Qualidade / RT`, `Gente Gestão`, `Financeiro`, `Estoque e logistica`, `Supply Chain`, `Compras`, `Operações`, `Gestor/Diretoria`, `Geral`.
  - Estrutura hierárquica de treinamentos: **Setor** (dropdown com setores oficiais do login) + **Módulo / Processo** (campo de texto livre/manual preenchido pelo usuário, ex: `Faturamento`, `Sys Personnalite`, `OPME`).
  - Edição completa: qualquer colaborador pode criar e editar treinamentos (atualizar link do vídeo, instrutor, setor, módulo, título e descrição).
  - Proteção anti-compartilhamento: `onContextMenu` bloqueado, `select-none`, iframe sem links expostos e histórico de acessos por colaborador.
- **Módulo NCO (Não Conformidades)**:
  - Botão **`+ Nova Não Conformidade`** permanentemente visível tanto no topo quanto na barra de ferramentas para todas as visões/perfis (Líder, COO, Diretoria, etc.).
  - **Fix de Contraste e Botões em Tailwind v4**: Botões de ação e submissão em modais (`GopCreateModal.tsx`, `DemandasCreateModal.tsx`, `GopDetail.tsx`) possuem estilização explícita com `style={{ backgroundColor: '#1f29de', color: '#ffffff' }}` e `bg-[#1f29de]` para garantir contraste visual perfeito e evitar renderizações transparentes/em branco.
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
