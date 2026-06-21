// ═══════════════════════════════════════════════════════════════
// samaramAI — Prescription Translator Page
// Upload → OCR → Translation → Explanation → Report
// ═══════════════════════════════════════════════════════════════

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Upload, Camera, Languages, FileText, Copy, Check,
  Download, RotateCcw, AlertTriangle, Shield, ClipboardList,
  ChevronDown, Trash2, Clock, Sparkles, Eye, BookOpen, Volume2,
} from 'lucide-react';
import { fadeInUp, staggerContainer } from '@/lib/animations';
import api from '@/lib/api';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuthStore } from '@/stores/authStore';
import { useVoiceStore } from '@/stores/voiceStore';
import { speechSynthesizer } from '@/lib/voice/SpeechSynthesis';
import { db } from '@/lib/firebase';
import {
  collection, addDoc, getDocs, deleteDoc, doc, orderBy, query,
  Timestamp,
} from 'firebase/firestore';
import type {
  PrescriptionTranslationResult,
  TranslationHistoryItem,
  TranslationConfidence,
} from '@/types/prescriptionTranslator';
import type { SupportedLanguage } from '@/types/common';
import { uploadToCloudinary } from '@/lib/cloudinary';

// ── Supported translation languages ──
const TRANSLATION_LANGUAGES = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'hi', name: 'Hindi', native: 'हिंदी' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം' },
  { code: 'mr', name: 'Marathi', native: 'मराठी' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  { code: 'ur', name: 'Urdu', native: 'اردو' },
] as const;

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

type PageStage = 'upload' | 'processing' | 'results';

// ── Processing sub-steps ──
const PROCESSING_STEPS = [
  'prescriptionTranslator.stepOcr',
  'prescriptionTranslator.stepCleanup',
  'prescriptionTranslator.stepTranslation',
  'prescriptionTranslator.stepExplanation',
] as const;

