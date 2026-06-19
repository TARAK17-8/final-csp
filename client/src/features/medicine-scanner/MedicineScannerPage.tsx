// ═══════════════════════════════════════════════════════════════
// samaramAI — Medicine Scanner Page
// Camera interface, OCR processing, results display
// ═══════════════════════════════════════════════════════════════

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Camera, Upload, Mic, ArrowLeft, AlertTriangle, CheckCircle2,
  Clock, Pill, Shield, Volume2, Share2, Bell, ShoppingBag,
} from 'lucide-react';
import { fadeInUp, staggerContainer } from '@/lib/animations';
import api from '@/lib/api';
import type { MedicineDetails, DrugInteraction } from '@/types/medicine';
import { useTranslation } from '@/hooks/useTranslation';
import { useVoiceStore } from '@/stores/voiceStore';
import { speechRecognizer } from '@/lib/voice/SpeechRecognition';
import { speechSynthesizer } from '@/lib/voice/SpeechSynthesis';
import { useEffect } from 'react';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { useAuthStore } from '@/stores/authStore';
import { db } from '@/lib/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

type ScanStage = 'camera' | 'processing' | 'results';

export default function MedicineScannerPage() {
  const navigate = useNavigate();
  const { t, language } = useTranslation();
  const { user, isAuthenticated } = useAuthStore();
  const [stage, setStage] = useState<ScanStage>('camera');
  const [results, setResults] = useState<MedicineDetails | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraActive, setCameraActive] = useState(false);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch {
      // Camera not available, show upload option
    }
  }, []);

  const captureImage = useCallback(async () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(videoRef.current, 0, 0);
    const base64 = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
    await processImage(base64);
  }, []);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = (reader.result as string).split(',')[1];
      await processImage(base64);
    };
    reader.readAsDataURL(file);
  }, []);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const processImage = async (base64: string) => {
    setStage('processing');
    setErrorMsg(null);
    // Stop camera
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
      setCameraActive(false);
    }

    try {
      // 1. Upload to Cloudinary concurrently
      let imageUrl = '';
      let publicId = '';
      if (isAuthenticated && user?.uid) {
        try {
          const dataUrl = `data:image/jpeg;base64,${base64}`;
          const cloudinaryResponse = await uploadToCloudinary(dataUrl, 'samaramai/medicine-scans');
          imageUrl = cloudinaryResponse.secure_url;
          publicId = cloudinaryResponse.public_id;
        } catch (e) {
          console.error('Failed to upload to Cloudinary:', e);
        }
      }

      const response = await api.post('/medicine/scan', { image: base64, language });
      const data = response.data.data;
      setResults(data);
      setStage('results');

      // 2. Save metadata to Firestore
      if (isAuthenticated && user?.uid && imageUrl) {
        try {
          await addDoc(collection(db, 'users', user.uid, 'reports'), {
            imageUrl,
            publicId,
            uploadedAt: Timestamp.now(),
            fileType: 'image/jpeg',
            originalFileName: 'medicine_scan.jpg',
            recordType: 'medicine_scan',
            aiSummary: data.identity?.brandName || 'Medicine Scan',
          });
        } catch (e) {
          console.error('Failed to save scan metadata to Firestore', e);
        }
      }
    } catch (err: any) {
      const message = err.response?.data?.error || 'Could not scan this medicine. Please check your internet connection and try again.';
      setErrorMsg(message);
      setStage('camera');
    }
  };

  const { state: voiceState, transcript, interimTranscript, clearTranscript } = useVoiceStore();

  const lookupMedicineByName = async (name: string) => {
    setStage('processing');
    setErrorMsg(null);
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
      setCameraActive(false);
    }

    try {
      const response = await api.post('/medicine/lookup', { medicineName: name, language });
      setResults(response.data.data);
      setStage('results');
    } catch (err: any) {
      const message = err.response?.data?.error || 'Could not look up this medicine. Please try again.';
      setErrorMsg(message);
      setStage('camera');
    }
  };

  useEffect(() => {
    if (stage === 'camera' && (voiceState === 'idle' || voiceState === 'submitted') && transcript.trim()) {
      lookupMedicineByName(transcript.trim());
      clearTranscript();
    }
  }, [stage, voiceState, transcript]);

  const handleListen = () => {
    if (voiceState === 'ai_speaking') {
      speechSynthesizer.cancel();
      return;
    }
    if (!results) return;

    // Build text dynamically using the current language's translated labels
    const text = `${t('medicine.brandName')}: ${results.identity.brandName}. ` +
                 `${t('medicine.purpose')}: ${results.purpose}. ` +
                 `${t('medicine.howToTake')}: ${results.howToTake}. ` +
                 `${t('medicine.commonSideEffects')}: ${results.sideEffects.common.join(', ')}.`;
                 
    speechSynthesizer.speak(text, language);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-midnight)', color: 'var(--color-text-inverse)' }}>
      {/* Top bar */}
      <div className="flex items-center justify-between" style={{ padding: '1.25rem clamp(1.5rem, 5vw, 4rem)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <button onClick={() => navigate(-1)} className="flex items-center gap-2" style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '0.9rem' }}>
          <ArrowLeft size={18} /> {t('common.back')}
        </button>
        <span className="text-label" style={{ color: 'var(--color-teal-400)', fontSize: '0.7rem' }}>{t('medicine.title')}</span>
        <div style={{ width: 40 }} />
      </div>

      <AnimatePresence mode="wait">
        {/* ═══ Camera Stage ═══ */}
        {stage === 'camera' && (
          <motion.div key="camera" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ padding: 'clamp(1.5rem, 4vw, 3rem)' }}>
            <div style={{ maxWidth: '500px', margin: '0 auto' }}>
              {/* Error message */}
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
              {/* Camera viewfinder */}
              <div style={{
                position: 'relative', width: '100%', aspectRatio: '4/3',
                borderRadius: 'var(--radius-xl)', overflow: 'hidden',
                background: '#111', marginBottom: '1.5rem',
                border: '2px solid rgba(255,255,255,0.08)',
              }}>
                <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover', display: cameraActive ? 'block' : 'none' }} />

                {!cameraActive && (
                  <div className="flex flex-col items-center justify-center" style={{ width: '100%', height: '100%', padding: '2rem' }}>
                    <Camera size={48} color="rgba(255,255,255,0.2)" style={{ marginBottom: '1rem' }} />
                    <p style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', fontSize: '0.9rem' }}>
                    {t('medicine.scanInstructions')}
                    </p>
                  </div>
                )}

                {/* Corner brackets */}
                {cameraActive && (
                  <>
                    <div style={{ position: 'absolute', top: '15%', left: '10%', width: 30, height: 30, borderTop: '3px solid var(--color-teal-400)', borderLeft: '3px solid var(--color-teal-400)' }} />
                    <div style={{ position: 'absolute', top: '15%', right: '10%', width: 30, height: 30, borderTop: '3px solid var(--color-teal-400)', borderRight: '3px solid var(--color-teal-400)' }} />
                    <div style={{ position: 'absolute', bottom: '15%', left: '10%', width: 30, height: 30, borderBottom: '3px solid var(--color-teal-400)', borderLeft: '3px solid var(--color-teal-400)' }} />
                    <div style={{ position: 'absolute', bottom: '15%', right: '10%', width: 30, height: 30, borderBottom: '3px solid var(--color-teal-400)', borderRight: '3px solid var(--color-teal-400)' }} />
                    {/* Scanning line */}
                    <motion.div
                      animate={{ top: ['15%', '85%', '15%'] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                      style={{ position: 'absolute', left: '10%', right: '10%', height: '2px', background: 'var(--color-teal-400)', opacity: 0.6 }}
                    />
                  </>
                )}

                {/* Instruction overlay */}
                {cameraActive && (
                  <div style={{ position: 'absolute', bottom: '5%', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.6)', padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', whiteSpace: 'nowrap' }}>
                    {t('medicine.scanInstructions')}
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex gap-3" style={{ marginBottom: '1.5rem' }}>
                {!cameraActive ? (
                  <button onClick={startCamera} className="btn-primary" style={{ flex: 1 }}>
                    <Camera size={18} /> {t('medicine.openCamera')}
                  </button>
                ) : (
                  <button onClick={captureImage} className="btn-primary" style={{ flex: 1 }}>
                    <Camera size={18} /> {t('medicine.scanNow')}
                  </button>
                )}
                <button onClick={() => fileInputRef.current?.click()} className="btn-secondary" style={{ borderColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)' }}>
                  <Upload size={18} /> {t('common.upload')}
                </button>
              </div>

              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />

              {/* Voice input */}
              <button 
                onClick={() => {
                  if (voiceState === 'listening' || voiceState === 'processing') {
                    speechRecognizer.stopListening();
                  } else if (voiceState !== 'ai_speaking' && voiceState !== 'submitted') {
                    speechRecognizer.startListening();
                  }
                }}
                style={{
                width: '100%', padding: '1rem', borderRadius: 'var(--radius-lg)',
                border: `1.5px solid ${voiceState === 'listening' ? 'rgba(239,68,64,0.5)' : 'rgba(255,255,255,0.08)'}`,
                background: voiceState === 'listening' ? 'rgba(239,68,64,0.1)' : 'rgba(255,255,255,0.03)',
                color: voiceState === 'listening' ? '#EF4444' : 'rgba(255,255,255,0.5)',
                cursor: voiceState === 'ai_speaking' ? 'not-allowed' : 'pointer', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                fontSize: '0.95rem',
                opacity: voiceState === 'ai_speaking' ? 0.4 : 1,
              }}>
                <Mic size={18} /> {voiceState === 'listening' ? '🎙️ Listening...' : t('medicine.voiceInput')}
              </button>

              {/* Live voice transcript */}
              {voiceState === 'listening' && (interimTranscript || transcript) && (
                <div style={{
                  marginTop: '0.5rem',
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(13,148,136,0.08)',
                  border: '1px solid rgba(13,148,136,0.2)',
                  color: 'var(--color-teal-400)',
                  fontSize: '0.85rem',
                  fontStyle: 'italic',
                  textAlign: 'center',
                }}>
                  🎙️ "{transcript}{interimTranscript ? (transcript ? ' ' : '') + interimTranscript : ''}"
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ═══ Processing Stage ═══ */}
        {stage === 'processing' && (
          <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ textAlign: 'center', padding: '6rem 2rem' }}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              style={{ width: 60, height: 60, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--color-teal-400)', margin: '0 auto 2rem' }}
            />
            <h2 className="text-display-sm" style={{ marginBottom: '0.5rem' }}>{t('medicine.reading')}</h2>
            <p style={{ color: 'rgba(255,255,255,0.5)' }}>{t('common.loading')}</p>
          </motion.div>
        )}

        {/* ═══ Results Stage ═══ */}
        {stage === 'results' && results && (
          <motion.div key="results" variants={staggerContainer} initial="hidden" animate="visible" style={{ padding: 'clamp(1.5rem, 4vw, 3rem)', maxWidth: '600px', margin: '0 auto' }}>
            {/* Card 1 — Identity */}
            <ResultCard title="Medicine Identity" icon={<Pill size={18} />} color="var(--color-teal-400)">
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, fontFamily: 'var(--font-display)', marginBottom: '0.25rem' }}>{results.identity.brandName}</h3>
              <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '0.75rem' }}>{results.identity.genericName} · {results.identity.strength} · {results.identity.form}</p>
              <div className="flex flex-wrap gap-4" style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>
                <span>Mfr: {results.identity.manufacturer}</span>
                <span style={{
                  color: results.expiryStatus === 'safe' ? 'var(--color-success)' :
                         results.expiryStatus === 'expiring_soon' ? 'var(--color-warning)' : 'var(--color-emergency)',
                }}>
                  Exp: {results.identity.expiryDate}
                </span>
              </div>
            </ResultCard>

            {/* Card 2 — Purpose */}
            <ResultCard title="What it's for" icon={<CheckCircle2 size={18} />} color="var(--color-blue-400)">
              <p style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 }}>{results.purpose}</p>
            </ResultCard>

            {/* Card 3 — How to take */}
            <ResultCard title="How to take it" icon={<Clock size={18} />} color="var(--color-teal-400)">
              <p style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 }}>{results.howToTake}</p>
            </ResultCard>

            {/* Card 4 — Side effects */}
            <ResultCard title="Side Effects" icon={<AlertTriangle size={18} />} color="var(--color-warning)">
              <div style={{ marginBottom: '0.75rem' }}>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>Common:</p>
                <div className="flex flex-wrap gap-2">
                  {results.sideEffects.common.map((e) => (
                    <span key={e} style={{ padding: '0.25rem 0.6rem', borderRadius: 'var(--radius-full)', background: 'rgba(255,255,255,0.05)', fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>{e}</span>
                  ))}
                </div>
              </div>
              <div>
                <p style={{ color: 'var(--color-warning)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>Serious (seek help):</p>
                <div className="flex flex-wrap gap-2">
                  {results.sideEffects.serious.map((e) => (
                    <span key={e} style={{ padding: '0.25rem 0.6rem', borderRadius: 'var(--radius-full)', background: 'rgba(217,119,6,0.1)', fontSize: '0.8rem', color: 'var(--color-warning)' }}>{e}</span>
                  ))}
                </div>
              </div>
            </ResultCard>

            {/* Card 5 — Contraindications */}
            <ResultCard title="Do Not Take With" icon={<Shield size={18} />} color="var(--color-emergency)">
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {results.contraindications.map((c) => (
                  <li key={c} className="flex items-start gap-2" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
                    <span style={{ color: 'var(--color-emergency)' }}>✕</span> {c}
                  </li>
                ))}
              </ul>
            </ResultCard>

            {/* Card 6 — Interaction Check */}
            {results.interactions.length === 0 ? (
              <ResultCard title="Interaction Check" icon={<CheckCircle2 size={18} />} color="var(--color-success)">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={20} color="var(--color-success)" />
                  <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>No conflicts with your current medicines</span>
                </div>
              </ResultCard>
            ) : (
              results.interactions.map((interaction) => (
                <InteractionCard key={interaction.medicationName} interaction={interaction} />
              ))
            )}

            {/* Action buttons */}
            <motion.div variants={fadeInUp} className="flex flex-wrap gap-3" style={{ marginTop: '1rem' }}>
              <button className="btn-primary" style={{ flex: 1 }}><Bell size={16} /> Set Refill Reminder</button>
              <button 
                className="btn-secondary" 
                onClick={handleListen}
                style={{ 
                  flex: 1, 
                  borderColor: voiceState === 'ai_speaking' ? 'var(--color-teal-400)' : 'rgba(255,255,255,0.15)', 
                  color: voiceState === 'ai_speaking' ? 'var(--color-teal-400)' : 'rgba(255,255,255,0.7)' 
                }}
              >
                <Volume2 size={16} /> {voiceState === 'ai_speaking' ? 'Stop' : 'Listen'}
              </button>
              <button className="btn-secondary" style={{ borderColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)' }}><Share2 size={16} /></button>
            </motion.div>

            {/* Scan another */}
            <button
              onClick={() => { setStage('camera'); setResults(null); }}
              style={{ width: '100%', marginTop: '1.5rem', padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1.5px solid rgba(255,255,255,0.08)', background: 'transparent', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '0.95rem' }}
            >
              {t('medicine.scanAnother')}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ResultCard({ title, icon, color, children }: { title: string; icon: React.ReactNode; color: string; children: React.ReactNode }) {
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

function InteractionCard({ interaction }: { interaction: DrugInteraction }) {
  const [acknowledged, setAcknowledged] = useState(false);
  const isSevere = interaction.severity >= 4;

  if (isSevere && !acknowledged) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          position: 'fixed', inset: 0, zIndex: 90, background: 'rgba(0,0,0,0.8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem',
        }}
      >
        <div style={{
          maxWidth: '400px', width: '100%', padding: '2rem',
          borderRadius: 'var(--radius-xl)',
          background: 'var(--color-midnight)',
          border: '2px solid var(--color-emergency)',
        }}>
          <AlertTriangle size={32} color="var(--color-emergency)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ color: 'var(--color-emergency)', fontFamily: 'var(--font-display)', fontSize: '1.2rem', marginBottom: '0.75rem' }}>
            Severe Drug Interaction Detected
          </h3>
          <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '0.5rem', fontSize: '0.95rem' }}>
            <strong>{interaction.medicationName}</strong> — {interaction.description}
          </p>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            {interaction.recommendation}
          </p>
          <a href="tel:" className="btn-emergency no-underline" style={{ display: 'flex', width: '100%', justifyContent: 'center', marginBottom: '1rem' }}>
            Call My Doctor
          </a>
          <button onClick={() => setAcknowledged(true)} style={{
            width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(255,255,255,0.1)', background: 'transparent',
            color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '0.85rem',
          }}>
            I understand the risk
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <ResultCard title="⚠️ Interaction Warning" icon={<AlertTriangle size={18} />} color="var(--color-warning)">
      <p style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600, marginBottom: '0.5rem' }}>{interaction.medicationName}</p>
      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{interaction.description}</p>
      <p style={{ color: 'var(--color-warning)', fontSize: '0.85rem' }}>{interaction.recommendation}</p>
    </ResultCard>
  );
}
