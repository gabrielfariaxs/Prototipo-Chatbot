import { createServerFn } from '@tanstack/react-start'
import { OpenAI } from 'openai'
import { z } from 'zod'
import processosJson from '../../../data/raw/processos_internos.json'

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || ''

const chatClient = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: OPENROUTER_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': 'https://arthromed-chatbot.pages.dev',
    'X-Title': 'Arthromed Chatbot',
  },
})

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
  }))
  .handler(async ({ data }) => {
    const { text, context } = data

    const prompt = `
        Você é o Assistente Virtual e Especialista Técnico da Arthromed/Medic. Você deve ser prestativo, claro e amigável.
        
        Sua tarefa principal é responder a pergunta do usuário utilizando APENAS as informações fornecidas no CONTEXTO abaixo.
        
        INSTRUÇÕES CRÍTICAS:
        1. Se a informação NÃO estiver no CONTEXTO, diga educadamente que não possui essa informação específica no momento e peça para o usuário ser mais específico ou entrar em contato com a coordenação.
        2. NUNCA invente passos, URLs, ou procedimentos que não estejam no texto.
        3. Vá direto ao ponto. NUNCA diga "De acordo com o contexto". Simplesmente responda.
        4. Se o contexto contiver passos (1, 2, 3...), mantenha essa estrutura.
        5. Se envolver lista de materiais, use o formato: "- [CÓDIGO] [DESCRIÇÃO] - [MARCA]".
        
        CONTEXTO:
        ${context}
 
        PERGUNTA DO USUÁRIO:
        ${text}
    `

    try {
      const response = await chatClient.chat.completions.create({
        model: 'anthropic/claude-3-haiku',
        messages: [{ role: 'user', content: prompt }],
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
