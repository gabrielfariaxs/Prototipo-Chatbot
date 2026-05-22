import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

// Carrega variáveis do .env do root e do web/
function loadEnv() {
  const rootEnv = path.resolve('../.env')
  const webEnv = path.resolve('.env')
  
  const parse = (filePath) => {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8')
      content.split(/\r?\n/).forEach(line => {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?$/)
        if (match) {
          const key = match[1]
          let value = match[2] || ''
          if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1)
          if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1)
          process.env[key] = value
        }
      })
    }
  }
  
  parse(rootEnv)
  parse(webEnv)
}

loadEnv()

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_KEY
const openrouterKey = process.env.OPENROUTER_API_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Erro: SUPABASE_URL ou SUPABASE_KEY não configurado no seu arquivo .env!')
  process.exit(1)
}

if (!openrouterKey) {
  console.error('❌ Erro: OPENROUTER_API_KEY não configurada no arquivo .env!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Lê processos_internos.json
const jsonPath = path.resolve('../data/raw/processos_internos.json')
if (!fs.existsSync(jsonPath)) {
  console.error(`❌ Erro: Arquivo de processos não encontrado em: ${jsonPath}`)
  process.exit(1)
}

const processos = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))

console.log(`🚀 Iniciando indexação de ${processos.length} processos no Supabase...`)

async function getEmbedding(text) {
  // Chamada de embedding via OpenRouter usando o modelo gratuito nvidia/llama-nemotron-embed-vl-1b-v2
  const response = await fetch('https://openrouter.ai/api/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openrouterKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'nvidia/llama-nemotron-embed-vl-1b-v2',
      input: text
    })
  })

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '')
    throw new Error(`Falha no Embeddings API do OpenRouter: Status ${response.status} - ${errorBody}`)
  }

  const data = await response.json()
  if (!data.data || !data.data[0] || !data.data[0].embedding) {
    throw new Error(`Resposta inválida do OpenRouter: ${JSON.stringify(data)}`)
  }
  return data.data[0].embedding
}

async function run() {
  let count = 0
  for (const proc of processos) {
    const content = `[SETOR: ${proc.setor}] [PROCESSO: ${proc.processo}]\n${proc.conteudo}`
    try {
      console.log(`Gerando embedding para: ${proc.processo}...`)
      const embedding = await getEmbedding(content)
      
      const { error } = await supabase.from('documents').insert({
        content: content,
        metadata: {
          setor: proc.setor,
          processo: proc.processo
        },
        embedding: embedding
      })
      
      if (error) {
        throw error
      }
      count++
      console.log(`✅ Indexado: ${proc.processo}`)
      // Pequena pausa para evitar rate limit
      await new Promise(resolve => setTimeout(resolve, 200))
    } catch (e) {
      console.error(`❌ Erro ao indexar "${proc.processo}":`, e.message)
    }
  }
  console.log(`\n🎉 Concluído! ${count}/${processos.length} processos foram indexados com sucesso no seu Supabase.`)
}

run()
