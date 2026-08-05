const fs = require('fs');
const file = 'src/App.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  "import Login from './components/Login';",
  "import Login from './components/Login';\nimport Portal from './components/Portal';"
);

code = code.replace(
  "export default function App() {\n  const [isAuthenticated, setIsAuthenticated] = useState(false);",
  "export default function App() {\n  const [appMode, setAppMode] = useState<'portal' | 'edu_manager'>('portal');\n  const [isAuthenticated, setIsAuthenticated] = useState(false);"
);

const targetRenderStr = `  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
        <h2 className="text-xl font-bold font-display text-slate-800">Đang tải dữ liệu...</h2>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login classes={classes} students={students} users={users} onLogin={handleLogin} />;
  }`;

const replaceRenderStr = `  if (appMode === 'portal') {
    return <Portal onSelectEduManager={() => setAppMode('edu_manager')} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
        <h2 className="text-xl font-bold font-display text-slate-800">Đang tải dữ liệu...</h2>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login classes={classes} students={students} users={users} onLogin={handleLogin} />;
  }`;

code = code.replace(targetRenderStr, replaceRenderStr);

fs.writeFileSync(file, code);
