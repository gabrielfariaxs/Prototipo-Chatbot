import http from 'http'
import tls from 'tls'

const PORT = 3005
console.log('⚡ Iniciando Locaweb IMAP/SMTP Bridge Server (Raw TLS) na porta', PORT)

function extractIntelligenceMetadata(subject, body, sender) {
  const fullText = (subject + ' ' + body + ' ' + sender).toUpperCase()
  let convênio = 'Não identificado'
  if (fullText.includes('BRADESCO')) convênio = 'Bradesco Saúde'
  else if (fullText.includes('UNIMED')) convênio = 'Unimed'
  else if (fullText.includes('SULAMERICA') || fullText.includes('SUL AMÉRICA')) convênio = 'SulAmérica Saúde'
  else if (fullText.includes('AMIL')) convênio = 'Amil Assistência Médica'
  else if (fullText.includes('HAPVIDA')) convênio = 'Hapvida / Notredame'
  else if (fullText.includes('CASSI')) convênio = 'CASSI'
  else if (fullText.includes('GEAP')) convênio = 'GEAP Autogestão'
  else if (fullText.includes('SUS')) convênio = 'SUS / Fundo Estadual'

  let hospital = 'Não informado'
  if (fullText.includes('HNSN') || fullText.includes('NOSSA SENHORA DAS NEVES') || fullText.includes('NEVES')) hospital = 'Hospital Nossa Senhora das Neves (HNSN)'
  else if (fullText.includes('MEMORIAL')) hospital = 'Hospital Memorial'
  else if (fullText.includes('SANTA JOANA')) hospital = 'Hospital Santa Joana'
  else if (fullText.includes('ESPERANCA') || fullText.includes('ESPERANÇA')) hospital = 'Hospital Esperança'
  else if (fullText.includes('REAL HOSPITAL') || fullText.includes('PORTUGUES')) hospital = 'Real Hospital Português'
  else if (fullText.includes('UNIMED')) hospital = 'Hospital Unimed'

  let paciente = 'Não especificado'
  const patientMatch = subject.match(/(?:OPERADORA|PACIENTE|PARA)\s+([A-Z\s]{4,30})/i) || body.match(/(?:PACIENTE|BENEFICIÁRIO|NOME DO PACIENTE):\s*([^\r\n]{4,35})/i)
  if (patientMatch) {
    paciente = patientMatch[1].trim().replace(/\s+/g, ' ')
  }

  return { convênio, hospital, paciente }
}

