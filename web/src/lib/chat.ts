import { createServerFn } from '@tanstack/react-start'
import { OpenAI } from 'openai'
import { z } from 'zod'
import processosJson from '../../../data/raw/processos_internos.json'

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || ''

const getChatClient = () => {
  // Tenta pegar de múltiplas fontes possíveis no ambiente Cloudflare/Nitro
  const apiKey = process.env.OPENROUTER_API_KEY || (globalThis as any).OPENROUTER_API_KEY || ''
  
  if (!apiKey) {
    console.error('ERRO: OPENROUTER_API_KEY não encontrada no ambiente!')
  }

  return new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: apiKey,
    defaultHeaders: {
      'HTTP-Referer': 'https://arthromed-chatbot.pages.dev',
      'X-Title': 'Arthromed Chatbot',
    },
  })
}

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
      
      // Busca local no JSON
      let results = processosJson.filter((doc: any) => {
        const conteudo = normalizeString(doc.conteudo || '')
        const processo = normalizeString(doc.processo || '')
        
        // Verifica se a frase exata ou as palavras-chave estão no documento
        const hasExact = conteudo.includes(searchTerm) || processo.includes(searchTerm)
        const hasWords = searchWords.length > 0 && searchWords.some(w => conteudo.includes(w) || processo.includes(w))
        
        return hasExact || hasWords
      })

      if (!results || results.length === 0) {
        return 'Nenhuma informação específica encontrada na base de dados.'
      }

      // Filtrar por setor (permite cross-check entre setores relacionados como Orçamento)
      const filtered = results.filter((doc: any) => {
        const docSector = (doc.setor || '').toUpperCase()
        const targetSector = (sector || '').toUpperCase()
        
        if (!targetSector) return true
        if (docSector === targetSector || docSector === 'MATERIAIS' || docSector === 'GERAL') return true
        
        // Se ambos forem orçamento, permite compartilhar processos
        if (targetSector.includes('ORÇAMENTO') && docSector.includes('ORÇAMENTO')) return true
        
        return false
      })

      const finalResults = filtered.length > 0 ? filtered : results // Fallback se o filtro for muito restrito

      const contexts = finalResults
        .map((doc: any) => `[SETOR: ${doc.setor}] [PROCESSO: ${doc.processo}]\n${doc.conteudo}`)
        .slice(0, 4)

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
      const chatClient = getChatClient()
      
      const messages: any[] = []
      
      let systemPrompt = `
        Você é o Assistente Virtual e Especialista Técnico da Arthromed/Medic. Você deve ser prestativo, claro e amigável.
        
        Sua tarefa principal é responder a pergunta do usuário utilizando as informações fornecidas no CONTEXTO abaixo.
      `

      const isDocumentExtraction = text.includes('[CONTEÚDO DO DOCUMENTO EXTRAÍDO]')
      const hasAttachment = !!fileData || isDocumentExtraction

      if (hasAttachment) {
        systemPrompt += `
        O USUÁRIO FORNECEU UM DOCUMENTO OU IMAGEM.
        Sua tarefa é analisar os dados técnicos e responder à solicitação.
        
        SE FOR UMA NOVA SOLICITAÇÃO (Primeira vez vendo o arquivo):
        Gere um RESUMO ESTRUTURADO dos dados técnicos usando este formato:
        - **Paciente**: [Nome]
        - **Médico**: [Nome e CRM]
        - **Hospital**: [Nome do Hospital ou Clínica]
        - **Convênio**: [Nome do Convênio]
        - **Procedimento**: [Nome da Cirurgia/Procedimento]
        - **Materiais**: [Lista de materiais ou 'Não especificado']
        - **Data**: [Data se houver]
        
        IMPORTANTE: Use o formato "**Campo**: Valor" para que o sistema possa criar os cards visuais.
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

      const userContent: any[] = [{ type: 'text', text: text }]
      
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

      const response = await chatClient.chat.completions.create({
        model: hasAttachment ? '~anthropic/claude-sonnet-latest' : '~anthropic/claude-haiku-latest',
        messages: messages,
        max_tokens: 800,
      })

      return response.choices[0].message.content
    } catch (e) {
      console.error('Erro ao gerar resposta:', e)
      throw new Error('Falha ao gerar resposta da IA.')
    }
  })

export const getSectors = createServerFn({ method: 'GET' })
  .handler(async () => {
    try {
      const data = processosJson
      const uniqueSectors = Array.from(new Set(data.map((d: any) => d.setor).filter(Boolean)))
      return uniqueSectors.sort()
    } catch (e) {
      console.error('Erro ao buscar setores:', e)
      return ['Geral', 'Financeiro', 'Comercial'] // Fallback
    }
  })
