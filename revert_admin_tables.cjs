const fs = require('fs');
let c = fs.readFileSync('src/components/AdminView.tsx', 'utf8');

// Revert 913, 1188 (where we injected <div className="overflow-x-auto"> between parent and table)
c = c.replace(/<div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">\n\s*<div className="overflow-x-auto">\n\s*<table className="w-full text-left border-collapse">/g, 
  '<div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto flex flex-col">\n              <table className="w-full text-left border-collapse">');

// Revert 1402
c = c.replace(/<div className="border border-slate-200 rounded-xl overflow-hidden overflow-x-auto">\n\s*<table className="w-full text-left border-collapse">/g, 
  '<div className="border border-slate-200 rounded-xl overflow-x-auto">\n                <table className="w-full text-left border-collapse">');

// Revert 2054, 2214, 2373
c = c.replace(/\) : \(\n\s*<div className="overflow-x-auto">\n\s*<table className="w-full text-left border-collapse">/g, 
  ') : (\n                <div className="overflow-x-auto">\n                <table className="w-full text-left border-collapse">'); 
// Wait, for 2054, we need the wrapper because there is no parent div. The parent is ) : (
// BUT we added an extra </div> in close_admin_div.cjs:
c = c.replace(/<\/table>\n\s*<\/div>\n\s*\)\}/g, '</table>\n              )}');

fs.writeFileSync('src/components/AdminView.tsx', c);
