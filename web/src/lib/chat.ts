import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import processosJson from '../../../data/raw/processos_internos.json'

const normalizeString = (str: string) => {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

export const getContext = createServerFn({ method: 'GET' })
  .inputValidator(z.object({
    text: z.string(),
    sector: z.string(),
    history: z.string().optional(),
  }))
  .handler(async ({ data }) => {
    const { text, sector, history = '' } = data

    try {
      const searchTerm = normalizeString(text)
      const searchWords = searchTerm.split(/\s+/).filter(w => w.length >= 3)
      
      const stopWords = [
        'como', 'para', 'com', 'uma', 'dos', 'das', 'pelo', 'pela', 
        'mais', 'este', 'esta', 'tudo', 'fazer', 'onde', 'seus', 
        'sua', 'seu', 'sobre', 'estao', 'esta', 'esteja', 'tiver', 
        'tenha', 'voce', 'como', 'quando', 'onde', 'qual', 'quais',
        'quem', 'neste', 'nesta', 'daqui', 'dali', 'deste', 'desta',
        'aquele', 'aquela', 'aquilo', 'esses', 'essas', 'aqueles', 'aquelas'
      ]
      
      // Filtrar stop words dos termos individuais para evitar falsos positivos
      const filteredSearchWords = searchWords.filter(w => !stopWords.includes(w))
      
      // Busca local no JSON com cálculo de pontuação (scoring)
      interface ScoredDoc {
        doc: any
        score: number
        isTargetSector: boolean
      }
      
      const targetSectorUpper = (sector || '').toUpperCase()

      const scoredDocs: ScoredDoc[] = processosJson.map((doc: any) => {
        const conteudo = normalizeString(doc.conteudo || '')
        const processo = normalizeString(doc.processo || '')
        const docSector = (doc.setor || '').toUpperCase()
        
        let score = 0
        
        // 1. Correspondência exata da frase de busca (pesos maiores)
        if (processo.includes(searchTerm)) {
          score += 100
        }
        if (conteudo.includes(searchTerm)) {
          score += 50
        }
        
        // 2. Correspondência de termos individuais válidos
        filteredSearchWords.forEach(w => {
          if (processo.includes(w)) {
            score += 15 // correspondência no título do processo é muito importante
          }
          if (conteudo.includes(w)) {
            score += 3 // correspondência no conteúdo
          }
        })
        
        // Verifica se pertence ao setor de destino ou setores globais
        let isTargetSector = false
        if (targetSectorUpper) {
          if (docSector === targetSectorUpper || docSector === 'MATERIAIS' || docSector === 'GERAL') {
            isTargetSector = true
          } else if (targetSectorUpper.includes('ORÇAMENTO') && docSector.includes('ORÇAMENTO')) {
            isTargetSector = true
          }
        } else {
          isTargetSector = true
        }

        // Dá um pequeno bônus se for do setor alvo para priorizar a relevância regional
        if (isTargetSector && score > 0) {
          score += 10
        }

        return { doc, score, isTargetSector }
      })

      // Filtrar documentos que tenham pontuação > 0
      let matchedDocs = scoredDocs.filter(item => item.score > 0)

      if (matchedDocs.length === 0) {
        return 'Nenhuma informação específica encontrada na base de dados.'
      }

      // Prioriza correspondências do mesmo setor primeiro.
      // Se tivermos correspondências no setor alvo, usamos elas.
      // Caso contrário, usamos todas as correspondências como fallback.
      const targetSectorMatches = matchedDocs.filter(item => item.isTargetSector)
      const docsToUse = targetSectorMatches.length > 0 ? targetSectorMatches : matchedDocs

      // Ordenar por pontuação (score) decrescente
      const sortedDocs = docsToUse
        .sort((a, b) => b.score - a.score)
        .map(item => item.doc)

      // Pegar até os 6 documentos mais relevantes
      const contexts = sortedDocs
        .slice(0, 6)
        .map((doc: any) => `[SETOR: ${doc.setor}] [PROCESSO: ${doc.processo}]\n${doc.conteudo}`)

      return contexts.join('\n\n---\n\n') || 'Nenhuma informação específica encontrada para este setor.'
    } catch (e) {
      console.error('Erro ao buscar contexto:', e)
      return 'Erro ao buscar informações na base de dados local.'
    }
  })


export const generateResponse = createServerFn({ method: 'POST' })
  .inputValidator(z.object({
    text: z.string(),
    context: z.string(),
    history: z.array(z.object({
      role: z.enum(['user', 'bot']),
      text: z.string(),
    })).optional(),
    fileData: z.object({
      base64: z.string(),
      mimeType: z.string(),
    }).optional(),
  }))
  .handler(async ({ data }) => {
    const { text, context, history = [], fileData } = data

    try {
      // Importa dinamicamente o arquivo servidor-only que nunca é enviado para o cliente
      const { getChatClient } = await import('./chat-server')
      const { chatClient, apiKey, debugInfo } = await getChatClient()

      if (!apiKey) {
        return `⚠️ **MedIA: Chave de API Ausente**\n\n` +
          `A variável de ambiente \`OPENROUTER_API_KEY\` não foi encontrada no servidor de produção da Cloudflare.\n\n` +
          `### 💡 Como resolver isso rapidamente:\n\n` +
          `👉 **Passo A**: Abra seu terminal na pasta \`web\` do seu projeto:\n` +
          `cd web\n\n` +
          `👉 **Passo B**: Execute o comando do Wrangler para registrar a sua chave de API de forma segura:\n` +
          `npx wrangler secret put OPENROUTER_API_KEY\n\n` +
          `👉 **Passo C**: Quando o terminal solicitar **"Enter the secret text you'd like to assign to OPENROUTER_API_KEY"**, cole a sua chave do OpenRouter:\n` +
          `SUA_CHAVE_DO_OPENROUTER\n\n` +
          `Após registrar a chave, ela estará ativa instantaneamente no servidor e o MedIA funcionará de forma 100% grátis! 🚀\n\n` +
          `🔍 **Diagnósticos do Servidor:**\n` +
          `- **Tem Processo (Node)**: ${debugInfo.hasProcess ? 'Sim' : 'Não'}\n` +
          `- **Chaves em process.env**: ${debugInfo.processEnvKeys.join(', ') || 'Nenhuma'}\n` +
          `- **Chaves no Contexto Workers**: ${debugInfo.cfEnvKeys.join(', ') || 'Nenhuma'}\n` +
          `- **Tem Evento H3/Vinxi**: ${debugInfo.hasEvent ? 'Sim' : 'Não'}\n` +
          `- **Chaves do Contexto de Evento**: ${debugInfo.eventContextKeys.join(', ') || 'Nenhuma'}\n` +
          `- **Erro no Evento**: ${debugInfo.error || 'Nenhum'}\n`
      }
      
      const messages: any[] = []
      
      let systemPrompt = `
Você é o MedIA, assistente virtual corporativo da Arthromed e Medic.
Sua missão é ajudar os colaboradores com processos internos, orçamentos e análise de documentos.

REGRAS DE OURO:
1. Analise documentos (PDF/Imagens) com EXTREMA PRECISÃO. Extraia nomes de pacientes, médicos, convênios, códigos de procedimentos e materiais orçados.
2. Se o documento for um pedido médico ou orçamento, organize as informações em tópicos claros.
3. Use sempre as informações do CONTEXTO abaixo para responder sobre processos da empresa.
4. Mantenha um tom profissional, prestativo e direto.
5. Se não encontrar uma informação no documento ou no contexto, diga claramente que não foi especificado.

CONTEXTO DA EMPRESA:
${context}
`
      const isDocumentExtraction = text.includes('[CONTEÚDO DO DOCUMENTO EXTRAÍDO]')
      const hasAttachment = !!fileData || isDocumentExtraction

      if (hasAttachment) {
        systemPrompt += `
        O USUÁRIO FORNECEU UM DOCUMENTO OU IMAGEM MÉDICA (Pedido Médico, Autorização de Guia, Orçamento ou Comanda).
        Sua tarefa é analisar o documento e gerar OBRIGATORIAMENTE um RESUMO ESTRUTURADO em formato de lista chave-valor, sem nenhuma conversa prévia!
        
        Você deve gerar a resposta seguindo EXATAMENTE este formato:
        - **Paciente**: [Nome completo do paciente. Evite abreviações]
        - **Médico**: [Nome completo e CRM do MÉDICO SOLICITANTE/CIRURGIÃO. Nunca coloque o médico auditor ou perito da guia]
        - **Hospital**: [Nome do hospital ou prestador onde ocorrerá a cirurgia/exame]
        - **Convênio**: [Nome da operadora do plano de saúde]
        - **Procedimento**: [Nome e códigos TUSS dos procedimentos solicitados]
        - **Materiais**: [Lista detalhada de OPME/materiais especiais solicitados. Se não houver, escreva "Não especificado"]
        - **Data**: [Data de emissão ou agendamento no formato DD/MM/AAAA. Se não houver, escreva "Não especificado"]

        CRÍTICO: Não escreva parágrafos de introdução! Comece sua resposta diretamente com a lista acima para que a nossa interface possa desenhar os cards interativos para o usuário.
        `;
      }

      systemPrompt += `
        INSTRUÇÕES CRÍTICAS:
        1. Se a informação NÃO estiver no CONTEXTO ou no DOCUMENTO ANEXADO (mesmo que em mensagens anteriores), diga educadamente que não possui essa informação.
        2. Vá direto ao ponto.
        3. Se envolver processos, use lista numerada.
        
        CONTEXTO:
        ${context}
      `

      messages.push({ role: 'system', content: systemPrompt })

      // Adiciona o histórico (limitado aos últimos 10 para evitar estouro)
      const recentHistory = history.slice(-10)
      recentHistory.forEach(msg => {
        messages.push({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.text
        })
      })

      const formattingInstruction = hasAttachment ? `\n\n` +
        `⚠️ **INSTRUÇÃO IMPORTANTE DE FORMATAÇÃO DO SISTEMA** ⚠️\n` +
        `Você deve analisar o documento acima e responder OBRIGATORIAMENTE seguindo este formato exato de lista chave-valor, sem nenhuma conversa prévia:\n` +
        `- **Paciente**: [Nome completo do paciente. Evite abreviações]\n` +
        `- **Médico**: [Nome completo e CRM do MÉDICO SOLICITANTE/CIRURGIÃO. Nunca coloque o médico auditor ou perito da guia]\n` +
        `- **Hospital**: [Nome do hospital ou prestador onde ocorrerá a cirurgia/exame]\n` +
        `- **Convênio**: [Nome da operadora do plano de saúde]\n` +
        `- **Procedimento**: [Nome e códigos TUSS dos procedimentos solicitados]\n` +
        `- **Materiais**: [Lista detalhada de OPME/materiais especiais solicitados. Se não houver, escreva "Não especificado"]\n` +
        `- **Data**: [Data de emissão ou agendamento no formato DD/MM/AAAA. Se não houver, escreva "Não especificado"]\n\n` +
        `CRÍTICO: Não comece com "O documento é..." ou introduções similares! Comece sua resposta diretamente com "- **Paciente**:" para que a interface desenhe os cards interativos.`
        : ''

      const userContent: any[] = [{ type: 'text', text: text + formattingInstruction }]
      
      if (fileData && fileData.mimeType.startsWith('image/')) {
        userContent.push({
          type: 'image_url',
          image_url: {
            url: `data:${fileData.mimeType};base64,${fileData.base64}`
          }
        })
      }

      // Adiciona a mensagem atual
      messages.push({ role: 'user', content: userContent })

      // Guarda de segurança para o TypeScript — chatClient nunca é null aqui porque
      // o bloco `if (!apiKey)` acima já retorna antes de chegar neste ponto.
      if (!chatClient) throw new Error('chatClient não inicializado — chave de API ausente.')

      // Para garantir máxima velocidade, confiabilidade e inteligência, priorizamos gpt-4o-mini e gemini-2.5-flash.
      // Eles são pagos, porém extremamente baratos (frações de centavo).
      // Se houver problemas de créditos (erro 402/429), o sistema faz fallback automático para os modelos grátis.
      const MODELS = [
        'openai/gpt-4o-mini',
        'google/gemini-2.5-flash',
        'openrouter/free',
        'meta-llama/llama-3.3-70b-instruct:free',
      ]

      let response: any = null
      let lastError: any = null
      let isOutOfCredits = false

      for (let i = 0; i < MODELS.length; i++) {
        const model = MODELS[i]
        
        // Se já sabemos que o usuário está sem créditos, pula os modelos pagos para não acumular erros
        const isPaidModel = !model.endsWith(':free') && model !== 'openrouter/free'
        if (isOutOfCredits && isPaidModel) {
          console.log(`Pulando modelo pago ${model} por falta de créditos da conta.`)
          continue
        }

        try {
          // Pequena pausa se não for o primeiro para evitar rate limits agressivos do OpenRouter
          if (i > 0) {
            await new Promise(resolve => setTimeout(resolve, 300))
          }

          const maxTokens = model === 'openai/gpt-4o-mini' ? 800 : 1200

          const apiResponse = await chatClient.chat.completions.create({
            model,
            messages: messages,
            max_tokens: maxTokens,
            temperature: 0.3,
          })

          const content = apiResponse?.choices?.[0]?.message?.content?.trim()
          if (!content) {
            throw new Error('Modelo retornou resposta vazia')
          }
          response = apiResponse
          break // Sucesso — sai do loop
        } catch (modelErr: any) {
          lastError = modelErr
          
          const status = modelErr?.status || modelErr?.status_code || 0
          const errMsg = (modelErr?.message || '').toLowerCase()
          
          // Se for erro de falta de créditos (402 ou mensagem de créditos), ativa flag
          if (
            status === 402 || 
            errMsg.includes('402') || 
            errMsg.includes('credits') || 
            errMsg.includes('insufficient') ||
            errMsg.includes('saldo')
          ) {
            isOutOfCredits = true
            console.warn('Conta sem saldo no OpenRouter. Pulando outros modelos pagos nesta tentativa.')
          }

          // Fallback se for 404, 429, 402, 400 ou se a resposta veio vazia
          const shouldFallback = 
            status === 404 || status === 429 || status === 402 || status === 400 ||
            errMsg.includes('404') || errMsg.includes('429') || errMsg.includes('402') || errMsg.includes('400') ||
            errMsg.includes('no endpoints found') || errMsg.includes('rate-limit') || errMsg.includes('credits') ||
            modelErr.message === 'Modelo retornou resposta vazia'

          if (!shouldFallback) {
            throw modelErr // Erro crítico de autenticação — propaga imediatamente
          }
          
          console.warn(`Modelo ${model} falhou ou retornou vazio (Status: ${status}), tentando próximo na lista...`)
        }
      }

      if (!response) throw lastError

      return response.choices[0].message.content
    } catch (e: any) {
      console.error('Erro ao gerar resposta:', e)
      return `❌ Erro no Servidor: ${e.message || 'Erro desconhecido'}${e.stack ? '\n\nStack: ' + e.stack.substring(0, 100) : ''}`
    }
  })

export const getSectors = createServerFn({ method: 'GET' })
  .handler(async () => {
    try {
      const data = processosJson
      const uniqueSectors = Array.from(new Set(data.map((d: any) => d.setor).filter(Boolean)))
      // Filtra setores que devem ser apenas contexto global (não exibidos como botão)
      const visibleSectors = uniqueSectors.filter(s => 
        s.toUpperCase() !== 'GERAL' && 
        s.toUpperCase() !== 'MATERIAIS'
      )
      return visibleSectors.sort()
    } catch (e) {
      console.error('Erro ao buscar setores:', e)
      return ['Geral', 'Financeiro', 'Comercial'] // Fallback
    }
  })
