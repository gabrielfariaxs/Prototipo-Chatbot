import fs from 'fs'
import { execSync } from 'child_process'
import path from 'path'

const wranglerPath = path.resolve('wrangler.jsonc')
const wranglerContent = fs.readFileSync(wranglerPath, 'utf8')

console.log('--- Preparando ambiente para build ---')

// 1. Comenta a linha do main no wrangler.jsonc
const commentedWrangler = wranglerContent.replace(
  /"main":\s*"dist\/server\/server.js",/,
  '// "main": "dist/server/server.js",'
)
fs.writeFileSync(wranglerPath, commentedWrangler)

try {
  console.log('--- Executando Vite Build ---')
  execSync('npx vite build', { stdio: 'inherit' })
  
  console.log('--- Limpando caches do Wrangler ---')
  if (fs.existsSync('.wrangler')) {
    fs.rmSync('.wrangler', { recursive: true, force: true })
  }
  if (fs.existsSync('dist/client/wrangler.json')) {
    fs.unlinkSync('dist/client/wrangler.json')
  }

} catch (error) {
  console.error('Erro durante o build:', error)
  process.exit(1)
} finally {
  // 2. Restaura o wrangler.jsonc original
  console.log('--- Restaurando configurações do Wrangler ---')
  fs.writeFileSync(wranglerPath, wranglerContent)
}

console.log('--- Build concluído com sucesso! ---')
