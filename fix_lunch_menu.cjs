const fs = require('fs');
let c = fs.readFileSync('src/components/TeacherLunchMenu.tsx', 'utf8');

c = c.replace(/import React, \{ useState \} from 'react';/, 
  "import React, { useState, useRef } from 'react';\nimport * as XLSX from 'xlsx';\nimport { useAlert } from '../contexts/AlertContext';");

c = c.replace(/import \{ Utensils, CheckCircle, ChevronLeft, ChevronRight, Download, Save, Plus, Trash2 \} from 'lucide-react';/,
  "import { Utensils, CheckCircle, ChevronLeft, ChevronRight, Download, Save, Plus, Trash2, Upload } from 'lucide-react';");

const stateSearch = `  const [menus, setMenus] = useState([
    { day: 'Thứ 2', dishes: 'Cơm trắng, Thịt kho trứng, Canh bí đỏ thịt bằm, Tráng miệng: Dưa hấu' },
    { day: 'Thứ 3', dishes: 'Bún bò xào, Canh cải ngọt tôm, Tráng miệng: Chuối' },
    { day: 'Thứ 4', dishes: 'Cơm trắng, Gà ram sả ớt, Canh chua cá lóc, Tráng miệng: Thanh long' },
    { day: 'Thứ 5', dishes: 'Phở gà, Tráng miệng: Sữa chua' },
    { day: 'Thứ 6', dishes: 'Cơm chiên Dương Châu, Canh súp rau củ, Tráng miệng: Bánh flan' }
  ]);`;

const stateReplace = `  const { showAlert } = useAlert();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [menus, setMenus] = useState([
    { day: 'Thứ 2', dishes: ['Cơm trắng, Thịt kho trứng', 'Canh bí đỏ thịt bằm'] },
    { day: 'Thứ 3', dishes: ['Bún bò xào', 'Canh cải ngọt tôm'] },
    { day: 'Thứ 4', dishes: ['Cơm trắng, Gà ram sả ớt', 'Canh chua cá lóc'] },
    { day: 'Thứ 5', dishes: ['Phở gà', 'Tráng miệng: Sữa chua'] },
    { day: 'Thứ 6', dishes: ['Cơm chiên Dương Châu', 'Canh súp rau củ'] },
    { day: 'Thứ 7', dishes: ['', ''] }
  ]);

  const handleAddDish = (dayIdx: number) => {
    const newMenus = [...menus];
    newMenus[dayIdx].dishes.push('');
    setMenus(newMenus);
  };

  const handleDishChange = (dayIdx: number, dishIdx: number, value: string) => {
    const newMenus = [...menus];
    newMenus[dayIdx].dishes[dishIdx] = value;
    setMenus(newMenus);
  };
  
  const handleRemoveDish = (dayIdx: number, dishIdx: number) => {
    const newMenus = [...menus];
    newMenus[dayIdx].dishes.splice(dishIdx, 1);
    setMenus(newMenus);
  };

  const handleDownloadTemplate = () => {
    const templateData = [
      ['Thứ', 'Món 1', 'Món 2', 'Món 3', 'Món 4'],
      ['Thứ 2', '', '', '', ''],
      ['Thứ 3', '', '', '', ''],
      ['Thứ 4', '', '', '', ''],
      ['Thứ 5', '', '', '', ''],
      ['Thứ 6', '', '', '', ''],
      ['Thứ 7', '', '', '', '']
    ];
    const ws = XLSX.utils.aoa_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "ThucDon");
    XLSX.writeFile(wb, "Mau_ThucDon.xlsx");
  };

  const handleUploadTemplate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
        
        if (data.length > 1) {
          const newMenus = days.map(day => ({ day, dishes: ['', ''] }));
          data.slice(1).forEach((row: any) => {
            const day = row[0];
            if (day) {
              const dayMenu = newMenus.find(m => m.day === day);
              if (dayMenu) {
                 const dishes = [];
                 for (let i = 1; i < row.length; i++) {
                   if (row[i]) dishes.push(row[i].toString());
                 }
                 if (dishes.length === 0) dishes.push('', '');
                 else if (dishes.length === 1) dishes.push('');
                 dayMenu.dishes = dishes;
              }
            }
          });
          setMenus(newMenus);
          showAlert('Nhập dữ liệu thành công!', 'success');
        }
      } catch (error) {
        showAlert('Lỗi khi đọc file', 'error');
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsBinaryString(file);
  };
`;
c = c.replace(stateSearch, stateReplace);

