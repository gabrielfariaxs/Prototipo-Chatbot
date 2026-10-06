import React from 'react'
import { ArrowLeft, Bot, Stethoscope, History, Plus, Volume2, VolumeX, BarChart2, FileSpreadsheet, Trash2, KeyRound, X, Terminal } from 'lucide-react'
import { cn } from '../../lib/utils'

interface ChatHeaderProps {
  step: string
  sector?: string
  onBackToMenu: () => void
  onClose: () => void
  isDesktop?: boolean
  canShowHistory?: boolean
  onOpenHistory?: () => void
  onOpenAddProcedure?: () => void
  isSpeechEnabled?: boolean
  onToggleSpeech?: () => void
  onOpenDashboard?: () => void
  onOpenFatureIA?: () => void
  onClearHistory?: () => void
  onOpenPortalPasswords?: () => void
  onOpenDevDocs?: () => void
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  step,
  sector,
  onBackToMenu,
  onClose,
  isDesktop = false,
  canShowHistory = false,
  onOpenHistory,
  onOpenAddProcedure,
  isSpeechEnabled = false,
  onToggleSpeech,
  onOpenDashboard,
  onOpenFatureIA,
  onClearHistory,
  onOpenPortalPasswords,
  onOpenDevDocs,
}) => {
  return (
    <div className="bg-white border-b border-slate-200 px-4 sm:px-8 py-3 flex items-center justify-between z-10 shrink-0 gap-2 min-h-[56px]">
      <div className="flex items-center gap-2 sm:gap-4 flex-1 flex-wrap sm:flex-nowrap">
        {step !== 'onboarding' && (
          <button
            type="button"
            onClick={onBackToMenu}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-slate-700 hover:text-[#1a2332] bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all cursor-pointer shrink-0 font-bold text-xs shadow-2xs"
            title="Voltar ao Menu Principal"
          >
            <ArrowLeft size={16} />
            <span>Voltar ao Menu</span>
          </button>
        )}
        {step === 'chat' && sector && (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#1f29de] to-[#4338ca] text-white flex items-center justify-center shadow-2xs shrink-0">
              <Bot size={15} />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Setor:</span>
            <div className="bg-blue-50 text-[#1f29de] px-2.5 py-1 rounded-md text-xs font-bold border border-blue-200/80">
              {sector}
            </div>
          </div>
        )}
        {step === 'doc_clinica' && (
          <div className="flex items-center gap-2">
            <div className="bg-rose-50 text-rose-800 px-2.5 py-1.5 rounded-lg text-xs font-bold border border-rose-200/80 flex items-center gap-1.5 shadow-2xs">
              <Stethoscope size={15} className="text-rose-600" />
              <span>Solicitação Médica Padronizada</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {step === 'chat' && (
          <>
            {canShowHistory && onOpenHistory && (
              <button
                type="button"
                onClick={onOpenHistory}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-indigo-700/60 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0 bg-[#1e1b4b] text-[#e0e7ff]"
                title="Histórico de alterações de procedimentos"
              >
                <History size={14} className="text-indigo-300" />
                <span className="hidden sm:inline">Histórico</span>
              </button>
            )}
            {onOpenAddProcedure && (
              <button
                type="button"
                onClick={onOpenAddProcedure}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0 bg-[#1a2332] text-white"
                title="Cadastrar novo procedimento"
              >
                <Plus size={14} />
                <span className="hidden sm:inline">Adicionar Procedimento</span>
              </button>
            )}
            {onToggleSpeech && (
              <button
                type="button"
                onClick={onToggleSpeech}
                className={cn(
                  'p-2 rounded-lg transition-all border shadow-sm cursor-pointer shrink-0',
                  isSpeechEnabled
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100 hover:text-emerald-700'
                    : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-50 hover:text-slate-600'
                )}
                title={isSpeechEnabled ? 'Desativar voz' : 'Ativar voz'}
              >
                {isSpeechEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </button>
            )}
            {onOpenDashboard && (
              <button
                type="button"
                onClick={onOpenDashboard}
                className="p-2 border border-slate-200 text-blue-600 hover:text-blue-700 bg-white hover:bg-blue-50 rounded-lg transition-colors shadow-sm cursor-pointer shrink-0"
                title="Métricas e Analytics"
              >
                <BarChart2 size={16} />
              </button>
            )}
            {onOpenFatureIA && (
              <button
                type="button"
                onClick={onOpenFatureIA}
                className="p-2 border border-slate-200 text-emerald-600 hover:text-emerald-700 bg-white hover:bg-emerald-50 rounded-lg transition-colors shadow-sm cursor-pointer shrink-0"
                title="FatureIA Automação"
              >
                <FileSpreadsheet size={16} />
              </button>
            )}
            {onClearHistory && (
              <button
                type="button"
                onClick={onClearHistory}
                className="p-2 border border-slate-200 text-red-500 hover:text-red-600 bg-white hover:bg-red-50 rounded-lg transition-colors shadow-sm cursor-pointer shrink-0"
                title="Limpar Histórico do Chat"
              >
                <Trash2 size={16} />
              </button>
            )}
          </>
        )}

        {(step === 'sector' || step === 'login' || step === 'chat') && onOpenPortalPasswords && (
          <button
            type="button"
            onClick={onOpenPortalPasswords}
            className="p-2 border border-amber-200 text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-full transition-all shadow-2xs cursor-pointer shrink-0"
            title="Senhas dos Portais"
          >
            <KeyRound size={18} />
          </button>
        )}

        {onOpenDevDocs && (
          <button
            type="button"
            onClick={onOpenDevDocs}
            className="p-2 border border-slate-200 text-slate-600 hover:text-[#1f29de] bg-slate-50 hover:bg-blue-50 rounded-full transition-all shadow-2xs cursor-pointer shrink-0"
            title="Documentação Técnica & API Reference"
          >
            <Terminal size={17} />
          </button>
        )}

        {step !== 'onboarding' && (
          <button
            type="button"
            onClick={onClose}
            className="bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 p-2 rounded-full transition-all shadow-sm border border-slate-100 cursor-pointer"
            title={isDesktop ? 'Encerrar' : 'Fechar'}
          >
            <X size={20} />
          </button>
        )}
      </div>
    </div>
  )
}
