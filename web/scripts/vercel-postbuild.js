import fs from 'fs'
import path from 'path'

console.log('--- Executando vercel-postbuild.js ---')

const webDir = process.cwd()
const outputDir = path.join(webDir, '.vercel', 'output')
const staticDir = path.join(outputDir, 'static')
const ssrFuncDir = path.join(outputDir, 'functions', '__ssr.func')

// 1. Limpa e cria diretórios
if (fs.existsSync(outputDir)) {
  fs.rmSync(outputDir, { recursive: true, force: true })
}
fs.mkdirSync(outputDir, { recursive: true })
fs.mkdirSync(staticDir, { recursive: true })
fs.mkdirSync(ssrFuncDir, { recursive: true })

// 2. Copia arquivos de dist/client para .vercel/output/static
function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true })
  const entries = fs.readdirSync(src, { withFileTypes: true })
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name)
    const destPath = path.join(dest, entry.name)
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath)
    } else {
      fs.copyFileSync(srcPath, destPath)
    }
  }
}

const clientDist = path.join(webDir, 'dist', 'client')
if (fs.existsSync(clientDist)) {
  console.log('Copiando arquivos estáticos de dist/client para .vercel/output/static...')
  copyDir(clientDist, staticDir)
} else {
  console.warn('Aviso: dist/client não encontrado!')
}

// 3. Copia arquivos do servidor de dist/server para .vercel/output/functions/__ssr.func
const serverDist = path.join(webDir, 'dist', 'server')
if (fs.existsSync(serverDist)) {
  console.log('Copiando arquivos do servidor de dist/server para .vercel/output/functions/__ssr.func...')
  copyDir(serverDist, ssrFuncDir)
} else {
  console.warn('Aviso: dist/server não encontrado!')
}

// 4. Cria arquivos da Serverless Function __ssr.func com runtime Node.js e export default function handler(req, res)
console.log('Criando arquivos da Serverless Function __ssr.func (Runtime: Nodejs)...')
fs.writeFileSync(
  path.join(ssrFuncDir, '.vc-config.json'),
  JSON.stringify({
    runtime: 'nodejs20.x',
    handler: 'index.js',
    launcherType: 'Nodejs'
  }, null, 2)
)

fs.writeFileSync(
  path.join(ssrFuncDir, 'index.js'),
  `import server from './server.js';

export default async function handler(req, res) {
  try {
    // Normalize path from x-matched-path (Vercel rewrite original path) if present.
    // Also strip out /__ssr prefix if Vercel routes routed directly.
    let reqPath = req.url || '/';
    if (req.headers['x-matched-path']) {
      const matchedPath = req.headers['x-matched-path'];
      const urlObj = new URL(reqPath, 'http://localhost');
      urlObj.pathname = matchedPath;
      reqPath = urlObj.pathname + urlObj.search;
    } else if (reqPath.startsWith('/__ssr')) {
      reqPath = reqPath.slice(6) || '/';
    }
    
    const url = new URL(reqPath, protocol + '://' + host);
    
    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (value !== undefined) {
        if (Array.isArray(value)) {
          value.forEach(v => headers.append(key, v));
        } else {
          headers.set(key, value);
        }
      }
    }

    const hasBody = req.method !== 'GET' && req.method !== 'HEAD';
    const webRequest = new Request(url, {
      method: req.method,
      headers: headers,
      body: hasBody ? req : null,
      duplex: hasBody ? 'half' : undefined
    });

    const webResponse = await server.fetch(webRequest);

    res.statusCode = webResponse.status;
    res.statusMessage = webResponse.statusText;
    
    webResponse.headers.forEach((value, key) => {
      const lowerKey = key.toLowerCase();
      // Filtra cabeçalhos hop-by-hop/gateway para evitar conflito com proxy do Vercel
      if (
        lowerKey === 'connection' ||
        lowerKey === 'transfer-encoding' ||
        lowerKey === 'keep-alive' ||
        lowerKey === 'content-encoding' ||
        lowerKey === 'content-length'
      ) {
        return;
      }
      res.setHeader(key, value);
    });

    if (webResponse.body) {
      const reader = webResponse.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(value);
      }
    }
    res.end();
  } catch (error) {
    console.error('Erro na Node.js Function SSR:', error);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.end('Erro Interno no Servidor: ' + error.message);
    }
  }
}
`
)

fs.writeFileSync(
  path.join(ssrFuncDir, 'package.json'),
  JSON.stringify({
    type: 'module'
  }, null, 2)
)

// 5. Cria config.json
console.log('Criando config.json...')
fs.writeFileSync(
  path.join(outputDir, 'config.json'),
  JSON.stringify({
    version: 3,
    routes: [
      { handle: 'filesystem' },
      { src: '/(.*)', dest: '/__ssr' }
    ]
  }, null, 2)
)

console.log('--- vercel-postbuild.js concluído com sucesso ---')
