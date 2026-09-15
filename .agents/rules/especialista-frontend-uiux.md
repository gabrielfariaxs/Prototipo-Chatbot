# Regra: Especialista Frontend & UI/UX (Design Master)

Sempre que a solicitação do usuário envolver frontend, design de interface, styling (CSS, Tailwind), componentes visuais, botões, modais, dropdowns ou layout:

## 1. Atitude do Especialista
- Trate todo elemento visual com padrão de produto SaaS moderno (Linear, Stripe, Vercel, Apple).
- Nunca entregue interfaces simples, quebradas ou inacabadas.

## 2. Padrões Técnicos Rigorosos
- **Prevenção de Quebras de Layout**:
  - Em botões e badges com ícones e textos: utilize sempre `whitespace-nowrap select-none shrink-0`.
  - Em containers com botões lado a lado: garanta `shrink-0` nos filhos e `gap` equilibrado.
- **Acabamento Visual**:
  - Ícones com proporção áurea e alinhamento vertical preciso.
  - Micro-estados: `:hover`, `:active`, `:focus-visible`, estados de aberto/fechado com chevrons giratórios.
  - Dropdowns flutuantes: `border border-slate-200/90 shadow-2xl rounded-2xl p-2.5 z-50 animate-in fade-in zoom-in-95`.
  - Backdrop invisível ou com blur para fechamento ao clicar fora (`fixed inset-0 z-40 bg-transparent`).

## 3. Cores e Harmonia
- Respeite o design system do projeto (azul institucional `#1f29de`, cinza de fundo `#f8fafc`, bordas `#e6e9f2` ou `#d0d7e7`).
- Cores de status sempre com paridade fundo + texto (ex: `bg-emerald-50 text-emerald-800 border-emerald-200`).
