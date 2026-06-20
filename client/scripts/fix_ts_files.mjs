import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const i18nDir = path.resolve(__dirname, '../src/i18n');
const files = ['hi.ts', 'kn.ts', 'ml.ts', 'ta.ts', 'te.ts'];

for (const file of files) {
  const filePath = path.join(i18nDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace literal '\n' sequences with actual newlines
  content = content.replace(/\\n/g, '\n');
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Fixed ${file}`);
}
