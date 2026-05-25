import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

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
const openrouterKey = process.env.AI_GATEWAY_API_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function getEmbedding(text) {
  const response = await fetch('https://ai-gateway.vercel.sh/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openrouterKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'openai/text-embedding-3-small',
      input: text
    })
  })

  if (!response.ok) {
    throw new Error(`Status ${response.status}`)
  }

  const data = await response.json()
  return data.data[0].embedding
}

async function test() {
  const query = 'como fazer orçamentos'
  console.log(`Buscando embeddings para: "${query}"...`)
  const embedding = await getEmbedding(query)
  
  console.log('Executando match_documents com threshold = 0.1...')
  const { data: documents, error } = await supabase.rpc('match_documents', {
    query_embedding: embedding,
    match_threshold: 0.1,
    match_count: 5
  })
  
  if (error) {
    console.error('Erro RPC:', error)
    return
  }
  
  console.log(`Resultados encontrados: ${documents.length}`)
  documents.forEach((doc, i) => {
    console.log(`[${i+1}] (Sim: ${doc.similarity.toFixed(4)}) - Setor: ${doc.metadata?.setor} | Processo: ${doc.metadata?.processo}`)
    console.log(`Conteúdo inicial: ${doc.content.substring(0, 150)}...\n`)
  })
}

test()
