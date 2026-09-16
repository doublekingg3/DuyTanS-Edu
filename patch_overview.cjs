const fs = require('fs');
let c = fs.readFileSync('src/components/TeacherView.tsx', 'utf8');

c = c.replace(
  /import AdminView from '\.\/AdminView';/,
  "import AdminView from './AdminView';\nimport AdminDashboard from './AdminDashboard';"
);

const overviewSearch = `{activeMenu === 'overview' && (
          <div className="p-8 h-full">
            <h2 className="text-2xl font-bold font-display text-slate-800 mb-2">Tổng quan lớp {allowedClasses.find(c => c.id === selectedClassId)?.name || ''}</h2>`;

const overviewReplace = `{activeMenu === 'overview' && (role === 'admin' || role === 'staff') && (
          <AdminDashboard classes={classes} students={students} schoolYearId={selectedYearId} />
        )}
        {activeMenu === 'overview' && role !== 'admin' && role !== 'staff' && (
          <div className="p-8 h-full">
            <h2 className="text-2xl font-bold font-display text-slate-800 mb-2">Tổng quan lớp {allowedClasses.find(c => c.id === selectedClassId)?.name || ''}</h2>`;

c = c.replace(overviewSearch, overviewReplace);

fs.writeFileSync('src/components/TeacherView.tsx', c);
