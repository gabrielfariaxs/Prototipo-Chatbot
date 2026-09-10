import fs from 'fs';
import path from 'path';

const content = fs.readFileSync(path.join(process.cwd(), 'backup_dados.sql'), 'utf-8');

const copyIdx = content.indexOf('COPY public.ti_chamados');
if (copyIdx === -1) {
  console.log('COPY public.ti_chamados not found!');
  process.exit(1);
}

const copyBlock = content.substring(copyIdx);
const endIdx = copyBlock.indexOf('\\.\n');
const dataText = copyBlock.substring(copyBlock.indexOf('\n') + 1, endIdx);

const rows = dataText.trim().split('\n');
console.log(`Original COPY data has ${rows.length} rows for ti_chamados!`);

rows.forEach((r, idx) => {
  const fields = r.split('\t');
  console.log(`Row ${idx + 1}: ID=${fields[0]}, Code=${fields[1]}, Title=${fields[2]}`);
});
