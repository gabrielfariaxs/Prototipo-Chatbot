import React, { useState, useEffect } from 'react'
import { X, Sparkles, Loader2, BookOpen, Trash2, Check, FileText, Image as ImageIcon, AlertCircle, Plus, Eye, ArrowUpRight } from 'lucide-react'
import { saveProcedure, updateProcedure, deleteProcedure, parseProcedureWithAI, type ProcedureItem } from '../../lib/procedures-service'

interface ProcedureManageModalProps {
  isOpen: boolean
  mode: 'create' | 'edit' | 'delete'
  initialData?: Partial<ProcedureItem>
  currentSector: string
  onClose: () => void
  onSaveSuccess: (item: ProcedureItem | { idOrProcesso: string | number }, action: 'created' | 'updated' | 'deleted') => void
}

export interface AttachedImage {
  id: string
  name: string
  base64: string
  type: string
  previewUrl: string
}

const SETORES_DISPONIVEIS = [
  'Comercial',
  'Estoque/Logística',
  'Faturamento',
  'Financeiro',
  'Orçamento',
  'Geral'
]

export const ProcedureManageModal: React.FC<ProcedureManageModalProps> = ({
  isOpen,
  mode,
  initialData,
  currentSector,
  onClose,
  onSaveSuccess
}) => {
  const [processo, setProcesso] = useState('')
  const [subtipo, setSubtipo] = useState('')
  const [materiais, setMateriais] = useState('')
  const [setor, setSetor] = useState(currentSector || 'Orçamento')
  const [sistema, setSistema] = useState('Emultec')
  const [conteudo, setConteudo] = useState('')
  const [attachedFiles, setAttachedFiles] = useState<AttachedImage[]>([])
  const [previewModalImg, setPreviewModalImg] = useState<{ name: string; url: string } | null>(null)
  
  const [isAiProcessing, setIsAiProcessing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (initialData) {
      setProcesso(initialData.processo || '')
      setSubtipo(initialData.subtipo || '')
      setMateriais(initialData.materiais || '')
      setSetor(initialData.setor || currentSector || 'Orçamento')
      setSistema(initialData.sistema || 'Emultec')
      const rawConteudo = initialData.conteudo || ''
      setConteudo(rawConteudo)

      // Extrai imagens já embutidas no markdown se houver
      const extractedImages: AttachedImage[] = []
      const imgRegex = /!\[(.*?)\]\((data:(image\/[^;]+);base64,([^\)]+))\)/g
      let match
      let imgIndex = 1
      while ((match = imgRegex.exec(rawConteudo)) !== null) {
        extractedImages.push({
          id: `extracted_${imgIndex}`,
          name: match[1] || `Foto Passo ${imgIndex}`,
          type: match[3],
          base64: match[4],
          previewUrl: match[2]
        })
        imgIndex++
      }

      if (extractedImages.length > 0) {
        setAttachedFiles(extractedImages)
      } else if (initialData.images && initialData.images.length > 0) {
        setAttachedFiles(initialData.images.map((img, i) => ({
          id: `initial_${i}`,
          name: img.name,
          type: img.type,
          base64: img.base64,
          previewUrl: `data:${img.type};base64,${img.base64}`
        })))
      } else {
        setAttachedFiles([])
      }
    } else {
      setProcesso('')
      setSetor(currentSector || 'Orçamento')
      setSistema('Emultec')
      setConteudo('')
      setAttachedFiles([])
    }
    setError('')
  }, [initialData, currentSector, isOpen])

  if (!isOpen) return null

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    Array.from(files).forEach((file, index) => {
      if (file.size > 5 * 1024 * 1024) {
        alert(`Arquivo ${file.name} ultrapassa o limite de 5MB.`)
        return
      }

      const reader = new FileReader()
      reader.onload = (event) => {
        const base64Full = event.target?.result as string
        const base64Data = base64Full.includes(',') ? base64Full.split(',')[1] : base64Full
        const newImg: AttachedImage = {
          id: `${Date.now()}_${index}_${Math.random().toString(36).substr(2, 5)}`,
          name: file.name,
          base64: base64Data,
          type: file.type || 'image/jpeg',
          previewUrl: base64Full
        }
        setAttachedFiles(prev => [...prev, newImg])
      }
      reader.readAsDataURL(file)
    })
    // Limpa o input para permitir selecionar o mesmo arquivo novamente se necessário
    e.target.value = ''
  }

  const handleRemoveFile = (id: string) => {
    setAttachedFiles(prev => prev.filter(f => f.id !== id))
  }

  const handleInsertImageIntoContent = (img: AttachedImage) => {
    const markdownImg = `\n\n![Passo: ${img.name}](${img.previewUrl})\n`
    setConteudo(prev => prev.trim() + markdownImg)
  }

  const handleStructureWithAI = async () => {
    if (!conteudo.trim() && attachedFiles.length === 0) {
      setError('Por favor, digite algumas anotações ou anexe fotos/prints para a IA estruturar o passo a passo.')
      return
    }

    setIsAiProcessing(true)
    setError('')

    try {
      const parsed = await parseProcedureWithAI(conteudo, attachedFiles)
      if (parsed.processo && !processo.trim()) {
        setProcesso(parsed.processo)
      }
      if (parsed.subtipo && !subtipo.trim()) {
        setSubtipo(parsed.subtipo)
      }
      if (parsed.materiais && !materiais.trim()) {
        setMateriais(parsed.materiais)
      }
      if (parsed.sistema) {
        setSistema(parsed.sistema)
      }
      if (parsed.conteudo) {
        setConteudo(parsed.conteudo)
      }
    } catch (err: any) {
      console.error(err)
      setError('Não foi possível estruturar o procedimento automaticamente. Preencha manualmente.')
    } finally {
      setIsAiProcessing(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const authorInfo = {
      usuario_nome: localStorage.getItem('userName') || currentSector || 'Usuário do Sistema',
      usuario_setor: currentSector || setor || 'Geral'
    }

    if (mode === 'delete') {
      setIsSubmitting(true)
      try {
        const idOrName = initialData?.id || initialData?.processo || processo
        await deleteProcedure(idOrName, authorInfo)
        onSaveSuccess({ idOrProcesso: idOrName }, 'deleted')
        onClose()
      } catch (err: any) {
        setError('Erro ao excluir procedimento.')
      } finally {
        setIsSubmitting(false)
      }
      return
    }

    if (!processo.trim()) {
      setError('Informe o título do procedimento.')
      return
    }
    if (!conteudo.trim()) {
      setError('Informe o passo a passo ou descrição do procedimento.')
      return
    }

    // Se o usuário preencheu subtipo ou materiais e eles não estão no topo do conteúdo, embute para consulta perfeita no RAG
    let finalConteudo = conteudo.trim()
    let prefixData = ''
    if (subtipo.trim() && !finalConteudo.toLowerCase().includes('subtipo')) {
      prefixData += `**Subtipo de Cirurgia/Procedimento:** ${subtipo.trim()}\n`
    }
    if (materiais.trim() && !finalConteudo.toLowerCase().includes('materiais')) {
      prefixData += `**Materiais Solicitados/Necessários:** ${materiais.trim()}\n`
    }
    if (prefixData) {
      finalConteudo = `${prefixData}\n${finalConteudo}`
    }

    // Se o usuário adicionou fotos mas elas não estão no texto Markdown, anexa no final
    attachedFiles.forEach((file, idx) => {
      const fileDataUrl = `data:${file.type};base64,${file.base64}`
      if (!finalConteudo.includes(fileDataUrl) && !finalConteudo.includes(file.base64.slice(0, 40))) {
        finalConteudo += `\n\n![Passo ${idx + 1}: ${file.name}](${fileDataUrl})`
      }
    })

    setIsSubmitting(true)
    try {
      if (mode === 'edit' && initialData?.id) {
        await updateProcedure(initialData.id, {
          processo: processo.trim(),
          subtipo: subtipo.trim(),
          materiais: materiais.trim(),
          setor,
          sistema: sistema.trim(),
          conteudo: finalConteudo,
          images: attachedFiles.map(f => ({ name: f.name, base64: f.base64, type: f.type }))
        }, authorInfo)
        onSaveSuccess({
          id: initialData.id,
          processo: processo.trim(),
          subtipo: subtipo.trim(),
          materiais: materiais.trim(),
          setor,
          sistema: sistema.trim(),
          conteudo: finalConteudo,
          images: attachedFiles.map(f => ({ name: f.name, base64: f.base64, type: f.type }))
        }, 'updated')
      } else {
        const created = await saveProcedure({
          processo: processo.trim(),
          subtipo: subtipo.trim(),
          materiais: materiais.trim(),
          setor,
          sistema: sistema.trim(),
          conteudo: finalConteudo,
          images: attachedFiles.map(f => ({ name: f.name, base64: f.base64, type: f.type }))
        }, authorInfo)
        onSaveSuccess(created, 'created')
      }
      onClose()
    } catch (err: any) {
      console.error(err)
      setError('Erro ao salvar procedimento. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
          
          {/* Header */}
          <div className={`p-5 text-white flex items-center justify-between ${
            mode === 'delete' ? 'bg-rose-900' : 'bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl text-white ${
                mode === 'delete' ? 'bg-rose-700' : 'bg-blue-600'
              }`}>
                {mode === 'delete' ? <Trash2 size={20} /> : <BookOpen size={20} />}
              </div>
              <div>
                <h3 className="font-bold text-base leading-tight">
                  {mode === 'create' && 'Adicionar Procedimento com Fotos'}
                  {mode === 'edit' && 'Editar Procedimento e Fotos'}
                  {mode === 'delete' && 'Excluir Procedimento'}
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  {mode === 'delete' 
                    ? 'Tem certeza de que deseja remover este procedimento?' 
                    : 'A IA usará os textos e fotos para guiar os colaboradores no chat'}
                </p>
              </div>
            </div>
            <button 
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content Body */}
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1 text-slate-800">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            {mode === 'delete' ? (
              <div className="space-y-3 py-2">
                <p className="text-sm text-slate-700">
                  O procedimento <strong>"{initialData?.processo || processo}"</strong> será removido e não será mais exibido nas respostas do chat.
                </p>
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500">
                  <strong>Setor:</strong> {setor} | <strong>Sistema:</strong> {sistema}
                </div>
              </div>
            ) : (
              <>
                {/* Título */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Título do Procedimento / Cirurgia *
                  </label>
                  <input 
                    type="text"
                    value={processo}
                    onChange={(e) => setProcesso(e.target.value)}
                    placeholder="Ex: Cirurgia de Joelho / Emitindo Relatório de Pendências"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 outline-none focus:bg-white focus:border-[#1a2332] focus:ring-1 focus:ring-[#1a2332] transition-all"
                  />
                </div>

                {/* Subtipo de Cirurgia / Procedimento */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Subtipo de Cirurgia / Procedimento
                  </label>
                  <input 
                    type="text"
                    value={subtipo}
                    onChange={(e) => setSubtipo(e.target.value)}
                    placeholder="Ex: Artroplastia Total de Joelho (ATJ), Fixação Pedicular 2 Níveis, etc."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 outline-none focus:bg-white focus:border-[#1a2332] focus:ring-1 focus:ring-[#1a2332] transition-all"
                  />
                </div>

                {/* Materiais OPME / Solicitados pelo Médico */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Materiais OPME / Solicitados pelo Médico
                  </label>
                  <textarea 
                    rows={2}
                    value={materiais}
                    onChange={(e) => setMateriais(e.target.value)}
                    placeholder="Ex: Prótese de Joelho, Cimento ósseo com antibiótico, Parafuso Pedicular 6.5x45mm, Haste Titânio 5.5mm, Cage PEEK"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 outline-none focus:bg-white focus:border-[#1a2332] focus:ring-1 focus:ring-[#1a2332] transition-all resize-y"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    💡 Ao cadastrar os materiais, o chat identificará automaticamente o subtipo de cirurgia quando os colaboradores pesquisarem pelos materiais solicitados pelo médico.
                  </p>
                </div>

                {/* Setor & Sistema */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Setor de Aplicação *
                    </label>
                    <select 
                      value={setor}
                      onChange={(e) => setSetor(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 outline-none focus:bg-white focus:border-[#1a2332] transition-all cursor-pointer"
                    >
                      {SETORES_DISPONIVEIS.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Sistema *
                    </label>
                    <input 
                      type="text"
                      value={sistema}
                      onChange={(e) => setSistema(e.target.value)}
                      placeholder="Ex: Emultec, Protheus, Web"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 outline-none focus:bg-white focus:border-[#1a2332] transition-all"
                    />
                  </div>
                </div>

                {/* Upload de Múltiplas Fotos Passo a Passo */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <ImageIcon size={15} className="text-blue-600" />
                        Fotos do Passo a Passo (Várias Imagens / Prints)
                      </span>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Selecione as fotos na ordem das etapas. A IA as vinculará automaticamente a cada passo.
                      </p>
                    </div>
                    {attachedFiles.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setAttachedFiles([])}
                        className="text-[11px] text-rose-600 hover:underline font-semibold"
                      >
                        Limpar todas ({attachedFiles.length})
                      </button>
                    )}
                  </div>

                  {/* Botão de Upload & IA */}
                  <div className="flex items-center gap-2">
                    <label className="flex-1 border border-dashed border-slate-300 hover:border-blue-500 bg-white rounded-xl p-3 text-center cursor-pointer transition-colors group flex items-center justify-center gap-2">
                      <input 
                        type="file" 
                        accept="image/*,application/pdf" 
                        multiple
                        onChange={handleFileUpload}
                        className="hidden" 
                      />
                      <Plus size={16} className="text-blue-600 group-hover:scale-110 transition-transform" />
                      <span className="text-xs text-slate-700 font-medium">
                        Adicionar Fotos / Prints (Você pode selecionar várias)
                      </span>
                    </label>

                    <button
                      type="button"
                      onClick={handleStructureWithAI}
                      disabled={isAiProcessing || (attachedFiles.length === 0 && !conteudo.trim())}
                      className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                      title="A IA lê as fotos anexadas e gera os passos já vinculados às fotos"
                    >
                      {isAiProcessing ? (
                        <>
                          <Loader2 size={15} className="animate-spin" />
                          <span>IA Analisando...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={15} />
                          <span>IA Estruturar com Fotos</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Grid de Fotos Anexadas */}
                  {attachedFiles.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                      {attachedFiles.map((file, idx) => (
                        <div 
                          key={file.id} 
                          className="group relative bg-white border border-slate-200 rounded-xl p-2 shadow-2xs flex flex-col gap-1.5 overflow-hidden"
                        >
                          <div className="relative aspect-video bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center border border-slate-100">
                            {file.type === 'application/pdf' ? (
                              <FileText size={24} className="text-rose-500" />
                            ) : (
                              <img 
                                src={file.previewUrl} 
                                alt={file.name} 
                                className="w-full h-full object-cover" 
                              />
                            )}
                            <div className="absolute top-1 left-1 bg-slate-900/80 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                              #{idx + 1}
                            </div>
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => setPreviewModalImg({ name: file.name, url: file.previewUrl })}
                                className="p-1.5 bg-white/90 text-slate-800 hover:bg-white rounded-lg text-xs"
                                title="Visualizar imagem cheia"
                              >
                                <Eye size={13} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleInsertImageIntoContent(file)}
                                className="p-1.5 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-xs"
                                title="Inserir no texto do passo a passo"
                              >
                                <ArrowUpRight size={13} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveFile(file.id)}
                                className="p-1.5 bg-rose-600 text-white hover:bg-rose-700 rounded-lg text-xs"
                                title="Remover foto"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-slate-700 truncate block max-w-[120px]" title={file.name}>
                              {file.name}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleInsertImageIntoContent(file)}
                              className="text-[10px] text-blue-600 font-bold hover:underline"
                            >
                              + Inserir
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Conteúdo / Passos */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span>Passo a Passo / Conteúdo do Procedimento *</span>
                    <span className="text-[10px] text-slate-400 font-normal lowercase">Imagens embutidas: ![Nome](data:image/...)</span>
                  </label>
                  <textarea 
                    rows={8}
                    value={conteudo}
                    onChange={(e) => setConteudo(e.target.value)}
                    placeholder={"1. Acesse o sistema: Abra o Emultec.\n![Passo 1](...)\n2. Navegue até o menu: Vá para Movimento > Comercial.\n3. Clique em Relatório."}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 outline-none focus:bg-white focus:border-[#1a2332] leading-relaxed transition-all"
                  />
                </div>
              </>
            )}

            {/* Footer Submit */}
            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isAiProcessing}
                className={`px-5 py-2 text-xs font-bold rounded-xl text-white flex items-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-50 ${
                  mode === 'delete' 
                    ? 'bg-rose-600 hover:bg-rose-700' 
                    : 'bg-[#1a2332] hover:bg-[#253043]'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Salvando...</span>
                  </>
                ) : mode === 'delete' ? (
                  <>
                    <Trash2 size={14} />
                    <span>Confirmar Exclusão</span>
                  </>
                ) : (
                  <>
                    <Check size={14} />
                    <span>Salvar Procedimento</span>
                  </>
                )}
              </button>
            </div>

          </form>

        </div>
      </div>

      {/* Mini Lightbox para foto clicada dentro do modal */}
      {previewModalImg && (
        <div 
          className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs"
          onClick={() => setPreviewModalImg(null)}
        >
          <div className="max-w-3xl max-h-[85vh] bg-white rounded-2xl overflow-hidden flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-3 bg-slate-900 text-white flex items-center justify-between text-xs font-semibold">
              <span>{previewModalImg.name}</span>
              <button onClick={() => setPreviewModalImg(null)} className="hover:text-slate-300"><X size={18} /></button>
            </div>
            <div className="p-2 overflow-auto max-h-[75vh] flex items-center justify-center bg-slate-950">
              <img src={previewModalImg.url} alt={previewModalImg.name} className="max-w-full max-h-[70vh] object-contain rounded-lg" />
            </div>
          </div>
        </div>
      )}
    </>
  )
}