const buttonsSearch = `<div className="flex flex-col gap-2">
          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-amber-500 text-white font-medium rounded-lg hover:bg-amber-600 transition-colors">
            <Download className="w-4 h-4" /> Xuất thực đơn tháng (.pdf)
          </button>
        </div>`;
const buttonsReplace = `<div className="flex flex-col sm:flex-row gap-2">
          <button onClick={handleDownloadTemplate} className="flex items-center justify-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors">
            <Download className="w-4 h-4" /> Tải mẫu
          </button>
          <label className="flex items-center justify-center gap-2 px-4 py-2 border border-amber-500 text-amber-600 font-medium rounded-lg hover:bg-amber-50 transition-colors cursor-pointer">
            <Upload className="w-4 h-4" /> Upload mẫu
            <input type="file" ref={fileInputRef} onChange={handleUploadTemplate} accept=".xlsx, .xls, .csv" className="hidden" />
          </label>
          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-amber-500 text-white font-medium rounded-lg hover:bg-amber-600 transition-colors">
            <Download className="w-4 h-4" /> Xuất PDF
          </button>
        </div>`;
c = c.replace(buttonsSearch, buttonsReplace);

const menuListSearch = `<div className="space-y-4">
              {days.map((day, idx) => {
                const menu = menus.find(m => m.day === day);
                return (
                  <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 border border-slate-200 rounded-xl bg-white hover:border-amber-300 transition-colors">
                    <div className="w-24 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold shrink-0 border border-amber-100">{day}</div>
                    <input 
                      type="text"
                      placeholder="Nhập các món ăn (Ví dụ: Cơm, Canh chua...)"
                      value={menu?.dishes || ''}
                      onChange={(e) => {
                        const newMenus = [...menus];
                        const existingIdx = newMenus.findIndex(m => m.day === day);
                        if (existingIdx >= 0) {
                          newMenus[existingIdx].dishes = e.target.value;
                        } else {
                          newMenus.push({ day, dishes: e.target.value });
                        }
                        setMenus(newMenus);
                      }}
                      className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none font-medium text-slate-700"
                    />
                  </div>
                );
              })}
            </div>`;

const menuListReplace = `<div className="space-y-4">
              {days.map((day, idx) => {
                const dayMenu = menus.find(m => m.day === day) || { day, dishes: ['', ''] };
                const dayIdx = menus.findIndex(m => m.day === day);
                return (
                  <div key={idx} className="flex flex-col sm:flex-row items-start gap-4 p-4 border border-slate-200 rounded-xl bg-white hover:border-amber-300 transition-colors">
                    <div className="w-24 h-10 mt-1 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold shrink-0 border border-amber-100">{day}</div>
                    <div className="flex-1 w-full space-y-2">
                       {dayMenu.dishes.map((dish, dishIdx) => (
                         <div key={dishIdx} className="flex items-center gap-2">
                            <input 
                              type="text"
                              placeholder={\`Món \${dishIdx + 1} (Ví dụ: Cơm trắng, Canh chua)\`}
                              value={dish}
                              onChange={e => handleDishChange(dayIdx, dishIdx, e.target.value)}
                              className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none font-medium text-slate-700"
                            />
                            <button 
                              onClick={() => handleRemoveDish(dayIdx, dishIdx)}
                              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                         </div>
                       ))}
                       <button 
                         onClick={() => handleAddDish(dayIdx)}
                         className="text-sm font-medium text-amber-600 hover:text-amber-700 hover:bg-amber-50 px-2 py-1.5 rounded-md transition-colors flex items-center gap-1"
                       >
                         <Plus className="w-4 h-4" /> Thêm món
                       </button>
                    </div>
                  </div>
                );
              })}
            </div>`;

c = c.replace(menuListSearch, menuListReplace);

fs.writeFileSync('src/components/TeacherLunchMenu.tsx', c);
