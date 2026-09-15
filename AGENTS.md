# Configuração de Agentes e Especialistas do Projeto

## 🎨 Agente Especialista Frontend & UI/UX (Design Master)

**Gatilho de Ativação Automática**: Toda vez que o usuário solicitar qualquer tarefa, ajuste, criação, refatoração ou melhoria relacionada a:
- Design, layout, aparência, visual, cores, temas ou tipografia.
- Criação ou modificação de componentes visuais (botões, dropdowns, modais, headers, cards, tabelas, formulários, badges).
- Responsividade (desktop, tablet, mobile), espaçamento (margin/padding/gap) e alinhamento (flex/grid).
- Experiência do usuário (UX), micro-interações, feedbacks, animações e estados de interação (`hover`, `focus`, `active`, `disabled`, loading).

---

### 🛡️ Regras Inegociáveis de Excelência Visual (Zero-Tolerance)

1. **Zero Quebra de Texto Não Intencional (`whitespace-nowrap shrink-0`)**:
   - Botões, badges, pílulas de status, ícones com texto e itens de navegação **NUNCA** devem sofrer quebra de linha acidental (como quebrar "Atalhos" em "Atal\\nhos").
   - Sempre utilize `whitespace-nowrap`, `shrink-0` e contêineres flexíveis com folga visual adequada.

2. **Hierarquia Visual e Tipografia Assertiva**:
   - Misture fontes display/modernas em títulos com fontes sans-serif limpas e legíveis.
   - Aplique tracking adequado: tracking negativo (`tracking-tight`) em títulos maiores e tracking expandido (`tracking-wider uppercase text-[10px]`) em rótulos de seção e badges.
   - Textos de apoio devem ter contraste balanceado (nunca cinza ilegível, garantindo WCAG AA).

3. **Micro-interações e Polimento nos Detalhes**:
   - Botões e elementos interativos devem ter transições suaves (`transition-all duration-150` ou `duration-200`).
   - Chevrons em dropdowns **devem rotacionar** (`rotate-180 transition-transform duration-200`) ao abrir.
   - Dropdowns, modais e popovers devem possuir backdrop sutil para clique-fora e animações de entrada suaves (`animate-in fade-in zoom-in-95`).
   - Sombras refinadas e multicamadas (`shadow-xs`, `shadow-sm`, `shadow-md`, `shadow-2xl` para dropdowns flutuantes).

4. **Design Moderno e Branded**:
   - Evite cores genéricas primárias puras ou botões sem acabamento.
   - Use bordas suaves (`border-slate-200`, `border-[#e6e9f2]`), cantos consistentes (`rounded-xl` / `rounded-2xl` / `rounded-[11px]`) e fundos contrastantes de alto nível (`bg-slate-50`, `bg-[#f8fafc]`, `bg-[#fafbfe]`).
   - Ícones devem ser expressivos, com stroke calibrado (ex: Lucide icons), frequentemente emoldurados por um container com cor temática sutil.

5. **Responsividade Garantida**:
   - Todo componente deve funcionar e ter layout testado tanto em telas mobile compactas quanto em telas ultrawide.
