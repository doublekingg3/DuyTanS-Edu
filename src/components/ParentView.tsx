import React, { useState, useMemo, useEffect } from 'react';
import { Student, getSubjectName, Grades, computeMonthlyGamificationData } from '../data';
import { Bell, BookOpen, User, Calendar, Trophy, AlertCircle, TrendingUp, TrendingDown, Minus, Clock, Medal, AlertTriangle, AlertOctagon, Bot, Loader2, Sparkles, CalendarCheck, UserCheck, UserX } from 'lucide-react';
import ParentSchedule from './ParentSchedule';
import ParentLunchMenu from './ParentLunchMenu';
import { Utensils } from 'lucide-react';
import Markdown from 'react-markdown';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell
} from 'recharts';

type PeriodType = 'week' | 'month' | 'term1' | 'term2' | 'year';

export default function ParentView({ student: initialStudent, allStudents, classes, schoolYears }: { student: Student, allStudents: Student[], classes: import('../data').SchoolClass[], schoolYears: import('../data').SchoolYear[] }) {
  const [activeTab, setActiveTab] = useState<'grades' | 'schedule' | 'notifications' | 'attendance' | 'history' | 'lunch_menu'>('attendance');
  const [periodType, setPeriodType] = useState<PeriodType>('year');
  
  // Find all historical records for this student based on their unique code
  const studentHistory = useMemo(() => {
    if (!initialStudent?.code) return [initialStudent];
    return allStudents.filter(s => s.code === initialStudent.code);
  }, [initialStudent, allStudents]);

  const [selectedHistoryId, setSelectedHistoryId] = useState<string>(initialStudent.id);
  
  // Keep selectedHistoryId in sync if the main student prop changes
  useEffect(() => {
    setSelectedHistoryId(initialStudent.id);
  }, [initialStudent.id]);
  
  const currentViewStudent = useMemo(() => {
    return studentHistory.find(s => s.id === selectedHistoryId) || initialStudent;
  }, [selectedHistoryId, studentHistory, initialStudent]);

  const student = currentViewStudent;

  const [selectedWeek, setSelectedWeek] = useState(1);
  const [selectedMonth, setSelectedMonth] = useState(9); // September
  const [aiReviewText, setAiReviewText] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Reset text when period changes
  useEffect(() => {
    setAiReviewText('');
  }, [periodType, selectedWeek, selectedMonth]);

  const requestAiReview = async () => {
    setIsAiLoading(true);
    setAiReviewText('');
    try {
      const adminInfo = localStorage.getItem('aiAdminConfig') || 'Fanpage: https://facebook.com/truong\nHotline: 0123.456.789\nCác khoá học hiện có: Tiếng Anh giao tiếp, Toán tư duy, Kỹ năng sống';
      const res = await fetch('/api/ai-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student: currentViewStudent, periodType, adminInfo })
      });
      
      let data;
      try {
        data = await res.json();
      } catch (e) {
        // Fallback for non-JSON response (e.g. 502 Bad Gateway)
        throw new Error('Máy chủ phản hồi không đúng định dạng. Có thể do lỗi kết nối hoặc cấu hình API.');
      }
      
      if (!res.ok) {
        if (data.error && data.error.includes('GEMINI_API_KEY')) {
          throw new Error('Chưa cấu hình GEMINI_API_KEY trên máy chủ. Vui lòng liên hệ Admin (hoặc cài đặt trong AI Studio).');
        }
        throw new Error(data.error || 'Lỗi không xác định từ máy chủ AI.');
      }
      
      if (data.error) {
        throw new Error(data.error);
      } else {
        setAiReviewText(data.text);
      }
    } catch (e: any) {
      setAiReviewText('❌ Lỗi: ' + (e.message || 'Không thể kết nối tới máy chủ AI.'));
    } finally {
      setIsAiLoading(false);
    }
  };

  // Mock variation function to simulate different grades over time
  // In a real app, this would be fetched from the database
  const getGradeForPeriod = (baseGrade: number | string, pType: PeriodType, index: number) => {
    if (typeof baseGrade === 'string') return baseGrade; // 'Đ' or 'CĐ'
    if (pType === 'year') return baseGrade;
    
    // Simulate variation based on student id and period
    const variation = (student.id.charCodeAt(0) + index) % 3 - 1; // -1, 0, or 1
    let simulated = baseGrade + variation * 0.5;
    
    // Cap between 0 and 10
    simulated = Math.max(0, Math.min(10, simulated));
    return Math.round(simulated * 10) / 10;
  };

  const currentGrades = useMemo(() => {
    if (periodType === 'term1') {
      return student.term1Grades || student.grades;
    } else if (periodType === 'term2') {
      return student.term2Grades || student.grades;
    } else if (periodType === 'year') {
      return student.yearGrades || student.grades;
    }
    const periodIndex = periodType === 'week' ? selectedWeek : periodType === 'month' ? selectedMonth : 0;
    const grades = { ...student.grades };
    Object.keys(grades).forEach(key => {
      const k = key as keyof Grades;
      grades[k] = getGradeForPeriod(student.grades[k], periodType, periodIndex) as never;
    });
    return grades;
  }, [student, periodType, selectedWeek, selectedMonth]);


  const getRank = (avgStr: string, currentGrades: Grades, isExcellent?: boolean) => {
    const avg = parseFloat(avgStr);
    
    let hasBelow65 = false;
    let hasBelow50 = false;
    let hasBelow35 = false;
    let hasFail = false;

    (Object.entries(currentGrades) as [keyof Grades, string | number][]).forEach(([key, val]) => {
      if (val === 'CĐ') {
        hasFail = true;
      } else if (typeof val === 'number') {
        if (val < 6.5) hasBelow65 = true;
        if (val < 5.0) hasBelow50 = true;
        if (val < 3.5) hasBelow35 = true;
      }
    });

    const math = typeof currentGrades.math === 'number' ? currentGrades.math : 0;
    const literature = typeof currentGrades.literature === 'number' ? currentGrades.literature : 0;

    if (hasFail) return 'Yếu';

    if (avg >= 8.0 && !hasBelow65 && (math >= 8.0 || literature >= 8.0)) {
      return isExcellent ? 'Xuất sắc' : 'Giỏi';
    }
    if (avg >= 6.5 && !hasBelow50) {
      return 'Khá';
    }
    if (avg >= 5.0 && !hasBelow35) {
      return 'Trung bình';
    }
    
    return 'Yếu';
  };

  // Calculate average for the simulated period
  const currentAvg = useMemo(() => {
    const numericGrades = Object.values(currentGrades).filter(val => typeof val === 'number') as number[];
    if (numericGrades.length === 0) return 0;
    const sum = numericGrades.reduce((a, b) => a + b, 0);
    return Math.round((sum / numericGrades.length) * 10) / 10;
  }, [currentGrades]);

  const periodRank = useMemo(() => {
    if (periodType !== 'term1' && periodType !== 'term2' && periodType !== 'year') return '';
    
    const isExcellent = periodType === 'term2' ? student.term2IsExcellent : periodType === 'term1' ? student.term1IsExcellent : student.yearIsExcellent;
    const rankOverride = periodType === 'term2' ? student.term2RankOverride : periodType === 'term1' ? student.term1RankOverride : student.yearRankOverride;
    
    const calculatedRank = getRank(currentAvg.toString(), currentGrades, isExcellent);
    return rankOverride ? rankOverride : calculatedRank;
  }, [currentAvg, currentGrades, periodType, student]);

  // Prepare data for Chart
  const chartData = Object.entries(currentGrades)
    .filter(([_, value]) => typeof value === 'number')
    .map(([key, value]) => ({
      subject: getSubjectName(key as keyof Grades),
      score: value as number,
      baseScore: student.grades[key as keyof Grades] as number
    }));

  return (
    <div className="bg-slate-50 min-h-full pb-12">
      <div className="max-w-5xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        
        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border-2 border-white/30 shadow-lg shadow-indigo-900/20">
              <User className="w-12 h-12 text-white" />
            </div>
            <div className="text-center sm:text-left flex-1">
              <h1 className="text-3xl font-bold font-display tracking-tight">{student.fullName}</h1>
              <div className="text-indigo-100 mt-2 flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-4">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" /> 
                  <span>{student.gender} | {student.ethnicity}</span>
                </div>
                
                {studentHistory.length > 0 && (
                  <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg border border-white/20">
                    <Calendar className="w-4 h-4" />
                    <select 
                      value={selectedHistoryId}
                      onChange={e => setSelectedHistoryId(e.target.value)}
                      className="bg-transparent text-white focus:outline-none cursor-pointer appearance-none pr-4 font-medium"
                    >
                      {studentHistory.map(hist => {
                        const histClass = classes.find(c => c.id === hist.classId);
                        const histYear = schoolYears.find(y => y.id === histClass?.schoolYearId);
                        return (
                          <option key={hist.id} value={hist.id} className="text-slate-800">
                            Lớp {histClass?.name || hist.classId} {histYear ? `(${histYear.name})` : ''}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                )}
              </div>
            </div>
            {student.award && (
              <div className="bg-yellow-400 text-yellow-900 px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg">
                <Trophy className="w-5 h-5" />
                Danh hiệu: {student.award}
              </div>
            )}
          </div>
          
          
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-4 border-b border-slate-200 overflow-x-auto hide-scrollbar">
          <button 
            className={`whitespace-nowrap flex-shrink-0 pb-4 px-2 font-medium text-sm transition-colors relative flex items-center gap-2 ${activeTab === 'attendance' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}
            onClick={() => setActiveTab('attendance')}
          >
            <CalendarCheck className="w-4 h-4" /> Hoạt động & Điểm danh
            {activeTab === 'attendance' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full" />}
          </button>
          
          <button 
            className={`whitespace-nowrap flex-shrink-0 pb-4 px-2 font-medium text-sm transition-colors relative flex items-center gap-2 ${activeTab === 'schedule' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}
            onClick={() => setActiveTab('schedule')}
          >
            <Calendar className="w-4 h-4" /> Thời khoá biểu
            {activeTab === 'schedule' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full" />}
          </button>
          
          <button 
            className={`whitespace-nowrap flex-shrink-0 pb-4 px-2 font-medium text-sm transition-colors relative flex items-center gap-2 ${activeTab === 'lunch_menu' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}
            onClick={() => setActiveTab('lunch_menu')}
          >
            <Utensils className="w-4 h-4" /> Thực đơn ăn trưa
            {activeTab === 'lunch_menu' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full" />}
          </button>
        </div>

        {/* Tab Content */}

        
                {activeTab === 'attendance' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-200">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <CalendarCheck className="w-5 h-5 text-indigo-600" />
                  Hoạt động & Điểm danh
                </h3>
              </div>
              <div className="p-6">
                {!student.attendanceRecords || Object.keys(student.attendanceRecords).length === 0 ? (
                  <div className="text-center text-slate-500 py-8">Chưa có dữ liệu điểm danh.</div>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(student.attendanceRecords)
                      .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
                      .map(([date, record]) => (
                        <div key={date} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 gap-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col items-center justify-center shrink-0">
                              <span className="text-xs font-medium text-slate-500 uppercase">{new Date(date).toLocaleDateString('vi-VN', { month: 'short' })}</span>
                              <span className="text-lg font-bold text-indigo-600 leading-none">{new Date(date).getDate()}</span>
                            </div>
                            <div>
                              <div className="font-bold text-slate-800 mb-1">{new Date(date).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                              {record.reason && (
                                <div className="text-sm text-slate-600 bg-white px-3 py-2 rounded-lg border border-slate-100 italic">
                                  <span className="font-medium not-italic text-slate-700 mr-1">Lý do:</span>
                                  {record.reason}
                                </div>
                              )}
                            </div>
                          </div>
                          <div>
                            {record.status === 'present' ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 font-bold rounded-lg text-sm border border-green-200">
                                <UserCheck className="w-4 h-4" /> Có mặt
                              </span>
                            ) : record.status === 'absent' ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-700 font-bold rounded-lg text-sm border border-red-200">
                                <UserX className="w-4 h-4" /> Vắng mặt
                              </span>
                            ) : record.status === 'leave_early' ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-100 text-orange-700 font-bold rounded-lg text-sm border border-orange-200">
                                Xin về
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-yellow-100 text-yellow-700 font-bold rounded-lg text-sm border border-yellow-200">
                                <Clock className="w-4 h-4" /> Đi trễ
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'schedule' && (
          <div className="max-w-4xl mx-auto">
            <ParentSchedule classId={student?.classId || ''} />
          </div>
        )}
        
        {activeTab === 'lunch_menu' && (
          <div className="max-w-4xl mx-auto">
            <ParentLunchMenu />
          </div>
        )}

              </div>
    </div>
  );
}

