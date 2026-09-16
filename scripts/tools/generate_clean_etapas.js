import fs from 'fs';
import path from 'path';

const content = fs.readFileSync(path.join(process.cwd(), 'backup_dados_inserts.sql'), 'utf-8');

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

// Helper to parse tuples from an INSERT statement string correctly without breaking SQL strings
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
          // Escaped quote ''
          current += "''";
          i++; // skip next quote
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
      if (nextChar === ',') i++; // skip comma
    }
  }

  return { prefix, tuples };
}

// Clean old files
const filesInDir = fs.readdirSync(process.cwd());
filesInDir.forEach(f => {
  if (f.startsWith('etapa_') && f.endsWith('.sql')) {
    fs.unlinkSync(path.join(process.cwd(), f));
  }
});

const blocks = content.split(/-- Data for Name: /);
let stageIndex = 1;

blocks.forEach((block, idx) => {
  if (idx === 0) return;
  const lines = block.split(/\r?\n/);
  const tableName = lines[0].split(';')[0].trim();

  // Skip documentos_arthromed because user already successfully executed it!
  if (tableName === 'documentos_arthromed') {
    console.log(`Skipping ${tableName} (already imported)`);
    return;
  }

  const insertIdx = block.indexOf('INSERT INTO');
  if (insertIdx === -1) {
    if (block.trim().length > 0) {
      const fileName = `etapa_${String(stageIndex).padStart(2, '0')}_${tableName}.sql`;
      fs.writeFileSync(path.join(process.cwd(), fileName), header + '\n-- Data for Name: ' + block, 'utf-8');
      console.log(`Generated ${fileName} (${(block.length/1024).toFixed(1)} KB)`);
      stageIndex++;
    }
    return;
  }

  const insertSql = block.substring(insertIdx).trim();
  const { prefix, tuples } = parseTuples(insertSql);

  console.log(`Table ${tableName}: parsed ${tuples.length} tuples.`);

  let currentBatch = [];
  let currentBatchSize = 0;
  let partNumber = 1;

  for (let t of tuples) {
    // If a single tuple is large or adding it exceeds 400KB limit, save current batch
    if (currentBatchSize + t.length > 400000 && currentBatch.length > 0) {
      const fileName = `etapa_${String(stageIndex).padStart(2, '0')}_${tableName}_p${partNumber}.sql`;
      const sqlContent = header + '\n\n' + prefix + '\n  ' + currentBatch.join(',\n  ') + ';';
      fs.writeFileSync(path.join(process.cwd(), fileName), sqlContent, 'utf-8');
      console.log(`Generated ${fileName} (${(sqlContent.length / 1024).toFixed(1)} KB)`);
      stageIndex++;
      partNumber++;
      currentBatch = [t];
      currentBatchSize = t.length;
    } else {
      currentBatch.push(t);
      currentBatchSize += t.length;
    }
  }

  if (currentBatch.length > 0) {
    const fileName = `etapa_${String(stageIndex).padStart(2, '0')}_${tableName}_p${partNumber}.sql`;
    const sqlContent = header + '\n\n' + prefix + '\n  ' + currentBatch.join(',\n  ') + ';';
    fs.writeFileSync(path.join(process.cwd(), fileName), sqlContent, 'utf-8');
    console.log(`Generated ${fileName} (${(sqlContent.length / 1024).toFixed(1)} KB)`);
    stageIndex++;
  }
});

console.log('\nAll clean etapa files generated successfully!');
