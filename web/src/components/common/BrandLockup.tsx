import React from 'react'

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
    <div className={`inline-flex items-center gap-3.5 select-none min-w-[240px] ${className}`}>
      {/* Texto Principal Grupo Medic (Holding) */}
      <div className="flex flex-col justify-center leading-none">
        <span className={`font-display font-extrabold text-base tracking-tight ${light ? 'text-white' : 'text-[#121d2b]'}`}>
          GRUPO MEDIC
        </span>
        <span className={`text-[9px] font-bold tracking-wider uppercase ${light ? 'text-slate-300' : 'text-[#475569]'}`}>
          HOLDING INSTITUCIONAL
        </span>
      </div>

      {/* 1px Vertical Divider */}
      <div className={`w-px h-7 ${light ? 'bg-white/30' : 'bg-[#e2e8f0]'}`} />

      {/* Marcas Operacionais (Medic Ortopedia | Arthromed) */}
      <div className="hidden sm:flex items-center gap-2 leading-none">
        <div className="flex flex-col">
          <span className={`text-[10px] font-extrabold ${light ? 'text-slate-200' : 'text-[#1b497d]'}`}>
            Medic Ortopedia
          </span>
          <span className={`text-[10px] font-extrabold ${light ? 'text-slate-300' : 'text-[#17a398]'}`}>
            Arthromed OPME
          </span>
        </div>
      </div>

      {/* Product Name Badge: MedIA */}
      {showAppName && (
        <>
          <div className={`w-px h-5 ${light ? 'bg-white/20' : 'bg-[#e2e8f0]'}`} />
          <div className="flex items-center gap-1 bg-[#1b497d]/10 border border-[#1b497d]/20 px-2.5 py-1 rounded-full">
            <span className="font-display font-extrabold text-xs text-[#1b497d]">
              MedIA
            </span>
          </div>
        </>
      )}
    </div>
  )
}