function parseIMAPEmails(rawStr, accountId) {
  const emailsList = []
  const blocks = rawStr.split(/\* \d+ FETCH/i).filter(b => b.includes('UID') || b.includes('BODY'))

  let idx = 1
  for (const block of blocks) {
    let cleanSubject = '(Sem Assunto)'
    let senderName = 'Remetente Locaweb'
    let senderEmail = ''
    let rawDate = new Date()

    // Função auxiliar para decodificar Quoted-Printable
    const decodeQP = (str) => {
      try {
        return decodeURIComponent(str.replace(/_/g, ' ').replace(/=([A-F0-9]{2})/gi, '%$1'))
      } catch (e) {
        return str.replace(/_/g, ' ')
      }
    }

    // 1. Extrair Cabeçalhos
    const headerMatch = block.match(/BODY\[HEADER\.FIELDS[^\]]*\]\s*\{(?:\d+)\}\r?\n([\s\S]*?)\r?\n\r?\n/i)
    if (headerMatch) {
      const headersStr = headerMatch[1]
      
      const subjMatch = headersStr.match(/^Subject:\s*([^\r\n]+)/im)
      if (subjMatch) {
        let s = subjMatch[1].trim()
        if (s.includes('=?')) s = s.replace(/=\?.*?\?Q\?(.*?)\?=/gi, (_, p1) => decodeQP(p1)).replace(/=\?.*?\?B\?(.*?)\?=/gi, (_, p1) => Buffer.from(p1, 'base64').toString('utf-8'))
        cleanSubject = s
      }

      const fromMatch = headersStr.match(/^From:\s*([^\r\n]+)/im)
      if (fromMatch) {
        let f = fromMatch[1].trim()
        if (f.includes('=?')) f = f.replace(/=\?.*?\?Q\?(.*?)\?=/gi, (_, p1) => decodeQP(p1)).replace(/=\?.*?\?B\?(.*?)\?=/gi, (_, p1) => Buffer.from(p1, 'base64').toString('utf-8'))
        
        const emMatch = f.match(/<([^>]+)>/)
        if (emMatch) {
          senderEmail = emMatch[1]
          senderName = f.replace(/<[^>]+>/, '').replace(/"/g, '').trim() || senderEmail
        } else {
          senderEmail = f
          senderName = f
        }
      }

      const dateMatch = headersStr.match(/^Date:\s*([^\r\n]+)/im)
      if (dateMatch) rawDate = new Date(dateMatch[1])
    }

    // 2. Extrair Corpo (Limpando multipart, Base64 e Quoted-Printable de forma inteligente)
    let cleanBodyContent = ''
    const bodyMatch = block.match(/BODY\[TEXT\](?:<\d+>)?\s*\{(?:\d+)\}\r?\n([\s\S]*?)(?=\r?\n\)\r?\n|\r?\nA3 OK|\Z)/i)
    
    if (bodyMatch) {
      let rawText = bodyMatch[1]
      let bestPart = rawText
      
      // Detecta se é multipart separando por boundaries comuns
      const parts = rawText.split(/\r?\n--[a-zA-Z0-9=._-]+/g)
      let isBase64 = /Content-Transfer-Encoding:\s*base64/i.test(block)
      let isQP = /Content-Transfer-Encoding:\s*quoted-printable/i.test(block)

      if (parts.length > 1) {
        // Encontra a melhor parte (prefere plain, depois html)
        const validParts = parts.slice(1)
        const plainPart = validParts.find(p => /Content-Type:\s*text\/plain/i.test(p))
        const htmlPart = validParts.find(p => /Content-Type:\s*text\/html/i.test(p))
        const selectedPart = plainPart || htmlPart
        
        if (selectedPart) {
          isBase64 = /Content-Transfer-Encoding:\s*base64/i.test(selectedPart)
          isQP = /Content-Transfer-Encoding:\s*quoted-printable/i.test(selectedPart)
          // Remove cabeçalhos MIME dessa parte específica
          bestPart = selectedPart.replace(/^[\s\S]*?\r?\n\r?\n/, '')
        }
      }

      // Decodificação Base64 ou Quoted-Printable
      if (isBase64 || (bestPart.length > 500 && !bestPart.includes(' '))) {
        try {
          bestPart = Buffer.from(bestPart.replace(/[\r\n]/g, ''), 'base64').toString('utf-8')
        } catch(e) {}
      } else if (isQP || bestPart.includes('=')) {
        try {
          // Remove quebras suaves e converte para %HEX
          let qpText = bestPart.replace(/=\r?\n/g, '').replace(/=([A-F0-9]{2})/gi, '%$1')
          try {
            bestPart = decodeURIComponent(qpText)
          } catch(err) {
            bestPart = unescape(qpText) // Fallback seguro
          }
        } catch(e) {}
      }

      // Limpeza final de HTML
      bestPart = bestPart.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      bestPart = bestPart.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      bestPart = bestPart.replace(/<br\s*\/?>/gi, '\n') // Preserva quebras de linha do HTML
      bestPart = bestPart.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ')
      
      // Limpeza de entidades HTML comuns
      bestPart = bestPart.replace(/&[a-z]+;/gi, ' ')

      cleanBodyContent = bestPart.replace(/[\r\n]{3,}/g, '\n\n').trim().substring(0, 5000)
    }

    if (!cleanBodyContent || cleanBodyContent.length < 5) {
      cleanBodyContent = `(Mensagem recebida, porém o formato original está cifrado ou contém apenas anexos).`
    }

    // 3. Categorização
    let categoryTag = 'Cotação / Mensagem'
    let categoryColor = 'bg-emerald-100 text-emerald-800 border-emerald-300'
    const subLower = (cleanSubject + ' ' + senderName).toLowerCase()

    if (subLower.includes('urgente') || subLower.includes('opme') || subLower.includes('prótese') || subLower.includes('cotação') || subLower.includes('orçamento')) {
      categoryTag = 'Cotação OPME'
      categoryColor = 'bg-emerald-100 text-emerald-800 border-emerald-300'
    } else if (subLower.includes('dúvida') || subLower.includes('técnica') || subLower.includes('especificação')) {
      categoryTag = 'Dúvida Técnica'
      categoryColor = 'bg-purple-100 text-purple-800 border-purple-300'
    } else if (subLower.includes('suporte') || subLower.includes('chamado') || subLower.includes('senha')) {
      categoryTag = 'Suporte T.I'
      categoryColor = 'bg-red-100 text-red-800 border-red-300'
    }

    const intel = extractIntelligenceMetadata(cleanSubject, cleanBodyContent, senderName)
    let summaryText = `Mensagem de ${senderName}.`
    if (categoryTag.includes('OPME')) {
      summaryText = `Cotação OPME de ${senderName}. Convênio: ${intel.convênio}. Hospital: ${intel.hospital}. Paciente: ${intel.paciente}.`
    }

    const dateDisplay = rawDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit' })
    const timeDisplay = rawDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

    emailsList.push({
      id: 'locaweb-' + Date.now() + '-' + (idx++),
      accountId: accountId,
      senderName,
      senderEmail,
      subject: cleanSubject,
      preview: cleanBodyContent.replace(/[\r\n\t\s]+/g, ' ').substring(0, 160),
      body: cleanBodyContent,
      timestamp: timeDisplay,
      dateFormatted: dateDisplay,
      isUnread: !block.includes('\\Seen'),
      isFlagged: subLower.includes('urgente'),
      categoryTag,
      categoryColor,
      aiSummary: summaryText,
      attachments: [], // Raw parsing for attachments is too complex without mailparser
      intelMetadata: intel
    })
  }

  return emailsList
}

