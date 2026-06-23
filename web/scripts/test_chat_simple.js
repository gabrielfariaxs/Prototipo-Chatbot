import fs from 'fs'
import path from 'path'
import { OpenAI } from 'openai'

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

const gatewayKey = process.env.AI_GATEWAY_API_KEY
const client = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: gatewayKey,
})

async function run() {
  console.log('Sending message to google/gemini-2.5-flash via Vercel AI Gateway...')
  try {
    const res = await client.chat.completions.create({
      model: 'google/gemini-2.5-flash',
      messages: [{ role: 'user', content: 'Diga olá!' }]
    })
    console.log('Response:', res.choices[0].message)
  } catch (err) {
    console.error('Error details:', err)
  }
}

run()
