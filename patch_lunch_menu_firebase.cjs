const fs = require('fs');
let c = fs.readFileSync('src/components/TeacherLunchMenu.tsx', 'utf8');

const importsStr = `import React, { useState, useRef, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { useAlert } from '../contexts/AlertContext';
import { Utensils, CheckCircle, ChevronLeft, ChevronRight, Download, Save, Plus, Trash2, Upload, X } from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';`;

c = c.replace(/import React.*?lucide-react';/s, importsStr);

const stateInitStr = `export default function TeacherLunchMenu({ classId, role, schoolYearName }: { classId: string, role?: string, schoolYearName?: string }) {
  const [weeks, setWeeks] = useState<{id: number, name: string, status: string}[]>([]);
  const [selectedWeek, setSelectedWeek] = useState(5);
  const { showAlert, showConfirm } = useAlert();
  const [loading, setLoading] = useState(true);
  const [menus, setMenus] = useState<{day: string, dishes: string[]}[]>([]);

  useEffect(() => {
    // We use a global document for lunch menus for the whole school
    const docRef = doc(db, 'lunch_menus', 'general');
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      const data = snapshot.data();
      
      const newWeeks = Array.from({ length: 42 }, (_, i) => {
        const weekId = i + 1;
        const weekData = data?.weeks?.[weekId];
        return {
          id: weekId,
          name: \`Tuần \${weekId}\`,
          status: weekData?.status || 'empty'
        };
      });
      setWeeks(newWeeks);
      
      const currentWeekData = data?.weeks?.[selectedWeek];
      if (currentWeekData?.menus) {
        setMenus(currentWeekData.menus);
      } else {
        setMenus([
          { day: 'Thứ 2', dishes: [] },
          { day: 'Thứ 3', dishes: [] },
          { day: 'Thứ 4', dishes: [] },
          { day: 'Thứ 5', dishes: [] },
          { day: 'Thứ 6', dishes: [] }
        ]);
      }
      
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [selectedWeek, schoolYearName]);

  const saveToFirebase = async (weekId: number, updateData: any) => {
    try {
      await setDoc(doc(db, 'lunch_menus', 'general'), {
        weeks: {
          [weekId]: updateData
        }
      }, { merge: true });
    } catch (e) {
      console.error(e);
      showAlert('Lỗi khi lưu dữ liệu lên server.', 'error');
    }
  };

  const handleApprove = async () => {
    const confirmed = await showConfirm(\`Bạn có chắc chắn muốn duyệt thực đơn tuần \${selectedWeek} không?\`);
    if (confirmed) {
      await saveToFirebase(selectedWeek, { status: 'approved' });
      showAlert('Duyệt thực đơn thành công! Áp dụng cho toàn bộ các lớp.', 'success');
    }
  };

  const handleSaveDraft = async () => {
    await saveToFirebase(selectedWeek, { status: 'draft', menus });
    showAlert('Đã lưu nháp thực đơn', 'success');
  };

  const handleCancelApprove = async () => {
    const confirmed = await showConfirm('Bạn có chắc chắn muốn hủy duyệt thực đơn tuần này không?');
    if (confirmed) {
      await saveToFirebase(selectedWeek, { status: 'draft' });
      showAlert('Đã hủy duyệt thực đơn.', 'success');
    }
  };`;

// Replace from export default to fileInputRef
const stateRegex = /export default function TeacherLunchMenu.*?(?=const fileInputRef = useRef<HTMLInputElement>\(null\);)/s;
c = c.replace(stateRegex, stateInitStr + "\n  ");

// In menus.map, replacing the input onChange and button onClick to update the state.
// Currently it updates the state directly. But it's better to update state, and the user must click "Save Draft" to push menus, OR we can push it automatically on blur.
// Since it's a global setting, maybe we should push it automatically.
const updateDishRegex = /const newMenus = \[\.\.\.menus\];\s*newMenus\[dayIdx\]\.dishes\[dishIdx\] = e\.target\.value;\s*setMenus\(newMenus\);/g;
const updateDishReplacement = `const newMenus = [...menus];
                        newMenus[dayIdx].dishes[dishIdx] = e.target.value;
                        setMenus(newMenus);`;
c = c.replace(updateDishRegex, updateDishReplacement);

const blurDishRegex = /className="flex-1 px-4 py-2 bg-transparent outline-none font-medium text-slate-700"/g;
const blurDishReplacement = `className="flex-1 px-4 py-2 bg-transparent outline-none font-medium text-slate-700"
                        onBlur={() => saveToFirebase(selectedWeek, { menus })}`;
c = c.replace(blurDishRegex, blurDishReplacement);

// Deleting dish
const delDishRegex = /onClick=\{\(\) => \{\s*const newMenus = \[\.\.\.menus\];\s*newMenus\[dayIdx\]\.dishes\.splice\(dishIdx, 1\);\s*setMenus\(newMenus\);\s*\}\}/g;
const delDishReplacement = `onClick={() => {
                        const newMenus = [...menus];
                        newMenus[dayIdx].dishes.splice(dishIdx, 1);
                        setMenus(newMenus);
                        saveToFirebase(selectedWeek, { menus: newMenus });
                      }}`;
c = c.replace(delDishRegex, delDishReplacement);

// Adding dish
const addDishRegex = /onClick=\{\(\) => \{\s*const newMenus = \[\.\.\.menus\];\s*newMenus\[dayIdx\]\.dishes\.push\(''\);\s*setMenus\(newMenus\);\s*\}\}/g;
const addDishReplacement = `onClick={() => {
                      const newMenus = [...menus];
                      newMenus[dayIdx].dishes.push('');
                      setMenus(newMenus);
                      saveToFirebase(selectedWeek, { menus: newMenus });
                    }}`;
c = c.replace(addDishRegex, addDishReplacement);

// Approve buttons replacement
const oldButtonsStr = `<div className="flex items-center gap-3">
            <button onClick={handleSaveDraft} className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors">
              <Save className="w-4 h-4" /> Lưu nháp
            </button>
            <button onClick={handleApprove} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed" disabled={role === 'staff'} title={role === 'staff' ? 'Chỉ BGH và Giáo viên mới có quyền duyệt' : ''}>
              <CheckCircle className="w-4 h-4" /> Duyệt thực đơn
            </button>
          </div>`;
          
const newButtonsStr = `<div className="flex items-center gap-3">
            {weeks[selectedWeek - 1]?.status !== 'approved' && (
              <button onClick={handleSaveDraft} className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors">
                <Save className="w-4 h-4" /> Lưu nháp
              </button>
            )}
            {weeks[selectedWeek - 1]?.status !== 'approved' && (
              <button onClick={handleApprove} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed" disabled={role === 'staff'} title={role === 'staff' ? 'Chỉ BGH và Giáo viên mới có quyền duyệt' : ''}>
                <CheckCircle className="w-4 h-4" /> Duyệt thực đơn
              </button>
            )}
            {weeks[selectedWeek - 1]?.status === 'approved' && role === 'admin' && (
              <button onClick={handleCancelApprove} className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-200 font-medium rounded-lg hover:bg-red-100 transition-colors shadow-sm">
                <X className="w-4 h-4" /> Hủy duyệt
              </button>
            )}
          </div>`;

c = c.replace(oldButtonsStr, newButtonsStr);

// Loading state
const returnRegex = /return \(\s*<div className="p-8 h-full bg-slate-50 overflow-y-auto">/;
const returnReplacement = `if (loading) {
    return <div className="p-8 h-full bg-slate-50 flex items-center justify-center text-slate-500">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="p-8 h-full bg-slate-50 overflow-y-auto">`;
c = c.replace(returnRegex, returnReplacement);

fs.writeFileSync('src/components/TeacherLunchMenu.tsx', c);
