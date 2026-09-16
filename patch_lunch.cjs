const fs = require('fs');

function patchLunch(file) {
  let c = fs.readFileSync(file, 'utf8');
  if (file === 'src/components/ParentLunchMenu.tsx') {
    c = c.replace(/import React, \{ useState \} from 'react';/, "import React, { useState, useRef } from 'react';");
  }
  
  const scrollAdd = `
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollLeft = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: -200, behavior: 'smooth' });
  };
  const scrollRight = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: 200, behavior: 'smooth' });
  };
  `;
  
  if (file === 'src/components/ParentLunchMenu.tsx') {
    c = c.replace(/const \[selectedWeek, setSelectedWeek\] = useState\(5\);/, "const [selectedWeek, setSelectedWeek] = useState(5);" + scrollAdd);
  } else {
    c = c.replace(/const \{ showAlert, showConfirm \} = useAlert\(\);/, "const { showAlert, showConfirm } = useAlert();" + scrollAdd);
  }
  
  c = c.replace(/<button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400"><ChevronLeft className="w-5 h-5" \/><\/button>/g, 
    `<button onClick={scrollLeft} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400"><ChevronLeft className="w-5 h-5" /></button>`);
    
  c = c.replace(/<button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400"><ChevronRight className="w-5 h-5" \/><\/button>/g, 
    `<button onClick={scrollRight} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400"><ChevronRight className="w-5 h-5" /></button>`);
    
  c = c.replace(/<div className="flex flex-1 gap-2 overflow-x-auto pb-2 \[\&::-webkit-scrollbar\]:hidden">/g, 
    `<div ref={scrollRef} className="flex flex-1 gap-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden" style={{ scrollBehavior: 'smooth' }}>`);
    
  fs.writeFileSync(file, c);
}

patchLunch('src/components/TeacherLunchMenu.tsx');
patchLunch('src/components/ParentLunchMenu.tsx');
