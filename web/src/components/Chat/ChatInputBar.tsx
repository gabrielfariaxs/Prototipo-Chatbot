import React from 'react'
import { Send, Paperclip, Mic, MicOff, Loader2, X } from 'lucide-react'
import { cn } from '../../lib/utils'

interface ChatInputBarProps {
  input: string
  setInput: (val: string) => void
  onSend: (textToSend?: string) => void
  isLoading: boolean
  attachedFiles: any[]
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  onRemoveFile: (index: number) => void
  isRecording?: boolean
  onToggleRecording?: () => void
  suggestions?: string[]
}

export const ChatInputBar: React.FC<ChatInputBarProps> = ({
  input,
  setInput,
  onSend,
  isLoading,
  attachedFiles,
  onFileUpload,
  onRemoveFile,
  isRecording = false,
  onToggleRecording,
  suggestions = [],
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (!isLoading && (input.trim() || attachedFiles.length > 0)) {
        onSend()
      }
    }
  }

  return (
    <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 border-t border-[#e6e9f2] dark:border-slate-800 transition-colors">
      {/* Sugestões Rápidas */}
      {suggestions.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide">
          {suggestions.map((sug) => (
            <button
              key={sug}
              type="button"
              onClick={() => onSend(sug)}
              className="whitespace-nowrap px-3.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-full text-xs font-medium hover:border-[#1f29de] dark:hover:border-blue-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-2xs cursor-pointer shrink-0"
            >
              {sug}
            </button>
          ))}
        </div>
      )}

      {/* Lista de Anexos Pendentes */}
      {attachedFiles.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2 mb-2">
          {attachedFiles.map((file, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-3 py-1.5 rounded-lg text-xs font-medium border border-blue-200 dark:border-blue-800 shrink-0"
            >
              <Paperclip size={12} />
              <span className="truncate max-w-[150px]">{file.name}</span>
              <button
                type="button"
                onClick={() => onRemoveFile(idx)}
                className="hover:text-rose-600 transition-colors cursor-pointer"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Barra de Digitação */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-[52px] bg-white dark:bg-slate-800 border border-[#e6e9f2] dark:border-slate-700 rounded-[11px] flex items-center px-3 focus-within:border-[#1f29de] dark:focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-[#1f29de]/16 transition-all shadow-2xs">
          <button
            type="button"
            className={cn(
              'p-2 transition-colors relative rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer',
              attachedFiles.length > 0 ? 'text-[#1f29de] dark:text-blue-400' : 'text-[#9097aa] dark:text-slate-400'
            )}
            title="Adicionar Anexo"
            onClick={() => document.getElementById('chat-file-upload')?.click()}
          >
            <Paperclip size={18} />
            {attachedFiles.length > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#06df82] rounded-full border-2 border-white" />
            )}
            <input
              type="file"
              id="chat-file-upload"
              className="hidden"
              multiple
              onChange={onFileUpload}
              accept=".pdf,image/*"
            />
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              attachedFiles.length > 0
                ? `${attachedFiles.length} arquivo(s) anexado(s)...`
                : 'Descreva sua dúvida ou procedimento...'
            }
            className="flex-1 bg-transparent border-none outline-none text-[14px] text-[#14161f] dark:text-slate-100 placeholder-[#9097aa] dark:placeholder-slate-500 px-2 font-normal"
          />

          {onToggleRecording && (
            <button
              type="button"
              onClick={onToggleRecording}
              className={cn(
                'p-2 rounded-lg transition-colors cursor-pointer',
                isRecording
                  ? 'text-rose-600 bg-rose-50 animate-pulse'
                  : 'text-[#9097aa] hover:text-[#5b6276] hover:bg-slate-100 dark:hover:bg-slate-700'
              )}
              title={isRecording ? 'Parar gravação' : 'Gravar áudio'}
            >
              {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => onSend()}
          disabled={isLoading || (!input.trim() && attachedFiles.length === 0)}
          className={cn(
            'w-[52px] h-[52px] rounded-[11px] flex items-center justify-center transition-all shadow-xs shrink-0 cursor-pointer',
            isLoading || (!input.trim() && attachedFiles.length === 0)
              ? 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed border border-slate-200 dark:border-slate-700'
              : 'bg-[#1f29de] hover:bg-[#1922c2] text-white'
          )}
        >
          {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
        </button>
      </div>
    </div>
  )
}
