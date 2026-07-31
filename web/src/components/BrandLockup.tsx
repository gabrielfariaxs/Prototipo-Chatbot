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
    <div className={`inline-flex items-center gap-3.5 select-none min-w-[260px] ${className}`}>
      {/* Medic Brand Representation */}
      <div className="flex items-center gap-2">
        {/* Medic Icon Tiles */}
        <div className="flex gap-0.5 items-center">
          <div className="w-2.5 h-6 bg-[#357fc4] rounded-xs" />
          <div className="w-2.5 h-6 bg-[#4ec7ac] rounded-xs" />
          <div className="w-2.5 h-6 bg-[#fd6192] rounded-xs" />
        </div>
        <div className="flex flex-col justify-center leading-none">
          <span className={`font-display font-extrabold text-base tracking-tight ${light ? 'text-white' : 'text-[#14161f]'}`}>
            MEDIC
          </span>
          <span className={`text-[9px] font-bold tracking-wider uppercase ${light ? 'text-slate-300' : 'text-[#5b6276]'}`}>
            ORTOPEDIA
          </span>
        </div>
      </div>

      {/* 1px Vertical Divider */}
      <div className={`w-px h-7 ${light ? 'bg-white/30' : 'bg-[#e6e9f2]'}`} />

      {/* Arthromed Brand Representation */}
      <div className="flex flex-col justify-center leading-none">
        <span className={`font-display font-extrabold text-base tracking-tight ${light ? 'text-white' : 'text-[#1f29de]'}`}>
          ARTHROMED
        </span>
        <span className={`text-[9px] font-bold tracking-wider uppercase ${light ? 'text-slate-300' : 'text-[#5b6276]'}`}>
          TECNOLOGIA OPME
        </span>
      </div>

      {/* Product Name Badge: MedIA */}
      {showAppName && (
        <>
          <div className={`w-px h-5 ${light ? 'bg-white/20' : 'bg-[#e6e9f2]'}`} />
          <div className="flex items-center gap-1 bg-[#1f29de]/10 border border-[#1f29de]/20 px-2.5 py-1 rounded-full">
            <span className="font-display font-extrabold text-xs text-[#1f29de]">
              MedIA
            </span>
          </div>
        </>
      )}
    </div>
  )
}
