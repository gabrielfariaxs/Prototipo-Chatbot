import fs from 'fs';
import path from 'path';

let content = fs.readFileSync(path.join(process.cwd(), 'backup_dados_inserts.sql'), 'utf-8');

const header = `SET session_replication_role = replica;
SET statement_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;
`;

// Helper to remove any huge base64 strings inside JSON objects e.g. "base64": "..."
// Match "base64": "[^"]+" and replace with "base64": ""
content = content.replace(/"base64"\s*:\s*"[^"]+"/g, '"base64": ""');
content = content.replace(/"url"\s*:\s*"data:image\/[^"]+"/g, '"url": ""');

// Clean any old etapa files
const filesInDir = fs.readdirSync(process.cwd());
filesInDir.forEach(f => {
  if (f.startsWith('etapa_') && f.endsWith('.sql')) {
    fs.unlinkSync(path.join(process.cwd(), f));
  }
});

function parseTuples(insertSql) {
  const valuesPos = insertSql.indexOf(' VALUES');
  if (valuesPos === -1) return { prefix: '', tuples: [] };

  const prefix = insertSql.substring(0, valuesPos + 7);
  let body = insertSql.substring(valuesPos + 7).trim();
  if (body.endsWith(';')) body = body.slice(0, -1).trim();

  const tuples = [];
  let current = '';
  let inString = false;

  for (let i = 0; i < body.length; i++) {
    const char = body[i];
    const nextChar = body[i + 1];

    if (char === "'") {
      if (!inString) {
        inString = true;
      } else {
        if (nextChar === "'") {
          current += "''";
          i++;
          continue;
        } else {
          inString = false;
        }
      }
    }

    current += char;

    if (!inString && char === ')' && (nextChar === ',' || i === body.length - 1)) {
      let t = current.trim();
      if (t.startsWith(',')) t = t.substring(1).trim();
      if (t.startsWith('(')) tuples.push(t);
      current = '';
      if (nextChar === ',') i++;
    }
  }

  return { prefix, tuples };
}

const blocks = content.split(/-- Data for Name: /);

blocks.forEach((block, idx) => {
  if (idx === 0) return;
  const lines = block.split(/\r?\n/);
  const tableName = lines[0].split(';')[0].trim();

  if (tableName !== 'ti_chamados') return; // We only need ti_chamados!

  const insertIdx = block.indexOf('INSERT INTO');
  if (insertIdx === -1) return;

  const insertSql = block.substring(insertIdx).trim();
  const { prefix, tuples } = parseTuples(insertSql);

  console.log(`ti_chamados clean tuples: ${tuples.length}`);
  tuples.forEach((t, i) => {
    console.log(`Tuple ${i+1} clean length: ${t.length} bytes`);
  });

  const sqlContent = header + '\n\n' + prefix + '\n  ' + tuples.join(',\n  ') + ';';
  const fileName = `etapa_ti_chamados_COMPLETO.sql`;
  fs.writeFileSync(path.join(process.cwd(), fileName), sqlContent, 'utf-8');
  console.log(`Generated ${fileName} (${(sqlContent.length / 1024).toFixed(1)} KB)`);
});
