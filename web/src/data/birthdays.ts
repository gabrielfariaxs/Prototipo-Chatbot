export interface Birthday {
  name: string;
  day: number;
  month: number;
}

export const BIRTHDAYS: Birthday[] = [
  // Janeiro
  { name: 'DIEGO LUIZ - ARTHROMED', day: 4, month: 1 },
  { name: 'LUIS AUGUSTO (MA)', day: 9, month: 1 },
  { name: 'LEO (ARTHOMED)', day: 9, month: 1 },
  { name: 'ELAYNE - BELEM', day: 15, month: 1 },
  { name: 'NETO', day: 18, month: 1 },
  { name: 'PEDROSA', day: 29, month: 1 },
  
  // Fevereiro
  { name: 'FERNANDA', day: 3, month: 2 },
  { name: 'HELBER', day: 11, month: 2 },
  { name: 'Anderson Barbosa - arthromed', day: 16, month: 2 },

  // Março
  { name: 'EVELLYN LUNA - INSTRUMENTADORA PB', day: 27, month: 3 },

  // Abril
  { name: 'VANESSA COSTA -- ARTHRO', day: 8, month: 4 },
  { name: 'GILMAR', day: 9, month: 4 },
  { name: 'DIEGO DE LIMA -- ARTHRO', day: 20, month: 4 },
  { name: 'GEORGE BOTELHO - PA', day: 28, month: 4 },
  { name: 'CLAYTON -- ARTHRO', day: 29, month: 4 },

  // Maio
  { name: 'JACKSON', day: 7, month: 5 },
  { name: 'BRUNO - CE', day: 24, month: 5 },
  { name: 'GUSTAVO - ARTHROMED', day: 27, month: 5 },
  { name: 'THACIANA', day: 28, month: 5 },

  // Junho
  { name: 'EDIL', day: 3, month: 6 },
  { name: 'ABMAEL', day: 4, month: 6 },
  { name: 'KAREN', day: 4, month: 6 },
  { name: 'DIANA - BELEM', day: 8, month: 6 },
  { name: 'EDSON SANTOS - BELEM', day: 14, month: 6 },
  { name: 'MAURIQUERCIO TAVARES - ARTHROMED', day: 16, month: 6 },
  { name: 'GENILSON de Souza', day: 18, month: 6 },
  { name: 'BRUNA Thaynna', day: 19, month: 6 },
  { name: 'JUÇARA', day: 20, month: 6 },
  { name: 'GABRIEL SOEIRO', day: 28, month: 6 },

  // Julho
  { name: 'JAILTON JOSE', day: 3, month: 7 },
  { name: 'MARCELO RAMOS', day: 4, month: 7 },
  { name: 'LUCAS WOCHTER', day: 8, month: 7 },
  { name: 'EVERALDO RODRIGUES', day: 23, month: 7 },
  { name: 'MARKLY MANOEL MACIEL SILVA', day: 24, month: 7 },
  { name: 'DIOGO QUINTELLA', day: 26, month: 7 },

  // Agosto
  { name: 'LEONARDO - PI', day: 2, month: 8 },
  { name: 'DIONATA SANTOS (SANTINHO)', day: 4, month: 8 },
  { name: 'MISAEL', day: 6, month: 8 },
  { name: 'BRANCA - BELEM', day: 18, month: 8 },
  { name: 'VALESKA HOLANDA - INSTRUMENTADORA CE', day: 23, month: 8 },
  { name: 'MARIA', day: 31, month: 8 },

  // Setembro
  { name: 'GABRIEL FARIAS - ARTHRO', day: 14, month: 9 },
  { name: 'RAFAEL DE SOUZA DUARTE - CAMPINA', day: 15, month: 9 },
  { name: 'CATARINA', day: 20, month: 9 },
  { name: 'ALINE - CE', day: 21, month: 9 },
  { name: 'ALESSANDRA DE LIMA - ARTHRO', day: 25, month: 9 },

  // Outubro
  { name: 'FRANCISCA - RN', day: 4, month: 10 },
  { name: 'GEYMISON - PE', day: 22, month: 10 },
  { name: 'EDSON - PE', day: 25, month: 10 },
  { name: 'LAHYS - PE', day: 27, month: 10 },
  { name: 'VALDEMAR - RN', day: 31, month: 10 },

  // Novembro
  { name: 'WALLYSON - MA', day: 2, month: 11 },
  { name: 'RONALDO - PA', day: 10, month: 11 },

  // Dezembro
  { name: 'Ingrid Fonseca - PE', day: 8, month: 12 },
  { name: 'ANDERSON - PE', day: 12, month: 12 },
  { name: 'NATHALIA - CE', day: 14, month: 12 },
  { name: 'BRENDO - RN', day: 16, month: 12 },
  { name: 'ELVIS - PB', day: 30, month: 12 }
];

export const getTodaysBirthdays = (): Birthday[] => {
  const today = new Date();
  // No Brasil (fuso horário local), pegamos o dia e o mês
  const day = today.getDate();
  const month = today.getMonth() + 1; // getMonth é 0-indexed

  return BIRTHDAYS.filter(b => b.day === day && b.month === month);
};
