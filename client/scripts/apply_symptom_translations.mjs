import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const newEnKeys = {
  'symptom.frontView': 'Front View',
  'symptom.backView': 'Back View',
  'symptom.tapToBegin': 'tap to begin',
  'symptom.severity.mild.label': 'MILD',
  'symptom.severity.mild.desc': 'Annoying but I can manage at home',
  'symptom.severity.moderate.label': 'MODERATE',
  'symptom.severity.moderate.desc': 'Noticeable, affecting my daily activities',
  'symptom.severity.severe.label': 'SEVERE',
  'symptom.severity.severe.desc': "Very hard to bear, can't do normal things",
  'symptom.severity.extreme.label': 'EXTREME',
  'symptom.severity.extreme.desc': 'Unbearable, I need help immediately',
  'symptom.thinking': 'Thinking of the right question...',
  'symptom.back': 'Back',
  'symptom.assessment.needsDoctor': "Your symptoms need a doctor's direct assessment",
  'symptom.assessment.lowConfidenceDesc': "Based on the information you provided, we cannot make a highly confident assessment. The following analysis is a best-guess, but please consult a professional.",
  'symptom.assessment.findDoctors': 'Find Nearby Doctors',
  'symptom.assessment.yourAssessment': 'Your Assessment',
  'symptom.assessment.basedOnSymptoms': "Based on your symptoms, here's what we found.",
  'symptom.assessment.urgency': 'urgency',
  'symptom.assessment.nextSteps': 'Recommended Next Steps',
  'symptom.assessment.exportPdf': 'Export PDF',
  'symptom.assessment.share': 'Share',
  'symptom.assessment.disclaimer': 'Disclaimer:',
};

const languages = [
  { code: 'te', name: 'Telugu' },
  { code: 'hi', name: 'Hindi' },
  { code: 'ta', name: 'Tamil' },
  { code: 'kn', name: 'Kannada' },
  { code: 'ml', name: 'Malayalam' },
];

async function updateTranslations() {
  const i18nDir = path.resolve(__dirname, '../src/i18n');
  
  // 1. Update en.ts
  let enContent = fs.readFileSync(path.join(i18nDir, 'en.ts'), 'utf8');
  let enAdditions = '\n';
  for (const [k, v] of Object.entries(newEnKeys)) {
    enAdditions += `  '${k}': '${v.replace(/'/g, "\\'")}',\n`;
  }
  enContent = enContent.replace(/\};\s*export\s+default\s+[a-z]+;\s*$/, (match) => {
    return enAdditions + match;
  });
  fs.writeFileSync(path.join(i18nDir, 'en.ts'), enContent, 'utf8');

  // 2. Translate and update others
  for (const lang of languages) {
    console.log(`Translating to ${lang.name}...`);
    try {
      const res = await fetch('http://127.0.0.1:3001/api/translate/ui', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetLanguageName: lang.name,
          sourceKeys: newEnKeys
        })
      });
      const data = await res.json();
      if (data.success && data.data) {
        let additions = '\n';
        for (const [k, v] of Object.entries(data.data)) {
          additions += `  '${k}': '${String(v).replace(/'/g, "\\'")}',\n`;
        }
        const p = path.join(i18nDir, `${lang.code}.ts`);
        let content = fs.readFileSync(p, 'utf8');
        content = content.replace(/\};\s*export\s+default\s+[a-z]+;\s*$/, (match) => additions + match);
        fs.writeFileSync(p, content, 'utf8');
        console.log(`Updated ${lang.code}.ts`);
      }
    } catch (e) {
      console.error('Error for', lang.name, e);
    }
  }
}
updateTranslations();
