// ═══════════════════════════════════════════════════════════════
// samaramAI — Symptom Checker Type Definitions
// ═══════════════════════════════════════════════════════════════

export type BodyView = 'front' | 'back';

export interface BodyRegion {
  id: string;
  name: string;
  view: BodyView;
  description: string;
  organs: string[];
  svgPathId: string;
  centerX: number;
  centerY: number;
}

export const BODY_REGIONS: BodyRegion[] = [
  // Front view (10 regions)
  { id: 'head-face', name: 'Head & Face', view: 'front', description: 'Forehead, eyes, nose, mouth, scalp, ears', organs: ['brain', 'sinuses', 'eyes', 'ears'], svgPathId: 'region-head-face', centerX: 200, centerY: 60 },
  { id: 'throat-neck', name: 'Throat & Neck', view: 'front', description: 'Neck, throat, thyroid, lymph nodes', organs: ['thyroid', 'trachea', 'lymph nodes'], svgPathId: 'region-throat-neck', centerX: 200, centerY: 120 },
  { id: 'left-chest', name: 'Left Chest', view: 'front', description: 'Cardiac region, left breast/pectoral, left rib cage', organs: ['heart', 'left lung'], svgPathId: 'region-left-chest', centerX: 230, centerY: 190 },
  { id: 'right-chest', name: 'Right Chest', view: 'front', description: 'Right lung, right breast/pectoral, right rib cage', organs: ['right lung', 'liver (upper)'], svgPathId: 'region-right-chest', centerX: 170, centerY: 190 },
  { id: 'upper-abdomen', name: 'Upper Abdomen', view: 'front', description: 'Stomach, liver, gallbladder, pancreas, spleen', organs: ['stomach', 'liver', 'gallbladder', 'pancreas', 'spleen'], svgPathId: 'region-upper-abdomen', centerX: 200, centerY: 260 },
  { id: 'lower-abdomen', name: 'Lower Abdomen', view: 'front', description: 'Intestines, bladder, appendix, pelvic area', organs: ['intestines', 'bladder', 'appendix'], svgPathId: 'region-lower-abdomen', centerX: 200, centerY: 320 },
  { id: 'left-arm', name: 'Left Shoulder & Arm', view: 'front', description: 'Shoulder joint, upper arm, elbow, forearm, wrist, hand', organs: [], svgPathId: 'region-left-arm', centerX: 305, centerY: 250 },
  { id: 'right-arm', name: 'Right Shoulder & Arm', view: 'front', description: 'Shoulder joint, upper arm, elbow, forearm, wrist, hand', organs: [], svgPathId: 'region-right-arm', centerX: 95, centerY: 250 },
  { id: 'left-leg', name: 'Left Leg', view: 'front', description: 'Hip, thigh, knee, shin, calf, ankle, foot', organs: [], svgPathId: 'region-left-leg', centerX: 230, centerY: 450 },
  { id: 'right-leg', name: 'Right Leg', view: 'front', description: 'Hip, thigh, knee, shin, calf, ankle, foot', organs: [], svgPathId: 'region-right-leg', centerX: 170, centerY: 450 },
  // Back view (8 regions)
  { id: 'back-head', name: 'Back of Head', view: 'back', description: 'Occipital region, base of skull', organs: ['cerebellum'], svgPathId: 'region-back-head', centerX: 200, centerY: 60 },
  { id: 'back-neck', name: 'Neck (Back)', view: 'back', description: 'Cervical spine, trapezius, back of neck', organs: ['cervical spine'], svgPathId: 'region-back-neck', centerX: 200, centerY: 120 },
  { id: 'upper-back', name: 'Upper Back', view: 'back', description: 'Thoracic spine, shoulder blades, rhomboids', organs: ['thoracic spine', 'scapulae'], svgPathId: 'region-upper-back', centerX: 200, centerY: 195 },
  { id: 'lower-back', name: 'Lower Back', view: 'back', description: 'Lumbar spine, kidneys, sacrum', organs: ['lumbar spine', 'kidneys', 'sacrum'], svgPathId: 'region-lower-back', centerX: 200, centerY: 290 },
  { id: 'left-hip', name: 'Left Hip & Glute', view: 'back', description: 'Left hip joint, gluteal region', organs: [], svgPathId: 'region-left-hip', centerX: 235, centerY: 360 },
  { id: 'right-hip', name: 'Right Hip & Glute', view: 'back', description: 'Right hip joint, gluteal region', organs: [], svgPathId: 'region-right-hip', centerX: 165, centerY: 360 },
  { id: 'left-back-leg', name: 'Left Knee & Calf', view: 'back', description: 'Popliteal, calf muscle, Achilles tendon', organs: [], svgPathId: 'region-left-back-leg', centerX: 230, centerY: 470 },
  { id: 'right-back-leg', name: 'Right Knee & Calf', view: 'back', description: 'Popliteal, calf muscle, Achilles tendon', organs: [], svgPathId: 'region-right-back-leg', centerX: 170, centerY: 470 },
];

export type SeverityLevel = 'mild' | 'moderate' | 'severe' | 'extreme';

export interface SeverityOption {
  level: SeverityLevel;
  emoji: string;
  label: string;
  description: string;
}

export const SEVERITY_OPTIONS: SeverityOption[] = [
  { level: 'mild', emoji: '🙂', label: 'MILD', description: 'Annoying but I can manage at home' },
  { level: 'moderate', emoji: '😐', label: 'MODERATE', description: 'Noticeable, affecting my daily activities' },
  { level: 'severe', emoji: '😣', label: 'SEVERE', description: 'Very hard to bear, can\'t do normal things' },
  { level: 'extreme', emoji: '😭', label: 'EXTREME', description: 'Unbearable, I need help immediately' },
];

export interface SymptomQuestion {
  question: string;
  options: string[];
  questionType: string;
}

export interface SymptomAnswer {
  question: string;
  answer: string;
}

export interface SymptomSession {
  sessionId: string;
  selectedRegion: BodyRegion | null;
  conversationHistory: SymptomAnswer[];
  severity: SeverityLevel | null;
  currentStep: 'region' | 'questions' | 'severity' | 'confirmation' | 'analyzing' | 'results' | 'emergency';
}

export interface ContradictionResult {
  hasContradiction: boolean;
  field1?: string;
  field2?: string;
  explanation?: string;
  clarificationOptions?: string[];
}

export interface SymptomCondition {
  name: string;
  plainName: string;
  confidence: number;
  description: string;
}

export interface SymptomAnalysis {
  isEmergency: boolean;
  lowConfidence: boolean;
  conditions: SymptomCondition[];
  urgencyLevel: 'low' | 'medium' | 'high';
  nextSteps: string[];
  disclaimer: string;
}
