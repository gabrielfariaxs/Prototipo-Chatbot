import { OpenAI } from 'openai'

export async function getChatClient() {
  let apiKey = ''
  const debugInfo: any = {
    hasProcess: typeof process !== 'undefined',
    processEnvKeys: typeof process !== 'undefined' ? Object.keys(process.env) : [],
    cfEnvKeys: [],
    hasEvent: false,
    eventContextKeys: [],
    startContextKeys: [],
    error: null
  }


  // 1. Tenta obter o segredo via tanstack-start:start-storage-context (requestOpts)
  // O Cloudflare Worker passa env como 2o argumento do fetch: (request, env, ctx)
  // O TanStack Start wraps isso em requestOpts e o passa via startStorage
  try {
    const START_STORAGE_KEY = Symbol.for("tanstack-start:start-storage-context")
    const startStorage = (globalThis as any)[START_STORAGE_KEY]
    
    if (startStorage) {
      const startCtx = startStorage.getStore()
      debugInfo.startContextKeys = Object.keys(startCtx || {})
      
      // O requestOpts do Cloudflare Worker pode estar em várias posições
      const possibleEnvSources = [
        startCtx?.requestOpts,
        startCtx?.env,
        startCtx?.cloudflare,
        startCtx?.request?._cf,
      ]
      
      for (const envSource of possibleEnvSources) {
        if (envSource?.AI_GATEWAY_API_KEY) {
          apiKey = envSource.AI_GATEWAY_API_KEY
          break
        }
      }
    }
  } catch (e: any) {
    debugInfo.error = `startStorage: ${e.message}`
  }

  // 2. Tenta via H3 event storage (tanstack-start:event-storage)
  if (!apiKey) {
    try {
      const EVENT_STORAGE_KEY = Symbol.for("tanstack-start:event-storage")
      const eventStorage = (globalThis as any)[EVENT_STORAGE_KEY]
      
      if (eventStorage) {
        const store = eventStorage.getStore()
        const h3Event = store?.h3Event
        
        if (h3Event) {
          debugInfo.hasEvent = true
          debugInfo.eventContextKeys = Object.keys(h3Event.context || {})
          
          // Tenta todas as formas possíveis de acesso ao env do Cloudflare
          const cfEnv = 
            h3Event.context?.cloudflare?.env || 
            h3Event.context?.env ||
            h3Event.context?.cf ||
            h3Event.node?.req?.cloudflare
          
          if (cfEnv) {
            debugInfo.cfEnvKeys = Object.keys(cfEnv)
            if (cfEnv.AI_GATEWAY_API_KEY) {
              apiKey = cfEnv.AI_GATEWAY_API_KEY
            }
          }
        }
      }
    } catch (e: any) {
      debugInfo.error = `${debugInfo.error || ''} | eventStorage: ${e.message}`
    }
  }

  // 3. Fallbacks secundários para desenvolvimento local
  if (!apiKey) {
    apiKey = 
      process.env.AI_GATEWAY_API_KEY || 
      (import.meta.env ? (import.meta.env as any).AI_GATEWAY_API_KEY : '') ||
      (globalThis as any).AI_GATEWAY_API_KEY || 
      ''
  }

  // Conecta diretamente ao OpenRouter (compatível com OpenAI SDK)
  const chatClient = apiKey ? new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: apiKey,
  }) : null

  return { chatClient, apiKey, debugInfo }
}

export async function transcribeAudioOnServer(base64Audio: string, mimeType: string): Promise<string> {
  const { chatClient, apiKey } = await getChatClient()

  if (!apiKey || !chatClient) {
    throw new Error('Chave de API do AI Gateway ausente no servidor.')
  }

  if (apiKey.startsWith('sk-ant-')) {
    throw new Error('A transcrição de áudio (Whisper) não é suportada utilizando uma chave de API do Claude (Anthropic) diretamente.')
  }

  // Converter base64 para Uint8Array
  const binaryString = atob(base64Audio)
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }

  // Descobre a extensão baseando-se no mimeType para dar nome adequado ao arquivo
  let extension = 'webm'
  if (mimeType.includes('wav')) extension = 'wav'
  else if (mimeType.includes('ogg')) extension = 'ogg'
  else if (mimeType.includes('mp4')) extension = 'mp4'
  else if (mimeType.includes('mpeg')) extension = 'mp3'
  else if (mimeType.includes('m4a')) extension = 'm4a'

  // Cria o arquivo virtual usando a API Web padrão File
  let fileObj: any
  if (typeof globalThis.File !== 'undefined') {
    fileObj = new globalThis.File([bytes], `audio.${extension}`, { type: mimeType })
  } else {
    // Fallback usando Blob (OpenAI SDK aceita Blob também)
    fileObj = new globalThis.Blob([bytes], { type: mimeType })
    ;(fileObj as any).name = `audio.${extension}`
  }

  try {
    const transcription = await chatClient.audio.transcriptions.create({
      file: fileObj,
      model: 'openai/whisper-1',
      language: 'pt',
    })

    return transcription.text
  } catch (error: any) {
    console.error('Erro ao chamar Whisper no servidor:', error)
    throw new Error(`Falha na transcrição: ${error.message || error}`)
  }
}

