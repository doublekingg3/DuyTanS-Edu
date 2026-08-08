const fs = require('fs');
const file = 'src/components/Login.tsx';
let content = fs.readFileSync(file, 'utf8');

const bgStyle = `    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 relative" style={{ 
      backgroundImage: settings?.loginBackground ? \`url(\${settings.loginBackground})\` : 'none',
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }}>
      {settings?.loginBackground && <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-0"></div>}
      <div className="w-full max-w-md relative z-10">
        {onBack && (
          <button 
            onClick={onBack}
            className="absolute -top-16 left-0 flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-xl shadow-sm border border-white/20 text-slate-700 hover:text-indigo-600 transition-all font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Về Portal</span>
          </button>
        )}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">`;

// Need to match exactly what is there
const toReplace = `    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 relative">
      {onBack && (
        <button 
          onClick={onBack}
          className="absolute top-4 left-4 sm:top-8 sm:left-8 flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-200 transition-all font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="hidden sm:inline">Về Portal</span>
        </button>
      )}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">`;

content = content.replace(toReplace, bgStyle);

fs.writeFileSync(file, content);
