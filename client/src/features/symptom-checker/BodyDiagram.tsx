// ═══════════════════════════════════════════════════════════════
// samaramAI — Premium Anatomical Body Diagram SVG
// 18 clickable regions, circulatory system, 3D shading
// Front and Back views with smooth cross-fade
// ═══════════════════════════════════════════════════════════════

import { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { BodyView, BodyRegion } from '@/types/symptom';
import { BODY_REGIONS } from '@/types/symptom';
import { useTranslation } from '@/hooks/useTranslation';

interface BodyDiagramProps {
  onSelectRegion: (region: BodyRegion) => void;
  selectedRegionId?: string | null;
}

function BodyDiagram({ onSelectRegion, selectedRegionId }: BodyDiagramProps) {
  const [view, setView] = useState<BodyView>('front');
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const { t } = useTranslation();

  const currentRegions = BODY_REGIONS.filter((r) => r.view === view);

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '450px', margin: '0 auto' }}>
      {/* Front/Back Toggle */}
      <div className="flex justify-center gap-2" style={{ marginBottom: '1.5rem' }}>
        {(['front', 'back'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            style={{
              padding: '0.5rem 1.5rem',
              borderRadius: 'var(--radius-full)',
              border: 'none',
              background: view === v ? 'var(--color-teal-500)' : 'rgba(255,255,255,0.08)',
              color: view === v ? 'white' : 'rgba(255,255,255,0.5)',
              fontSize: '0.85rem',
              fontWeight: 600,
              fontFamily: 'var(--font-display)',
              cursor: 'pointer',
              transition: 'all 0.3s',
              textTransform: 'capitalize',
            }}
          >
            {v === 'front' ? t('symptom.frontView') : t('symptom.backView')}
          </button>
        ))}
      </div>

      {/* Body Container */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '1 / 1.5',
          background: 'radial-gradient(ellipse at center, rgba(13,148,136,0.06) 0%, transparent 70%)',
          borderRadius: 'var(--radius-2xl)',
          overflow: 'visible',
        }}
      >
        <AnimatePresence mode="wait">
          <motion.svg
            key={view}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            viewBox="0 0 400 580"
            style={{ width: '100%', height: '100%' }}
          >
            <defs>
              {/* 3D body shading gradients */}
              <linearGradient id="bodyGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="rgba(255,255,255,0.06)" />
                <stop offset="50%" stopColor="rgba(255,255,255,0.1)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0.03)" />
              </linearGradient>
              <linearGradient id="skinGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="rgba(200,180,170,0.12)" />
                <stop offset="100%" stopColor="rgba(180,160,150,0.06)" />
              </linearGradient>
              {/* Glow filter for selected/hovered regions */}
              <filter id="glowFilter">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* ═══ Body Silhouette ═══ */}
            {view === 'front' ? (
              <g>
                {/* Head */}
                <ellipse cx="200" cy="62" rx="38" ry="45" fill="url(#skinGrad)" stroke="rgba(255,255,255,0.15)" strokeWidth="1.2" />
                {/* Skull faint outline */}
                <ellipse cx="200" cy="58" rx="28" ry="34" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.8" />
                {/* Face features (subtle) */}
                <ellipse cx="186" cy="55" rx="4" ry="3" fill="rgba(255,255,255,0.06)" />
                <ellipse cx="214" cy="55" rx="4" ry="3" fill="rgba(255,255,255,0.06)" />
                <path d="M195 68 Q200 73 205 68" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.8" />

                {/* Neck */}
                <path d="M185 105 L185 125 Q200 130 215 125 L215 105" fill="url(#skinGrad)" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />

                {/* Clavicles */}
                <path d="M160 133 Q180 128 200 130 Q220 128 240 133" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

                {/* Torso */}
                <path d="M155 135 Q150 140 148 170 L148 200 Q148 230 150 260 Q155 300 160 330 Q170 350 190 355 L210 355 Q230 350 240 330 Q245 300 252 260 Q254 230 252 200 L252 170 Q250 140 245 135 Z"
                  fill="url(#bodyGrad)" stroke="rgba(255,255,255,0.12)" strokeWidth="1.2" />

                {/* Rib cage (subtle) */}
                {[155, 170, 185, 200].map((y, i) => (
                  <path key={`rib-${i}`} d={`M170 ${y} Q200 ${y + 5} 230 ${y}`} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.6" />
                ))}

                {/* Circulatory system — Arteries (red) */}
                <g opacity="0.15">
                  {/* Aorta */}
                  <path d="M200 140 L195 180 L195 260 L195 320" stroke="#E8564A" strokeWidth="1.5" fill="none" />
                  {/* Carotid */}
                  <path d="M195 130 L190 115 L190 100" stroke="#E8564A" strokeWidth="1" fill="none" />
                  <path d="M205 130 L210 115 L210 100" stroke="#E8564A" strokeWidth="1" fill="none" />
                  {/* Subclavian / Brachial */}
                  <path d="M180 145 L150 155 L130 200 L120 260 L115 310" stroke="#E8564A" strokeWidth="0.8" fill="none" />
                  <path d="M220 145 L250 155 L270 200 L280 260 L285 310" stroke="#E8564A" strokeWidth="0.8" fill="none" />
                  {/* Femoral */}
                  <path d="M185 330 L180 380 L175 440 L172 500" stroke="#E8564A" strokeWidth="0.8" fill="none" />
                  <path d="M215 330 L220 380 L225 440 L228 500" stroke="#E8564A" strokeWidth="0.8" fill="none" />
                </g>

                {/* Veins (blue) */}
                <g opacity="0.1">
                  <path d="M205 140 L208 180 L208 260 L208 320" stroke="#6B8EDE" strokeWidth="1.2" fill="none" />
                  <path d="M175 150 L145 160 L125 210 L112 280" stroke="#6B8EDE" strokeWidth="0.7" fill="none" />
                  <path d="M225 150 L255 160 L275 210 L288 280" stroke="#6B8EDE" strokeWidth="0.7" fill="none" />
                </g>

                {/* Organ regions (extremely faint) */}
                {/* Heart */}
                <ellipse cx="210" cy="180" rx="18" ry="16" fill="rgba(232,86,74,0.04)" />
                {/* Liver */}
                <ellipse cx="175" cy="235" rx="25" ry="18" fill="rgba(160,120,80,0.03)" />
                {/* Stomach */}
                <ellipse cx="215" cy="245" rx="18" ry="14" fill="rgba(200,180,100,0.03)" />
                {/* Bladder */}
                <ellipse cx="200" cy="330" rx="14" ry="12" fill="rgba(100,150,200,0.03)" />

                {/* Arms */}
                {/* Left arm */}
                <path d="M148 140 Q135 145 125 165 L110 230 Q105 260 100 290 L95 330 Q92 345 90 355"
                  fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1.2" />
                <path d="M148 140 Q140 148 132 168 L118 233 Q113 263 108 293 L103 333 Q100 348 98 358"
                  fill="url(#skinGrad)" stroke="none" />
                {/* Right arm */}
                <path d="M252 140 Q265 145 275 165 L290 230 Q295 260 300 290 L305 330 Q308 345 310 355"
                  fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1.2" />
                <path d="M252 140 Q260 148 268 168 L282 233 Q287 263 292 293 L297 333 Q300 348 302 358"
                  fill="url(#skinGrad)" stroke="none" />

                {/* Hands (simplified) */}
                <ellipse cx="93" cy="362" rx="10" ry="14" fill="url(#skinGrad)" stroke="rgba(255,255,255,0.08)" strokeWidth="0.8" />
                <ellipse cx="307" cy="362" rx="10" ry="14" fill="url(#skinGrad)" stroke="rgba(255,255,255,0.08)" strokeWidth="0.8" />

                {/* Legs */}
                <path d="M170 350 Q165 380 163 420 L160 470 Q158 500 157 530 L155 560"
                  fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1.2" />
                <path d="M190 355 Q185 380 182 420 L179 470 Q177 500 176 530 L174 560"
                  fill="url(#skinGrad)" stroke="none" />
                <path d="M230 350 Q235 380 237 420 L240 470 Q242 500 243 530 L245 560"
                  fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1.2" />
                <path d="M210 355 Q215 380 218 420 L221 470 Q223 500 224 530 L226 560"
                  fill="url(#skinGrad)" stroke="none" />

                {/* Knee joints */}
                <circle cx="170" cy="430" r="6" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.8" />
                <circle cx="230" cy="430" r="6" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.8" />

                {/* Feet */}
                <ellipse cx="164" cy="565" rx="14" ry="8" fill="url(#skinGrad)" stroke="rgba(255,255,255,0.08)" strokeWidth="0.8" />
                <ellipse cx="236" cy="565" rx="14" ry="8" fill="url(#skinGrad)" stroke="rgba(255,255,255,0.08)" strokeWidth="0.8" />
              </g>
            ) : (
              /* ═══ BACK VIEW ═══ */
              <g>
                {/* Head back */}
                <ellipse cx="200" cy="62" rx="38" ry="45" fill="url(#skinGrad)" stroke="rgba(255,255,255,0.15)" strokeWidth="1.2" />
                {/* Neck back */}
                <path d="M185 105 L185 125 Q200 130 215 125 L215 105" fill="url(#skinGrad)" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
                {/* Back torso */}
                <path d="M155 135 Q150 140 148 170 L148 200 Q148 230 150 260 Q155 300 160 330 Q170 350 190 355 L210 355 Q230 350 240 330 Q245 300 252 260 Q254 230 252 200 L252 170 Q250 140 245 135 Z"
                  fill="url(#bodyGrad)" stroke="rgba(255,255,255,0.12)" strokeWidth="1.2" />
                {/* Spine */}
                <g opacity="0.12">
                  {Array.from({ length: 20 }, (_, i) => (
                    <rect key={`vert-${i}`} x="197" y={130 + i * 12} width="6" height="8" rx="1" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
                  ))}
                </g>
                {/* Shoulder blades (scapulae) */}
                <path d="M160 155 Q170 170 175 195 Q170 205 160 200 Q155 185 160 155" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.06)" strokeWidth="0.8" />
                <path d="M240 155 Q230 170 225 195 Q230 205 240 200 Q245 185 240 155" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.06)" strokeWidth="0.8" />
                {/* Kidneys */}
                <ellipse cx="178" cy="265" rx="14" ry="18" fill="rgba(200,150,100,0.04)" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
                <ellipse cx="222" cy="265" rx="14" ry="18" fill="rgba(200,150,100,0.04)" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
                {/* Arms */}
                <path d="M148 140 Q135 145 125 165 L110 230 Q105 260 100 290 L95 330 Q92 345 90 355" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1.2" />
                <path d="M252 140 Q265 145 275 165 L290 230 Q295 260 300 290 L305 330 Q308 345 310 355" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1.2" />
                <ellipse cx="93" cy="362" rx="10" ry="14" fill="url(#skinGrad)" stroke="rgba(255,255,255,0.08)" strokeWidth="0.8" />
                <ellipse cx="307" cy="362" rx="10" ry="14" fill="url(#skinGrad)" stroke="rgba(255,255,255,0.08)" strokeWidth="0.8" />
                {/* Legs */}
                <path d="M170 350 Q165 380 163 420 L160 470 Q158 500 157 530 L155 560" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1.2" />
                <path d="M230 350 Q235 380 237 420 L240 470 Q242 500 243 530 L245 560" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1.2" />
                <ellipse cx="164" cy="565" rx="14" ry="8" fill="url(#skinGrad)" stroke="rgba(255,255,255,0.08)" strokeWidth="0.8" />
                <ellipse cx="236" cy="565" rx="14" ry="8" fill="url(#skinGrad)" stroke="rgba(255,255,255,0.08)" strokeWidth="0.8" />
              </g>
            )}

            {/* ═══ Interactive Regions ═══ */}
            {currentRegions.map((region) => {
              const isHovered = hoveredRegion === region.id;
              const isSelected = selectedRegionId === region.id;
              const regionPaths = getRegionPath(region.id);

              return (
                <g key={region.id}>
                  {/* Clickable region */}
                  <motion.path
                    d={regionPaths}
                    fill={isSelected ? 'rgba(13,148,136,0.25)' : isHovered ? 'rgba(13,148,136,0.15)' : 'rgba(13,148,136,0.04)'}
                    stroke={isSelected ? 'var(--color-teal-400)' : isHovered ? 'rgba(13,148,136,0.5)' : 'rgba(13,148,136,0.15)'}
                    strokeWidth={isSelected ? 2 : isHovered ? 1.5 : 0.8}
                    style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                    filter={isSelected ? 'url(#glowFilter)' : undefined}
                    onMouseEnter={() => setHoveredRegion(region.id)}
                    onMouseLeave={() => setHoveredRegion(null)}
                    onClick={() => onSelectRegion(region)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  />

                  {/* Pulse ring on hover */}
                  {isHovered && (
                    <motion.circle
                      cx={region.centerX}
                      cy={region.centerY}
                      r={20}
                      fill="none"
                      stroke="var(--color-teal-400)"
                      strokeWidth="1"
                      initial={{ r: 10, opacity: 0.6 }}
                      animate={{ r: 30, opacity: 0 }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                  )}
                </g>
              );
            })}
          </motion.svg>
        </AnimatePresence>

        {/* Tooltip */}
        <AnimatePresence>
          {hoveredRegion && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="glass"
              style={{
                position: 'absolute',
                bottom: '1rem',
                left: '50%',
                transform: 'translateX(-50%)',
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem',
                color: 'var(--color-text-inverse)',
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
              }}
            >
              {BODY_REGIONS.find((r) => r.id === hoveredRegion)?.name} — {t('symptom.tapToBegin')}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Region hit areas (clickable paths covering each anatomical zone)
function getRegionPath(regionId: string): string {
  const paths: Record<string, string> = {
    // Front regions
    'head-face': 'M162 17 Q200 5 238 17 Q250 40 245 70 Q238 100 220 107 Q200 110 180 107 Q162 100 155 70 Q150 40 162 17 Z',
    'throat-neck': 'M180 107 Q200 110 220 107 L218 135 Q200 138 182 135 Z',
    'left-chest': 'M200 135 L248 140 Q255 165 255 200 L200 200 Z',
    'right-chest': 'M200 135 L152 140 Q145 165 145 200 L200 200 Z',
    'upper-abdomen': 'M148 200 L252 200 L252 270 L148 270 Z',
    'lower-abdomen': 'M150 270 L250 270 Q245 310 238 340 L162 340 Q155 310 150 270 Z',
    'left-arm': 'M252 135 Q270 145 282 170 L298 240 Q305 280 310 320 L315 365 L295 365 L285 320 Q280 280 273 240 L258 170 Q255 155 248 140 Z',
    'right-arm': 'M148 135 Q130 145 118 170 L102 240 Q95 280 90 320 L85 365 L105 365 L115 320 Q120 280 127 240 L142 170 Q145 155 152 140 Z',
    'left-leg': 'M200 340 L238 340 Q240 380 242 420 L248 480 L250 560 L220 560 L218 480 L215 420 Q212 380 200 340 Z',
    'right-leg': 'M200 340 L162 340 Q160 380 158 420 L152 480 L150 560 L180 560 L182 480 L185 420 Q188 380 200 340 Z',
    // Back regions
    'back-head': 'M162 17 Q200 5 238 17 Q250 40 245 70 Q238 100 220 107 Q200 110 180 107 Q162 100 155 70 Q150 40 162 17 Z',
    'back-neck': 'M180 107 Q200 110 220 107 L218 135 Q200 138 182 135 Z',
    'upper-back': 'M152 135 L248 135 Q255 165 255 220 L145 220 Q145 165 152 135 Z',
    'lower-back': 'M148 220 L252 220 L252 320 Q245 340 238 345 L162 345 Q155 340 148 320 Z',
    'left-hip': 'M200 345 L240 345 Q238 370 235 395 L200 395 Z',
    'right-hip': 'M200 345 L160 345 Q162 370 165 395 L200 395 Z',
    'left-back-leg': 'M200 395 L235 395 Q240 430 245 480 L248 560 L218 560 L215 480 Q212 430 200 395 Z',
    'right-back-leg': 'M200 395 L165 395 Q160 430 155 480 L152 560 L182 560 L185 480 Q188 430 200 395 Z',
  };
  return paths[regionId] || '';
}

export default memo(BodyDiagram);
