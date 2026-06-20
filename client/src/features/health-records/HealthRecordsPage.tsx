// ═══════════════════════════════════════════════════════════════
// samaramAI — Health Records Page
// View/upload prescriptions, lab reports, medical history
// ═══════════════════════════════════════════════════════════════

import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Upload, FileText, FlaskConical, Pill,
  Calendar, Camera, Eye, Trash2, Plus, Search, Volume2,
} from 'lucide-react';
import { staggerContainer, fadeInUp } from '@/lib/animations';
import api from '@/lib/api';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuthStore } from '@/stores/authStore';
import { useVoiceStore } from '@/stores/voiceStore';
import { speechSynthesizer } from '@/lib/voice/SpeechSynthesis';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, orderBy, Timestamp, deleteDoc, doc } from 'firebase/firestore';
import { uploadToCloudinary } from '@/lib/cloudinary';

interface HealthRecord {
  id: string;
  type: 'prescription' | 'lab_report' | 'discharge_summary' | 'vaccination';
  title: string;
  date: string;
  doctor?: string;
  hospital?: string;
  summary?: string;
  aiAnalysis?: string;
  imageUrl?: string;
  publicId?: string;
}

const typeIcons = {
  prescription: <Pill size={18} />,
  lab_report: <FlaskConical size={18} />,
  discharge_summary: <FileText size={18} />,
  vaccination: <Plus size={18} />,
};

const typeColors = {
  prescription: 'var(--color-teal-400)',
  lab_report: 'var(--color-blue-400)',
  discharge_summary: 'var(--color-warning)',
  vaccination: 'var(--color-success)',
};

const typeLabels = {
  prescription: 'PRESCRIPTION',
  lab_report: 'LAB REPORT',
  discharge_summary: 'DISCHARGE',
  vaccination: 'VACCINATION',
};

const MOCK_RECORDS: HealthRecord[] = [
  {
    id: 'mock-1',
    type: 'prescription',
    title: 'Dr. Agrawal Health Checkup',
    date: new Date().toISOString().split('T')[0],
    hospital: 'Agrawal Clinic',
    summary: 'General health checkup prescription. Take Paracetamol 500mg twice daily after meals.',
  },
  {
    id: 'mock-2',
    type: 'lab_report',
    title: 'Complete Blood Count (CBC)',
    date: new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0],
    hospital: 'City Diagnostics',
    summary: 'All parameters normal. Hemoglobin is slightly low, consider iron supplements.',
  }
];

