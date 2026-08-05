import React, { useEffect, useState, useRef } from 'react'
import { ChevronLeft, File, FileText, Image as ImageIcon, Calendar, Loader2, Trash2, Edit, Save, X, Paperclip, Plus } from 'lucide-react'
import { supabase } from '../../lib/supabase'

export const GopDetail = ({ id, onBack, userRole, onPreviewFile }: { id: string, onBack: () => void, userRole: string, onPreviewFile?: (file: any) => void }) => {
  const [gargalo, setGargalo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Tratativa form state
  const [decisao, setDecisao] = useState('')
  const [responsavel, setResponsavel] = useState('')
  const [prazo, setPrazo] = useState('')
  const [indicador, setIndicador] = useState('')
  const [revisao, setRevisao] = useState('')
  const [status, setStatus] = useState('')
  const [urgencia, setUrgencia] = useState('')
  const [impactos, setImpactos] = useState<string[]>([])
  const [tratativaAutorBadge, setTratativaAutorBadge] = useState('')

  // Edição do Relato da Não Conformidade
  const [isEditingReport, setIsEditingReport] = useState(false)
  const [editTitulo, setEditTitulo] = useState('')
  const [editSetor, setEditSetor] = useState('')
  const [editDescricao, setEditDescricao] = useState('')
  const [editUrgencia, setEditUrgencia] = useState('')

  // Anexo de novas evidências
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadingEvidence, setUploadingEvidence] = useState(false)

  const handleImpactoToggle = (val: string) => {
    if (userRole !== 'coo') return;
    setImpactos(prev => prev.includes(val) ? prev.filter(i => i !== val) : [...prev, val])
  }

  useEffect(() => {
    fetchGargalo()
  }, [id])

  const fetchGargalo = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('gargalos')
      .select('*')
      .eq('id', id)
      .single()
    if (data) {
      setGargalo(data)
      setDecisao(data.tratativa_decisao || '')
      setResponsavel(data.tratativa_responsavel || '')
      setPrazo(data.tratativa_prazo || '')
      setIndicador(data.tratativa_indicador || '')
      setRevisao(data.tratativa_revisao || '')
      setStatus(data.status || '')
      setUrgencia(data.urgencia || '')
      setImpactos(data.impacto || [])
      const defaultBadge = (data.tratativa_decisao || data.status === 'Resolvido' || data.status === 'Em Andamento') 
        ? 'Respondido pelo Gestor de Operações' 
        : ''
      setTratativaAutorBadge(data.tratativa_autor_badge || defaultBadge)

      setEditTitulo(data.titulo || '')
      setEditSetor(data.setor || '')
      setEditDescricao(data.descricao || '')
      setEditUrgencia(data.urgencia || 'Média')
    } else {
      console.error('Erro ao buscar gargalo:', error)
    }
    setLoading(false)
  }

  const handleUploadNewEvidence = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    setUploadingEvidence(true)

    const newFiles = Array.from(e.target.files)
    const uploadedEvidencias: any[] = []

    for (const file of newFiles) {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('evidencias')
        .upload(fileName, file)

      if (uploadData) {
        const { data: publicUrlData } = supabase.storage
          .from('evidencias')
          .getPublicUrl(fileName)

        uploadedEvidencias.push({
          name: file.name,
          type: file.type,
          url: publicUrlData.publicUrl
        })
      } else {
        // Fallback Base64 data URL
        const base64Url = await new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result as string)
          reader.readAsDataURL(file)
        })

        uploadedEvidencias.push({
          name: file.name,
          type: file.type,
          url: base64Url
        })
      }
    }

    const existingEvidencias = gargalo.evidencias || []
    const combined = [...existingEvidencias, ...uploadedEvidencias]

    const { error } = await supabase
      .from('gargalos')
      .update({ evidencias: combined, updated_at: new Date().toISOString() })
      .eq('id', id)

    setUploadingEvidence(false)
    if (!error) {
      alert('Nova(s) evidência(s) anexada(s) com sucesso!')
      setGargalo((prev: any) => ({ ...prev, evidencias: combined }))
    } else {
      alert('Erro ao salvar nova evidência.')
      console.error(error)
    }
  }

  const handleSaveReportEdit = async () => {
    setSaving(true)
    const { error } = await supabase
      .from('gargalos')
      .update({
        titulo: editTitulo,
        setor: editSetor,
        descricao: editDescricao,
        urgencia: editUrgencia,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    setSaving(false)
    if (!error) {
      alert('Não conformidade atualizada com sucesso!')
      setGargalo((prev: any) => ({
        ...prev,
        titulo: editTitulo,
        setor: editSetor,
        descricao: editDescricao,
        urgencia: editUrgencia
      }))
      setIsEditingReport(false)
    } else {
      alert('Erro ao atualizar não conformidade.')
      console.error(error)
    }
  }

  const handleSave = async () => {
    setSaving(true)

    const userSector = localStorage.getItem('userSector') || ''
    const sectorLower = userSector.toLowerCase()

    let badgeText = ''
    if (sectorLower.includes('qualidade')) {
      badgeText = 'Respondido pelo Gestor de Qualidade / RT'
    } else if (sectorLower.includes('operac') || sectorLower.includes('operaç') || sectorLower.includes('estoque') || sectorLower.includes('logistica')) {
      badgeText = 'Respondido pelo Gestor de Operações'
    } else if (userSector === 'Gestor/Diretoria') {
      badgeText = 'Respondido pelo Gestor de Operações'
    } else if (userSector) {
      badgeText = `Respondido pelo Gestor (${userSector})`
    } else {
      badgeText = 'Respondido pelo Gestor de Operações'
    }

    const { error } = await supabase
      .from('gargalos')
      .update({
        tratativa_decisao: decisao,
        tratativa_responsavel: responsavel,
        tratativa_prazo: prazo,
        tratativa_indicador: indicador,
        tratativa_revisao: revisao,
        tratativa_autor_badge: badgeText,
        status: status,
        urgencia: urgencia,
        impacto: impactos,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    setSaving(false)
    if (!error) {
      setTratativaAutorBadge(badgeText)
      alert('Tratativa salva com sucesso!')
      onBack()
    } else {
      alert('Erro ao salvar tratativa.')
      console.error(error)
    }
  }

const handleDelete = async () => {
  if (window.confirm('Tem certeza que deseja excluir esta não conformidade? Esta ação não pode ser desfeita.')) {
    setLoading(true)
    const { error } = await supabase.from('gargalos').delete().eq('id', id)
    if (error) {
      alert('Erro ao excluir não conformidade.')
      console.error(error)
      setLoading(false)
    } else {
      alert('Não conformidade excluída com sucesso!')
      onBack()
    }
  }
}

if (loading || !gargalo) {
  return (
    <div className="w-full flex flex-col items-center justify-center p-20 text-slate-400">
      <Loader2 className="w-10 h-10 animate-spin mb-4 text-blue-500" />
      <span className="text-sm font-bold">Carregando detalhes da não conformidade...</span>
    </div>
  )
}

const formatDate = (dateString: string) => {
  const d = new Date(dateString)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).replace('.', '')
}

return (
  <div className="w-full max-w-[1200px] mx-auto p-4 md:p-8 flex flex-col gap-6">
    <div className="flex flex-col md:flex-row md:items-center justify-between mb-2 gap-4">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold text-sm transition-colors cursor-pointer"
      >
        <ChevronLeft size={16} strokeWidth={3} /> Voltar para a fila
      </button>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setIsEditingReport(!isEditingReport)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-1.5 rounded-lg font-bold text-sm transition-colors cursor-pointer"
        >
          {isEditingReport ? <X size={16} strokeWidth={2.5} /> : <Edit size={16} strokeWidth={2.5} />}
          <span>{isEditingReport ? 'Cancelar Edição' : 'Editar Não Conformidade'}</span>
        </button>

        <button
          type="button"
          onClick={handleDelete}
          className="flex items-center gap-2 text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg font-bold text-sm transition-colors cursor-pointer"
        >
          <Trash2 size={16} strokeWidth={2.5} /> Excluir
        </button>
      </div>
    </div>

    <div className="flex flex-col xl:grid xl:grid-cols-[1fr_450px] gap-8 items-start">
      {/* Left Column: Details or Edit Form */}
      <div className="bg-white rounded-[1.5rem] p-5 md:p-8 border border-slate-100 shadow-sm flex flex-col gap-6 w-full">
        {isEditingReport ? (
          /* Formulário de Edição da Não Conformidade */
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-[#14161f]">Editar Registro de Não Conformidade</h2>
              <span className="eyebrow bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md border border-blue-200">Modo de Edição</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="eyebrow block mb-1.5">Título da Não Conformidade *</label>
                <input
                  type="text"
                  value={editTitulo}
                  onChange={(e) => setEditTitulo(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 outline-none focus:bg-white focus:border-[#1f29de]"
                />
              </div>

              <div>
                <label className="eyebrow block mb-1.5">Setor Envolvido *</label>
                <input
                  type="text"
                  value={editSetor}
                  onChange={(e) => setEditSetor(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 outline-none focus:bg-white focus:border-[#1f29de]"
                />
              </div>
            </div>

            <div>
              <label className="eyebrow block mb-1.5">Nível de Urgência *</label>
              <select
                value={editUrgencia}
                onChange={(e) => setEditUrgencia(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 outline-none focus:bg-white focus:border-[#1f29de]"
              >
                <option value="Baixa">Baixa</option>
                <option value="Média">Média</option>
                <option value="Alta">Alta</option>
              </select>
            </div>

            <div>
              <label className="eyebrow block mb-1.5">Descrição do Problema *</label>
              <textarea
                rows={5}
                value={editDescricao}
                onChange={(e) => setEditDescricao(e.target.value)}
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 outline-none focus:bg-white focus:border-[#1f29de] resize-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsEditingReport(false)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveReportEdit}
                disabled={saving}
                className="px-5 py-2.5 bg-[#1f29de] hover:bg-[#12345b] text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                <span>Salvar Alterações</span>
              </button>
            </div>
          </div>
        ) : (
          /* Modo de Visualização do Relato */
          <>
            <div className="flex flex-col gap-4 mb-2">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Relato do Líder</span>
              </div>
              <div className="flex items-center gap-2">
                {gargalo.urgencia && (
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-[0.4rem] text-[11px] font-bold uppercase tracking-wider
                        ${gargalo.urgencia === 'Alta' ? 'bg-red-50 text-red-600' :
                      gargalo.urgencia === 'Média' ? 'bg-amber-50 text-amber-600' :
                        'bg-green-50 text-green-600'}`}>
                    {gargalo.urgencia}
                  </span>
                )}
                <span className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[12px] font-bold
                      ${gargalo.status === 'Em Andamento' ? 'bg-blue-50 text-blue-600' :
                    gargalo.status === 'Não Iniciado' ? 'bg-red-50 text-red-600' :
                      gargalo.status === 'Resolvido' ? 'bg-green-50 text-green-600' :
                        'bg-slate-100 text-slate-500'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${gargalo.status === 'Em Andamento' ? 'bg-blue-500' :
                      gargalo.status === 'Não Iniciado' ? 'bg-red-500' :
                        gargalo.status === 'Resolvido' ? 'bg-green-500' : 'bg-slate-400'
                    }`}></div>
                  {gargalo.status}
                </span>
              </div>
              <h1 className="text-2xl font-extrabold text-[#1a2332] tracking-tight leading-tight mt-1">{gargalo.titulo}</h1>
              <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8 mt-2">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Setor</span>
                  <span className="text-sm font-bold text-[#1a2332]">{gargalo.setor}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Responsável</span>
                  <span className="text-sm font-bold text-[#1a2332]">{gargalo.autor_nome}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Registro</span>
                  <span className="text-sm font-bold text-[#1a2332]">{formatDate(gargalo.data_registro)}</span>
                </div>
              </div>
            </div>

            <div className="h-px bg-slate-100 w-full"></div>

            <div className="flex flex-col gap-2">
              <h3 className="font-bold text-[#1a2332] text-[15px]">Descrição do Problema</h3>
              <p className="text-slate-600 text-[15px] leading-relaxed break-words">{gargalo.descricao}</p>
            </div>

            {gargalo.consequencias && (
              <div className="flex flex-col gap-2 mt-2">
                <h3 className="font-bold text-[#1a2332] text-[15px]">Consequências</h3>
                <p className="text-slate-600 text-[15px] leading-relaxed">{gargalo.consequencias}</p>
              </div>
            )}

            {gargalo.causa_provavel && (
              <div className="flex flex-col gap-2 mt-2">
                <h3 className="font-bold text-[#1a2332] text-[15px]">Causa Provável</h3>
                <p className="text-slate-600 text-[15px] leading-relaxed">{gargalo.causa_provavel}</p>
              </div>
            )}

            {gargalo.sugestao_lider && (
              <div className="flex flex-col gap-2 mt-2">
                <h3 className="font-bold text-[#1a2332] text-[15px]">Sugestão do Líder</h3>
                <div className="bg-amber-50/50 border border-amber-200/60 rounded-xl p-5">
                  <p className="text-amber-800 text-[15px] leading-relaxed font-medium">{gargalo.sugestao_lider}</p>
                </div>
              </div>
            )}
          </>
        )}

        <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-[#1a2332] text-[15px] flex items-center gap-2">
              <span>Evidências Anexadas</span>
              {gargalo.evidencias?.length > 0 && (
                <span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full font-extrabold">
                  {gargalo.evidencias.length}
                </span>
              )}
            </h3>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingEvidence}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs disabled:opacity-50"
            >
              {uploadingEvidence ? <Loader2 size={14} className="animate-spin" /> : <Paperclip size={14} />}
              <span>{uploadingEvidence ? 'Anexando...' : '+ Anexar Evidência'}</span>
            </button>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleUploadNewEvidence}
              multiple
              className="hidden"
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-1">
            {gargalo.evidencias && gargalo.evidencias.length > 0 ? (
              gargalo.evidencias.map((ev: any, idx: number) => (
                <div
                  key={idx}
                  onClick={() => {
                    if (onPreviewFile) {
                      onPreviewFile({
                        name: ev.name,
                        type: ev.type,
                        url: ev.url,
                        base64: '' // Not needed if we have url, but kept for type compat
                      })
                    }
                  }}
                  className="bg-slate-50 border border-slate-200 text-slate-700 rounded-xl flex flex-col items-center justify-center p-6 gap-3 cursor-pointer hover:bg-slate-100 hover:border-slate-300 transition-colors shadow-sm"
                >
                  {ev.type.includes('image') ? (
                    <ImageIcon size={24} className="text-blue-500" strokeWidth={2} />
                  ) : (
                    <FileText size={24} className="text-red-500" strokeWidth={2} />
                  )}
                  <span className="text-[11px] font-bold truncate w-full text-center">{ev.name}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400 font-medium italic col-span-3">Nenhuma evidência anexada.</p>
            )}
          </div>
        </div>
      </div>

      {/* Right Column: COO Form */}
      <div className="bg-white rounded-[1.5rem] p-5 md:p-6 border border-indigo-100 shadow-xl shadow-indigo-500/5 flex flex-col relative overflow-hidden w-full">
        <div className="absolute top-0 left-0 w-full h-1 bg-indigo-600"></div>

        <div className="flex items-center gap-3 mb-6 bg-indigo-50/50 -mx-6 -mt-6 p-6 border-b border-indigo-50">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm">
            <FileText size={20} strokeWidth={2} />
          </div>
          <div className="flex flex-col">
            <h2 className="text-lg font-bold text-indigo-950 leading-tight">Tratativa pós-reunião</h2>
            <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-widest mt-0.5">Preenchimento exclusivo do COO</span>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2 mt-1">
            <label className="text-[13px] font-bold text-slate-700">Impacto <span className="font-normal text-slate-400 ml-1">(selecione todos aplicáveis)</span></label>
            <div className="flex flex-wrap gap-2">
              {['Financeiro', 'Operacional', 'Cliente', 'Estoque', 'Compras', 'Comercial'].map(i => (
                <label key={i} className={`px-3 py-2 border rounded-lg text-[13px] font-semibold transition-colors flex items-center gap-2 ${userRole !== 'coo' ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'} ${impactos.includes(i) ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                  <input type="checkbox" checked={impactos.includes(i)} onChange={() => handleImpactoToggle(i)} className="hidden" disabled={userRole !== 'coo'} />
                  <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${impactos.includes(i) ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-slate-300 bg-white'}`}>
                    {impactos.includes(i) && <span className="text-[10px]">✓</span>}
                  </div>
                  {i}
                </label>
              ))}
            </div>
          </div>


          <div className="flex flex-col gap-2 mt-1">
            <label className="text-[13px] font-bold text-slate-700">Urgência</label>
            <div className="flex gap-4">
              {['Alta', 'Média', 'Baixa'].map(u => (
                <label key={u} className={`flex-1 text-center py-2.5 border rounded-xl text-[13px] font-bold transition-colors ${userRole !== 'coo' ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'} ${urgencia === u ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                  <input type="radio" name="urgencia" value={u} checked={urgencia === u} onChange={() => setUrgencia(u)} className="hidden" disabled={userRole !== 'coo'} />
                  {u}
                </label>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-bold text-slate-700">Decisão Tomada</label>
            <textarea
              value={decisao}
              onChange={(e) => setDecisao(e.target.value)}
              disabled={userRole !== 'coo'}
              className="w-full border border-slate-200 rounded-xl p-4 text-sm min-h-[120px] focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none placeholder:text-slate-400 font-medium text-slate-700 disabled:bg-slate-50 disabled:text-slate-500"
              placeholder="Descreva a decisão definida na reunião..."
            ></textarea>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-bold text-slate-700">Responsável pela Ação <span className="text-slate-400 font-normal">(Opcional)</span></label>
              <input
                type="text"
                value={responsavel}
                onChange={(e) => setResponsavel(e.target.value)}
                disabled={userRole !== 'coo'}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder:text-slate-400 font-medium text-slate-700 disabled:bg-slate-50 disabled:text-slate-500"
                placeholder="Nome do responsável"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-bold text-slate-700">Prazo</label>
              <div className="relative">
                <input
                  type="text"
                  value={prazo}
                  onChange={(e) => setPrazo(e.target.value)}
                  disabled={userRole !== 'coo'}
                  className="w-full border border-slate-200 rounded-xl pl-4 pr-10 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder:text-slate-400 font-medium text-slate-700 disabled:bg-slate-50 disabled:text-slate-500"
                  placeholder="dd/mm/aaaa"
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-bold text-slate-700">Data de Revisão</label>
              <div className="relative">
                <input
                  type="text"
                  value={revisao}
                  onChange={(e) => setRevisao(e.target.value)}
                  disabled={userRole !== 'coo'}
                  className="w-full border border-slate-200 rounded-xl pl-4 pr-10 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder:text-slate-400 font-medium text-slate-700 disabled:bg-slate-50 disabled:text-slate-500"
                  placeholder="dd/mm/aaaa"
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 mt-2">
            <label className="text-[13px] font-bold text-slate-700">Status Atualizado</label>
            <div className="grid grid-cols-3 gap-3">
              <label className={`flex items-center justify-center gap-2 border rounded-xl py-3 cursor-pointer transition-colors ${status === 'Resolvido' ? 'border-green-500 bg-green-50/50' : 'border-slate-200 hover:bg-slate-50'} ${userRole !== 'coo' ? 'opacity-70 pointer-events-none' : ''}`}>
                <input type="radio" name="status" value="Resolvido" checked={status === 'Resolvido'} onChange={(e) => setStatus(e.target.value)} className="hidden" />
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className={`text-[13px] font-bold ${status === 'Resolvido' ? 'text-green-700' : 'text-slate-600'}`}>Resolvido</span>
              </label>
              <label className={`flex items-center justify-center gap-2 border rounded-xl py-3 cursor-pointer transition-colors ${status === 'Em Andamento' ? 'border-blue-500 bg-blue-50/50' : 'border-slate-200 hover:bg-slate-50'} ${userRole !== 'coo' ? 'opacity-70 pointer-events-none' : ''}`}>
                <input type="radio" name="status" value="Em Andamento" checked={status === 'Em Andamento'} onChange={(e) => setStatus(e.target.value)} className="hidden" />
                <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                <span className={`text-[13px] font-bold ${status === 'Em Andamento' ? 'text-blue-700' : 'text-slate-600'}`}>Em Andamento</span>
              </label>
              <label className={`flex items-center justify-center gap-2 border rounded-xl py-3 cursor-pointer transition-colors ${status === 'Não Iniciado' ? 'border-red-500 bg-red-50/50' : 'border-slate-200 hover:bg-slate-50'} ${userRole !== 'coo' ? 'opacity-70 pointer-events-none' : ''}`}>
                <input type="radio" name="status" value="Não Iniciado" checked={status === 'Não Iniciado'} onChange={(e) => setStatus(e.target.value)} className="hidden" />
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <span className={`text-[13px] font-bold ${status === 'Não Iniciado' ? 'text-red-700' : 'text-slate-600'}`}>Não Iniciado</span>
              </label>
            </div>
          </div>

          {userRole === 'coo' && (
            <div className="grid grid-cols-[1fr_2fr] gap-3 mt-4 pt-6 border-t border-slate-100">
              <button onClick={onBack} className="py-4 border border-slate-200 rounded-xl text-[13px] font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer">
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[13px] font-bold shadow-lg shadow-indigo-600/20 transition-all cursor-pointer flex justify-center items-center gap-2 disabled:opacity-70"
              >
                {saving && <Loader2 size={16} className="animate-spin" />}
                Salvar Tratativa e Atualizar Status
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
)
}
