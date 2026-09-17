const fs = require('fs');

const replaceInFile = (file, regex, replacement) => {
  let c = fs.readFileSync(file, 'utf8');
  c = c.replace(regex, replacement);
  fs.writeFileSync(file, c);
};

// AdminView
replaceInFile('src/components/AdminView.tsx', 
  /<div className="h-full bg-slate-50 p-8 overflow-y-auto">/g, 
  '<div className="h-full bg-slate-50 p-4 md:p-6 lg:p-8 overflow-y-auto">');

// TeacherStudents
replaceInFile('src/components/TeacherStudents.tsx', 
  /<div className="flex flex-col h-full bg-slate-50 relative p-6">/g, 
  '<div className="flex flex-col h-full bg-slate-50 relative p-4 md:p-6">');

// TeacherGrades
replaceInFile('src/components/TeacherGrades.tsx', 
  /<div className="h-full flex flex-col bg-slate-50 p-6 overflow-hidden">/g, 
  '<div className="h-full flex flex-col bg-slate-50 p-4 md:p-6 overflow-hidden">');

// TeacherLunchMenu
replaceInFile('src/components/TeacherLunchMenu.tsx', 
  /<div className="p-8 h-full bg-slate-50 overflow-y-auto">/g, 
  '<div className="p-4 md:p-6 lg:p-8 h-full bg-slate-50 overflow-y-auto">');

// TeacherWeeklyPlan
replaceInFile('src/components/TeacherWeeklyPlan.tsx', 
  /<div className="p-8 h-full bg-slate-50 flex items-center justify-center text-slate-500">/g, 
  '<div className="p-4 md:p-6 lg:p-8 h-full bg-slate-50 flex items-center justify-center text-slate-500">');
replaceInFile('src/components/TeacherWeeklyPlan.tsx', 
  /<div className="p-8 h-full bg-slate-50 overflow-y-auto">/g, 
  '<div className="p-4 md:p-6 lg:p-8 h-full bg-slate-50 overflow-y-auto">');

// TeacherSchedule
replaceInFile('src/components/TeacherSchedule.tsx', 
  /<div className="p-6 h-full bg-slate-50 overflow-y-auto">/g, 
  '<div className="p-4 md:p-6 lg:p-8 h-full bg-slate-50 overflow-y-auto">');

// TeacherView - admin container
replaceInFile('src/components/TeacherView.tsx', 
  /<div className="p-6 h-full overflow-auto">/g, 
  '<div className="p-0 h-full overflow-hidden">'); // AdminView handles its own padding and scrolling

