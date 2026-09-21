import fs from 'fs'
import { spawn } from 'child_process'
import path from 'path'

console.log('--- Preparando ambiente para dev ---')

// 1. Deleta a pasta dist para evitar que o dev server carregue assets de produção antigos
try {
  if (fs.existsSync('dist')) {
    console.log('🧹 Limpando pasta dist (produção) para evitar conflitos no dev...')
    fs.rmSync('dist', { recursive: true, force: true })
  }
} catch (e) {
  console.warn('Aviso: Não foi possível deletar a pasta dist:', e.message)
}

// 2. Cria a pasta dist/server e o arquivo server.js placeholder
// para que a validação de configuração do Wrangler/Cloudflare passe com "main" ativo
try {
  if (!fs.existsSync('dist/server')) {
    fs.mkdirSync('dist/server', { recursive: true })
  }
  fs.writeFileSync('dist/server/server.js', 'export default { fetch() { return new Response("Placeholder"); } }')
  console.log('📝 Criado arquivo placeholder em dist/server/server.js para o Wrangler.')
} catch (e) {
  console.error('Erro ao criar placeholder de validação:', e.message)
}

// 3. Inicia o servidor Bridge IMAP Locaweb (Porta 3001)
const bridgeProcess = spawn('node scripts/email-bridge.js', { stdio: 'inherit', shell: true })

// 4. Inicia o servidor Vite Dev (Porta 3000)
const devProcess = spawn('npx vite dev --port 3000', { stdio: 'inherit', shell: true })

devProcess.on('close', (code) => {
  bridgeProcess.kill()
  process.exit(code || 0)
})

process.on('SIGINT', () => {
  bridgeProcess.kill('SIGINT')
  devProcess.kill('SIGINT')
})
process.on('SIGTERM', () => {
  bridgeProcess.kill('SIGTERM')
  devProcess.kill('SIGTERM')
})
