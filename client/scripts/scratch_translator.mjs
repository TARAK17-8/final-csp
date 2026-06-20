import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const langs = [
  { code: 'hi', name: 'Hindi' },
  { code: 'ta', name: 'Tamil' },
  { code: 'te', name: 'Telugu' },
  { code: 'kn', name: 'Kannada' },
  { code: 'ml', name: 'Malayalam' },
];

const basePath = path.resolve(__dirname, '../src/i18n');

const enObject = {
  "features.symptomChecker.badge": "AI Symptom Checker",
  "features.symptomChecker.title": "Tap where it hurts. No typing needed.",
  "features.symptomChecker.bullet1": "Interactive anatomical body diagram with 18 regions",
  "features.symptomChecker.bullet2": "Adaptive AI questions — gets smarter with each answer",
  "features.symptomChecker.bullet3": "Emergency patterns detected in real-time, always",
  "features.symptomChecker.cta": "Try the Symptom Checker",
  "features.prescription.badge": "Prescription Translator",
  "features.prescription.title": "Upload a prescription. Read it in your language.",
  "features.prescription.bullet1": "Extracts text from handwritten or printed prescriptions",
  "features.prescription.bullet2": "Translates complex medical terms to simple language",
  "features.prescription.bullet3": "Provides clear dosage instructions and AI explanations",
  "features.prescription.cta": "Translate Prescription",
  "features.prescription.translated": "Translated",
  "features.medicine.badge": "Medicine Scanner",
  "features.medicine.title": "Point your camera. Know your medicine.",
  "features.medicine.bullet1": "AI reads medicine names, dosage, and expiry from any strip",
  "features.medicine.bullet2": "Instant drug interaction checks against your medications",
  "features.medicine.bullet3": "Works in 5 Indian languages — speaks your pharmacy",
  "features.medicine.cta": "Scan a Medicine",
  "features.emergency.badge": "Emergency Triage",
  "features.emergency.title": "23 emergency patterns. Detected instantly. Always rule-based.",
  "features.emergency.bullet1": "Never AI — always deterministic pattern matching",
  "features.emergency.bullet2": "Instant 108 connection with one tap",
  "features.emergency.bullet3": "Nearest hospitals mapped in real-time",
  "features.emergency.cta": "Learn About Safety",
  "features.voice.badge": "Voice Assistant",
  "features.voice.title": "Speak your symptoms. Let AI do the rest.",
  "features.voice.bullet1": "Natural voice conversations in multiple Indian languages",
  "features.voice.bullet2": "Automatically maps voice to medical terminology",
  "features.voice.bullet3": "No need to type long paragraphs of symptoms",
  "features.voice.cta": "Try Voice Assistant",
  "features.records.badge": "Health Records",
  "features.records.title": "Your entire health story. Always with you.",
  "features.records.bullet1": "Track vitals, lab results, medications in one place",
  "features.records.bullet2": "Trend charts show your health journey over time",
  "features.records.bullet3": "Scan lab reports — AI reads and files them automatically",
  "features.records.cta": "View Dashboard Preview",
  "features.factChecker.badge": "Fact Checker",
  "features.factChecker.title": "Received a health forward? Verify it in 10 seconds.",
  "features.factChecker.bullet1": "Paste any WhatsApp health claim for instant verification",
  "features.factChecker.bullet2": "Grounded in WHO, ICMR, and peer-reviewed evidence",
  "features.factChecker.bullet3": "Share corrections directly back to WhatsApp",
  "features.factChecker.cta": "Check a Health Claim",
  "prescriptionTranslator.title": "Prescription Translator",
  "prescriptionTranslator.subtitle": "Upload a prescription and get it translated into your preferred language with AI-powered explanations.",
  "prescriptionTranslator.uploadTitle": "Upload Prescription",
  "prescriptionTranslator.dragDrop": "Drag & drop your prescription here",
  "prescriptionTranslator.browseFiles": "Browse Files",
  "prescriptionTranslator.cameraCapture": "Take Photo",
  "prescriptionTranslator.selectLanguage": "Translate to",
  "prescriptionTranslator.translate": "Translate Prescription",
  "prescriptionTranslator.processing": "Processing your prescription...",
  "prescriptionTranslator.stepOcr": "Extracting text from image...",
  "prescriptionTranslator.stepCleanup": "Cleaning up OCR text...",
  "prescriptionTranslator.stepTranslation": "Translating prescription...",
  "prescriptionTranslator.stepExplanation": "Generating explanation...",
  "prescriptionTranslator.ocrResult": "Extracted Text",
  "prescriptionTranslator.translatedText": "Translated Prescription",
  "prescriptionTranslator.explanation": "What This Prescription Means",
  "prescriptionTranslator.medicineTable": "Medicine Details",
  "prescriptionTranslator.medicineName": "Medicine",
  "prescriptionTranslator.dosage": "Dosage",
  "prescriptionTranslator.frequency": "Frequency",
  "prescriptionTranslator.duration": "Duration",
  "prescriptionTranslator.instructions": "Instructions",
  "prescriptionTranslator.notSpecified": "Not specified in prescription",
  "prescriptionTranslator.confidence": "AI Confidence",
  "prescriptionTranslator.confidenceHigh": "High",
  "prescriptionTranslator.confidenceMedium": "Medium",
  "prescriptionTranslator.confidenceLow": "Low",
  "prescriptionTranslator.safetyNotice": "AI-generated translation. Please verify all prescription details with a qualified healthcare professional before taking any medication.",
  "prescriptionTranslator.copyText": "Copy Text",
  "prescriptionTranslator.copied": "Copied!",
  "prescriptionTranslator.downloadPdf": "Download PDF",
  "prescriptionTranslator.downloadTxt": "Download TXT",
  "prescriptionTranslator.reset": "Translate Another",
  "prescriptionTranslator.history": "Translation History",
  "prescriptionTranslator.noHistory": "No previous translations",
  "prescriptionTranslator.saveToHistory": "Save to History",
  "prescriptionTranslator.saved": "Saved!",
  "prescriptionTranslator.viewReport": "View Report",
  "prescriptionTranslator.deleteHistory": "Delete",
  "prescriptionTranslator.unclearText": "[Unclear Text Detected]",
  "prescriptionTranslator.invalidFile": "Invalid file format. Please upload a JPG, PNG, or WebP image.",
  "prescriptionTranslator.fileTooLarge": "File is too large. Maximum size is 10MB.",
  "prescriptionTranslator.ocrFailed": "Could not read the prescription. Please try a clearer photo.",
  "prescriptionTranslator.translationFailed": "Translation failed. Please try again.",
  "prescriptionTranslator.generalInstructions": "General Instructions",
  "prescriptionTranslator.followUp": "Follow-up Note",
  "hero.stripPrescriptionTranslator": "Prescription Translator",
  "hero.stripSymptomChecker": "Symptom Checker"
};

async function run() {
  for (const lang of langs) {
    console.log('Translating to', lang.name, '...');
    const res = await fetch('http://localhost:3001/api/translate/ui', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        targetLanguageName: lang.name,
        sourceKeys: enObject
      })
    });
    
    if (!res.ok) {
      console.error('Failed API call for', lang.name, await res.text());
      continue;
    }
    
    const data = await res.json();
    if (!data.success) {
      console.error('Failed to translate for', lang.name, data);
      continue;
    }
    
    const translatedObj = data.data;
    
    const filePath = path.join(basePath, lang.code + '.ts');
    let content = fs.readFileSync(filePath, 'utf-8');
    
    let additions = '\\n';
    for (const [k, v] of Object.entries(translatedObj)) {
      const escapedVal = String(v).replace(/'/g, "\\\\'");
      additions += "  '" + k + "': '" + escapedVal + "',\\n";
    }
    
    content = content.replace(/\\};\\s*export\\s+default\\s+[a-z]+;\\s*$/, (match) => {
      return additions + match;
    });
    
    fs.writeFileSync(filePath, content);
    console.log('Successfully updated', filePath);
  }
}

run().catch(console.error);
