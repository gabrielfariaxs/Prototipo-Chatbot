import fs from 'fs';
import path from 'path';

const inputFile = path.join(process.cwd(), 'backup_dados_inserts.sql');
const content = fs.readFileSync(inputFile, 'utf-8');

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

const tableBlocks = content.split(/--\r?\n-- Data for Name: /);
let outputFiles = [];
const MAX_FILE_SIZE = 350000; // 350 KB max to be super safe

tableBlocks.forEach((block, idx) => {
  if (idx === 0) return;
  const lines = block.split(/\r?\n/);
  const tableNameMatch = lines[0].match(/^([a-zA-Z0-9_]+);/);
  const tableName = tableNameMatch ? tableNameMatch[1] : `table_${idx}`;

  const insertIndex = block.indexOf('INSERT INTO');
  if (insertIndex === -1) return;

  const insertQuery = block.substring(insertIndex).trim();
  const valuesPos = insertQuery.indexOf(' VALUES');
  const statementPrefix = insertQuery.substring(0, valuesPos + 7);
  const tuplesString = insertQuery.substring(valuesPos + 7, insertQuery.lastIndexOf(';')).trim();

  const tuples = [];
  let currentTuple = '';
  let inQuotes = false;
  let quoteChar = '';

  for (let i = 0; i < tuplesString.length; i++) {
    const char = tuplesString[i];
    const nextChar = tuplesString[i + 1];

    if ((char === "'" || char === '"') && tuplesString[i - 1] !== '\\') {
      if (!inQuotes) {
        inQuotes = true;
        quoteChar = char;
      } else if (quoteChar === char) {
        if (char === "'" && nextChar === "'") {
          currentTuple += "''";
          i++;
          continue;
        } else {
          inQuotes = false;
        }
      }
    }

    currentTuple += char;

    if (!inQuotes && char === ')' && (nextChar === ',' || i === tuplesString.length - 1)) {
      tuples.push(currentTuple.trim());
      currentTuple = '';
      if (nextChar === ',') i++;
    }
  }

  let currentChunk = [];
  let currentChunkSize = 0;
  let subPart = 1;

  for (let tuple of tuples) {
    if (tuple.startsWith(',')) tuple = tuple.substring(1).trim();
    if (!tuple.startsWith('(')) tuple = '(' + tuple;

    if ((currentChunkSize + tuple.length > MAX_FILE_SIZE) && currentChunk.length > 0) {
      const fileContent = header + '\n\n' + statementPrefix + '\n  ' + currentChunk.join(',\n  ') + ';';
      const fileNum = String(outputFiles.length + 1).padStart(2, '0');
      const fileName = `etapa_${fileNum}_${tableName}_p${subPart}.sql`;
      fs.writeFileSync(path.join(process.cwd(), fileName), fileContent, 'utf-8');
      outputFiles.push({ name: fileName, size: (fileContent.length / 1024).toFixed(0) + ' KB' });
      subPart++;
      currentChunk = [tuple];
      currentChunkSize = tuple.length;
    } else {
      currentChunk.push(tuple);
      currentChunkSize += tuple.length;
    }
  }

  if (currentChunk.length > 0) {
    const fileContent = header + '\n\n' + statementPrefix + '\n  ' + currentChunk.join(',\n  ') + ';';
    const fileNum = String(outputFiles.length + 1).padStart(2, '0');
    const fileName = `etapa_${fileNum}_${tableName}_p${subPart}.sql`;
    fs.writeFileSync(path.join(process.cwd(), fileName), fileContent, 'utf-8');
    outputFiles.push({ name: fileName, size: (fileContent.length / 1024).toFixed(0) + ' KB' });
  }
});

console.log('\nSUCCESS! Generated files (all <= 390KB):');
outputFiles.forEach(f => console.log(` - ${f.name} (${f.size})`));
