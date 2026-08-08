const fs = require('fs');
const file = 'src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "    return <Portal onSelectEduManager={() => setAppMode('edu_manager')} />;",
  "    return <Portal onSelectEduManager={() => setAppMode('edu_manager')} settings={settings} />;"
);

content = content.replace(
  "return <Login classes={classes} students={students} users={users} onLogin={handleLogin} onBack={() => setAppMode('portal')} />;",
  "return <Login classes={classes} students={students} users={users} onLogin={handleLogin} onBack={() => setAppMode('portal')} settings={settings} />;"
);

content = content.replace(
  "<AdminView classes={classes} students={students} users={users} schoolYears={schoolYears} />",
  "<AdminView classes={classes} students={students} users={users} schoolYears={schoolYears} settings={settings} />"
);

fs.writeFileSync(file, content);
