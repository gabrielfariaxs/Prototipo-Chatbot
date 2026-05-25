import http from 'http'
import handler from '../.vercel/output/functions/__ssr.func/index.js'

console.log('Starting test server...')
const server = http.createServer(async (req, res) => {
  console.log(`Received request: ${req.method} ${req.url}`)
  try {
    await handler(req, res)
    console.log('Request handled successfully')
  } catch (error) {
    console.error('CRITICAL ERROR in test server:', error)
    if (!res.headersSent) {
      res.statusCode = 500;
      res.end('Error: ' + error.stack)
    }
  }
})

server.listen(3005, () => {
  console.log('Test server listening on port 3005')
  
  http.get('http://localhost:3005/?desktop=false&extension=false', (res) => {
    let data = ''
    res.on('data', chunk => data += chunk)
    res.on('end', () => {
      console.log('Response status:', res.statusCode)
      console.log('Response headers:', res.headers)
      console.log('Response body:', data)
      process.exit(0)
    })
  }).on('error', (err) => {
    console.error('Request error:', err)
    process.exit(1)
  })
})
