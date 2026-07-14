import React, { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { X, Upload, AlertTriangle, Send, Loader2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'

interface GopCreateModalProps {
  onClose: () => void;
  onSuccess: () => void;
  userSector?: string;
}

export const GopCreateModal: React.FC<GopCreateModalProps> = ({ onClose, onSuccess, userSector }) => {
  const [setor, setSetor] = useState(userSector || '')
  const [responsavel, setResponsavel] = useState('')
  const [dataOcorrencia, setDataOcorrencia] = useState('')
  const [dataRegistro, setDataRegistro] = useState(new Date().toISOString().split('T')[0])
  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [consequencias, setConsequencias] = useState('')
  const [causa, setCausa] = useState('')
  const [arquivos, setArquivos] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setArquivos(prev => [...prev, ...Array.from(e.target.files!)])
    }
  }

  const handleSubmit = async () => {
    if (!setor || !responsavel || !nome || !descricao) {
      alert("Por favor, preencha os campos básicos do relato (Setor, Responsável, Nome da Não Conformidade e Descrição) antes de enviar.")
      return
    }

    setIsSubmitting(true)

    // 1. Upload dos arquivos para o Bucket 'evidencias'
    const evidenciasUrls = []
    if (arquivos.length > 0) {
      for (const file of arquivos) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('evidencias')
          .upload(fileName, file)
          
        if (uploadError) {
          console.error("Erro no upload do arquivo:", file.name, uploadError)
          alert(`Erro ao fazer upload da evidência: ${uploadError.message}. Verifique se o Bucket 'evidencias' existe no Supabase Storage.`)
        } else if (uploadData) {
          const { data: publicUrlData } = supabase.storage
            .from('evidencias')
            .getPublicUrl(fileName)
            
          evidenciasUrls.push({
            name: file.name,
            type: file.type,
            url: publicUrlData.publicUrl
          })
        }
      }
    }

    // 2. Inserir no banco de dados com a nova coluna de evidências
    const { error } = await supabase.from('gargalos').insert({
      setor,
      autor_nome: responsavel,
      data_ocorrencia: dataOcorrencia || null,
      data_registro: dataRegistro,
      titulo: nome,
      descricao,
      consequencias,
      causa_provavel: causa,
      sugestao_lider: '',
      status: 'Não Iniciado',
      urgencia: 'Média',
      frequencia: 'Ocasional',
      impacto: [],
      evidencias: evidenciasUrls
    })
    setIsSubmitting(false)

    if (error) {
      alert(`Ocorreu um erro ao registrar a não conformidade: ${error.message || JSON.stringify(error)}`)
      console.error(error)
    } else {
      alert('Não conformidade reportada com sucesso!')
      onSuccess()
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#0b0f19]/60 backdrop-blur-sm flex justify-center items-center p-0 md:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white w-full max-w-4xl h-full md:h-[90vh] md:rounded-2xl shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 md:px-8 py-4 md:py-5 border-b border-slate-100 bg-white shrink-0">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Novo Relato</span>
            <h2 className="text-2xl font-extrabold text-[#1a2332]">Registro de Não Conformidade Operacional</h2>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          <div className="max-w-3xl mx-auto space-y-10">
            
            {/* 1. Informações Gerais */}
            <section>
              <h3 className="flex items-center gap-3 text-[#1a2332] text-base font-bold mb-4">
                <span className="w-7 h-7 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center text-sm">1</span>
                Informações Gerais
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-bold text-[#1a2332]">Setor *</label>
                  <input 
                    type="text" 
                    value={setor} 
                    readOnly={!!userSector}
                    onChange={e => !userSector && setSetor(e.target.value)}
                    placeholder="Ex: Comercial, T.I..."
                    className={`w-full border border-slate-200 rounded-xl px-4 py-3 text-[15px] outline-none text-slate-700 ${userSector ? 'bg-slate-100 cursor-not-allowed' : 'focus:border-blue-500 focus:ring-1 focus:ring-blue-500'}`}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-bold text-[#1a2332]">Responsável</label>
                  <input 
                    type="text" 
                    value={responsavel} 
                    onChange={e => setResponsavel(e.target.value)}
                    placeholder="Nome do responsável"
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-[15px] outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-700"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-bold text-[#1a2332]">Data de Ocorrência</label>
                  <input 
                    type="date" 
                    value={dataOcorrencia} 
                    onChange={e => setDataOcorrencia(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-[15px] outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-700"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-bold text-[#1a2332]">Data de Registro</label>
                  <input 
                    type="date" 
                    value={dataRegistro} 
                    onChange={e => setDataRegistro(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-[15px] outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-700"
                  />
                </div>
              </div>
            </section>

            <hr className="border-slate-100" />

            {/* 2. O Problema */}
            <section>
              <h3 className="flex items-center gap-3 text-[#1a2332] text-base font-bold mb-4">
                <span className="w-7 h-7 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center text-sm">2</span>
                O Problema
              </h3>
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-bold text-[#1a2332]">Nome da Não Conformidade</label>
                  <input 
                    type="text" 
                    value={nome} 
                    onChange={e => setNome(e.target.value)}
                    placeholder="Ex.: Atraso na aprovação de pedidos de compra"
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-[15px] outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-700"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-bold text-[#1a2332]">Descrição do Problema</label>
                  <textarea 
                    value={descricao} 
                    onChange={e => setDescricao(e.target.value)}
                    placeholder="Descreva o que acontece, onde e quem é afetado..."
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-[15px] outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 min-h-[100px] resize-none text-slate-700"
                  />
                </div>
              </div>
            </section>

            <hr className="border-slate-100" />

            {/* 3. Evidências */}
            <section>
              <h3 className="flex items-center gap-3 text-[#1a2332] text-base font-bold mb-4">
                <span className="w-7 h-7 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center text-sm">3</span>
                Evidências <span className="text-red-500">*</span>
              </h3>
              <div className="bg-red-50/50 border border-red-200 text-red-600 px-4 py-4 rounded-xl text-sm font-medium flex items-center gap-2 mb-4">
                <AlertTriangle size={18} />
                Sem evidências, o problema não será priorizado.
              </div>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 hover:bg-slate-50 hover:border-blue-300 transition-colors p-10 flex flex-col items-center justify-center text-center cursor-pointer group"
              >
                <input 
                  type="file" 
                  multiple 
                  className="hidden" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                />
                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Upload size={28} />
                </div>
                {arquivos.length > 0 ? (
                  <div className="flex flex-col items-center gap-1">
                    <p className="text-green-600 font-bold text-base mb-1">
                      {arquivos.length} {arquivos.length === 1 ? 'arquivo anexado' : 'arquivos anexados'} com sucesso!
                    </p>
                    <p className="text-slate-500 text-sm font-medium line-clamp-2 px-4">
                      {arquivos.map(f => f.name).join(', ')}
                    </p>
                    <p className="text-blue-600 text-xs mt-2 font-bold hover:underline">Clique para adicionar mais</p>
                  </div>
                ) : (
                  <>
                    <p className="text-[#1a2332] font-bold text-base mb-1.5">Arraste arquivos aqui ou <span className="text-blue-600">clique para selecionar</span></p>
                    <p className="text-slate-400 text-sm font-medium">PNG, JPG, PDF - prints, planilhas e documentos</p>
                  </>
                )}
              </div>
            </section>



          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-4 shrink-0">
          <button onClick={onClose} className="px-6 py-3 text-[15px] font-bold text-slate-600 hover:bg-slate-200 bg-white border border-slate-200 rounded-xl transition-colors">
            Cancelar
          </button>
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-8 py-3 text-[15px] font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed rounded-xl flex items-center gap-2.5 transition-colors shadow-lg shadow-blue-600/20"
          >
            {isSubmitting ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Send size={18} />
            )}
            {isSubmitting ? 'Enviando...' : 'Enviar Relato'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
