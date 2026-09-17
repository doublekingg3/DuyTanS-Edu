const fs = require('fs');
let c = fs.readFileSync('src/components/AdminView.tsx', 'utf8');

// Replace table opening
c = c.replace(/\) : \(\n\s*<table className="w-full text-left border-collapse">/g, 
  ') : (\n                <div className="overflow-x-auto">\n                <table className="w-full text-left border-collapse">');

c = c.replace(/<div className="border border-slate-200 rounded-xl overflow-hidden">\n\s*<table className="w-full text-left border-collapse">/g, 
  '<div className="border border-slate-200 rounded-xl overflow-hidden overflow-x-auto">\n                <table className="w-full text-left border-collapse">');

// Now we need to close the div for the first 3 replacements.
// Let's check where the table closes.

fs.writeFileSync('src/components/AdminView.tsx', c);
