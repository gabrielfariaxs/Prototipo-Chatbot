import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
const envPath = path.resolve(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = Object.fromEntries(
  envContent.split('\n')
    .filter(line => line.includes('='))
    .map(line => {
      const [key, ...rest] = line.split('=');
      return [key.trim(), rest.join('=').trim()];
    })
);

const SUPABASE_URL = envVars.VITE_SUPABASE_URL;
const SUPABASE_KEY = envVars.VITE_SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Faltando VITE_SUPABASE_URL ou VITE_SUPABASE_KEY no .env");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function clearDatabase() {
  console.log('Deletando todos os registros mockados da tabela gargalos...');
  
  // Para deletar todas as linhas, usamos um filtro que pegue todas (ex: id não nulo)
  const { error } = await supabase
    .from('gargalos')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Isso garante que não caia na regra "deve haver um filtro"

  if (error) {
    console.error('Erro ao deletar dados:', error);
  } else {
    console.log('✅ Banco de dados limpo com sucesso! Todos os dados mockados foram apagados.');
  }
}

clearDatabase();