async function fetchLocawebImap(email, password, maxCount = 20) {
  return new Promise((resolve, reject) => {
    let socket
    try {
      socket = tls.connect(993, 'email-ssl.com.br', { rejectUnauthorized: false, timeout: 30000 })
    } catch (e) {
      return reject(new Error('Falha ao conectar via TLS: ' + e.message))
    }

    let buffer = ''
    let step = 0
    let totalMsgs = 0

    socket.on('error', (err) => {
      console.warn('[IMAP Bridge] Socket Error (ENOTFOUND/Timeout?):', err.message)
      resolve([
        {
          id: 'demo-1',
          accountId: 'acc-1',
          senderName: 'Locaweb (Offline / Erro de Conexão)',
          senderEmail: 'suporte@locaweb.com.br',
          subject: 'Aviso: Falha de Conexão com Servidor',
          preview: 'Ocorreu um erro ao conectar no servidor email-ssl.com.br. Detalhes: ' + err.message,
          body: 'O sistema detectou uma falha (ECONNRESET, Timeout ou ENOTFOUND) ao tentar alcançar o servidor da Locaweb.\n\nDetalhes do Erro:\n' + err.message,
          timestamp: new Date().toLocaleTimeString(),
          dateFormatted: new Date().toLocaleDateString(),
          isUnread: true,
          categoryTag: 'Suporte T.I',
          categoryColor: 'bg-red-100 text-red-800 border-red-300',
          aiSummary: 'Falha de rede ao conectar no servidor IMAP da Locaweb.',
          intelMetadata: { convênio: '-', hospital: '-', paciente: '-' }
        }
      ])
    })

    socket.on('timeout', () => {
      console.warn('[IMAP Bridge] Socket Timeout!')
      socket.destroy(new Error('Timeout de Conexão com Servidor Locaweb (30s)'))
    })

    socket.setTimeout(30000)

    socket.on('data', (data) => {
      buffer += data.toString('latin1')
      
      try {
        if (step === 0 && buffer.includes('* OK')) {
          step = 1; buffer = ''
          socket.write(`A1 LOGIN "${email}" "${password}"\r\n`)
        } 
        else if (step === 1 && (buffer.includes('A1 OK') || buffer.includes('A1 NO') || buffer.includes('A1 BAD'))) {
          if (!buffer.includes('A1 OK')) throw new Error('Credenciais Inválidas')
          step = 2; buffer = ''
          socket.write('A2 SELECT INBOX\r\n')
        }
        else if (step === 2 && buffer.includes('A2 OK')) {
          const match = buffer.match(/\* (\d+) EXISTS/i)
          if (match) {
            totalMsgs = parseInt(match[1])
            if (totalMsgs === 0) {
              socket.write('A4 LOGOUT\r\n')
              resolve([])
              return
            }
            step = 3; buffer = ''
            
            const fetchCount = Math.min(maxCount, 1000)
            socket._batchEndSeq = Math.max(1, totalMsgs - fetchCount + 1)
            socket._batchStart = totalMsgs
            socket._fullBuffer = ''
            
            // Busca lotes de 50 para evitar ECONNRESET da Locaweb
            const currentFetchStart = Math.max(socket._batchEndSeq, socket._batchStart - 49)
            socket.write(`A3 FETCH ${currentFetchStart}:${socket._batchStart} (FLAGS BODY.PEEK[HEADER.FIELDS (FROM TO SUBJECT DATE)] BODY.PEEK[TEXT]<0.15000>)\r\n`)
          } else {
            throw new Error('Não foi possível ler EXISTS')
          }
        }
        else if (step === 3 && (buffer.includes('A3 OK') || buffer.includes('A3 NO') || buffer.includes('A3 BAD'))) {
          socket._fullBuffer += buffer
          const currentFetchStart = Math.max(socket._batchEndSeq, socket._batchStart - 49)
          
          if (currentFetchStart <= socket._batchEndSeq) {
            // Todos os lotes foram baixados
            const accId = email.includes('arthromed') ? 'acc-2' : 'acc-1'
            const parsed = parseIMAPEmails(socket._fullBuffer, accId)
            socket.write('A4 LOGOUT\r\n')
            resolve(parsed.reverse())
          } else {
            // Baixar próximo lote
            socket._batchStart = currentFetchStart - 1
            const nextStart = Math.max(socket._batchEndSeq, socket._batchStart - 49)
            buffer = '' // Reseta o buffer do socket para esperar o próximo A3 OK
            socket.write(`A3 FETCH ${nextStart}:${socket._batchStart} (FLAGS BODY.PEEK[HEADER.FIELDS (FROM TO SUBJECT DATE)] BODY.PEEK[TEXT]<0.15000>)\r\n`)
          }
        }
      } catch (err) {
        socket.destroy()
        reject(err)
      }
    })
  })
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    res.writeHead(204); res.end(); return
  }

  if (req.url === '/api/imap/fetch' && req.method === 'POST') {
    let body = ''
    req.on('data', chunk => body += chunk)
    req.on('end', async () => {
      try {
        const { email, password, maxCount } = JSON.parse(body || '{}')
        if (!email || !password) {
          res.writeHead(400, { 'Content-Type': 'application/json' })
          return res.end(JSON.stringify({ error: 'Email e senha são obrigatórios' }))
        }

        const emails = await fetchLocawebImap(email, password, maxCount || 25)
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ success: true, emails }))
      } catch (err) {
        console.error('[IMAP Bridge Error]', err.message)
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ success: false, error: err.message }))
      }
    })
    return
  }

  res.writeHead(404, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ error: 'Rota não encontrada' }))
})

server.listen(PORT, () => {
  console.log(`🚀 Bridge IMAP/SMTP Locaweb ativo em http://localhost:${PORT}`)
})
