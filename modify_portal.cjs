const fs = require('fs');
const file = 'src/components/Portal.tsx';
let content = fs.readFileSync(file, 'utf8');

const importStatement = `import React from 'react';
import { Calendar, GraduationCap, ArrowRight } from 'lucide-react';
import { AppSettings } from '../data';`;

const propsSignature = `export default function Portal({ onSelectEduManager, settings }: { onSelectEduManager: () => void, settings?: AppSettings }) {`;

content = content.replace(/import React from 'react';\nimport \{ Calendar, GraduationCap, ArrowRight \} from 'lucide-react';/, importStatement);
content = content.replace(/export default function Portal\(\{ onSelectEduManager \}: \{ onSelectEduManager: \(\) => void \}\) \{/, propsSignature);

const bgStyle = `    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative" style={{ 
      backgroundImage: settings?.portalBackground ? \`url(\${settings.portalBackground})\` : 'none',
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }}>
      {settings?.portalBackground && <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-0"></div>}
      <div className="max-w-4xl w-full relative z-10">`;

content = content.replace(/    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">\n      <div className="max-w-4xl w-full">/, bgStyle);

const logoRender = `          {settings?.portalLogo ? (
            <img src={settings.portalLogo} alt="Logo" className="h-24 object-contain mb-6 mx-auto drop-shadow-xl" />
          ) : (
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-200 mb-6">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
          )}`;

content = content.replace(/          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-200 mb-6">\n            <GraduationCap className="w-8 h-8 text-white" \/>\n          <\/div>/, logoRender);

fs.writeFileSync(file, content);
