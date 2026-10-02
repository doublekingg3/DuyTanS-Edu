import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export function VietnamFlag({ className = "w-6 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 30 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="30" height="20" rx="2.5" fill="#DA251D" />
      <polygon
        points="15,4 16.35,8.15 20.71,8.15 17.02,10.84 18.43,15.21 15,12.68 11.57,15.21 12.98,10.84 9.29,8.15 13.65,8.15"
        fill="#FFCD00"
      />
    </svg>
  );
}

export function UKFlag({ className = "w-6 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 60 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <clipPath id="uk-flag-round-clip">
          <rect width="60" height="40" rx="5" />
        </clipPath>
      </defs>
      <rect width="60" height="40" rx="5" fill="#012169" />
      <g clipPath="url(#uk-flag-round-clip)">
        {/* White Saltire */}
        <path d="M0,0 L60,40 M60,0 L0,40" stroke="#FFFFFF" strokeWidth="9" />
        {/* Red Saltire */}
        <path d="M0,0 L60,40 M60,0 L0,40" stroke="#C8102E" strokeWidth="3.5" />
        {/* White St George Cross */}
        <path d="M30,0 V40 M0,20 H60" stroke="#FFFFFF" strokeWidth="13" />
        {/* Red St George Cross */}
        <path d="M30,0 V40 M0,20 H60" stroke="#C8102E" strokeWidth="7" />
      </g>
    </svg>
  );
}

interface LanguageSwitcherProps {
  className?: string;
}

export default function LanguageSwitcher({ className = "" }: LanguageSwitcherProps) {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div 
      className={`inline-flex items-center p-1 rounded-xl bg-teal-50/90 border border-teal-200/80 shadow-2xs shrink-0 ${className}`} 
      title={t('switchLanguage', 'Chuyển đổi ngôn ngữ')}
    >
      <button
        type="button"
        onClick={() => setLanguage('vi')}
        className={`p-1.5 rounded-lg transition-all flex items-center justify-center cursor-pointer ${
          language === 'vi'
            ? 'bg-white shadow-xs ring-1.5 ring-teal-500 scale-105'
            : 'opacity-60 hover:opacity-100 hover:bg-white/60'
        }`}
        title="Tiếng Việt"
        aria-label="Tiếng Việt"
      >
        <VietnamFlag className="w-6 h-4 rounded-xs shadow-2xs" />
      </button>

      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`p-1.5 rounded-lg transition-all flex items-center justify-center cursor-pointer ${
          language === 'en'
            ? 'bg-white shadow-xs ring-1.5 ring-teal-500 scale-105'
            : 'opacity-60 hover:opacity-100 hover:bg-white/60'
        }`}
        title="English"
        aria-label="English"
      >
        <UKFlag className="w-6 h-4 rounded-xs shadow-2xs" />
      </button>
    </div>
  );
}
