import React from 'react';

interface SchoolLogoProps {
  src?: string;
  className?: string;
  size?: number;
}

export default function SchoolLogo({ src, className = "w-11 h-11", size = 44 }: SchoolLogoProps) {
  if (src) {
    return (
      <img 
        src={src} 
        alt="Trường Phổ Thông Duy Tân" 
        className={`${className} rounded-full object-cover shadow-xs border border-teal-200`} 
      />
    );
  }

  // Crisp SVG seal inspired by Duy Tan School emblem
  return (
    <div className={`relative flex items-center justify-center rounded-full ${className} shrink-0 shadow-xs select-none overflow-hidden`}>
      <svg 
        viewBox="0 0 100 100" 
        className="w-full h-full"
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer Ring */}
        <circle cx="50" cy="50" r="48" fill="#ffffff" stroke="#0284c7" strokeWidth="3" />
        <circle cx="50" cy="50" r="44" fill="#f0fdfa" stroke="#0d9488" strokeWidth="1.5" />
        
        {/* Inner Ring */}
        <circle cx="50" cy="50" r="33" fill="#0d9488" />
        
        {/* Stylized Book & Torch */}
        <path 
          d="M32 58C38 54 46 54 50 58C54 54 62 54 68 58V40C62 36 54 36 50 40C46 36 38 36 32 40V58Z" 
          fill="#ffffff" 
        />
        <path 
          d="M50 34V58" 
          stroke="#0f766e" 
          strokeWidth="2" 
          strokeLinecap="round" 
        />
        {/* Flame / Star */}
        <path 
          d="M50 24C48 27 46 29 48 32C49 33 51 33 52 32C54 29 52 27 50 24Z" 
          fill="#f59e0b" 
        />

        {/* Text Arc around ring */}
        <path 
          id="textArc" 
          d="M 18,50 A 32,32 0 1,1 82,50" 
          fill="none" 
        />
        <text fontSize="8.5" fontWeight="bold" fill="#0369a1" letterSpacing="0.5">
          <textPath href="#textArc" startOffset="50%" textAnchor="middle">
            DUY TÂN
          </textPath>
        </text>

        <path 
          id="textArcBottom" 
          d="M 82,50 A 32,32 0 0,1 18,50" 
          fill="none" 
        />
        <text fontSize="7" fontWeight="bold" fill="#0f766e" letterSpacing="0.2">
          <textPath href="#textArcBottom" startOffset="50%" textAnchor="middle">
            EST. 2002
          </textPath>
        </text>
      </svg>
    </div>
  );
}
