import fs from 'fs';
import path from 'path';

const inputFile = path.join(process.cwd(), 'backup_dados_inserts.sql');
const content = fs.readFileSync(inputFile, 'utf-8');

// Match each table section or INSERT statement
const header = content.substring(0, content.indexOf('INSERT INTO'));

// Split into statements starting with INSERT INTO
const matches = content.match(/INSERT INTO[\s\S]*?;/g) || [];

console.log(`Found ${matches.length} INSERT statements.`);

let filesCount = 0;
let currentBuffer = header;

function saveFile(buffer) {
  filesCount++;
  const name = `dados_parte_${filesCount}.sql`;
  fs.writeFileSync(path.join(process.cwd(), name), buffer, 'utf-8');
  console.log(`Saved ${name} (${(buffer.length / 1024 / 1024).toFixed(2)} MB)`);
}

for (const stmt of matches) {
  if (stmt.length > 1500000) {
    // If a single INSERT statement is larger than 1.5MB, split its VALUES rows!
    const insertHeaderMatch = stmt.match(/INSERT INTO.*VALUES/s);
    if (insertHeaderMatch) {
      const insertHeader = insertHeaderMatch[0];
      const valuesPart = stmt.substring(insertHeader.length, stmt.lastIndexOf(';')).trim();
      
      // Split rows by "), (" or "),\n"
      // Match tuple rows: \(\d+,[\s\S]*?\)(?=,\r?\n\s*\(|;|\s*$)
      const rows = valuesPart.split(/,\r?\n\s*\(/).map((r, idx) => {
        let trimmed = r.trim();
        if (idx > 0 && !trimmed.startsWith('(')) trimmed = '(' + trimmed;
        if (idx < valuesPart.split(/,\r?\n\s*\(/).length - 1 && !trimmed.endsWith(')')) {
          // ensure row ends with )
        }
        return trimmed;
      });

      console.log(`Splitting large INSERT statement with ${rows.length} rows...`);

      let currentRows = [];
      let currentRowsSize = 0;

      for (let r of rows) {
        if (currentRowsSize + r.length > 1200000 && currentRows.length > 0) {
          if (currentBuffer.length > header.length + 50) {
            saveFile(currentBuffer);
            currentBuffer = header;
          }
          const chunkStmt = insertHeader + '\n  ' + currentRows.join(',\n  ') + ';';
          saveFile(header + chunkStmt);
          currentRows = [r];
          currentRowsSize = r.length;
        } else {
          currentRows.push(r);
          currentRowsSize += r.length;
        }
      }
      if (currentRows.length > 0) {
        const chunkStmt = insertHeader + '\n  ' + currentRows.join(',\n  ') + ';';
        if (currentBuffer.length + chunkStmt.length > 1500000) {
          if (currentBuffer.length > header.length + 50) saveFile(currentBuffer);
          saveFile(header + chunkStmt);
          currentBuffer = header;
        } else {
          currentBuffer += '\n\n' + chunkStmt;
        }
      }
    } else {
      currentBuffer += '\n\n' + stmt;
    }
  } else {
    if (currentBuffer.length + stmt.length > 1500000) {
      saveFile(currentBuffer);
      currentBuffer = header + '\n\n' + stmt;
    } else {
      currentBuffer += '\n\n' + stmt;
    }
  }
}

if (currentBuffer.length > header.length + 50) {
  saveFile(currentBuffer);
}

console.log(`Done! Created ${filesCount} files.`);
