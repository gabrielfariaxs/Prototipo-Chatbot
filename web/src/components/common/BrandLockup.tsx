import React from 'react'
import { Sparkles } from 'lucide-react'

interface BrandLockupProps {
  light?: boolean
  showAppName?: boolean
  className?: string
}

export const BrandLockup: React.FC<BrandLockupProps> = ({ 
  light = false,
  showAppName = true,
  className = ''
}) => {
  return (
    <div className={`inline-flex items-center gap-3 sm:gap-3.5 bg-white/95 backdrop-blur-md border border-[#e2e8f0] shadow-[0_6px_22px_-2px_rgba(15,23,42,0.06)] hover:border-blue-300/80 hover:shadow-[0_8px_25px_-2px_rgba(31,41,222,0.1)] rounded-2xl px-3.5 py-2 sm:px-4 sm:py-2.5 transition-all select-none ${className}`}>
      {/* Insígnia / Emblema 3D MedIA */}
      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-[#1f29de] via-[#3543f0] to-[#4338ca] text-white flex items-center justify-center shadow-md shadow-blue-500/25 shrink-0 border border-white/50">
        <Sparkles size={17} className="animate-pulse text-white" />
      </div>

      {/* Texto Principal Grupo Medic (Holding) */}
      <div className="flex flex-col justify-center text-left leading-none">
        <span className="font-display font-black text-xs sm:text-sm tracking-tight text-[#14161f]">
          GRUPO MEDIC
        </span>
        <span className="text-[8.5px] font-extrabold tracking-widest uppercase text-[#64748b] block mt-0.5">
          HOLDING INSTITUCIONAL
        </span>
      </div>

      {/* Divisor Vertical */}
      <div className="w-px h-6 bg-[#e2e8f0] shrink-0" />

      {/* Marcas Operacionais (Medic Ortopedia | Arthromed) */}
      <div className="hidden sm:flex items-center gap-2 leading-none">
        <div className="flex flex-col text-left">
          <span className="text-[9.5px] font-extrabold text-[#1f29de] tracking-tight">
            Medic Ortopedia
          </span>
          <span className="text-[9.5px] font-extrabold text-teal-600 tracking-tight mt-0.5">
            Arthromed OPME
          </span>
        </div>
      </div>

      {/* Badge do App MedIA */}
      {showAppName && (
        <>
          <div className="hidden sm:block w-px h-5 bg-[#e2e8f0] shrink-0" />
          <div className="flex items-center gap-1.5 bg-blue-50/90 border border-blue-200/80 px-2.5 py-1 rounded-full shadow-2xs shrink-0">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-display font-black text-xs text-[#1f29de] tracking-tight">
              MedIA
            </span>
          </div>
        </>
      )}
    </div>
  )
}
