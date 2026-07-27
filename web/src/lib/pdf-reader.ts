export interface ProcessedFile {
  name: string
  base64: string
  type: string
  extractedText?: string
}

/**
 * Processa um arquivo enviado (Imagem ou PDF).
 * Se for PDF digital: extrai todo o texto da história, CIDs, laudos e materiais.
 * Se for PDF escaneado (foto de exame): renderiza as páginas em imagens PNG usando Canvas para a IA ler via Visão Computacional.
 */
export async function processClinicalFile(file: File): Promise<ProcessedFile> {
  return new Promise((resolve) => {
    const reader = new FileReader()

    reader.onload = async (e) => {
      const base64Full = e.target?.result as string
      const base64Data = base64Full.split(',')[1]

      if (file.type !== 'application/pdf') {
        resolve({
          name: file.name,
          base64: base64Data,
          type: file.type || 'image/png',
        })
        return
      }

      // É um arquivo PDF
      try {
        const pdfjsModule = await import('pdfjs-dist')
        const pdfjs = pdfjsModule.default || pdfjsModule
        pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@5.7.284/build/pdf.worker.min.mjs`

        const binaryString = atob(base64Data)
        const bytes = new Uint8Array(binaryString.length)
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i)
        }

        const loadingTask = pdfjs.getDocument({ data: bytes })
        const pdf = await loadingTask.promise
        let fullText = ''

        // 1. Tenta extrair o texto de todas as páginas (até 10 páginas)
        for (let i = 1; i <= Math.min(pdf.numPages, 10); i++) {
          const page = await pdf.getPage(i)
          const textContent = await page.getTextContent()
          const pageText = textContent.items.map((item: any) => item.str).join(' ')
          if (pageText.trim().length > 0) {
            fullText += `[PÁGINA ${i} DO PDF ${file.name}]:\n${pageText}\n\n`
          }
        }

        // Se encontrou texto digital no PDF
        if (fullText.trim().length > 50) {
          resolve({
            name: file.name,
            base64: base64Data,
            type: 'application/pdf',
            extractedText: fullText,
          })
          return
        }

        // 2. Se for um PDF escaneado (sem texto digital), converte a 1ª página em Imagem PNG
        const page = await pdf.getPage(1)
        const viewport = page.getViewport({ scale: 2.0 })

        const canvas = document.createElement('canvas')
        canvas.width = viewport.width
        canvas.height = viewport.height
        const ctx = canvas.getContext('2d')

        if (ctx) {
          await page.render({
            canvasContext: ctx,
            viewport: viewport,
            canvas: canvas,
          }).promise

          const imgUrl = canvas.toDataURL('image/png')
          const imgBase64 = imgUrl.split(',')[1]

          resolve({
            name: `${file.name} (Página 1 Escaneada)`,
            base64: imgBase64,
            type: 'image/png',
            extractedText: fullText || undefined,
          })
          return
        }
      } catch (err) {
        console.error('Erro ao processar PDF via pdfjs-dist:', err)
      }

      // Fallback padrão se der qualquer falha no PDF
      resolve({
        name: file.name,
        base64: base64Data,
        type: 'application/pdf',
      })
    }

    reader.readAsDataURL(file)
  })
}
