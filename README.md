# 🤖 MedIA - Assistente Virtual Inteligente
> A fusão da inteligência Arthromed + Medic.

---

## 🚀 Novidades: Inteligência em PDFs
O MedIA agora possui um sistema de processamento de documentos multiplataforma:
- **Desktop**: Extração via Python (`pypdf`, `PyMuPDF`) com suporte a arquivos locais.
- **Web**: Extração cliente-side via `pdf.js`, permitindo análise de documentos direto no navegador com privacidade.

---

## 🚀 Uso Simplificado (Para todos os usuários)

Se você quer apenas usar o MedIA no seu dia a dia:

1. **Configuração Inicial**: Se é a primeira vez usando nesta máquina, execute o arquivo **`Instalar_MedIA.bat`**. Ele vai configurar tudo e criar um atalho na Área de Trabalho.
2. **Acesso Diário**: Basta dar um clique duplo no ícone **"MedIA - Assistente Virtual"** na sua Área de Trabalho.
3. **Versão Web**: Acesse o Portal pelo link oficial enviado pela TI.

---

## 🌐 Deploy e Servidor (Cloudflare Workers)
O MedIA está configurado para rodar como uma **Cloudflare Worker**:
1. **Build**: Use `npm run build` na pasta `web`. O sistema possui um script robusto (`scripts/build.js`) que gerencia dependências automaticamente.
2. **Deploy**: Use `npx wrangler deploy`.
3. **Secrets**: As chaves de API devem ser configuradas via `wrangler secret put OPENROUTER_API_KEY`.

---

## 📂 Funcionalidades Principais
- **Análise de Pedidos Médicos**: Extração detalhada de Paciente, Médico, Convênio e Procedimentos de PDFs e imagens.
- **Busca de Processos Internos**: Acesso instantâneo a workflows de todos os setores (Orçamento, Materiais, Geral).
- **Modo Desktop**: Interface flutuante premium que acompanha sua jornada de trabalho.

---

## 🛠️ Para Desenvolvedores

### Configuração do Ambiente
```powershell
# Web (TanStack Start + Cloudflare)
cd web
npm install
npm run dev

# Desktop (Python Bridge)
pip install requests pywebview pillow pypdf pymupdf
```

### Variáveis de Ambiente
Crie um arquivo `.env` na raiz ou configure no Cloudflare:
- `OPENROUTER_API_KEY`: Chave para acesso aos modelos Claude 3.5 Sonnet / GPT-4o.

---
Desenvolvido por **Gabriel Farias** para a **Arthromed & Medic** 🚀