export default function PrescriptionTranslatorPage() {
  const navigate = useNavigate();
  const { t, language } = useTranslation();
  const { user, isAuthenticated } = useAuthStore();

  // ── State ──
  const [stage, setStage] = useState<PageStage>('upload');
  const { state: voiceState } = useVoiceStore();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>(() => {
    const match = TRANSLATION_LANGUAGES.find((l) => l.code === language);
    return match ? match.name : 'English';
  });
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [results, setResults] = useState<PrescriptionTranslationResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [processingStep, setProcessingStep] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<TranslationHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  // ── Auto-select language from user preference ──
  useEffect(() => {
    const match = TRANSLATION_LANGUAGES.find((l) => l.code === language);
    if (match) setSelectedLanguage(match.name);
  }, [language]);

  // ── Close dropdown on outside click ──
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(e.target as Node)) {
        setLangDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // ── Load history on mount ──
  useEffect(() => {
    if (isAuthenticated && user?.uid) {
      loadHistory();
    }
  }, [isAuthenticated, user?.uid]);

  // ── File Validation ──
  const validateFile = useCallback((file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return t('prescriptionTranslator.invalidFile');
    }
    if (file.size > MAX_FILE_SIZE) {
      return t('prescriptionTranslator.fileTooLarge');
    }
    return null;
  }, [t]);

  // ── Handle File Select ──
  const handleFileSelect = useCallback((file: File) => {
    const error = validateFile(file);
    if (error) {
      setErrorMsg(error);
      return;
    }
    setErrorMsg(null);
    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, [validateFile]);

  // ── Drag & Drop Handlers ──
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  // ── Image compression (resize before upload) ──
  const compressImage = useCallback((dataUrl: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_DIM = 1600;
        let { width, height } = img;

        if (width > MAX_DIM || height > MAX_DIM) {
          const ratio = Math.min(MAX_DIM / width, MAX_DIM / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', 0.85);
        resolve(compressed.split(',')[1]);
      };
      img.src = dataUrl;
    });
  }, []);

  // ── Translate ──
  const handleTranslate = useCallback(async () => {
    if (!imagePreview) return;

    setStage('processing');
    setProcessingStep(0);
    setErrorMsg(null);

    try {
      if (voiceState === 'ai_speaking' || voiceState === 'ai_paused') {
        speechSynthesizer.cancel();
      }

      // Compress image
      const base64 = await compressImage(imagePreview);

      // Animate through processing steps
      const stepInterval = setInterval(() => {
        setProcessingStep((prev) => {
          if (prev < PROCESSING_STEPS.length - 1) return prev + 1;
          clearInterval(stepInterval);
          return prev;
        });
      }, 2500);

      // Upload to Cloudinary concurrently with the backend OCR
      let imageUrl = '';
      let publicId = '';
      if (selectedFile) {
        try {
          const cloudinaryResponse = await uploadToCloudinary(selectedFile, 'samaramai/prescriptions');
          imageUrl = cloudinaryResponse.secure_url;
          publicId = cloudinaryResponse.public_id;
        } catch (e) {
          console.error('Failed to upload image to Cloudinary', e);
        }
      }

      const response = await api.post('/prescription-translator/translate', {
        image: base64,
        language: selectedLanguage,
        userProfile: user ? {
          age: user.profiles?.[0]?.age,
          chronicConditions: user.profiles?.[0]?.chronicConditions,
        } : undefined,
      });

      clearInterval(stepInterval);
      const data = response.data.data;
      if (imageUrl) {
        data.imageUrl = imageUrl;
        data.publicId = publicId;
      }
      setResults(data);
      setStage('results');
      setSaved(false);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      const message = axiosErr.response?.data?.error || t('prescriptionTranslator.translationFailed');
      setErrorMsg(message);
      setStage('upload');
    }
  }, [imagePreview, selectedLanguage, user, compressImage, t]);

  // ── Copy to Clipboard ──
  const handleCopy = useCallback(async () => {
    if (!results) return;
    const text = [
      '═══ PRESCRIPTION TRANSLATION ═══',
      '',
      '── Extracted Text ──',
      results.ocrText,
      '',
      '── Translated Text ──',
      results.translatedText,
      '',
      '── Explanation ──',
      results.explanation,
      '',
      '── Medicine Table ──',
      ...results.medicineTable.map(
        (m) => `• ${m.medicineName} — ${m.dosage} — ${m.frequency} — ${m.duration} — ${m.specialInstructions}`
      ),
      '',
      `── Confidence: ${(results.confidence || 'medium').toUpperCase()} ──`,
      '',
      '── Safety Notice ──',
      t('prescriptionTranslator.safetyNotice'),
    ].join('\n');

    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [results, t]);

  // ── Download TXT ──
  const handleDownloadTxt = useCallback(() => {
    if (!results) return;
    const text = [
      'PRESCRIPTION TRANSLATION REPORT',
      `Date: ${new Date().toLocaleDateString()}`,
      `Language: ${results.targetLanguage}`,
      '',
      '════════════════════════════════════',
      'ORIGINAL TEXT (OCR)',
      '════════════════════════════════════',
      results.ocrText,
      '',
      '════════════════════════════════════',
      'TRANSLATED TEXT',
      '════════════════════════════════════',
      results.translatedText,
      '',
      '════════════════════════════════════',
      'MEDICINE TABLE',
      '════════════════════════════════════',
      ...results.medicineTable.map(
        (m, i) => `${i + 1}. ${m.medicineName}\n   Dosage: ${m.dosage}\n   Frequency: ${m.frequency}\n   Duration: ${m.duration}\n   Instructions: ${m.specialInstructions}`
      ),
      '',
      '════════════════════════════════════',
      'PRESCRIPTION EXPLANATION',
      '════════════════════════════════════',
      results.explanation,
      '',
      results.generalInstructions ? `General Instructions: ${results.generalInstructions}\n` : '',
      results.followUpNote ? `Follow-up: ${results.followUpNote}\n` : '',
      `AI Confidence: ${(results.confidence || 'medium').toUpperCase()} (${results.confidenceScore || 50}%)`,

      '',
      '════════════════════════════════════',
      'SAFETY NOTICE',
      '════════════════════════════════════',
      t('prescriptionTranslator.safetyNotice'),
      '',
      'Generated by samaramAI Prescription Translator',
    ].join('\n');

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prescription-translation-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [results, t]);

  // ── Download PDF (via window.print on a hidden container) ──
  const handleDownloadPdf = useCallback(() => {
    if (!results) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Prescription Translation - samaramAI</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', sans-serif; padding: 40px; color: #1a1a2e; line-height: 1.7; }
    h1 { font-family: 'Space Grotesk', sans-serif; font-size: 24px; color: #0d9488; margin-bottom: 4px; }
    h2 { font-family: 'Space Grotesk', sans-serif; font-size: 16px; color: #0d9488; margin: 24px 0 8px; border-bottom: 2px solid #e8e4df; padding-bottom: 4px; }
    .meta { color: #718096; font-size: 13px; margin-bottom: 24px; }
    .section { margin-bottom: 16px; }
    .text-block { background: #faf8f5; padding: 16px; border-radius: 8px; white-space: pre-wrap; font-size: 14px; border: 1px solid #e8e4df; }
    table { width: 100%; border-collapse: collapse; margin: 8px 0; font-size: 13px; }
    th { background: #0d9488; color: white; padding: 10px 12px; text-align: left; font-weight: 600; }
    td { padding: 10px 12px; border-bottom: 1px solid #e8e4df; }
    tr:nth-child(even) td { background: #faf8f5; }
    .confidence { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
    .confidence-high { background: #d1fae5; color: #059669; }
    .confidence-medium { background: #fef3c7; color: #d97706; }
    .confidence-low { background: #fee2e2; color: #b91c1c; }
    .safety { margin-top: 24px; padding: 16px; background: #fef3c7; border-radius: 8px; border-left: 4px solid #d97706; font-size: 13px; color: #92400e; }
    .footer { margin-top: 32px; text-align: center; color: #718096; font-size: 12px; border-top: 1px solid #e8e4df; padding-top: 16px; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <h1>📋 Prescription Translation Report</h1>
  <p class="meta">Generated on ${new Date().toLocaleString()} · Language: ${results.targetLanguage} · samaramAI</p>

  <h2>📝 Original Extracted Text</h2>
  <div class="text-block">${escapeHtml(results.ocrText)}</div>

  <h2>💊 Medicine Details</h2>
  ${results.medicineTable.length > 0 ? `
  <table>
    <thead><tr><th>Medicine</th><th>Dosage</th><th>Frequency</th><th>Duration</th><th>Instructions</th></tr></thead>
    <tbody>${results.medicineTable.map((m) => `
      <tr><td><strong>${escapeHtml(m.medicineName)}</strong></td><td>${escapeHtml(m.dosage)}</td><td>${escapeHtml(m.frequency)}</td><td>${escapeHtml(m.duration)}</td><td>${escapeHtml(m.specialInstructions)}</td></tr>
    `).join('')}</tbody>
  </table>` : '<p>No medicines could be extracted.</p>'}

  <h2>📖 What This Prescription Means</h2>
  <div class="text-block">${escapeHtml(results.explanation)}</div>

  ${results.generalInstructions ? `<h2>📋 General Instructions</h2><div class="text-block">${escapeHtml(results.generalInstructions)}</div>` : ''}
  ${results.followUpNote ? `<h2>🔄 Follow-up</h2><div class="text-block">${escapeHtml(results.followUpNote)}</div>` : ''}

  <h2>🎯 AI Confidence</h2>
  <span class="confidence confidence-${results.confidence || 'medium'}">${(results.confidence || 'medium').toUpperCase()} (${results.confidenceScore ?? 50}%)</span>

  <div class="safety">⚠️ ${escapeHtml(t('prescriptionTranslator.safetyNotice'))}</div>
  <div class="footer">Generated by samaramAI Prescription Translator · For informational purposes only</div>
</body>
</html>`;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  }, [results, t]);

  // ── Firestore: Save to History ──
  const handleSaveToHistory = useCallback(async () => {
    if (!results || !user?.uid) return;

    try {
      const historyRef = collection(db, 'users', user.uid, 'prescriptionTranslations');
      await addDoc(historyRef, {
        createdAt: Timestamp.now(),
        language: results.targetLanguage,
        ocrText: results.ocrText,
        translatedText: results.translatedText,
        explanation: results.explanation,
        medicineTable: results.medicineTable,
        confidence: results.confidence,
        imageUrl: (results as any).imageUrl || '',
        publicId: (results as any).publicId || '',
      });
      setSaved(true);
      await loadHistory();
    } catch (err) {
      console.error('[PrescriptionTranslator] Save error:', err);
    }
  }, [results, user?.uid]);

  // ── Firestore: Load History ──
  const loadHistory = useCallback(async () => {
    if (!user?.uid) return;
    setHistoryLoading(true);
    try {
      const historyRef = collection(db, 'users', user.uid, 'prescriptionTranslations');
      const q = query(historyRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const items: TranslationHistoryItem[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          createdAt: data.createdAt?.toDate?.()?.toISOString?.() || new Date().toISOString(),
          language: data.language || 'English',
          ocrText: data.ocrText || '',
          translatedText: data.translatedText || '',
          explanation: data.explanation || '',
          medicineTable: data.medicineTable || [],
          confidence: data.confidence || 'medium',
          imageUrl: data.imageUrl || '',
        };
      });
      setHistory(items);
    } catch (err) {
      console.error('[PrescriptionTranslator] Load history error:', err);
    } finally {
      setHistoryLoading(false);
    }
  }, [user?.uid]);

  // ── Firestore: Delete History Item ──
  const handleDeleteHistory = useCallback(async (historyId: string) => {
    if (!user?.uid) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'prescriptionTranslations', historyId));
      setHistory((prev) => prev.filter((h) => h.id !== historyId));
    } catch (err) {
      console.error('[PrescriptionTranslator] Delete error:', err);
    }
  }, [user?.uid]);

  // ── Load history item into results ──
  const loadHistoryItem = useCallback((item: TranslationHistoryItem) => {
    setResults({
      ocrText: item.ocrText,
      cleanedText: item.ocrText,
      translatedText: item.translatedText,
      explanation: item.explanation,
      medicineTable: item.medicineTable,
      generalInstructions: null,
      followUpNote: null,
      confidence: item.confidence,
      confidenceScore: item.confidence === 'high' ? 85 : item.confidence === 'medium' ? 60 : 30,
      unclearSections: [],
      detectedLanguage: 'Unknown',
      preservedElements: { medicineNames: [], dosages: [], doctorName: null, hospitalName: null, dates: [] },
      targetLanguage: item.language,
      safetyNotice: 'AI-generated translation. Please verify all prescription details with a qualified healthcare professional before taking any medication.',
    });
    setStage('results');
    setSaved(true);
    setShowHistory(false);
  }, []);

  // ── Listen ──
  const handleListen = useCallback(() => {
    if (voiceState === 'ai_speaking') {
      speechSynthesizer.pause();
      return;
    }
    if (voiceState === 'ai_paused') {
      speechSynthesizer.resume();
      return;
    }
    if (!results) return;

    const text = [
      t('prescriptionTranslator.explanation') + ':',
      results.explanation,
      results.medicineTable.length > 0 ? t('prescriptionTranslator.medicineTable') + ':' : '',
      ...results.medicineTable.map(
        (m) => `${m.medicineName}, ${t('prescriptionTranslator.dosage')}: ${m.dosage}, ${t('prescriptionTranslator.frequency')}: ${m.frequency}`
      )
    ].filter(Boolean).join('. ');

    speechSynthesizer.speak(text, language);
  }, [results, language, voiceState, t]);

  // ── Reset ──
  const handleReset = useCallback(() => {
    setStage('upload');
    setSelectedFile(null);
    setImagePreview(null);
    setResults(null);
    setErrorMsg(null);
    if (voiceState === 'ai_speaking' || voiceState === 'ai_paused') {
      speechSynthesizer.cancel();
    }
    setProcessingStep(0);
    setCopied(false);
    setSaved(false);
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-midnight)', color: 'var(--color-text-inverse)' }}>
      {/* ═══ Top Bar ═══ */}
      <div
        className="flex items-center justify-between"
        style={{
          padding: '1.25rem clamp(1.5rem, 5vw, 4rem)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2"
          style={{
            background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)',
            cursor: 'pointer', fontSize: '0.9rem',
          }}
        >
          <ArrowLeft size={18} /> {t('common.back')}
        </button>
        <span className="text-label" style={{ color: 'var(--color-teal-400)', fontSize: '0.7rem' }}>
          {t('prescriptionTranslator.title')}
        </span>
        <div style={{ width: 40 }}>
          {isAuthenticated && (
            <button
              onClick={() => setShowHistory(!showHistory)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: showHistory ? 'var(--color-teal-400)' : 'rgba(255,255,255,0.4)',
              }}
              title={t('prescriptionTranslator.history')}
            >
              <Clock size={18} />
            </button>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* ═══════════════════════════════════════════════════════ */}
        {/* HISTORY PANEL */}
        {/* ═══════════════════════════════════════════════════════ */}
        {showHistory && (
          <motion.div
            key="history"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            style={{ padding: 'clamp(1.5rem, 4vw, 3rem)', maxWidth: '600px', margin: '0 auto' }}
          >
            <h2 className="text-display-sm" style={{ marginBottom: '1.5rem' }}>
              {t('prescriptionTranslator.history')}
            </h2>

            {historyLoading ? (
              <p style={{ color: 'rgba(255,255,255,0.4)' }}>{t('common.loading')}</p>
            ) : history.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                <ClipboardList size={48} color="rgba(255,255,255,0.15)" style={{ margin: '0 auto 1rem' }} />
                <p style={{ color: 'rgba(255,255,255,0.4)' }}>{t('prescriptionTranslator.noHistory')}</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {history.map((item) => (
                  <motion.div
                    key={item.id}
                    variants={fadeInUp}
                    initial="hidden"
                    animate="visible"
                    className="glass"
                    style={{
                      borderRadius: 'var(--radius-lg)', padding: '1.25rem',
                      cursor: 'pointer',
                    }}
                  >
                    <div className="flex items-center justify-between" style={{ marginBottom: '0.5rem' }}>
                      <span style={{ color: 'var(--color-teal-400)', fontSize: '0.8rem', fontWeight: 600 }}>
                        {item.language}
                      </span>
                      <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem' }}>
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p style={{
                      color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      marginBottom: '0.75rem',
                    }}>
                      {item.ocrText.slice(0, 120)}...
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => loadHistoryItem(item)}
                        style={{
                          flex: 1, padding: '0.5rem', borderRadius: 'var(--radius-md)',
                          background: 'rgba(13,148,136,0.15)', border: '1px solid rgba(13,148,136,0.3)',
                          color: 'var(--color-teal-400)', cursor: 'pointer', fontSize: '0.8rem',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                        }}
                      >
                        <Eye size={14} /> {t('prescriptionTranslator.viewReport')}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteHistory(item.id); }}
                        style={{
                          padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)',
                          background: 'rgba(185,28,28,0.1)', border: '1px solid rgba(185,28,28,0.2)',
                          color: 'var(--color-emergency)', cursor: 'pointer', fontSize: '0.8rem',
                          display: 'flex', alignItems: 'center', gap: '0.3rem',
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════════════════ */}
        {/* UPLOAD STAGE */}
        {/* ═══════════════════════════════════════════════════════ */}
        {!showHistory && stage === 'upload' && (
          <motion.div
            key="upload"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ padding: 'clamp(1.5rem, 4vw, 3rem)' }}
          >
            <div style={{ maxWidth: '520px', margin: '0 auto' }}>
              {/* Title */}
              <motion.div variants={fadeInUp} initial="hidden" animate="visible" style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.4rem 1rem', borderRadius: 'var(--radius-full)',
                  background: 'rgba(13,148,136,0.1)', border: '1px solid rgba(13,148,136,0.2)',
                  marginBottom: '1rem',
                }}>
                  <Languages size={14} color="var(--color-teal-400)" />
                  <span style={{ color: 'var(--color-teal-400)', fontSize: '0.8rem', fontWeight: 600 }}>
                    {t('prescriptionTranslator.title')}
                  </span>
                </div>
                <h1 className="text-display-sm" style={{ marginBottom: '0.5rem' }}>
                  {t('prescriptionTranslator.uploadTitle')}
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto' }}>
                  {t('prescriptionTranslator.subtitle')}
                </p>
              </motion.div>

              {/* Error */}
              {errorMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    padding: '1rem 1.25rem', borderRadius: 'var(--radius-lg)',
                    background: 'rgba(185,28,28,0.12)', border: '1px solid rgba(185,28,28,0.3)',
                    marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem',
                  }}
                >
                  <AlertTriangle size={20} color="var(--color-emergency)" style={{ flexShrink: 0 }} />
                  <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', margin: 0 }}>{errorMsg}</p>
                </motion.div>
              )}

              {/* Drag & Drop Zone / Image Preview */}
              {!imagePreview ? (
                <motion.div
                  variants={fadeInUp}
                  initial="hidden"
                  animate="visible"
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    position: 'relative',
                    width: '100%',
                    minHeight: '240px',
                    borderRadius: 'var(--radius-xl)',
                    border: `2px dashed ${isDragging ? 'var(--color-teal-400)' : 'rgba(255,255,255,0.15)'}`,
                    background: isDragging ? 'rgba(13,148,136,0.08)' : 'rgba(255,255,255,0.02)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    padding: '2rem',
                    marginBottom: '1rem',
                  }}
                >
                  <motion.div
                    animate={{ y: isDragging ? -8 : 0 }}
                    style={{
                      width: 64, height: 64, borderRadius: 'var(--radius-lg)',
                      background: 'rgba(13,148,136,0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      marginBottom: '1rem',
                    }}
                  >
                    <Upload size={28} color="var(--color-teal-400)" />
                  </motion.div>
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem', textAlign: 'center', marginBottom: '0.5rem' }}>
                    {t('prescriptionTranslator.dragDrop')}
                  </p>
                  <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem' }}>
                    JPG, PNG, WebP · Max 10MB
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{
                    position: 'relative',
                    width: '100%',
                    borderRadius: 'var(--radius-xl)',
                    overflow: 'hidden',
                    marginBottom: '1rem',
                    border: '2px solid rgba(13,148,136,0.3)',
                  }}
                >
                  <img
                    src={imagePreview}
                    alt="Prescription preview"
                    style={{ width: '100%', maxHeight: '350px', objectFit: 'contain', background: '#111' }}
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                      setImagePreview(null);
                    }}
                    style={{
                      position: 'absolute', top: '0.75rem', right: '0.75rem',
                      width: 32, height: 32, borderRadius: 'var(--radius-full)',
                      background: 'rgba(0,0,0,0.7)', border: 'none',
                      color: 'white', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    ✕
                  </button>
                </motion.div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3" style={{ marginBottom: '1.25rem' }}>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-secondary"
                  style={{ flex: 1, borderColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)' }}
                >
                  <Upload size={16} /> {t('prescriptionTranslator.browseFiles')}
                </button>
                <button
                  onClick={() => cameraInputRef.current?.click()}
                  className="btn-secondary"
                  style={{ flex: 1, borderColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)' }}
                >
                  <Camera size={16} /> {t('prescriptionTranslator.cameraCapture')}
                </button>
              </div>

              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileInput} style={{ display: 'none' }} />
              <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleFileInput} style={{ display: 'none' }} />



              {/* Translate Button */}
              <button
                onClick={handleTranslate}
                disabled={!imagePreview}
                className="btn-primary"
                style={{
                  width: '100%',
                  opacity: imagePreview ? 1 : 0.4,
                  cursor: imagePreview ? 'pointer' : 'not-allowed',
                }}
              >
                <Sparkles size={18} /> {t('prescriptionTranslator.translate')}
              </button>
            </div>
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════════════════ */}
        {/* PROCESSING STAGE */}
        {/* ═══════════════════════════════════════════════════════ */}
        {!showHistory && stage === 'processing' && (
          <motion.div
            key="processing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ textAlign: 'center', padding: '5rem 2rem' }}
          >
            {/* Spinner */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              style={{
                width: 64, height: 64, borderRadius: '50%',
                border: '3px solid rgba(255,255,255,0.1)',
                borderTopColor: 'var(--color-teal-400)',
                margin: '0 auto 2.5rem',
              }}
            />

            <h2 className="text-display-sm" style={{ marginBottom: '1.5rem' }}>
              {t('prescriptionTranslator.processing')}
            </h2>

            {/* Processing steps */}
            <div style={{ maxWidth: '320px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {PROCESSING_STEPS.map((stepKey, index) => (
                <motion.div
                  key={stepKey}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{
                    opacity: index <= processingStep ? 1 : 0.3,
                    x: 0,
                  }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3"
                  style={{ fontSize: '0.9rem' }}
                >
                  <div style={{
                    width: 24, height: 24, borderRadius: 'var(--radius-full)',
                    background: index < processingStep ? 'var(--color-teal-500)' :
                      index === processingStep ? 'rgba(13,148,136,0.3)' : 'rgba(255,255,255,0.05)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: index === processingStep ? '2px solid var(--color-teal-400)' : 'none',
                    flexShrink: 0,
                  }}>
                    {index < processingStep ? (
                      <Check size={12} color="white" />
                    ) : index === processingStep ? (
                      <motion.div
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-teal-400)' }}
                      />
                    ) : null}
                  </div>
                  <span style={{
                    color: index <= processingStep ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.25)',
                  }}>
                    {t(stepKey as Parameters<typeof t>[0])}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════════════════ */}
        {/* RESULTS STAGE */}
        {/* ═══════════════════════════════════════════════════════ */}
        {!showHistory && stage === 'results' && results && (
          <motion.div
            key="results"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            style={{ padding: 'clamp(1.5rem, 4vw, 3rem)', maxWidth: '650px', margin: '0 auto' }}
          >
            {/* Confidence Badge */}
            <motion.div variants={fadeInUp} className="flex items-center justify-between" style={{ marginBottom: '1.25rem' }}>
              <ConfidenceBadge confidence={results.confidence} score={results.confidenceScore} t={t} />
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem' }}>
                {results.targetLanguage}
              </span>
            </motion.div>



            {/* Card 3 — Explanation */}
            <ResultCard
              title={t('prescriptionTranslator.explanation')}
              icon={<BookOpen size={18} />}
              color="var(--color-blue-400)"
            >
              <p style={{
                color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem',
                lineHeight: 1.8,
              }}>
                {results.explanation}
              </p>
            </ResultCard>

            {/* Card 4 — Medicine Table */}
            {results.medicineTable.length > 0 && (
              <ResultCard
                title={t('prescriptionTranslator.medicineTable')}
                icon={<ClipboardList size={18} />}
                color="var(--color-teal-400)"
              >
                <div style={{ overflowX: 'auto' }}>
                  <table style={{
                    width: '100%', borderCollapse: 'collapse',
                    fontSize: '0.8rem',
                  }}>
                    <thead>
                      <tr>
                        {[
                          t('prescriptionTranslator.medicineName'),
                          t('prescriptionTranslator.dosage'),
                          t('prescriptionTranslator.frequency'),
                          t('prescriptionTranslator.duration'),
                          t('prescriptionTranslator.instructions'),
                        ].map((header) => (
                          <th
                            key={header}
                            style={{
                              padding: '0.6rem 0.75rem', textAlign: 'left',
                              color: 'var(--color-teal-400)', fontWeight: 600,
                              borderBottom: '1px solid rgba(255,255,255,0.1)',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {results.medicineTable.map((med, idx) => (
                        <tr key={idx}>
                          <td style={{ padding: '0.6rem 0.75rem', color: 'rgba(255,255,255,0.8)', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            {med.medicineName}
                          </td>
                          <td style={{ padding: '0.6rem 0.75rem', color: 'rgba(255,255,255,0.6)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            {med.dosage}
                          </td>
                          <td style={{ padding: '0.6rem 0.75rem', color: 'rgba(255,255,255,0.6)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            {med.frequency}
                          </td>
                          <td style={{ padding: '0.6rem 0.75rem', color: 'rgba(255,255,255,0.6)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            {med.duration}
                          </td>
                          <td style={{ padding: '0.6rem 0.75rem', color: 'rgba(255,255,255,0.6)', borderBottom: '1px solid rgba(255,255,255,0.05)', maxWidth: '140px' }}>
                            {med.specialInstructions}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </ResultCard>
            )}

            {/* Card 5 — General Instructions */}
            {results.generalInstructions && (
              <ResultCard
                title={t('prescriptionTranslator.generalInstructions')}
                icon={<FileText size={18} />}
                color="var(--color-blue-400)"
              >
                <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.9rem', lineHeight: 1.7 }}>
                  {results.generalInstructions}
                </p>
              </ResultCard>
            )}

            {/* Card 6 — Follow-up */}
            {results.followUpNote && (
              <ResultCard
                title={t('prescriptionTranslator.followUp')}
                icon={<Clock size={18} />}
                color="var(--color-warning)"
              >
                <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.9rem', lineHeight: 1.7 }}>
                  {results.followUpNote}
                </p>
              </ResultCard>
            )}

            {/* Safety Notice */}
            <motion.div
              variants={fadeInUp}
              style={{
                padding: '1rem 1.25rem', borderRadius: 'var(--radius-lg)',
                background: 'rgba(217,119,6,0.08)',
                border: '1px solid rgba(217,119,6,0.2)',
                marginBottom: '1.25rem',
              }}
            >
              <div className="flex items-start gap-3">
                <Shield size={18} color="var(--color-warning)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.85rem', margin: 0, lineHeight: 1.6 }}>
                  {t('prescriptionTranslator.safetyNotice')}
                </p>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div variants={fadeInUp} className="flex flex-wrap gap-3" style={{ marginBottom: '0.75rem' }}>
              <button
                onClick={handleCopy}
                className="btn-secondary"
                style={{
                  flex: 1, borderColor: 'rgba(255,255,255,0.15)',
                  color: copied ? 'var(--color-success)' : 'rgba(255,255,255,0.7)',
                  minWidth: '120px',
                }}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? t('prescriptionTranslator.copied') : t('prescriptionTranslator.copyText')}
              </button>
              <button
                onClick={handleListen}
                className="btn-secondary"
                style={{
                  flex: 1, 
                  borderColor: voiceState === 'ai_speaking' ? 'var(--color-teal-400)' : 'rgba(255,255,255,0.15)', 
                  color: voiceState === 'ai_speaking' ? 'var(--color-teal-400)' : 'rgba(255,255,255,0.7)',
                  minWidth: '120px',
                }}
              >
                <Volume2 size={16} /> {voiceState === 'ai_speaking' ? t('common.stop') : t('common.listen')}
              </button>
            </motion.div>



            {/* Reset */}
            <button
              onClick={handleReset}
              style={{
                width: '100%', padding: '1rem',
                borderRadius: 'var(--radius-lg)',
                border: '1.5px solid rgba(255,255,255,0.08)',
                background: 'transparent', color: 'rgba(255,255,255,0.5)',
                cursor: 'pointer', fontSize: '0.95rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              }}
            >
              <RotateCcw size={16} /> {t('prescriptionTranslator.reset')}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Sub-components
// ═══════════════════════════════════════════════════════════════

function ResultCard({
  title, icon, color, children,
}: {
  title: string; icon: React.ReactNode; color: string; children: React.ReactNode;
}) {
  return (
    <motion.div
      variants={fadeInUp}
      className="glass"
      style={{ borderRadius: 'var(--radius-xl)', padding: '1.5rem', marginBottom: '1rem' }}
    >
      <div className="flex items-center gap-2" style={{ marginBottom: '1rem' }}>
        <div style={{ color }}>{icon}</div>
        <span className="text-label" style={{ color, fontSize: '0.65rem' }}>{title}</span>
      </div>
      {children}
    </motion.div>
  );
}

function ConfidenceBadge({
  confidence,
  score,
  t,
}: {
  confidence: TranslationConfidence;
  score: number;
  t: any;
}) {
  const configs: Record<string, { bg: string; border: string; color: string; label: string }> = {
    high: { bg: 'rgba(5,150,105,0.15)', border: 'rgba(5,150,105,0.3)', color: 'var(--color-success)', label: t('prescriptionTranslator.confidenceHigh') },
    medium: { bg: 'rgba(217,119,6,0.15)', border: 'rgba(217,119,6,0.3)', color: 'var(--color-warning)', label: t('prescriptionTranslator.confidenceMedium') },
    low: { bg: 'rgba(185,28,28,0.15)', border: 'rgba(185,28,28,0.3)', color: 'var(--color-emergency)', label: t('prescriptionTranslator.confidenceLow') },
  };

  // Normalize confidence key: handle 'High', 'HIGH', etc. from AI responses
  const normalizedKey = (confidence || 'medium').toString().toLowerCase();
  const config = configs[normalizedKey] || configs.medium;

  return (
    <div className="flex items-center gap-2">
      <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>
        {t('prescriptionTranslator.confidence')}:
      </span>
      <span
        style={{
          padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)',
          background: config.bg, border: `1px solid ${config.border}`,
          color: config.color, fontSize: '0.8rem', fontWeight: 600,
        }}
      >
        {config.label} ({score ?? 50}%)
      </span>
    </div>
  );
}

/** Escape HTML for safe injection into the print window */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/\n/g, '<br>');
}
