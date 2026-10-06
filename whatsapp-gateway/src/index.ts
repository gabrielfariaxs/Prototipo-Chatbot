import { Hono } from 'hono'

type Bindings = {
  UAIZAPI_URL: string
  UAIZAPI_TOKEN: string
  MAIN_API_URL: string
}

const app = new Hono<{ Bindings: Bindings }>()

app.get('/', (c) => c.text('WhatsApp Gateway is running! 🚀'))

// Endpoint de Webhook que a Uaizapi vai chamar
app.post('/webhook/uaizapi', async (c) => {
  try {
    const payload = await c.req.json()

    // Validação básica se é uma mensagem recebida
    if (payload.event === 'messages.upsert' && payload.data) {
      const message = payload.data.message
      
      // Ignorar mensagens enviadas por nós mesmos (ou bots)
      if (payload.data.key?.fromMe) {
        return c.text('Ignorado: fromMe', 200)
      }

      const remoteJid = payload.data.key?.remoteJid // Ex: 5511999999999@s.whatsapp.net
      const textMessage = message?.conversation || message?.extendedTextMessage?.text

      if (!remoteJid || !textMessage) {
        return c.text('Ignorado: Sem texto ou remente', 200)
      }

      console.log(`[WHATSAPP] Mensagem recebida de ${remoteJid}: ${textMessage}`)

      // AQUI ENTRA A ARQUITETURA DE MICROSERVIÇOS EM CASCATA:
      // Como o WhatsApp exige resposta rápida (< 5s), não podemos bloquear essa execução 
      // esperando a IA do Claude responder (que leva uns 15-20s).
      //
      // Passo 1: Mandar uma mensagem de "Aguarde..." para o Uaizapi usando a API de Envio.
      // Passo 2: Mandar o texto para a nossa MAIN_API_URL em background usando ctx.waitUntil().

      // 1. Opcional: Mandar mensagem de carregamento
      /*
      c.executionCtx.waitUntil(
        fetch(`${c.env.UAIZAPI_URL}/messages/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${c.env.UAIZAPI_TOKEN}` },
          body: JSON.stringify({ number: remoteJid, text: "Estou analisando sua dúvida, aguarde um momento..." })
        })
      )
      */

      // 2. Repassar para o Assistente Web (IA) processar de forma assíncrona
      const aiRequestPayload = {
        whatsapp_number: remoteJid,
        text: textMessage
      }

      c.executionCtx.waitUntil(
        fetch(`${c.env.MAIN_API_URL}/webhook/whatsapp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(aiRequestPayload)
        }).then(res => {
          if (!res.ok) console.error('Erro ao chamar Main API:', res.status)
        }).catch(err => console.error('Falha de rede ao chamar Main API:', err))
      )
    }

    // SEMPRE responder rápido com 200 OK para a Uaizapi não achar que deu timeout
    return c.text('Recebido e em processamento', 200)

  } catch (err) {
    console.error('Erro no Webhook:', err)
    return c.text('Erro interno do gateway', 500)
  }
})

export default app
