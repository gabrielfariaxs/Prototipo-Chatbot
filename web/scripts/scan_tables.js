import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

function loadEnv() {
  const rootEnv = path.resolve('../.env')
  const webEnv = path.resolve('.env')
  const parse = (filePath) => {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8')
      content.split(/\r?\n/).forEach(line => {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?$/)
        if (match) {
          let value = match[2] || ''
          if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1)
          if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1)
          process.env[match[1]] = value
        }
      })
    }
  }
  parse(rootEnv)
  parse(webEnv)
}
loadEnv()

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const candidateTables = ['documents', 'gargalos', 'chamados_ti', 'chamados', 'gop', 'demandas', 'users', 'profiles', 'processos', 'clinical_docs'];

async function scan() {
  console.log("=== TABELAS ENCONTRADAS NO SUPABASE ATUAL ===");
  for (const table of candidateTables) {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    if (!error) {
      console.log(`✅ Tabela: "${table}" (${data ? data.length : 0} linha(s))`);
      if (data && data.length > 0) {
        console.log(`   Campos:`, Object.keys(data[0]));
      }
    }
  }
}

scan();
