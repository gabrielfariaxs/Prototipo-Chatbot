import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Paperclip, X } from 'lucide-react'

interface FilePreviewModalProps {
  previewFile: { name: string; base64: string; type: string; originalPdfBase64?: string } | null;
  previewUrl: string | null;
  imgZoom: number;
  setImgZoom: React.Dispatch<React.SetStateAction<number>>;
  onClose: () => void;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  previewFile,
  previewUrl,
  imgZoom,
  setImgZoom,
  onClose
}) => {
  if (!previewFile) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] bg-[#0b0f19]/80 backdrop-blur-md flex items-center justify-center p-4 md:p-6"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, y: 15 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="bg-white rounded-3xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden shadow-2xl border border-slate-100"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header do Modal */}
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white border border-slate-200 text-[#1a2332] rounded-xl shadow-sm">
                {previewFile.type === 'application/pdf' ? <FileText size={20} /> : <Paperclip size={20} />}
              </div>
              <div className="flex flex-col">
                <h3 className="font-bold text-slate-800 text-sm md:text-base leading-tight truncate max-w-[200px] md:max-w-[450px]">
                  {previewFile.name}
                </h3>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                  Pré-visualização do Anexo
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {previewUrl && (
                <a
                  href={previewUrl}
                  download={previewFile.name}
                  className="flex items-center gap-2 border border-slate-200 bg-white text-slate-600 px-4 py-2 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
                >
                  Baixar Arquivo
                </a>
              )}
              <button
                onClick={onClose}
                className="bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 p-2.5 rounded-full transition-all border border-slate-200/50 shadow-sm cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Corpo do Modal - Conteúdo do Arquivo */}
          <div className="flex-1 bg-slate-100/50 p-4 md:p-6 flex items-center justify-center overflow-hidden">
            {previewFile.originalPdfBase64 || previewFile.type === 'application/pdf' ? (
              previewUrl ? (
                <iframe
                  src={previewUrl}
                  title={previewFile.name}
                  className="w-full h-full border border-slate-200 rounded-2xl shadow-inner bg-white"
                />
              ) : (
                <div className="text-slate-400 text-sm font-semibold">Carregando visualizador de PDF...</div>
              )
            ) : previewFile.type.startsWith('image/') ? (
              <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden">
                {/* Zoom Controls */}
                <div className="absolute top-4 right-4 z-50 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm border border-slate-200/60 p-1.5 rounded-2xl shadow-md select-none">
                  <button
                    onClick={() => setImgZoom(prev => Math.max(0.5, prev - 0.25))}
                    className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition-all cursor-pointer font-bold text-xs"
                    title="Diminuir Zoom"
                  >
                    A-
                  </button>
                  <span className="text-[10px] font-bold text-slate-500 px-2 min-w-[36px] text-center">
                    {Math.round(imgZoom * 100)}%
                  </span>
                  <button
                    onClick={() => setImgZoom(prev => Math.min(3.0, prev + 0.25))}
                    className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition-all cursor-pointer font-bold text-xs"
                    title="Aumentar Zoom"
                  >
                    A+
                  </button>
                  <button
                    onClick={() => setImgZoom(1)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all cursor-pointer text-[10px] font-bold uppercase tracking-wider px-2"
                    title="Resetar Zoom"
                  >
                    Reset
                  </button>
                </div>
                {/* Zoomable Image Container */}
                <div className="w-full h-full overflow-auto flex items-center justify-center p-4">
                  <img
                    src={`data:${previewFile.type};base64,${previewFile.base64}`}
                    alt={previewFile.name}
                    style={{
                      transform: `scale(${imgZoom})`,
                      transformOrigin: 'center center',
                      transition: 'transform 0.15s ease-out'
                    }}
                    className="max-w-full max-h-full object-contain rounded-2xl shadow-lg border border-white"
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 text-center p-8 bg-white border border-slate-200 rounded-3xl shadow-md max-w-sm">
                <div className="p-4 bg-slate-50 text-slate-400 rounded-full border border-slate-100">
                  <FileText size={40} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-700 text-base mb-1">Visualização Indisponível</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Não conseguimos exibir este tipo de arquivo diretamente. Faça o download para visualizá-lo.
                  </p>
                </div>
                {previewUrl && (
                  <a
                    href={previewUrl}
                    download={previewFile.name}
                    className="bg-[#1a2332] text-white px-5 py-2.5 rounded-xl text-xs font-semibold hover:bg-[#253043] transition-colors shadow-md"
                  >
                    Baixar Arquivo
                  </a>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
