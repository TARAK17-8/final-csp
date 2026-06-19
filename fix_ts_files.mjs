import fs from 'fs';
import path from 'path';

const i18nDir = 'c:/CLAUDE CSP/samaramai/client/src/i18n';
const files = ['hi.ts', 'kn.ts', 'ml.ts', 'ta.ts', 'te.ts'];

for (const file of files) {
  const filePath = path.join(i18nDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace literal '\n' sequences with actual newlines
  content = content.replace(/\\n/g, '\n');
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Fixed ${file}`);
}