export default function HealthRecordsPage() {
  const navigate = useNavigate();
  const { t, language } = useTranslation();
  const { state: voiceState } = useVoiceStore();
  const { user, isAuthenticated } = useAuthStore();
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load records from Firestore
  const loadRecords = useCallback(async () => {
    if (!isAuthenticated || !user?.uid) {
      setRecords(MOCK_RECORDS);
      setLoading(false);
      return;
    }
    try {
      const recordsRef = collection(db, 'users', user.uid, 'reports');
      const q = query(recordsRef, orderBy('uploadedAt', 'desc'));
      const snapshot = await getDocs(q);
      const items: HealthRecord[] = snapshot.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          type: data.recordType || 'prescription',
          title: data.originalFileName || 'Medical Document',
          date: data.uploadedAt?.toDate?.().toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
          summary: data.aiSummary || '',
          imageUrl: data.imageUrl,
          publicId: data.publicId,
        };
      });
      if (items.length === 0) {
        setRecords(MOCK_RECORDS);
      } else {
        setRecords(items);
      }
    } catch (err) {
      console.error('Failed to load records:', err);
      setRecords(MOCK_RECORDS);
    } finally {
      setLoading(false);
    }
  }, [user, isAuthenticated]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  const filtered = records.filter((r) => {
    if (filterType !== 'all' && r.type !== filterType) return false;
    if (search && !r.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user?.uid) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'reports', id));
      setRecords(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleListen = useCallback((record: HealthRecord) => {
    if (voiceState === 'ai_speaking') {
      speechSynthesizer.cancel();
      return;
    }
    const text = `${typeLabels[record.type]}. ${record.title}. ${record.summary ? record.summary : ''}`;
    speechSynthesizer.speak(text, language);
  }, [voiceState, language]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadResult(null);

    try {
      // 1. Upload to Cloudinary (optional if unauthenticated, but we try)
      let cloudinaryResponse = { secure_url: '', public_id: '' };
      try {
        cloudinaryResponse = await uploadToCloudinary(file, 'samaramai/reports');
      } catch (err) {
        console.warn('Cloudinary upload failed, proceeding with base64 for AI', err);
      }
      
      // 2. Read as base64 for AI Processing
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(',')[1];
        try {
          // 3. Get AI Analysis
          const response = await api.post('/prescription-translator/translate', { image: base64, language });
          const aiData = response.data.data;
          setUploadResult(aiData);

          // 4. Save metadata to Firestore only if authenticated
          if (user?.uid) {
            let summary = aiData.explanation || '';
            if (!summary && aiData.medicineTable && aiData.medicineTable.length > 0) {
              summary = aiData.medicineTable.map((m: any) => m.medicineName).join(', ');
            }

            const recordsRef = collection(db, 'users', user.uid, 'reports');
            await addDoc(recordsRef, {
              imageUrl: cloudinaryResponse.secure_url,
              publicId: cloudinaryResponse.public_id,
              uploadedAt: Timestamp.now(),
              fileType: file.type,
              originalFileName: file.name,
              recordType: 'prescription',
              aiSummary: summary,
            });

            // Refresh records list
            loadRecords();
          }
        } catch (err) {
          console.error(err);
          setUploadResult({ error: 'Could not process this image via AI, but it was uploaded successfully.' });
        } finally {
          setUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Upload process failed:', err);
      setUploadResult({ error: 'Failed to process image. Please check your connection.' });
      setUploading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-midnight)', color: 'var(--color-text-inverse)' }}>
      {/* Header */}
      <div className="flex items-center justify-between" style={{ padding: '1.25rem clamp(1.5rem, 5vw, 4rem)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <button onClick={() => navigate(-1)} className="flex items-center gap-2" style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '0.9rem' }}>
          <ArrowLeft size={18} /> {t('common.back')}
        </button>
        <span className="text-label" style={{ color: 'var(--color-teal-400)', fontSize: '0.7rem' }}>{t('health.title')}</span>
        <button onClick={() => fileInputRef.current?.click()} style={{ background: 'none', border: 'none', color: 'var(--color-teal-400)', cursor: 'pointer' }}>
          <Upload size={18} />
        </button>
      </div>
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleUpload} style={{ display: 'none' }} />

      <div style={{ maxWidth: '700px', margin: '0 auto', padding: 'clamp(1rem, 3vw, 2rem) clamp(1.5rem, 5vw, 4rem)' }}>
        {/* Upload area */}
        <motion.div
          whileHover={{ borderColor: 'var(--color-teal-500)' }}
          onClick={() => fileInputRef.current?.click()}
          style={{
            padding: '2rem', borderRadius: 'var(--radius-xl)',
            border: '2px dashed rgba(255,255,255,0.1)', textAlign: 'center',
            cursor: 'pointer', marginBottom: '1.5rem', transition: 'border-color 0.3s',
          }}
        >
          {uploading ? (
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--color-teal-400)', margin: '0 auto' }} />
          ) : (
            <>
              <Camera size={32} color="var(--color-teal-400)" style={{ margin: '0 auto 0.75rem' }} />
              <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{t('health.uploadTitle')}</p>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>{t('health.uploadDesc')}</p>
            </>
          )}
        </motion.div>

        {/* AI Upload Result */}
        <AnimatePresence>
          {uploadResult && !uploadResult.error && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="glass" style={{ borderRadius: 'var(--radius-xl)', padding: '1.25rem', marginBottom: '1.5rem' }}>
              <span className="text-label" style={{ color: 'var(--color-teal-400)', fontSize: '0.65rem', display: 'block', marginBottom: '0.75rem' }}>AI TRANSLATION</span>
              
              {uploadResult.explanation && (
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.95rem', marginBottom: '1.25rem', lineHeight: 1.6 }}>
                  {uploadResult.explanation}
                </p>
              )}

              {uploadResult.medicineTable?.map((med: any, i: number) => (
                <div key={i} style={{ padding: '0.75rem 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{med.medicineName}</p>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>
                    {med.dosage} · {med.frequency} · {med.duration}
                  </p>
                  {med.specialInstructions && med.specialInstructions !== 'Not specified in prescription' && (
                    <p style={{ color: 'var(--color-teal-400)', fontSize: '0.85rem', marginTop: '0.25rem' }}>{med.specialInstructions}</p>
                  )}
                </div>
              ))}
              {uploadResult.generalInstructions && <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginTop: '0.5rem' }}>{uploadResult.generalInstructions}</p>}
              
              <button 
                onClick={() => speechSynthesizer.speak(uploadResult.explanation || uploadResult.translatedText || '', language)} 
                className="btn-secondary flex items-center justify-center gap-2" 
                style={{ marginTop: '1rem', width: '100%', borderColor: voiceState === 'ai_speaking' ? 'var(--color-teal-400)' : 'rgba(255,255,255,0.15)', color: voiceState === 'ai_speaking' ? 'var(--color-teal-400)' : 'rgba(255,255,255,0.7)' }}
              >
                <Volume2 size={16} /> {voiceState === 'ai_speaking' ? t('common.stop') : t('common.listen')}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search */}
        <div className="flex items-center gap-2" style={{ marginBottom: '1rem' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('common.search')} className="input-field" style={{ paddingLeft: '2.25rem', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1.5px solid rgba(255,255,255,0.1)', minHeight: '44px', fontSize: '0.9rem' }} />
          </div>
        </div>

        {/* Filter chips */}
        <div className="flex flex-wrap gap-2" style={{ marginBottom: '1.25rem' }}>
          {[['all', 'All'], ['prescription', 'Prescriptions'], ['lab_report', 'Lab Reports'], ['vaccination', 'Vaccinations']].map(([val, label]) => (
            <button key={val} onClick={() => setFilterType(val)} style={{ padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-full)', border: 'none', background: filterType === val ? 'var(--color-teal-500)' : 'rgba(255,255,255,0.08)', color: filterType === val ? 'white' : 'rgba(255,255,255,0.5)', fontSize: '0.8rem', cursor: 'pointer' }}>{label}</button>
          ))}
        </div>

        {/* Records list */}
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="flex flex-col gap-3">
          {filtered.map((record) => (
            <motion.div key={record.id} variants={fadeInUp} className="glass" style={{ borderRadius: 'var(--radius-xl)', padding: '1rem 1.25rem' }}>
              <div className="flex items-start gap-3">
                <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: `${typeColors[record.type]}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: typeColors[record.type], flexShrink: 0 }}>
                  {typeIcons[record.type]}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.05em', color: typeColors[record.type], textTransform: 'uppercase' }}>{typeLabels[record.type]}</span>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.2rem' }}>{record.title}</h3>
                  <div className="flex items-center gap-2" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', marginBottom: '0.3rem' }}>
                    <Calendar size={12} /> {record.date}
                    {record.hospital && <span>· {record.hospital}</span>}
                  </div>
                  {record.summary && <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>{record.summary}</p>}
                </div>
                <div className="flex gap-1">
                  <button onClick={(e) => { e.stopPropagation(); handleListen(record); }} style={{ width: 32, height: 32, borderRadius: 'var(--radius-sm)', background: 'rgba(255,255,255,0.05)', border: 'none', color: voiceState === 'ai_speaking' ? 'var(--color-teal-400)' : 'rgba(255,255,255,0.4)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Volume2 size={14} /></button>
                  {record.imageUrl && (
                    <button onClick={(e) => { e.stopPropagation(); window.open(record.imageUrl, '_blank'); }} style={{ width: 32, height: 32, borderRadius: 'var(--radius-sm)', background: 'rgba(255,255,255,0.05)', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Eye size={14} /></button>
                  )}
                  <button onClick={(e) => handleDelete(record.id, e)} style={{ width: 32, height: 32, borderRadius: 'var(--radius-sm)', background: 'rgba(255,255,255,0.05)', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Trash2 size={14} /></button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'rgba(255,255,255,0.3)' }}>
            <FileText size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
            <p>{t('common.noResults')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
