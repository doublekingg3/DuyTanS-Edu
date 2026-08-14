const fs = require('fs');
let content = fs.readFileSync('src/components/AdminView.tsx', 'utf8');

const reportsHtml = `        {activeTab === 'reports' && (
          <AdminReports students={students} />
        )}`;

// insert it right before the last closing div of max-w-6xl container, or after firebase tab
content = content.replace(
  "        {activeTab === 'firebase' && (",
  reportsHtml + "\n\n        {activeTab === 'firebase' && ("
);

fs.writeFileSync('src/components/AdminView.tsx', content);
