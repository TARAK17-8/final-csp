// ═══════════════════════════════════════════════════════════════
// samaramAI — Language Selector Component
// Compact globe-icon dropdown for switching languages
// ═══════════════════════════════════════════════════════════════

import { useState, useRef, useEffect } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '@/types/common';
import { useTranslation } from '@/hooks/useTranslation';

// Primary languages shown at the top
const PRIMARY_CODES = ['en', 'te', 'hi', 'kn', 'ta'] as const;

export default function LanguageSelector({ variant = 'navbar' }: { variant?: 'navbar' | 'standalone' }) {
  const { language, setLanguage, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Close on ESC
  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsOpen(false);
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      return () => document.removeEventListener('keydown', handleEsc);
    }
  }, [isOpen]);

  const currentLang = SUPPORTED_LANGUAGES.find((l) => l.code === language);
  const primaryLangs = SUPPORTED_LANGUAGES.filter((l) => PRIMARY_CODES.includes(l.code as typeof PRIMARY_CODES[number]));
  const otherLangs = SUPPORTED_LANGUAGES.filter((l) => !PRIMARY_CODES.includes(l.code as typeof PRIMARY_CODES[number]));

  const isNavbar = variant === 'navbar';

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={t('langSelector.title')}
        aria-expanded={isOpen}
        id="language-selector-trigger"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: isNavbar ? '0.45rem 0.75rem' : '0.5rem 1rem',
          background: isOpen ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)',
          border: `1px solid ${isOpen ? 'var(--color-teal-400)' : 'rgba(255,255,255,0.15)'}`,
          borderRadius: 'var(--radius-full)',
          color: isNavbar ? 'var(--color-text-inverse)' : 'var(--color-text-primary)',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          fontSize: '0.8rem',
          fontFamily: 'var(--font-display)',
          fontWeight: 500,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
          e.currentTarget.style.borderColor = 'var(--color-teal-400)';
        }}
        onMouseLeave={(e) => {
          if (!isOpen) {
            e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
          }
        }}
      >
        <Globe size={14} />
        <span>{currentLang?.nativeName || 'English'}</span>
        <ChevronDown
          size={12}
          style={{
            transition: 'transform 0.2s',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
          }}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          role="listbox"
          aria-label={t('langSelector.title')}
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            minWidth: '240px',
            maxHeight: '400px',
            overflowY: 'auto',
            background: 'var(--color-midnight)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: '0 16px 48px rgba(0,0,0,0.4)',
            padding: '0.5rem',
            zIndex: 100,
            animation: 'drift-in 0.2s ease',
          }}
        >
          {/* Primary Languages */}
          <div style={{ padding: '0.4rem 0.75rem 0.25rem', fontSize: '0.65rem', fontWeight: 600, color: 'var(--color-teal-400)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {t('langSelector.primary')}
          </div>
          {primaryLangs.map((lang) => (
            <LanguageOption
              key={lang.code}
              lang={lang}
              isSelected={lang.code === language}
              onSelect={async () => {
                await setLanguage(lang.code);
                setIsOpen(false);
              }}
            />
          ))}

          {/* Divider */}
          {otherLangs.length > 0 && (
            <>
              <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '0.4rem 0.5rem' }} />
              <div style={{ padding: '0.4rem 0.75rem 0.25rem', fontSize: '0.65rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                {t('langSelector.other')}
              </div>
              {otherLangs.map((lang) => (
                <LanguageOption
                  key={lang.code}
                  lang={lang}
                  isSelected={lang.code === language}
                  onSelect={async () => {
                    await setLanguage(lang.code);
                    setIsOpen(false);
                  }}
                />
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function LanguageOption({
  lang,
  isSelected,
  onSelect,
}: {
  lang: { code: string; name: string; nativeName: string; flag: string };
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      role="option"
      aria-selected={isSelected}
      onClick={onSelect}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem',
        width: '100%',
        padding: '0.55rem 0.75rem',
        background: isSelected ? 'rgba(13, 148, 136, 0.15)' : 'transparent',
        border: 'none',
        borderRadius: 'var(--radius-sm)',
        color: isSelected ? 'var(--color-teal-300)' : 'var(--color-text-inverse)',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        textAlign: 'left',
        fontSize: '0.85rem',
        fontFamily: 'var(--font-body)',
      }}
      onMouseEnter={(e) => {
        if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
      }}
      onMouseLeave={(e) => {
        if (!isSelected) e.currentTarget.style.background = 'transparent';
      }}
    >
      <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>{lang.flag}</span>
      <span style={{ flex: 1 }}>
        <span style={{ fontWeight: isSelected ? 600 : 400 }}>{lang.nativeName}</span>
        {lang.nativeName !== lang.name && (
          <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', marginLeft: '0.4rem' }}>
            {lang.name}
          </span>
        )}
      </span>
      {isSelected && <Check size={14} style={{ color: 'var(--color-teal-400)' }} />}
    </button>
  );
}
