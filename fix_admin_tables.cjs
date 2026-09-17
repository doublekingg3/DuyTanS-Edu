const fs = require('fs');
let c = fs.readFileSync('src/components/AdminView.tsx', 'utf8');

c = c.replace(/<div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">\n\s*<table className="w-full text-left border-collapse">/g, 
  '<div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">\n            <div className="overflow-x-auto">\n              <table className="w-full text-left border-collapse">');

c = c.replace(/<\/tbody>\n\s*<\/table>\n\s*<\/div>\n\s*<\/div>\n\s*<\/div>\n\s*<\/div>\n\s*<\/div>\n\s*\);/g, 
  '</tbody>\n                </table>\n              </div>\n            </div>\n          </div>\n        </div>\n      </div>\n    </div>\n  );'); // This is risky, I will write a custom regex for it, or just use sed.
fs.writeFileSync('src/components/AdminView.tsx', c);
