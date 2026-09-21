import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || 'https://espjmmzyrimglobetlzo.supabase.co',
  process.env.VITE_SUPABASE_ANON_KEY || 'no-key'
);

async function checkSchema() {
  const { data, error } = await supabase
    .from('procedimentos_historico')
    .select('*')
    .limit(1);
    
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Columns available (from first row):', data.length ? Object.keys(data[0]) : 'Table empty but exists');
  }
}

checkSchema();
