const fs = require('fs');
let c = fs.readFileSync('src/components/ParentView.tsx', 'utf8');

c = c.replace(/\{activeTab === 'history' && \([\s\S]*?\{activeTab === 'grades' && \(/, '{activeTab === \'grades\' && (');
c = c.replace(/\{activeTab === 'grades' && \([\s\S]*?\{activeTab === 'notifications' && \(/, '{activeTab === \'notifications\' && (');

// Remove notifications block
const notifMatch = c.match(/\{activeTab === 'notifications' && \([\s\S]*?\}\s*<\/div>\s*<\/div>\s*\);\s*\}/);
if (notifMatch) {
  c = c.replace(notifMatch[0], '      </div>\n    </div>\n  );\n}');
}

fs.writeFileSync('src/components/ParentView.tsx', c);
