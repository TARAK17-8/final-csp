import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const mockTranslations = {
  en: {
    "hero.mock.acidReflux": "Acid Reflux (GERD)",
    "hero.mock.connected108": "108 Connected",
    "showcase.mock.paracetamol": "Paracetamol",
    "showcase.mock.take1Tablet": "Take 1 tablet after food",
    "showcase.mock.amoxicillin": "Amoxicillin",
    "showcase.mock.takeTwiceDaily": "Take twice daily for 5 days",
    "showcase.mock.paracetamol500": "Paracetamol 500mg",
    "showcase.mock.ciplaExp": "Cipla Ltd · Exp: 12/2026",
    "showcase.mock.noInteractions": "✓ No interactions",
    "showcase.mock.tapToCall": "TAP TO CALL",
    "showcase.mock.langTelugu": "Telugu",
    "showcase.mock.langHindi": "Hindi",
    "showcase.mock.langTamil": "Tamil",
    "showcase.mock.langKannada": "Kannada",
    "showcase.mock.langEnglish": "English",
    "showcase.mock.vitals": "Vitals",
    "showcase.mock.today": "Today",
    "showcase.mock.heartRate": "Heart Rate",
    "showcase.mock.bloodPressure": "Blood Pressure",
    "showcase.mock.bloodSugar": "Blood Sugar",
    "showcase.mock.misleading": "MISLEADING",
    "showcase.mock.diabetesClaim": "\"Drinking warm water with lemon cures diabetes naturally\"",
    "showcase.mock.diabetesFact": "This claim is not supported by medical evidence. Diabetes requires proper medical treatment."
  },
  hi: {
    "hero.mock.acidReflux": "एसिड रिफ्लक्स (जीईआरडी)",
    "hero.mock.connected108": "108 कनेक्टेड",
    "showcase.mock.paracetamol": "पैरासिटामोल",
    "showcase.mock.take1Tablet": "भोजन के बाद 1 गोली लें",
    "showcase.mock.amoxicillin": "अमोक्सिसिलिन",
    "showcase.mock.takeTwiceDaily": "5 दिनों के लिए दिन में दो बार लें",
    "showcase.mock.paracetamol500": "पैरासिटामोल 500mg",
    "showcase.mock.ciplaExp": "Cipla Ltd · समाप्ति: 12/2026",
    "showcase.mock.noInteractions": "✓ कोई इंटरैक्शन नहीं",
    "showcase.mock.tapToCall": "कॉल करने के लिए टैप करें",
    "showcase.mock.langTelugu": "तेलुगु",
    "showcase.mock.langHindi": "हिन्दी",
    "showcase.mock.langTamil": "तमिल",
    "showcase.mock.langKannada": "कन्नड़",
    "showcase.mock.langEnglish": "अंग्रेज़ी",
    "showcase.mock.vitals": "महत्वपूर्ण आँकड़े",
    "showcase.mock.today": "आज",
    "showcase.mock.heartRate": "हृदय गति",
    "showcase.mock.bloodPressure": "रक्तचाप",
    "showcase.mock.bloodSugar": "रक्त शर्करा",
    "showcase.mock.misleading": "भ्रामक",
    "showcase.mock.diabetesClaim": "\"नींबू के साथ गर्म पानी पीने से मधुमेह स्वाभाविक रूप से ठीक हो जाता है\"",
    "showcase.mock.diabetesFact": "यह दावा चिकित्सा साक्ष्य द्वारा समर्थित नहीं है। मधुमेह के लिए उचित चिकित्सा उपचार की आवश्यकता होती है।"
  },
  ta: {
    "hero.mock.acidReflux": "நெஞ்செரிச்சல் (GERD)",
    "hero.mock.connected108": "108 இணைக்கப்பட்டுள்ளது",
    "showcase.mock.paracetamol": "பாரசிட்டமால்",
    "showcase.mock.take1Tablet": "உணவுக்குப் பிறகு 1 மாத்திரை எடுக்கவும்",
    "showcase.mock.amoxicillin": "அமாக்சிசிலின்",
    "showcase.mock.takeTwiceDaily": "5 நாட்களுக்கு தினமும் இருமுறை எடுக்கவும்",
    "showcase.mock.paracetamol500": "பாரசிட்டமால் 500mg",
    "showcase.mock.ciplaExp": "Cipla Ltd · காலாவதி: 12/2026",
    "showcase.mock.noInteractions": "✓ ஊடாடல்கள் இல்லை",
    "showcase.mock.tapToCall": "அழைக்க தட்டவும்",
    "showcase.mock.langTelugu": "தெலுங்கு",
    "showcase.mock.langHindi": "இந்தி",
    "showcase.mock.langTamil": "தமிழ்",
    "showcase.mock.langKannada": "கன்னடம்",
    "showcase.mock.langEnglish": "ஆங்கிலம்",
    "showcase.mock.vitals": "அடிப்படைகள்",
    "showcase.mock.today": "இன்று",
    "showcase.mock.heartRate": "இதய துடிப்பு",
    "showcase.mock.bloodPressure": "இரத்த அழுத்தம்",
    "showcase.mock.bloodSugar": "இரத்த சர்க்கரை",
    "showcase.mock.misleading": "தவறாக வழிநடத்துவது",
    "showcase.mock.diabetesClaim": "\"எலுமிச்சையுடன் சூடான நீர் குடிப்பது சர்க்கரை நோயை இயற்கையாக குணப்படுத்துகிறது\"",
    "showcase.mock.diabetesFact": "இந்த கூற்றுக்கு மருத்துவ சான்றுகள் இல்லை. சர்க்கரை நோய்க்கு சரியான மருத்துவ சிகிச்சை தேவை."
  },
  te: {
    "hero.mock.acidReflux": "యాసిడ్ రిఫ్లక్స్ (GERD)",
    "hero.mock.connected108": "108 కనెక్ట్ చేయబడింది",
    "showcase.mock.paracetamol": "పారాసెటమాల్",
    "showcase.mock.take1Tablet": "భోజనం తర్వాత 1 టాబ్లెట్ తీసుకోండి",
    "showcase.mock.amoxicillin": "అమోక్సిసిలిన్",
    "showcase.mock.takeTwiceDaily": "5 రోజుల పాటు రోజుకు రెండుసార్లు తీసుకోండి",
    "showcase.mock.paracetamol500": "పారాసెటమాల్ 500mg",
    "showcase.mock.ciplaExp": "Cipla Ltd · గడువు: 12/2026",
    "showcase.mock.noInteractions": "✓ ఇంటరాక్షన్స్ లేవు",
    "showcase.mock.tapToCall": "కాల్ చేయడానికి నొక్కండి",
    "showcase.mock.langTelugu": "తెలుగు",
    "showcase.mock.langHindi": "హిందీ",
    "showcase.mock.langTamil": "తమిళం",
    "showcase.mock.langKannada": "కన్నడ",
    "showcase.mock.langEnglish": "ఆంగ్లం",
    "showcase.mock.vitals": "వైటల్స్",
    "showcase.mock.today": "నేడు",
    "showcase.mock.heartRate": "హృదయ స్పందన",
    "showcase.mock.bloodPressure": "రక్తపోటు",
    "showcase.mock.bloodSugar": "రక్తంలో చక్కెర",
    "showcase.mock.misleading": "తప్పుదారి పట్టించేది",
    "showcase.mock.diabetesClaim": "\"నిమ్మకాయతో వేడి నీరు తాగితే మధుమేహం సహజంగా నయమవుతుంది\"",
    "showcase.mock.diabetesFact": "ఈ వాదనకు వైద్య ఆధారాలు లేవు. మధుమేహానికి సరైన వైద్య చికిత్స అవసరం."
  },
  kn: {
    "hero.mock.acidReflux": "ಆಸಿಡ್ ರಿಫ್ಲಕ್ಸ್ (GERD)",
    "hero.mock.connected108": "108 ಸಂಪರ್ಕಗೊಂಡಿದೆ",
    "showcase.mock.paracetamol": "ಪ್ಯಾರಾಸಿಟಮಾಲ್",
    "showcase.mock.take1Tablet": "ಊಟದ ನಂತರ 1 ಮಾತ್ರೆ ತೆಗೆದುಕೊಳ್ಳಿ",
    "showcase.mock.amoxicillin": "ಅಮೋಕ್ಸಿಸಿಲಿನ್",
    "showcase.mock.takeTwiceDaily": "5 ದಿನಗಳವರೆಗೆ ದಿನಕ್ಕೆ ಎರಡು ಬಾರಿ ತೆಗೆದುಕೊಳ್ಳಿ",
    "showcase.mock.paracetamol500": "ಪ್ಯಾರಾಸಿಟಮಾಲ್ 500mg",
    "showcase.mock.ciplaExp": "Cipla Ltd · ಮುಕ್ತಾಯ: 12/2026",
    "showcase.mock.noInteractions": "✓ ಯಾವುದೇ ಪರಸ್ಪರ ಕ್ರಿಯೆಗಳಿಲ್ಲ",
    "showcase.mock.tapToCall": "ಕರೆ ಮಾಡಲು ಟ್ಯಾಪ್ ಮಾಡಿ",
    "showcase.mock.langTelugu": "ತೆಲುಗು",
    "showcase.mock.langHindi": "ಹಿಂದಿ",
    "showcase.mock.langTamil": "ತಮಿಳು",
    "showcase.mock.langKannada": "ಕನ್ನಡ",
    "showcase.mock.langEnglish": "ಇಂಗ್ಲಿಷ್",
    "showcase.mock.vitals": "ಪ್ರಮುಖಾಂಶಗಳು",
    "showcase.mock.today": "ಇಂದು",
    "showcase.mock.heartRate": "ಹೃದಯ ಬಡಿತ",
    "showcase.mock.bloodPressure": "ರಕ್ತದೊತ್ತಡ",
    "showcase.mock.bloodSugar": "ರಕ್ತದ ಸಕ್ಕರೆ",
    "showcase.mock.misleading": "ತಪ್ಪುದಾರಿಗೆಳೆಯುವಂತಹುದು",
    "showcase.mock.diabetesClaim": "\"ನಿಂಬೆಯೊಂದಿಗೆ ಬಿಸಿ ನೀರನ್ನು ಕುಡಿಯುವುದರಿಂದ ಮಧುಮೇಹವು ನೈಸರ್ಗಿಕವಾಗಿ ಗುಣವಾಗುತ್ತದೆ\"",
    "showcase.mock.diabetesFact": "ಈ ಹಕ್ಕು ವೈದ್ಯಕೀಯ ಪುರಾವೆಗಳಿಂದ ಬೆಂಬಲಿತವಾಗಿಲ್ಲ. ಮಧುಮೇಹಕ್ಕೆ ಸರಿಯಾದ ವೈದ್ಯಕೀಯ ಚಿಕಿತ್ಸೆಯ ಅಗತ್ಯವಿದೆ."
  },
  ml: {
    "hero.mock.acidReflux": "ആസിഡ് റിഫ്ലക്സ് (GERD)",
    "hero.mock.connected108": "108 കണക്റ്റുചെയ്‌തു",
    "showcase.mock.paracetamol": "പാരസെറ്റമോൾ",
    "showcase.mock.take1Tablet": "ഭക്ഷണത്തിന് ശേഷം 1 ഗുളിക കഴിക്കുക",
    "showcase.mock.amoxicillin": "അമോക്സിസിലിൻ",
    "showcase.mock.takeTwiceDaily": "5 ദിവസത്തേക്ക് ദിവസത്തിൽ രണ്ടുതവണ കഴിക്കുക",
    "showcase.mock.paracetamol500": "പാരസെറ്റമോൾ 500mg",
    "showcase.mock.ciplaExp": "Cipla Ltd · കാലഹരണപ്പെടൽ: 12/2026",
    "showcase.mock.noInteractions": "✓ ഇടപെടലുകളൊന്നുമില്ല",
    "showcase.mock.tapToCall": "വിളിക്കാൻ ടാപ്പുചെയ്യുക",
    "showcase.mock.langTelugu": "തെലുങ്ക്",
    "showcase.mock.langHindi": "ഹിന്ദി",
    "showcase.mock.langTamil": "തമിഴ്",
    "showcase.mock.langKannada": "കന്നഡ",
    "showcase.mock.langEnglish": "ഇംഗ്ലീഷ്",
    "showcase.mock.vitals": "പ്രധാന കാര്യങ്ങൾ",
    "showcase.mock.today": "ഇന്ന്",
    "showcase.mock.heartRate": "ഹൃദയമിടിപ്പ്",
    "showcase.mock.bloodPressure": "രക്തസമ്മർദ്ദം",
    "showcase.mock.bloodSugar": "രക്തത്തിലെ പഞ്ചസാര",
    "showcase.mock.misleading": "തെറ്റിദ്ധരിപ്പിക്കുന്നത്",
    "showcase.mock.diabetesClaim": "\"നാരങ്ങ ചേർത്ത ചൂടുവെള്ളം കുടിക്കുന്നത് പ്രമേഹം സ്വാഭാവികമായി സുഖപ്പെടുത്തുന്നു\"",
    "showcase.mock.diabetesFact": "ഈ അവകാശവാദം മെഡിക്കൽ തെളിവുകളാൽ പിന്തുണയ്ക്കുന്നില്ല. പ്രമേഹത്തിന് ശരിയായ വൈദ്യചികിത്സ ആവശ്യമാണ്."
  }
};

const basePath = path.resolve(__dirname, '../src/i18n');

async function run() {
  for (const [lang, keys] of Object.entries(mockTranslations)) {
    const filePath = path.join(basePath, lang + '.ts');
    let content = fs.readFileSync(filePath, 'utf-8');
    
    let additions = '\\n';
    for (const [k, v] of Object.entries(keys)) {
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
