import React, { useState, useMemo, useEffect } from 'react';
import { Student, getSubjectName, Grades, computeMonthlyGamificationData } from '../data';
import { Bell, BookOpen, User, Calendar, Trophy, AlertCircle, TrendingUp, TrendingDown, Minus, Clock, Medal, AlertTriangle, AlertOctagon, Bot, Loader2, Sparkles, CalendarCheck, UserCheck, UserX } from 'lucide-react';
import ParentSchedule from './ParentSchedule';
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
  const [activeTab, setActiveTab] = useState<'grades' | 'schedule' | 'notifications' | 'attendance' | 'history'>('grades');
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
      const data = await res.json();
      if (data.error) {
        setAiReviewText('❌ Lỗi: ' + data.error);
      } else {
        setAiReviewText(data.text);
      }
    } catch (e) {
      setAiReviewText('❌ Lỗi kết nối tới máy chủ AI.');
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
          
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-slate-100 border-t border-slate-100 bg-white">
            <div className="p-4 text-center">
              <div className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Học lực</div>
              <div className="text-xl font-bold text-slate-800">{student.academicPerformance === 'T' ? 'Tốt' : student.academicPerformance === 'K' ? 'Khá' : student.academicPerformance === 'Đ' ? 'Đạt' : (student.academicPerformance || 'Chưa đánh giá')}</div>
            </div>
            <div className="p-4 text-center">
              <div className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Hạnh kiểm</div>
              <div className="text-xl font-bold text-slate-800">{student.conduct === 'T' ? 'Tốt' : 'Khá'}</div>
            </div>
            <div className="p-4 text-center">
              <div className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Nghỉ có phép (CP)</div>
              <div className="text-xl font-bold text-slate-800">{student.cp || 0} ngày</div>
            </div>
            <div className="p-4 text-center">
              <div className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Nghỉ không phép (KP)</div>
              <div className="text-xl font-bold text-red-600">{student.kp || 0} ngày</div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-4 border-b border-slate-200">
          <button 
            className={`whitespace-nowrap flex-shrink-0 pb-4 px-2 font-medium text-sm transition-colors relative flex items-center gap-2 ${activeTab === 'grades' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}
            onClick={() => setActiveTab('grades')}
          >
            <BookOpen className="w-4 h-4" /> Bảng điểm chi tiết
            {activeTab === 'grades' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full" />}
          </button>
          <button 
            className={`whitespace-nowrap flex-shrink-0 pb-4 px-2 font-medium text-sm transition-colors relative flex items-center gap-2 ${activeTab === 'notifications' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}
            onClick={() => setActiveTab('notifications')}
          >
            <Bell className="w-4 h-4" /> Thông báo & Nhận xét
            {student.notifications.some(n => !n.isRead) && (
              <span className="bg-red-500 w-2 h-2 rounded-full inline-block"></span>
            )}
            {activeTab === 'notifications' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full" />}
          </button>

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
            className={`whitespace-nowrap flex-shrink-0 pb-4 px-2 font-medium text-sm transition-colors relative flex items-center gap-2 ${activeTab === 'history' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}
            onClick={() => setActiveTab('history')}
          >
            <BookOpen className="w-4 h-4" /> Lịch sử học tập
            {activeTab === 'history' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full" />}
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

        {activeTab === 'history' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-200">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                  Lịch sử các năm học trước
                </h3>
              </div>
              <div className="p-0">
                {!student.historicalRecords || student.historicalRecords.length === 0 ? (
                  <div className="p-8 text-center text-slate-500">
                    Không có dữ liệu lịch sử năm học cũ.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {student.historicalRecords.map((record, index) => (
                      <div key={index} className="p-4 sm:p-6 hover:bg-slate-50 transition-colors">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                          <div>
                            <h4 className="font-bold text-lg text-slate-800">Lớp {record.className || 'Không xác định'}</h4>
                            <p className="text-sm text-slate-500 mt-1">Dữ liệu lưu trữ năm học trước</p>
                          </div>
                          <div className="flex gap-2">
                            <span className="px-3 py-1 bg-indigo-50 text-indigo-700 font-medium rounded-full text-sm">
                              HL: {record.academicPerformance || 'Chưa đánh giá'}
                            </span>
                            <span className="px-3 py-1 bg-green-50 text-green-700 font-medium rounded-full text-sm">
                              HK: {record.conduct || 'Chưa đánh giá'}
                            </span>
                          </div>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm text-left whitespace-nowrap">
                            <thead className="bg-slate-100/50 text-slate-600 text-xs uppercase font-medium">
                              <tr>
                                <th className="px-4 py-3 rounded-tl-lg">Môn học</th>
                                <th className="px-4 py-3 text-center">TBM HK1</th>
                                <th className="px-4 py-3 text-center">TBM HK2</th>
                                <th className="px-4 py-3 text-center rounded-tr-lg">TBM Cả năm</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {Object.keys(record.grades || {}).map((subjectKey) => (
                                <tr key={subjectKey}>
                                  <td className="px-4 py-3 font-medium text-slate-700">
                                    {getSubjectName(subjectKey as keyof Grades) || subjectKey}
                                  </td>
                                  <td className="px-4 py-3 text-center text-slate-600 font-medium">
                                    {(record.term1Grades && record.term1Grades[subjectKey as keyof Grades]) || '-'}
                                  </td>
                                  <td className="px-4 py-3 text-center text-slate-600 font-medium">
                                    {(record.term2Grades && record.term2Grades[subjectKey as keyof Grades]) || '-'}
                                  </td>
                                  <td className="px-4 py-3 text-center text-indigo-600 font-bold">
                                    {(record.yearGrades && record.yearGrades[subjectKey as keyof Grades]) || (record.grades && record.grades[subjectKey as keyof Grades]) || '-'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'grades' && (

          <div className="space-y-6">
            
            {/* Time Period Selector */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex bg-slate-100 p-1 rounded-xl overflow-x-auto gap-1" style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}>
                  <button 
                    onClick={() => setPeriodType('week')}
                    className={`px-4 py-2 text-sm font-medium whitespace-nowrap flex-shrink-0 rounded-lg transition-colors ${periodType === 'week' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                  >
                    Theo tuần
                  </button>
                  <button 
                    onClick={() => setPeriodType('month')}
                    className={`px-4 py-2 text-sm font-medium whitespace-nowrap flex-shrink-0 rounded-lg transition-colors ${periodType === 'month' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                  >
                    Theo tháng
                  </button>
                  <button 
                    onClick={() => setPeriodType('term1')}
                    className={`px-4 py-2 text-sm font-medium whitespace-nowrap flex-shrink-0 rounded-lg transition-colors ${periodType === 'term1' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                  >
                    HK I
                  </button>
                  <button 
                    onClick={() => setPeriodType('term2')}
                    className={`px-4 py-2 text-sm font-medium whitespace-nowrap flex-shrink-0 rounded-lg transition-colors ${periodType === 'term2' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                  >
                    HK II
                  </button>
                  <button 
                    onClick={() => setPeriodType('year')}
                    className={`px-4 py-2 text-sm font-medium whitespace-nowrap flex-shrink-0 rounded-lg transition-colors ${periodType === 'year' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                  >
                    Cả năm
                  </button>
                </div>
                
                {periodType === 'week' && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <select 
                      value={selectedWeek}
                      onChange={(e) => setSelectedWeek(Number(e.target.value))}
                      className="bg-white border border-slate-200 text-sm rounded-lg px-3 py-2 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                    >
                      {Array.from({length: 35}).map((_, i) => (
                        <option key={i} value={i+1}>Tuần {i+1}</option>
                      ))}
                    </select>
                  </div>
                )}
                
                {periodType === 'month' && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <select 
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(Number(e.target.value))}
                      className="bg-white border border-slate-200 text-sm rounded-lg px-3 py-2 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                    >
                      <option value={9}>Tháng 9</option>
                      <option value={10}>Tháng 10</option>
                      <option value={11}>Tháng 11</option>
                      <option value={12}>Tháng 12</option>
                      <option value={1}>Tháng 1</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Detailed Grades Table */}
              <div className={`${periodType === 'week' ? 'lg:col-span-3' : 'lg:col-span-2'} bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col`}>
                <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50">
                  <h2 className="font-bold text-slate-800 text-lg">{periodType === 'week' ? 'Đánh giá thi đua' : 'Bảng điểm chi tiết'}</h2>
                  {periodType !== 'week' && (
                    <div className="flex gap-2">
                      <div className="bg-indigo-100 text-indigo-700 px-4 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2">
                        Trung bình: <span className="text-lg">{currentAvg}</span>
                      </div>
                      <div className={`px-4 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 ${
                        periodRank === 'Xuất sắc' ? 'bg-purple-100 text-purple-700' :
                        periodRank === 'Giỏi' ? 'bg-green-100 text-green-700' : 
                        periodRank === 'Khá' ? 'bg-blue-100 text-blue-700' : 
                        periodRank === 'Trung bình' ? 'bg-yellow-100 text-yellow-700' : 
                        'bg-red-100 text-red-700'
                      }`}>
                        Xếp loại: <span className="text-lg uppercase">{periodRank}</span>
                      </div>
                    </div>
                  )}
                </div>
                
                
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      {periodType === 'week' ? (
                        <tr>
                          <th className="px-5 py-3 border-b border-slate-100 font-bold text-xs uppercase tracking-wider text-slate-500 bg-slate-50 w-48">Tiêu chí</th>
                          <th className="px-5 py-3 border-b border-slate-100 font-bold text-xs uppercase tracking-wider text-slate-500 bg-slate-50 text-center" colSpan={3}>Nội dung đánh giá</th>
                        </tr>
                      ) : (
                        <tr>
                          <th className="px-5 py-3 border-b border-slate-100 font-bold text-xs uppercase tracking-wider text-slate-500 bg-slate-50">Môn học</th>
                          <th className="px-5 py-3 border-b border-slate-100 font-bold text-xs uppercase tracking-wider text-slate-500 bg-slate-50 text-center">Điểm số</th>
                          <th className="px-5 py-3 border-b border-slate-100 font-bold text-xs uppercase tracking-wider text-slate-500 bg-slate-50 text-center">Đánh giá</th>
                          {periodType !== 'year' && (
                            <th className="px-5 py-3 border-b border-slate-100 font-bold text-xs uppercase tracking-wider text-slate-500 bg-slate-50 text-center">So với Cả năm</th>
                          )}
                        </tr>
                      )}
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {periodType === 'week' || periodType === 'month' ? (
                        (() => {
                          let gData: any;
                          if (periodType === 'week') {
                            gData = student.weeklyData?.[selectedWeek] || { achievement: '', reward: '', study: '', comment: '', goldCards: 0, silverCards: 0, bronzeCards: 0, penaltyLevel: 0 };
                          } else {
                            gData = computeMonthlyGamificationData(student, selectedMonth);
                          }
                          return (
                            <>
                              <tr className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-5 py-4 font-medium text-slate-700 bg-slate-50/30">Học tập</td>
                                <td className="px-5 py-4 text-center font-bold text-slate-800 whitespace-pre-line" colSpan={3}>
                                  {gData.study || <span className="text-slate-400 font-normal">Chưa có đánh giá</span>}
                                </td>
                              </tr>
                              <tr className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-5 py-4 font-medium text-slate-700 bg-slate-50/30">Thành tích</td>
                                <td className="px-5 py-4 text-center font-bold text-slate-800 whitespace-pre-line" colSpan={3}>
                                  {gData.achievement || <span className="text-slate-400 font-normal">Chưa có đánh giá</span>}
                                </td>
                              </tr>
                              <tr className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-5 py-4 font-medium text-slate-700 bg-slate-50/30">Khen thưởng</td>
                                <td className="px-5 py-4 text-center font-bold text-indigo-600 whitespace-pre-line" colSpan={3}>
                                  {gData.reward || <span className="text-slate-400 font-normal">Chưa có đánh giá</span>}
                                </td>
                              </tr>
                              <tr className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-5 py-4 font-medium text-slate-700 bg-slate-50/30">Thi đua & Kỷ luật</td>
                                <td className="px-5 py-4 text-center" colSpan={3}>
                                  <div className="flex items-center justify-center gap-6">
                                    <div className="flex gap-4 items-center">
                                      <div className="flex flex-col items-center gap-1">
                                        <Medal className="w-6 h-6 text-yellow-500" />
                                        <span className="text-sm font-bold text-slate-700">{gData.goldCards || 0}</span>
                                      </div>
                                      <div className="flex flex-col items-center gap-1">
                                        <Medal className="w-6 h-6 text-slate-400" />
                                        <span className="text-sm font-bold text-slate-700">{gData.silverCards || 0}</span>
                                      </div>
                                      <div className="flex flex-col items-center gap-1">
                                        <Medal className="w-6 h-6 text-amber-600" />
                                        <span className="text-sm font-bold text-slate-700">{gData.bronzeCards || 0}</span>
                                      </div>
                                    </div>
                                    <div className="w-px h-8 bg-slate-200"></div>
                                    <div className="flex items-center">
                                      {(() => {
                                        const penalty = gData.penaltyLevel;
                                        if (penalty === 1) return <div className="flex items-center gap-2 text-yellow-600 bg-yellow-50 px-3 py-1.5 rounded-lg font-medium"><AlertCircle className="w-5 h-5" /> Nhắc nhở</div>;
                                        if (penalty === 2) return <div className="flex items-center gap-2 text-orange-600 bg-orange-50 px-3 py-1.5 rounded-lg font-medium"><AlertTriangle className="w-5 h-5" /> Cảnh cáo</div>;
                                        if (penalty === 3) return <div className="flex items-center gap-2 text-red-600 bg-red-50 px-3 py-1.5 rounded-lg font-medium"><AlertOctagon className="w-5 h-5" /> Vi phạm nặng</div>;
                                        return <span className="text-slate-400 text-sm font-medium">Không có vi phạm</span>;
                                      })()}
                                    </div>
                                  </div>
                                </td>
                              </tr>
                              <tr className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-5 py-4 font-medium text-slate-700 bg-slate-50/30">Nhận xét</td>
                                <td className="px-5 py-4 text-center font-medium text-slate-600 whitespace-pre-line" colSpan={3}>
                                  {gData.comment || <span className="text-slate-400 font-normal">Chưa có nhận xét</span>}
                                </td>
                              </tr>
                            </>
                          );
                        })()
                      ) : (
                        Object.entries(currentGrades).map(([key, value]) => {
                          const isScore = typeof value === 'number';
                          const subjectName = getSubjectName(key as keyof Grades);
                          const baseScore = student.grades[key as keyof Grades];
                          
                          let trend = null;
                          if (isScore && periodType !== 'year') {
                            const diff = Math.round((value - (baseScore as number)) * 10) / 10;
                            if (diff > 0) trend = <span className="text-green-600 flex items-center justify-center gap-1"><TrendingUp className="w-3 h-3" /> +{diff}</span>;
                            else if (diff < 0) trend = <span className="text-red-600 flex items-center justify-center gap-1"><TrendingDown className="w-3 h-3" /> {diff}</span>;
                            else trend = <span className="text-slate-400 flex items-center justify-center gap-1"><Minus className="w-3 h-3" /></span>;
                          }
                          return (
                            <tr key={key} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-5 py-3 font-medium text-slate-700">{subjectName}</td>
                              <td className="px-5 py-3 text-center">
                                {isScore ? (
                                  <span className={`font-bold ${value >= 8 ? 'text-indigo-600' : value >= 6.5 ? 'text-blue-600' : value >= 5 ? 'text-amber-600' : 'text-red-600'}`}>
                                    {value.toFixed(1)}
                                  </span>
                                ) : (
                                  <span className="text-slate-400">-</span>
                                )}
                              </td>
                              <td className="px-5 py-3 text-center">
                                {!isScore ? (
                                  <span className={`px-3 py-1 rounded-lg text-xs font-bold ${value === 'Đ' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {value === 'Đ' ? 'Đạt' : 'Chưa Đạt'}
                                  </span>
                                ) : (
                                  <span className="text-slate-400">-</span>
                                )}
                              </td>
                              {periodType !== 'year' && (
                                <td className="px-5 py-3 text-center text-sm font-medium">
                                  {trend || <span className="text-slate-400">-</span>}
                                </td>
                              )}
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
                
                {/* Mobile Cards View */}
                <div className="md:hidden flex flex-col divide-y divide-slate-100">
                  {periodType === 'week' || periodType === 'month' ? (
                    (() => {
                      let gData: any;
                      if (periodType === 'week') {
                        gData = student.weeklyData?.[selectedWeek] || { achievement: '', reward: '', study: '', comment: '', goldCards: 0, silverCards: 0, bronzeCards: 0, penaltyLevel: 0 };
                      } else {
                        gData = computeMonthlyGamificationData(student, selectedMonth);
                      }
                      return (
                        <div className="flex flex-col">
                          <div className="p-4 flex flex-col gap-2">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Học tập</span>
                            <span className="text-slate-800 font-medium whitespace-pre-line">{gData.study || <span className="text-slate-400 italic">Chưa có đánh giá</span>}</span>
                          </div>
                          <div className="p-4 flex flex-col gap-2 bg-slate-50/50">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Thành tích</span>
                            <span className="text-slate-800 font-medium whitespace-pre-line">{gData.achievement || <span className="text-slate-400 italic">Chưa có đánh giá</span>}</span>
                          </div>
                          <div className="p-4 flex flex-col gap-2">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Khen thưởng</span>
                            <span className="text-indigo-600 font-bold whitespace-pre-line">{gData.reward || <span className="text-slate-400 italic">Chưa có đánh giá</span>}</span>
                          </div>
                          <div className="p-4 flex flex-col gap-3 bg-slate-50/50">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Thi đua & Kỷ luật</span>
                            <div className="flex items-center gap-6">
                              <div className="flex gap-4 items-center">
                                <div className="flex items-center gap-1">
                                  <Medal className="w-5 h-5 text-yellow-500" />
                                  <span className="text-sm font-bold text-slate-700">{gData.goldCards || 0}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Medal className="w-5 h-5 text-slate-400" />
                                  <span className="text-sm font-bold text-slate-700">{gData.silverCards || 0}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Medal className="w-5 h-5 text-amber-600" />
                                  <span className="text-sm font-bold text-slate-700">{gData.bronzeCards || 0}</span>
                                </div>
                              </div>
                              <div className="w-px h-6 bg-slate-200"></div>
                              <div className="flex items-center">
                                {(() => {
                                  const penalty = gData.penaltyLevel;
                                  if (penalty === 1) return <div className="flex items-center gap-1.5 text-yellow-600 bg-yellow-50 px-2 py-1 rounded-lg text-sm font-medium"><AlertCircle className="w-4 h-4" /> Nhắc nhở</div>;
                                  if (penalty === 2) return <div className="flex items-center gap-1.5 text-orange-600 bg-orange-50 px-2 py-1 rounded-lg text-sm font-medium"><AlertTriangle className="w-4 h-4" /> Cảnh cáo</div>;
                                  if (penalty === 3) return <div className="flex items-center gap-1.5 text-red-600 bg-red-50 px-2 py-1 rounded-lg text-sm font-medium"><AlertOctagon className="w-4 h-4" /> Vi phạm</div>;
                                  return <span className="text-slate-400 text-sm font-medium">Không vi phạm</span>;
                                })()}
                              </div>
                            </div>
                          </div>
                          <div className="p-4 flex flex-col gap-2">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nhận xét</span>
                            <span className="text-slate-600 font-medium whitespace-pre-line">{gData.comment || <span className="text-slate-400 italic">Chưa có nhận xét</span>}</span>
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    <div className="p-2 grid grid-cols-1 gap-2">
                      {Object.entries(currentGrades).map(([key, value]) => {
                        const isScore = typeof value === 'number';
                        const subjectName = getSubjectName(key as keyof Grades);
                        const baseScore = student.grades[key as keyof Grades];
                        
                        let trend = null;
                        if (isScore && periodType !== 'year') {
                          const diff = Math.round((value - (baseScore as number)) * 10) / 10;
                          if (diff > 0) trend = <span className="text-green-600 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> +{diff}</span>;
                          else if (diff < 0) trend = <span className="text-red-600 flex items-center gap-1"><TrendingDown className="w-3 h-3" /> {diff}</span>;
                          else trend = <span className="text-slate-400 flex items-center gap-1"><Minus className="w-3 h-3" /></span>;
                        }
                        return (
                          <div key={key} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl shadow-sm">
                            <div className="font-medium text-slate-700">{subjectName}</div>
                            <div className="flex items-center gap-4">
                              {periodType !== 'year' && isScore && (
                                <div className="text-xs font-medium">{trend}</div>
                              )}
                              {isScore ? (
                                <div className={`flex items-center justify-center w-10 h-10 rounded-lg font-bold text-lg ${value >= 8 ? 'bg-indigo-50 text-indigo-700' : value >= 6.5 ? 'bg-blue-50 text-blue-700' : value >= 5 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'}`}>
                                  {value.toFixed(1)}
                                </div>
                              ) : (
                                <div className={`flex items-center justify-center px-3 h-10 rounded-lg font-bold text-sm ${value === 'Đ' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                  {value === 'Đ' ? 'Đạt' : 'C.Đạt'}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Chart */}
              {periodType !== 'week' && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col">
                  <h2 className="text-lg font-bold text-slate-800 mb-6">Biểu đồ trực quan</h2>
                  <div className="flex-1 min-h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 60 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis 
                          dataKey="subject" 
                          tick={{fontSize: 11, fill: '#64748b'}} 
                          axisLine={false} 
                          tickLine={false}
                          angle={-45}
                          textAnchor="end"
                          interval={0}
                        />
                        <YAxis 
                          domain={[0, 10]} 
                          tick={{fontSize: 12, fill: '#64748b'}} 
                          axisLine={false} 
                          tickLine={false}
                        />
                        <Tooltip 
                          cursor={{fill: '#f8fafc'}}
                          contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                        />
                        <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.score >= 8 ? '#4f46e5' : entry.score >= 6.5 ? '#3b82f6' : entry.score >= 5 ? '#f59e0b' : '#ef4444'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 flex flex-wrap justify-center gap-4 text-xs text-slate-500 font-medium">
                    <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-indigo-600"></div> Giỏi (8.0+)</div>
                    <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-blue-500"></div> Khá (6.5+)</div>
                    <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-amber-500"></div> TB (5.0+)</div>
                    <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-red-500"></div> Yếu (&lt;5.0)</div>
                  </div>
                </div>
              )}
            </div>

            {/* AI Review Section */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl shadow-sm border border-indigo-100 p-6 mt-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
                    <Bot className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">Trợ lý AI Phân tích</h3>
                    <p className="text-sm text-slate-600">Đánh giá quá trình học tập và định hướng</p>
                  </div>
                </div>
                <button
                  onClick={requestAiReview}
                  disabled={isAiLoading}
                  className="px-5 py-2.5 bg-white hover:bg-indigo-50 text-indigo-700 font-semibold rounded-xl border border-indigo-200 shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isAiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {isAiLoading ? 'Đang phân tích...' : 'Phân tích ngay'}
                </button>
              </div>

              {aiReviewText && (
                <div className="mt-4 bg-white p-5 rounded-xl border border-indigo-100 shadow-sm">
                  <div className="prose prose-indigo prose-sm max-w-none text-slate-700">
                    <div className="markdown-body">
                      <Markdown>{aiReviewText}</Markdown>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        )}
        {activeTab === 'notifications' && (

          <div className="max-w-2xl mx-auto space-y-4">
            {student.notifications.length === 0 && student.comments.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
                <Bell className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">Chưa có thông báo hoặc nhận xét nào.</p>
              </div>
            ) : (
              <>
                {student.notifications.map(n => (
                  <div key={n.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                      <Bell className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-slate-800">{n.title}</h4>
                        {!n.isRead && <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Mới</span>}
                      </div>
                      <p className="text-slate-600 text-sm">{n.message}</p>
                      <div className="text-xs text-slate-400 mt-2">{new Date(n.date).toLocaleString('vi-VN')}</div>
                    </div>
                  </div>
                ))}
                {student.comments.map(c => (
                  <div key={c.id} className="bg-indigo-50 p-5 rounded-2xl shadow-sm border border-indigo-100 flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-indigo-200 flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-indigo-700" />
                    </div>
                    <div>
                      <h4 className="font-bold text-indigo-900 mb-1">Nhận xét từ Giáo viên</h4>
                      <p className="text-indigo-800 text-sm font-medium">"{c.text}"</p>
                      <div className="text-xs text-indigo-400 mt-2">{new Date(c.date).toLocaleString('vi-VN')}</div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

