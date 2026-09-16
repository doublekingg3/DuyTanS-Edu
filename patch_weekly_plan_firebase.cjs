const fs = require('fs');
let c = fs.readFileSync('src/components/TeacherWeeklyPlan.tsx', 'utf8');

const importsStr = `import React, { useState, useRef, useEffect } from 'react';
import { useAlert } from '../contexts/AlertContext';
import { Calendar as CalendarIcon, CheckCircle, ChevronLeft, ChevronRight, FileText, Download, Save, Trash2, Plus, X } from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';`;

c = c.replace(/import React.*?lucide-react';/s, importsStr);

const stateInitStr = `export default function TeacherWeeklyPlan({ classId, role, className, schoolYearName }: { classId: string, role?: string, className?: string, schoolYearName?: string }) {
  const { showAlert, showConfirm } = useAlert();
  
  const [weeks, setWeeks] = useState<{
    id: number;
    name: string;
    status: 'empty' | 'draft' | 'approved';
    startDate: string;
    endDate: string;
    dutyTeam: string;
    tasks: string[];
  }[]>([]);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!classId) return;
    const docRef = doc(db, 'class_weekly_plans', classId);
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      const data = snapshot.data();
      
      const startYearStr = schoolYearName ? schoolYearName.match(/\\d{4}/)?.[0] : null;
      const startYear = startYearStr ? parseInt(startYearStr) : new Date().getFullYear();
      const baseDate = new Date(startYear, 8, 5); // 5th Sept
      
      const newWeeks = Array.from({ length: 42 }, (_, i) => {
        const weekId = i + 1;
        const weekData = data?.weeks?.[weekId];
        
        if (weekData) {
          return {
            id: weekId,
            name: \`Tuần \${weekId}\`,
            status: weekData.status || 'empty',
            startDate: weekData.startDate || '',
            endDate: weekData.endDate || '',
            dutyTeam: weekData.dutyTeam || 'Tổ 1',
            tasks: weekData.tasks || []
          };
        }
        
        // Default if no data
        const sDate = new Date(baseDate);
        sDate.setDate(sDate.getDate() + (i * 7));
        const eDate = new Date(sDate);
        eDate.setDate(eDate.getDate() + 5);
        
        return {
          id: weekId,
          name: \`Tuần \${weekId}\`,
          status: 'empty',
          startDate: sDate.toISOString().split('T')[0],
          endDate: eDate.toISOString().split('T')[0],
          dutyTeam: 'Tổ 1',
          tasks: []
        };
      });
      
      setWeeks(newWeeks);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [classId, schoolYearName]);

  const saveWeekToFirebase = async (weekId: number, updateData: Partial<typeof weeks[0]>) => {
    try {
      const currentWeek = weeks.find(w => w.id === weekId);
      if (!currentWeek) return;
      const fullWeekData = { ...currentWeek, ...updateData };
      
      // Clean up for firebase
      const firebaseData = {
        status: fullWeekData.status,
        startDate: fullWeekData.startDate,
        endDate: fullWeekData.endDate,
        dutyTeam: fullWeekData.dutyTeam,
        tasks: fullWeekData.tasks
      };
      
      await setDoc(doc(db, 'class_weekly_plans', classId), {
        weeks: {
          [weekId]: firebaseData
        }
      }, { merge: true });
    } catch (e) {
      console.error(e);
      showAlert('Lỗi khi lưu dữ liệu lên server.', 'error');
    }
  };`;

// Replace everything from export default function to React.useEffect
const regexState = /export default function TeacherWeeklyPlan.*?\]\);/s;
c = c.replace(regexState, stateInitStr);

fs.writeFileSync('src/components/TeacherWeeklyPlan.tsx', c);
