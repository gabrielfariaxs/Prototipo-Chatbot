import React from 'react'
import { Bot, FileText, Paperclip, ThumbsUp, ThumbsDown, Copy, Edit3, Trash2 } from 'lucide-react'
import { cn } from '../../lib/utils'
import { LinkifiedText } from '../common/LinkifiedText'

export interface ChatMessage {
  id: string
  role: 'user' | 'bot'
  text: string
  timestamp: Date
  files?: {
    name: string
    base64: string
    type: string
    originalPdfBase64?: string
  }[]
  feedback?: 'up' | 'down'
  feedbackComment?: string
}

interface ChatMessageItemProps {
  message: ChatMessage
  onPreviewFile: (file: any) => void
  onFeedback?: (msgId: string, type: 'up' | 'down') => void
  onOpenEditProcedure?: (text: string) => void
  onOpenDeleteProcedure?: (text: string) => void
  renderCustomContent?: (msg: ChatMessage) => React.ReactNode
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({
  message,
  onPreviewFile,
  onFeedback,
  onOpenEditProcedure,
  onOpenDeleteProcedure,
  renderCustomContent,
}) => {
  const isUser = message.role === 'user'

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text)
  }

  const isProcedure = message.text.includes('PASSO A PASSO') || message.text.includes('INSTRUÇÕES') || message.text.includes('1.')

  return (
    <div
      className={cn(
        'flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300',
        isUser ? 'ml-auto flex-row-reverse max-w-[60%]' : 'items-start max-w-[85%]'
      )}
    >
      {!isUser && (
        <div className="p-2 rounded-full shrink-0 flex items-center justify-center w-9 h-9 bg-gradient-to-br from-[#1f29de] to-[#4338ca] text-white shadow-xs mt-1">
          <Bot size={16} />
        </div>
      )}

      <div className="flex flex-col gap-1.5 min-w-0">
        <div
          className={cn(
            'p-4 text-[14px] leading-relaxed',
            isUser
              ? 'bg-[#1f29de] text-white rounded-[16px_16px_4px_16px] shadow-xs font-medium'
              : 'bg-white dark:bg-slate-800 border border-[#e6e9f2] dark:border-slate-700 text-[#14161f] dark:text-slate-100 rounded-[16px_16px_16px_4px] shadow-xs'
          )}
        >
          {isUser ? (
            <div className="flex flex-col gap-3">
              <LinkifiedText text={message.text} isDarkBg={true} />
              {message.files && message.files.length > 0 && (
                <div className="flex flex-col gap-2 w-full mt-1">
                  {message.files.map((file, idx) => (
                    <button
                      key={idx}
                      onClick={() => onPreviewFile(file)}
                      className="flex items-center gap-3 p-3 bg-white/10 hover:bg-white/20 border border-white/15 rounded-xl text-white transition-all text-left group cursor-pointer w-full"
                    >
                      <div className="p-2 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors shrink-0">
                        {file.type === 'application/pdf' ? <FileText size={18} /> : <Paperclip size={18} />}
                      </div>
                      <div className="flex flex-col flex-1 overflow-hidden">
                        <span className="text-xs font-semibold truncate">{file.name}</span>
                        <span className="text-[9px] text-white/60 uppercase tracking-widest mt-0.5 font-bold">
                          Clique para pré-visualizar
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : renderCustomContent ? (
            renderCustomContent(message)
          ) : (
            <LinkifiedText text={message.text} />
          )}
        </div>

        {/* Rodapé da Mensagem */}
        <div className={cn('flex items-center gap-3 px-1 pt-0.5', isUser ? 'justify-end' : 'justify-between')}>
          {!isUser && (
            <div className="flex items-center gap-3">
              <span className="font-mono text-[12.5px] text-[#9097aa]">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              <div className="flex items-center gap-2">
                {onFeedback && (
                  <>
                    <button
                      type="button"
                      onClick={() => onFeedback(message.id, 'up')}
                      className="text-[#9097aa] hover:text-emerald-600 transition-colors cursor-pointer"
                      title="Útil"
                    >
                      <ThumbsUp size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onFeedback(message.id, 'down')}
                      className="text-[#9097aa] hover:text-rose-600 transition-colors cursor-pointer"
                      title="Não útil"
                    >
                      <ThumbsDown size={12} />
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={handleCopy}
                  className="text-[#9097aa] hover:text-[#5b6276] transition-colors cursor-pointer"
                  title="Copiar mensagem"
                >
                  <Copy size={12} />
                </button>
              </div>
            </div>
          )}

          {!isUser && isProcedure && onOpenEditProcedure && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onOpenEditProcedure(message.text)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-slate-700 hover:text-blue-700 bg-slate-100 hover:bg-blue-50 border border-slate-200 transition-colors cursor-pointer"
                title="Editar procedimento"
              >
                <Edit3 size={11} />
                <span>Editar Procedimento</span>
              </button>
              {onOpenDeleteProcedure && (
                <button
                  type="button"
                  onClick={() => onOpenDeleteProcedure(message.text)}
                  className="flex items-center gap-1 p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Excluir procedimento"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          )}

          {isUser && (
            <span className="font-mono text-[12.5px] text-[#9097aa]">
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
