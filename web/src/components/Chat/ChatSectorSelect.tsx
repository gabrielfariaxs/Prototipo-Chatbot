import React from 'react'
import { motion } from 'framer-motion'
import { Layers, Briefcase, DollarSign, Landmark, Calculator, Truck, ArrowRight, Building2, Package, Receipt, Wallet, PieChart, Sparkles, Sun, Moon } from 'lucide-react'
import { useTheme, setThemeMode } from '../../lib/theme'

interface ChatSectorSelectProps {
  availableSectors: string[];
  onSelectSector: (sector: string) => void;
}

export const ChatSectorSelect: React.FC<ChatSectorSelectProps> = ({ availableSectors, onSelectSector }) => {
  const { isDark, toggleTheme } = useTheme()

  return (
    <motion.div
      key="sector"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="flex-1 flex flex-col p-4 sm:p-8 lg:p-10 overflow-y-auto bg-[#f8fafc] custom-scrollbar"
    >
      <div className="mb-8 text-center flex flex-col items-center">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1f29de] to-[#4338ca] text-white flex items-center justify-center shadow-md shadow-blue-500/20 mb-3.5">
          <Building2 size={24} />
        </div>
        
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/70 text-[#1f29de] text-xs font-bold mb-2">
          <Sparkles size={13} />
          <span>Central de Atendimento MedIA</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-display font-black text-slate-900 mb-2 tracking-tight">
          Seleção de Departamento
        </h2>
        
        <p className="text-slate-500 text-xs sm:text-sm max-w-[440px] mx-auto leading-relaxed">
          Por favor, selecione sua área de atuação para personalizarmos o seu atendimento e fornecermos as informações corretas.
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5 sm:gap-5 max-w-[840px] mx-auto w-full">
        {availableSectors.length > 0 ? (
          availableSectors.map((s, index) => {
            let Icon = Layers;
            let desc = "Gestão de processos e suporte operacional.";
            let iconTheme = "bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/20";
            let hoverGlow = "hover:border-sky-500/50 hover:shadow-[0_12px_28px_rgba(14,165,233,0.14)]";
            let hoverTitle = "group-hover:text-sky-600";
            let tagTheme = "bg-sky-50 text-sky-700 border-sky-200/70";
            let tagText = "Geral";

            const sLower = s.toLowerCase();

            if (sLower.includes('comercial')) {
              Icon = Briefcase;
              desc = "Vendas, contratos e relacionamento corporativo.";
              iconTheme = "bg-gradient-to-br from-[#1f29de] to-[#4338ca] text-white shadow-md shadow-blue-500/20";
              hoverGlow = "hover:border-[#1f29de]/50 hover:shadow-[0_12px_28px_rgba(31,41,222,0.14)]";
              hoverTitle = "group-hover:text-[#1f29de]";
              tagTheme = "bg-blue-50 text-[#1f29de] border-blue-200/70";
              tagText = "Comercial";
            } else if (sLower.includes('faturamento')) {
              Icon = Receipt;
              desc = "Emissão de notas fiscais, cobranças e conciliações.";
              iconTheme = "bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-md shadow-emerald-500/20";
              hoverGlow = "hover:border-emerald-500/50 hover:shadow-[0_12px_28px_rgba(16,185,129,0.14)]";
              hoverTitle = "group-hover:text-emerald-600";
              tagTheme = "bg-emerald-50 text-emerald-700 border-emerald-200/70";
              tagText = "NFe & Notas";
            } else if (sLower.includes('financeiro')) {
              Icon = Landmark;
              desc = "Contas a pagar, receber e tesouraria geral.";
              iconTheme = "bg-gradient-to-br from-purple-600 to-indigo-700 text-white shadow-md shadow-purple-500/20";
              hoverGlow = "hover:border-purple-500/50 hover:shadow-[0_12px_28px_rgba(147,51,234,0.14)]";
              hoverTitle = "group-hover:text-purple-600";
              tagTheme = "bg-purple-50 text-purple-700 border-purple-200/70";
              tagText = "Financeiro";
            } else if (sLower.includes('orçamento') || sLower.includes('orcamento')) {
              Icon = Calculator;
              desc = "Gestão de orçamentos, cotações e controle de custos.";
              iconTheme = "bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-md shadow-rose-500/20";
              hoverGlow = "hover:border-rose-500/50 hover:shadow-[0_12px_28px_rgba(244,63,94,0.14)]";
              hoverTitle = "group-hover:text-rose-600";
              tagTheme = "bg-rose-50 text-rose-700 border-rose-200/70";
              tagText = "Cirurgias";
            } else if (sLower.includes('estoque') || sLower.includes('logística') || sLower.includes('logistica')) {
              Icon = Truck;
              desc = "Processos de transporte, expedição e compras.";
              iconTheme = "bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md shadow-amber-500/20";
              hoverGlow = "hover:border-amber-500/50 hover:shadow-[0_12px_28px_rgba(245,158,11,0.14)]";
              hoverTitle = "group-hover:text-amber-600";
              tagTheme = "bg-amber-50 text-amber-700 border-amber-200/70";
              tagText = "Logística";
            }

            return (
              <motion.button
                key={s}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -4, scale: 1.015 }}
                whileTap={{ scale: 0.985 }}
                onClick={() => onSelectSector(s)}
                className={`text-left w-full flex flex-col p-5 bg-gradient-to-br from-white via-slate-50/40 to-white border border-slate-200/90 ${hoverGlow} rounded-[20px] shadow-[0_4px_18px_rgba(15,23,42,0.03)] transition-all duration-300 group relative cursor-pointer select-none justify-between min-h-[160px]`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3.5">
                    <div className={`w-11 h-11 rounded-[14px] ${iconTheme} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <Icon size={22} strokeWidth={2.2} />
                    </div>
                    
                    <span className={`eyebrow text-[9.5px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full border shrink-0 whitespace-nowrap ${tagTheme}`}>
                      {tagText}
                    </span>
                  </div>

                  <h3 className={`font-display font-black text-slate-900 text-base mb-1 ${hoverTitle} transition-colors`}>
                    {s}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-normal">
                    {desc}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs font-extrabold text-slate-500 group-hover:text-slate-900 transition-colors">
                  <span className="text-[11px] font-bold text-slate-400 group-hover:text-[#1f29de] transition-colors">
                    Acessar Setor
                  </span>
                  <div className="w-7 h-7 rounded-full bg-slate-100 group-hover:bg-[#1f29de] group-hover:text-white text-slate-400 flex items-center justify-center transition-all duration-300 shadow-2xs group-hover:translate-x-0.5">
                    <ArrowRight size={14} />
                  </div>
                </div>
              </motion.button>
            )
          })
        ) : (
          <div className="col-span-1 sm:col-span-2 text-center py-10 opacity-50 font-medium text-slate-500">
            Carregando departamentos...
          </div>
        )}
      </div>

      <p className="mt-auto pt-8 text-center text-xs text-slate-400 font-medium">
        Caso não encontre seu departamento, entre em contato com o suporte de TI.
      </p>
    </motion.div>
  )
}
