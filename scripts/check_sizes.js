import fs from 'fs';
import path from 'path';

const content = fs.readFileSync(path.join(process.cwd(), 'backup_dados_inserts.sql'), 'utf-8');

// Match table sections
const blocks = content.split(/-- Data for Name: /);

blocks.forEach((block, idx) => {
  if (idx === 0) return;
  const lines = block.split(/\r?\n/);
  const tableName = lines[0].split(';')[0].trim();
  console.log(`Table ${tableName}: total size ${(block.length / 1024).toFixed(1)} KB`);
});
