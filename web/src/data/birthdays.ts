export interface Birthday {
  name: string;
  day: number;
  month: number;
}

export const BIRTHDAYS: Birthday[] = [
  // Janeiro
  { name: 'DIEGO LUIZ - RN', day: 4, month: 1 },
  { name: 'LEONARDO ALVES - PE', day: 9, month: 1 },
  { name: 'ELAYNE CORDOVIL - PA', day: 15, month: 1 },
  { name: 'ADILSON NETO - PE', day: 18, month: 1 },
  { name: 'PEDROSA - PE', day: 29, month: 1 },
  
  // Fevereiro
  { name: 'MARIA FERNANDA - RN', day: 3, month: 2 },
  { name: 'HELBER - PI', day: 11, month: 2 },
  { name: 'ANDERSON ALEXANDRE BARBOSA - PE', day: 16, month: 2 },

  // Março
  { name: 'RAFAELA TORRES - PE', day: 30, month: 3 },

  // Abril
  { name: 'VANESSA - PE', day: 8, month: 4 },
  { name: 'GILMAR JÚNIOR - RN', day: 9, month: 4 },
  { name: 'DIEGO LIMA - RN', day: 20, month: 4 },
  { name: 'CLAYTON - PE', day: 29, month: 4 },

  // Maio
  { name: 'JACKSON - PE', day: 7, month: 5 },
  { name: 'THACIANA PONTUAL - PE', day: 18, month: 5 },
  { name: 'JOSE BRUNO - CE', day: 24, month: 5 },
  { name: 'GUSTAVO GONÇALVES - RN', day: 27, month: 5 },

  // Junho
  { name: 'EDIL - PE', day: 3, month: 6 },
  { name: 'ABMAEL - PE', day: 4, month: 6 },
  { name: 'KAREN MAIA - PE', day: 4, month: 6 },
  { name: 'DIANA MORAES - PA', day: 8, month: 6 },
  { name: 'MAURIQUÉRCIO TAVARES - RN', day: 16, month: 6 },
  { name: 'GENILSON - PE', day: 18, month: 6 },
  { name: 'BRUNA THAYNNA - PE', day: 19, month: 6 },
  { name: 'JUÇARA - PE', day: 20, month: 6 },
  { name: 'GABRIEL - MA', day: 28, month: 6 },

  // Julho
  { name: 'JAILTON JOSÉ - PE', day: 3, month: 7 },
  { name: 'MARCELO - PE', day: 4, month: 7 },
  { name: 'LUCAS - PE', day: 8, month: 7 },
  { name: 'NAZARENO DE JESUS - PA', day: 10, month: 7 },
  { name: 'EVERALDO - PE', day: 23, month: 7 },
  { name: 'MARKLY - PE', day: 24, month: 7 },
  { name: 'DIOGO QUINTELLA - PE', day: 26, month: 7 },

  // Agosto
  { name: 'LEONARDO - PI', day: 2, month: 8 },
  { name: 'MISAEL - PB', day: 6, month: 8 },
  { name: 'LUCIANA BARBOSA DE SOUZA - PA', day: 7, month: 8 },
  { name: 'BRANCA BATISTA - PA', day: 18, month: 8 },
  { name: 'VALESKA - PB', day: 23, month: 8 },
  { name: 'MARIA JOSE - PE', day: 31, month: 8 },

  // Setembro
  { name: 'GABRIEL FARIAS - PE', day: 14, month: 9 },
  { name: 'CATARINA - PE', day: 20, month: 9 },
  { name: 'ALINE - CE', day: 21, month: 9 },
  { name: 'ALESSANDRA LIMA - PE', day: 25, month: 9 },
  { name: 'LUKAS DANIEL - RN', day: 28, month: 9 },

  // Outubro
  { name: 'FRANCISCA JANUÁRIO - RN', day: 4, month: 10 },
  { name: 'GEYMISSON COSTA - PE', day: 22, month: 10 },
  { name: 'EDSON - PE', day: 25, month: 10 },
  { name: 'LAHYS ARAUJO - PE', day: 27, month: 10 },
  { name: 'VALDEMAR JÚNIOR - RN', day: 31, month: 10 },

  // Novembro
  { name: 'WALLYSON - MA', day: 2, month: 11 },
  { name: 'JHONATAN XAVIER - RN', day: 7, month: 11 },
  { name: 'RONALDO ABREU - PA', day: 10, month: 11 },
  { name: 'MATHEUS CRUZ - PA', day: 25, month: 11 },

  // Dezembro
  { name: 'INGRID FONSECA - PE', day: 8, month: 12 },
  { name: 'ANDERSON RAIMUNDO - PE', day: 12, month: 12 },
  { name: 'NATALIA MARQUES - CE', day: 14, month: 12 },
  { name: 'BRENDO LUCAS - RN', day: 16, month: 12 },
  { name: 'ELVIS MARIO - PB', day: 30, month: 12 }
];

export const getTodaysBirthdays = (): Birthday[] => {
  const today = new Date();
  // No Brasil (fuso horário local), pegamos o dia e o mês
  const day = today.getDate();
  const month = today.getMonth() + 1; // getMonth é 0-indexed

  return BIRTHDAYS.filter(b => b.day === day && b.month === month);
};
