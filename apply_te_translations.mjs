import fs from 'fs';
import path from 'path';

const newTeKeys = {
  'symptom.frontView': 'ముందు వీక్షణ',
  'symptom.backView': 'వెనుక వీక్షణ',
  'symptom.tapToBegin': 'ప్రారంభించడానికి నొక్కండి',
  'symptom.severity.mild.label': 'తేలికపాటి',
  'symptom.severity.mild.desc': 'చిరాకుగా ఉంది కానీ నేను ఇంట్లో నిర్వహించగలను',
  'symptom.severity.moderate.label': 'మధ్యస్థం',
  'symptom.severity.moderate.desc': 'గమనించదగ్గది, నా రోజువారీ కార్యకలాపాలను ప్రభావితం చేస్తుంది',
  'symptom.severity.severe.label': 'తీవ్రమైన',
  'symptom.severity.severe.desc': 'భరించడం చాలా కష్టం, సాధారణ పనులు చేయలేను',
  'symptom.severity.extreme.label': 'అత్యంత తీవ్రమైన',
  'symptom.severity.extreme.desc': 'భరించలేనిది, నాకు తక్షణ సహాయం కావాలి',
  'symptom.thinking': 'సరైన ప్రశ్న గురించి ఆలోచిస్తోంది...',
  'symptom.back': 'వెనుకకు',
  'symptom.assessment.needsDoctor': 'మీ లక్షణాలకు వైద్యుని ప్రత్యక్ష అంచనా అవసరం',
  'symptom.assessment.lowConfidenceDesc': 'మీరు అందించిన సమాచారం ఆధారంగా, మేము అత్యంత నమ్మకమైన అంచనా వేయలేము. కింది విశ్లేషణ ఒక ఉత్తమ అంచనా, కానీ దయచేసి నిపుణుడిని సంప్రదించండి.',
  'symptom.assessment.findDoctors': 'సమీపంలోని వైద్యులను కనుగొనండి',
  'symptom.assessment.yourAssessment': 'మీ అంచనా',
  'symptom.assessment.basedOnSymptoms': 'మీ లక్షణాల ఆధారంగా, మేము కనుగొన్నది ఇక్కడ ఉంది.',
  'symptom.assessment.urgency': 'అత్యవసరం',
  'symptom.assessment.nextSteps': 'సిఫార్సు చేయబడిన తదుపరి దశలు',
  'symptom.assessment.exportPdf': 'PDF ఎగుమతి చేయండి',
  'symptom.assessment.share': 'భాగస్వామ్యం చేయండి',
  'symptom.assessment.disclaimer': 'నిరాకరణ:',
};

const i18nDir = 'c:/CLAUDE CSP/samaramai/client/src/i18n';
const p = path.join(i18nDir, 'te.ts');
let content = fs.readFileSync(p, 'utf8');

let additions = '\n';
for (const [k, v] of Object.entries(newTeKeys)) {
  additions += `  '${k}': '${v.replace(/'/g, "\\'")}',\n`;
}

content = content.replace(/\};\s*export\s+default\s+[a-z]+;\s*$/, (match) => additions + match);
fs.writeFileSync(p, content, 'utf8');
console.log('Updated te.ts');
