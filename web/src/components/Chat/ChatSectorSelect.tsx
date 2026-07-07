import React from 'react'
import { motion } from 'framer-motion'
import { Layers, Briefcase, DollarSign, Landmark, Calculator, Activity, Truck, ArrowRight } from 'lucide-react'

interface ChatSectorSelectProps {
  availableSectors: string[];
  onSelectSector: (sector: string) => void;
}

export const ChatSectorSelect: React.FC<ChatSectorSelectProps> = ({ availableSectors, onSelectSector }) => {
  return (
    <motion.div
      key="sector"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex-1 flex flex-col p-8 overflow-y-auto bg-slate-50/50"
    >
      <div className="mb-10 text-center flex flex-col items-center">
        <div className="w-14 h-14 bg-[#1a2332] rounded-full flex items-center justify-center text-white mb-6 shadow-md">
          <Layers size={24} />
        </div>
        <h2 className="text-2xl font-bold text-[#1a2332] mb-3 tracking-tight">Seleção de Departamento</h2>
        <p className="text-slate-500 text-sm max-w-[400px] mx-auto leading-relaxed">Por favor, selecione sua área de atuação para personalizarmos o seu atendimento e fornecermos as informações corretas.</p>
      </div>
      
      <div className="grid grid-cols-2 gap-4 max-w-[800px] mx-auto w-full">
        {availableSectors.length > 0 ? (
          availableSectors.map((s, index) => {
            let Icon = Layers;
            let desc = "Gestão de processos e suporte.";
            if (s.toLowerCase().includes('comercial')) {
              Icon = Briefcase;
              desc = "Vendas, contratos e relacionamento corporativo.";
            } else if (s.toLowerCase().includes('faturamento')) {
              Icon = DollarSign;
              desc = "Emissão de notas, cobranças e conciliações.";
            } else if (s.toLowerCase().includes('financeiro')) {
              Icon = Landmark;
              desc = "Contas a pagar, receber e tesouraria geral.";
            } else if (s.toLowerCase().includes('orçamento - arthromed')) {
              Icon = Calculator;
              desc = "Planejamento e controle de custos Arthromed.";
            } else if (s.toLowerCase().includes('orçamento - medic')) {
              Icon = Activity;
              desc = "Planejamento e controle de custos Medic.";
            } else if (s.toLowerCase().includes('estoque') || s.toLowerCase().includes('logística') || s.toLowerCase().includes('logistica')) {
              Icon = Truck;
              desc = "Processos de transporte e análise de compras.";
            }

            return (
              <motion.button
                key={s}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onSelectSector(s)}
                className="text-left w-full flex flex-col p-5 bg-white border border-slate-200 rounded-2xl hover:border-slate-300 hover:shadow-md transition-all group relative cursor-pointer"
              >
                <div className="bg-slate-100 text-slate-500 p-2 rounded-lg w-fit mb-4">
                  <Icon size={18} strokeWidth={1.5} />
                </div>
                <h3 className="font-bold text-slate-800 text-base mb-1">{s}</h3>
                <p className="text-xs text-slate-500 leading-relaxed pr-6">{desc}</p>
                <ArrowRight className="text-slate-300 absolute top-5 right-5 group-hover:text-slate-500 transition-colors" size={16} />
              </motion.button>
            )
          })
        ) : (
          <div className="col-span-2 text-center py-10 opacity-50">Carregando departamentos...</div>
        )}
      </div>

      <p className="mt-auto pt-8 text-center text-xs text-slate-400">
        Caso não encontre seu departamento, entre em contato com o suporte de TI.
      </p>
    </motion.div>
  )
}
