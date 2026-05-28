# 🤖 MedIA - Assistente Virtual Inteligente

> A fusão da inteligência Arthromed + Medic. Uma plataforma completa de automação, processos internos e extração de dados médicos.

O **MedIA** é muito mais que um chatbot; é o Assistente Virtual Corporativo definitivo da Arthromed, construído com as tecnologias web mais modernas e impulsionado pelo Claude 3.5 Sonnet (Anthropic).

---

## ✨ Tudo que o MedIA Faz (Funcionalidades)

### 🏥 1. Extração Inteligente de Pedidos Médicos (PDF/Imagens)
- **Leitura Automática:** Arraste e solte o arquivo (PDF de exames, pedidos médicos ou imagens escaneadas) no chat.
- **Processamento Multiplataforma:** 
  - Na versão Desktop, usa `PyMuPDF` e `pypdf` + OCR melhorado com `Pillow` para PDFs difíceis.
  - Na versão Web, usa a API Nativa (Client-side) para segurança e velocidade.
- **Formatação em Cards:** A inteligência artificial mapeia as informações e devolve tudo formatado (Paciente, Médico, Hospital, Procedimentos, CID, Materiais e Data).
- **Processamento em Lote:** Capacidade de leitura simultânea *(Em breve)*.

### 📊 2. Dashboard Analytics Integrado & Feedback
- **Métricas e Relatórios:** Acesse o painel de métricas no próprio cabeçalho do chat clicando no ícone do gráfico (Métricas e Analytics).
- **Indicadores de Desempenho:** O MedIA rastreia e mostra as "Guias e Pedidos Processados", as "Horas Humanas Economizadas" e "Qualidade e Satisfação".
- **Botões de Avaliação (Like/Dislike):** Toda extração médica finalizada possui botões 👍 e 👎. Avaliações negativas abrem uma caixa de comentário (feedback qualitativo) para evolução do sistema.

### 🧠 3. RAG (Conhecimento Interno e Setores)
- **Seleção de Contexto:** Antes de iniciar o chat, o usuário escolhe o seu setor (Orçamento, Assistente Corp, Materiais, etc).
- **Inteligência Contextual:** A IA adapta as respostas e atua como uma consultora daquele setor específico.
- **Upload Local de Conhecimento:** (Através da ferramenta `upload_knowledge.py`).

### 🎙️ 4. Acessibilidade e Interação por Voz
- **Transcrição de Áudio (Microfone):** O usuário pode gravar áudios explicando a pendência ou dúvida, e o MedIA converte a voz em texto automaticamente para pesquisa.
- **Leitura em Voz Alta:** Um botão de alto-falante 🔈 no cabeçalho ativa/desativa a leitura das mensagens que o MedIA responde.

### 💻 5. Modos Web e Desktop (Premium UI)
- **Design de Alta Fidelidade (Wow Factor):** Construído do zero usando Tailwind CSS, Lucide Icons e Framer Motion. Tem animações dinâmicas, *glassmorphism* e *feedback visual* de interações.
- **Modo Web (Nuvem):** Acessível de qualquer navegador, escalado globalmente via **Cloudflare Workers**.
- **Modo Desktop Widget (Python):** Uma "bolha" de chat flutuante, discreta e premium no Windows. Se esconde, pode ser movida pelo usuário (Drag & Drop) e sobrepõe a tela para auxílio imediato.

---

## 🚀 Uso Simplificado (Para a Equipe)

1. **Acesso Diário (Desktop):** Basta dar um clique duplo no ícone **"MedIA - Assistente Virtual"** na sua Área de Trabalho. Um widget flutuante no formato do logo abrirá no canto inferior direito.
2. **Acesso Web:** Use o link de acesso seguro fornecido pela equipe de TI.
3. **Navegação:** Escolha o setor, clique no microfone para falar ou simplesmente arraste um arquivo PDF/Imagem para cima da caixa de texto para extrair os dados.
4. **Limpar:** A qualquer momento, clique no ícone da Lixeira 🗑️ para resetar o histórico.

---

## 🌐 Deploy e Servidor (Cloudflare)

O ambiente de produção do MedIA é totalmente *Serverless* com baixa latência:
- Hospedado no **Cloudflare Workers** para respostas em tempo real.
- **Deploy Automático:** Basta executar `npm run deploy` na pasta `web` (requer `npm` e `wrangler`).
- **Comandos Úteis:**
  - `npm run dev` - Rodar versão local na porta 3000.
  - `npm run build` - Gera a compilação de arquivos estáticos.

---

## 🛠️ Para Desenvolvedores

### Configuração do Ambiente

```bash
# Ambiente Web (TanStack Start / React / Tailwind)
cd web
npm install
npm run dev

# Ambiente Desktop (Python Bridge)
pip install requests pywebview pillow pypdf pymupdf
python desktop_app.py --window
```

### Segurança e Variáveis (`.dev.vars`)
As senhas e API Keys agora ficam restritas ao arquivo `web/.dev.vars` para segurança e *NUNCA* são enviadas para o GitHub (Push Protection ativo):
- `ANTHROPIC_API_KEY`: Chave segura para os modelos Claude (3.5 Sonnet).

---
*Desenvolvido por Gabriel Farias para a Arthromed & Medic* 🚀
