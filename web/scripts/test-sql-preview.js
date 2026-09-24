import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lê o arquivo .env manualmente
const envPath = path.resolve(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, ...values] = line.split('=');
  if (key && values.length > 0) {
    env[key.trim()] = values.join('=').trim();
  }
});

const supabaseUrl = env['VITE_SUPABASE_URL'] || env['ITE_SUPABASE_URL'];
const supabaseKey = env['SUPABASE_SERVICE_ROLE_KEY']; // Usando a chave de serviço para ter acesso total

const supabase = createClient(supabaseUrl, supabaseKey);

async function testQuery() {
  console.log('Testando busca de dados (Simulando a Query SQL)...\n');
  
  const { data, error } = await supabase
    .from('ti_chamados')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error('Erro ao buscar dados:', error);
    return;
  }

  if (!data || data.length === 0) {
    console.log('Nenhum chamado encontrado na base.');
    return;
  }

  const output = data.map(row => {
    let tempoResolucao = 'Ainda não concluído';
    if (row.completed_at) {
      const created = new Date(row.created_at);
      const completed = new Date(row.completed_at);
      const diffMs = completed - created;
      tempoResolucao = (diffMs / (1000 * 60 * 60)).toFixed(2) + ' horas';
    }

    return {
      'Código': row.code,
      'Status': row.status,
      'Solicitante': row.creator_name,
      'Setor': row.creator_sector,
      'Abertura': new Date(row.created_at).toLocaleString('pt-BR'),
      'Tempo de Resolução': tempoResolucao
    };
  });

  console.table(output);
  console.log('\nEsses são os 5 chamados mais recentes! Os dados estão perfeitamente formatados.');
}

testQuery();
