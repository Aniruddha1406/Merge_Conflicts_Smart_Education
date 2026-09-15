'use client'

import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { locales } from '@/i18n/config';

export default function LanguageSelector() {
  const { locale, setLocale } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLocale = locales.find(l => l.code === locale) || locales[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="language-selector" ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          background: 'transparent', border: '1px solid var(--border-light)',
          padding: '0.375rem 0.75rem', borderRadius: 'var(--radius-full)',
          cursor: 'pointer', fontSize: '0.875rem', color: 'inherit'
        }}
      >
        <span aria-hidden="true">🌐</span>
        <span>{currentLocale.localName}</span>
        <span aria-hidden="true">▾</span>
      </button>
      
      {isOpen && (
        <ul 
          role="menu"
          style={{
            position: 'absolute', top: '100%', right: 0, marginTop: '0.5rem',
            background: 'var(--bg-surface)', border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)',
            padding: '0.5rem 0', minWidth: '150px', zIndex: 50,
            listStyle: 'none', margin: 0
          }}
        >
          {locales.map(l => (
            <li key={l.code} role="none" style={{ margin: 0 }}>
              <button
                role="menuitem"
                onClick={() => { setLocale(l.code); setIsOpen(false); }}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  padding: '0.5rem 1rem', background: 'transparent',
                  border: 'none', cursor: 'pointer',
                  fontSize: '0.875rem',
                  color: locale === l.code ? 'var(--cf-800)' : 'var(--text-secondary)',
                  fontWeight: locale === l.code ? '600' : '400'
                }}
              >
                {l.localName} {l.name !== l.localName ? `(${l.name})` : ''}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
