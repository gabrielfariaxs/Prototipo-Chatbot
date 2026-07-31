import React from 'react'
import { BrandLockup } from './BrandLockup'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-20 bg-[#ffffff] border-t border-[#e6e9f2] text-[#5b6276]">
      {/* Signature 3px gradient bar at top */}
      <div className="brand-filete-bar" />

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <BrandLockup showAppName={true} />

        <div className="text-center md:text-right space-y-1">
          <p className="m-0 text-xs font-medium text-[#5b6276]">
            &copy; {year} Arthromed & Medic Ortopedia. Todos os direitos reservados.
          </p>
          <p className="m-0 text-[11px] font-bold text-[#9097aa] uppercase tracking-wider">
            MedIA Corporativo &bull; Distribuição de OPME
          </p>
        </div>
      </div>
    </footer>
  )
}
