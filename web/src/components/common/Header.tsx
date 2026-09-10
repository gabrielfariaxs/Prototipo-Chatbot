import React from 'react'
import { Link } from '@tanstack/react-router'
import { BrandLockup } from './BrandLockup'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-[#ffffff] border-b border-[#e2e8f0] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-[64px] flex items-center justify-between">
        <Link to="/" className="no-underline">
          <BrandLockup showAppName={true} />
        </Link>

        <nav className="flex items-center gap-6 text-sm font-semibold">
          <Link
            to="/"
            className="text-[#475569] hover:text-[#1b497d] transition-colors no-underline"
            activeProps={{ className: 'text-[#1b497d] font-bold no-underline' }}
          >
            Início
          </Link>
          <Link
            to="/about"
            className="text-[#475569] hover:text-[#1b497d] transition-colors no-underline"
            activeProps={{ className: 'text-[#1b497d] font-bold no-underline' }}
          >
            Sobre o Portal
          </Link>
        </nav>
      </div>

      {/* Signature 3px gradient bar at base */}
      <div className="brand-filete-bar" />
    </header>
  )
}
