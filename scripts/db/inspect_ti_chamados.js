import fs from 'fs';
import path from 'path';

const content = fs.readFileSync(path.join(process.cwd(), 'backup_dados_inserts.sql'), 'utf-8');

const tiIndex = content.indexOf('Data for Name: ti_chamados');
if (tiIndex === -1) {
  console.log('ti_chamados not found!');
  process.exit(1);
}

const tiBlock = content.substring(tiIndex);
const insertIdx = tiBlock.indexOf('INSERT INTO');
const insertSql = tiBlock.substring(insertIdx, tiBlock.indexOf(';\n', insertIdx) + 1);

console.log('ti_chamados insert statement length:', insertSql.length);

// Let's find rows starting with "  (" and ending with ")," or ");"
const rows = [];
let cur = '';
let inStr = false;

for (let i = 0; i < insertSql.length; i++) {
  const c = insertSql[i];
  const nextC = insertSql[i+1];

  if (c === "'") {
    if (!inStr) {
      inStr = true;
    } else if (nextC === "'") {
      cur += "''";
      i++;
      continue;
    } else {
      inStr = false;
    }
  }

  cur += c;

  if (!inStr && c === ')' && (nextC === ',' || nextC === ';')) {
    rows.push(cur.trim());
    cur = '';
    if (nextC === ',') i++;
  }
}

console.log(`Parsed ${rows.length} rows for ti_chamados:`);
rows.forEach((r, idx) => {
  console.log(`Row ${idx+1}: length ${r.length} bytes`);
});
