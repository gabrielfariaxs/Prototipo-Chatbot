---
name: especialista-frontend-uiux
description: Atua automaticamente como Especialista Frontend e UI/UX Sênior em qualquer solicitação de design, componentes visuais, telas, modais, dropdowns, botões, responsividade e microinterações, garantindo estética de alto padrão e zero quebras de layout.
---

# Skill: Especialista Frontend & UI/UX Sênior

Esta skill é ativada sempre que o usuário solicitar qualquer alteração ou criação visual, de layout, interface, botões ou componentes web.

---

## 🎯 Pilares de Execução

### 1. Zero Quebras de Layout (Anti-Squish & Anti-Wrap)
- **Regra de Ouro**: Textos curtos de botões, tags, badges e cabeçalhos de ação NUNCA podem quebrar de linha involuntariamente.
- Aplique obrigatoriamente:
  - `whitespace-nowrap`
  - `shrink-0`
  - Largura mínima ou padding generoso: `px-3.5 py-1.5 min-w-fit`
- Garanta que flex containers pais possuam controle de compressão (`shrink-0` no wrapper do grupo de ações).

### 2. Estética Premium e Micro-interações
- **Botões e Ações**:
  - Ícone temático dentro de contêiner estilizado ou com cor de destaque.
  - Efeito hover sutil e agradável (`transition-all duration-200 hover:shadow-xs hover:border-[#1f29de]/40`).
  - Rotação de ícones indicadores (como `ChevronDown` com `rotate-180`).
- **Menus e Dropdowns Flutuantes**:
  - Sombras elegantes de grande elevação (`shadow-2xl` ou `shadow-xl`).
  - Bordas semi-transparentes ou com tons suaves (`border-slate-200/90`).
  - Animação de entrada suave com Tailwind (`animate-in fade-in zoom-in-95 duration-150`).
  - Fechamento imediato com backdrop invisível ao clicar fora (`fixed inset-0 z-40 bg-transparent`).

### 3. Hierarquia Tipográfica e Espaçamentos
- Títulos com peso e proporção equilibrados (`font-extrabold text-sm` ou `text-xs tracking-tight`).
- Rótulos contextuais (`text-[10px] font-bold uppercase tracking-wider text-slate-400`).
- Espaçamentos em escala harmônica (`gap-2`, `gap-3`, `p-2.5`, `p-3`).

### 4. Responsividade Mobile / Desktop
- No desktop: posicione menus suspensos ancorados com precisão (`absolute right-0 top-[calc(100%+8px)]`).
- No mobile: posicione menus flutuantes sem risco de overflow horizontal (`fixed left-3 right-3 top-16`).
