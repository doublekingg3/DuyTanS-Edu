import React, { useState, useMemo, useEffect } from 'react';
import { Student, getSubjectName, Grades, computeMonthlyGamificationData, SchoolClass, SchoolYear } from '../data';
import { 
  Bell, 
  BookOpen, 
  User, 
  Calendar, 
  Trophy, 
  AlertCircle, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Clock, 
  Medal, 
  AlertTriangle, 
  AlertOctagon, 
  Bot, 
  Loader2, 
  Sparkles, 
  CalendarCheck, 
  UserCheck, 
  UserX,
  Edit,
  Save,
  X,
  Phone,
  MapPin,
  CreditCard,
  Globe,
  Heart,
  CheckCircle2,
  ShieldCheck,
  IdCard,
  Utensils, 
  ClipboardList,
  Info,
  MoreHorizontal,
  ChevronRight
} from 'lucide-react';
import ParentSchedule from './ParentSchedule';
import ParentLunchMenu from './ParentLunchMenu';
import ParentWeeklyPlan from './ParentWeeklyPlan';
import { useAlert } from '../contexts/AlertContext';
import { db } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { getCurrentSchoolWeek } from '../lib/schoolWeekUtils';

interface ParentViewProps {
  student: Student;
  allStudents: Student[];
  classes: SchoolClass[];
  schoolYears: SchoolYear[];
  onEditStudent?: (student: Student) => void;
}

export default function ParentView({ 
  student: initialStudent, 
  allStudents, 
  classes, 
  schoolYears,
  onEditStudent 
}: ParentViewProps) {
  const { showAlert } = useAlert();
  const [activeTab, setActiveTab] = useState<'profile' | 'weekly_plan' | 'attendance' | 'schedule' | 'lunch_menu'>('profile');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  // Form state for student profile editing by parent
  const [editFormData, setEditFormData] = useState({
    fullName: '',
    dob: '',
    gender: 'Nam' as 'Nam' | 'Nữ',
    ethnicity: 'Kinh',
    nationality: 'Việt Nam',
    religion: 'Không',
    pob: '',
    currentAddress: '',
    phone: '',
    parentPhone: '',
    citizenId: '',
    parentName: ''
  });
  
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

  const currentClass = useMemo(() => {
    return classes?.find(c => c.id === currentViewStudent.classId);
  }, [classes, currentViewStudent.classId]);

  const schoolYearName = useMemo(() => {
    return schoolYears?.find(y => y.id === currentClass?.schoolYearId)?.name || '';
  }, [schoolYears, currentClass]);

  // Tuần hiện tại theo thời gian thực tế
  const currentWeekNumber = useMemo(() => {
    return getCurrentSchoolWeek(schoolYearName);
  }, [schoolYearName]);

  // Sync form state when selected student changes
  useEffect(() => {
    if (currentViewStudent) {
      setEditFormData({
        fullName: currentViewStudent.fullName || '',
        dob: currentViewStudent.dob || '',
        gender: currentViewStudent.gender || 'Nam',
        ethnicity: currentViewStudent.ethnicity || 'Kinh',
        nationality: currentViewStudent.nationality || 'Việt Nam',
        religion: currentViewStudent.religion || 'Không',
        pob: currentViewStudent.pob || '',
        currentAddress: currentViewStudent.currentAddress || '',
        phone: currentViewStudent.phone || currentViewStudent.parentPhone || '',
        parentPhone: currentViewStudent.parentPhone || currentViewStudent.phone || '',
        citizenId: currentViewStudent.citizenId || '',
        parentName: currentViewStudent.parentName || ''
      });
    }
  }, [currentViewStudent]);

  const handleStartEditing = () => {
    setEditFormData({
      fullName: currentViewStudent.fullName || '',
      dob: currentViewStudent.dob || '',
      gender: currentViewStudent.gender || 'Nam',
      ethnicity: currentViewStudent.ethnicity || 'Kinh',
      nationality: currentViewStudent.nationality || 'Việt Nam',
      religion: currentViewStudent.religion || 'Không',
      pob: currentViewStudent.pob || '',
      currentAddress: currentViewStudent.currentAddress || '',
      phone: currentViewStudent.phone || currentViewStudent.parentPhone || '',
      parentPhone: currentViewStudent.parentPhone || currentViewStudent.phone || '',
      citizenId: currentViewStudent.citizenId || '',
      parentName: currentViewStudent.parentName || ''
    });
    setIsEditingProfile(true);
    setActiveTab('profile');
  };

  const handleCancelEditing = () => {
    setIsEditingProfile(false);
    if (currentViewStudent) {
      setEditFormData({
        fullName: currentViewStudent.fullName || '',
        dob: currentViewStudent.dob || '',
        gender: currentViewStudent.gender || 'Nam',
        ethnicity: currentViewStudent.ethnicity || 'Kinh',
        nationality: currentViewStudent.nationality || 'Việt Nam',
        religion: currentViewStudent.religion || 'Không',
        pob: currentViewStudent.pob || '',
        currentAddress: currentViewStudent.currentAddress || '',
        phone: currentViewStudent.phone || currentViewStudent.parentPhone || '',
        parentPhone: currentViewStudent.parentPhone || currentViewStudent.phone || '',
        citizenId: currentViewStudent.citizenId || '',
        parentName: currentViewStudent.parentName || ''
      });
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFormData.fullName.trim()) {
      showAlert('Họ và tên học sinh không được để trống', 'error');
      return;
    }

    setIsSaving(true);
    const updatedStudent: Student = {
      ...currentViewStudent,
      fullName: editFormData.fullName.trim(),
      dob: editFormData.dob.trim(),
      gender: editFormData.gender,
      ethnicity: editFormData.ethnicity.trim() || 'Kinh',
      nationality: editFormData.nationality.trim() || 'Việt Nam',
      religion: editFormData.religion.trim() || 'Không',
      pob: editFormData.pob.trim(),
      currentAddress: editFormData.currentAddress.trim(),
      phone: editFormData.phone.trim(),
      parentPhone: editFormData.phone.trim() || editFormData.parentPhone.trim(),
      citizenId: editFormData.citizenId.trim(),
      parentName: editFormData.parentName.trim()
    };

    try {
      // Save directly to Firebase Firestore
      const studentDocRef = doc(db, 'students', updatedStudent.id);
      await setDoc(studentDocRef, updatedStudent, { merge: true });

      if (onEditStudent) {
        onEditStudent(updatedStudent);
      }
      setIsEditingProfile(false);
      showAlert('Cập nhật thông tin con em thành công! Dữ liệu đã được lưu vào hệ thống.', 'success');
    } catch (error) {
      console.error('Error saving student info to Firestore:', error);
      if (onEditStudent) {
        onEditStudent(updatedStudent);
      }
      setIsEditingProfile(false);
      showAlert('Đã lưu thông tin học sinh vào hệ thống.', 'success');
    } finally {
      setIsSaving(false);
    }
  };

  // Tính toán nhanh dữ liệu chuyên cần
  const attendanceStats = useMemo(() => {
    const records = Object.values(currentViewStudent.attendanceRecords || {});
    return {
      total: records.length,
      present: records.filter(r => r.status === 'present').length,
      absent: records.filter(r => r.status === 'absent').length,
      late: records.filter(r => r.status === 'late').length,
      leaveEarly: records.filter(r => r.status === 'leave_early').length
    };
  }, [currentViewStudent.attendanceRecords]);

  return (
    <div className="bg-slate-50 min-h-full pb-28 md:pb-12 font-sans">
      <div className="max-w-5xl mx-auto p-3 sm:p-5 md:p-6 lg:p-8 space-y-4 sm:space-y-6">
        
        {/* Profile Header Card */}
        <div className="bg-white rounded-2xl shadow-teal-soft border border-teal-100 overflow-hidden">
          <div className="bg-gradient-to-r from-[#0f766e] via-teal-700 to-[#0d9488] p-4 sm:p-6 md:p-8 text-white flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
            <div className="w-20 h-20 sm:w-22 sm:h-22 md:w-24 md:h-24 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border-2 border-white/30 shadow-md shrink-0">
              <User className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
            </div>

            <div className="text-center sm:text-left flex-1 min-w-0 w-full">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold font-display tracking-tight text-white">
                  {student.fullName}
                </h1>
                {student.code && (
                  <span className="font-mono text-xs px-2.5 py-0.5 rounded-md bg-white/20 border border-white/30 text-white font-semibold">
                    {student.code}
                  </span>
                )}
              </div>

              <div className="text-teal-100 text-xs sm:text-sm mt-1.5 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="inline-flex items-center gap-1.5 bg-white/15 px-3 py-1 rounded-lg text-white font-medium border border-white/20">
                  <BookOpen className="w-3.5 h-3.5" /> 
                  <span>{student.gender} • {student.ethnicity || 'Kinh'}</span>
                </span>
                
                {studentHistory.length > 0 && (
                  <div className="inline-flex items-center gap-1.5 bg-white/15 px-3 py-1 rounded-lg border border-white/20 text-white">
                    <Calendar className="w-3.5 h-3.5" />
                    <select 
                      value={selectedHistoryId}
                      onChange={e => setSelectedHistoryId(e.target.value)}
                      className="bg-transparent text-white focus:outline-none cursor-pointer appearance-none pr-3 font-medium text-xs sm:text-sm"
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

            {/* Mobile / Desktop Action buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto shrink-0 mt-2 sm:mt-0">
              {student.award && (
                <div className="w-full sm:w-auto bg-amber-400 text-amber-950 px-3.5 py-2 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-sm">
                  <Trophy className="w-4 h-4 text-amber-900 shrink-0" />
                  <span>Danh hiệu: {student.award}</span>
                </div>
              )}

              <button
                onClick={handleStartEditing}
                className="w-full sm:w-auto px-4 py-2.5 bg-white text-[#0f766e] hover:bg-teal-50 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-all hover:scale-[1.02] active:scale-95"
                title="Chỉnh sửa thông tin con em"
              >
                <Edit className="w-4 h-4" />
                <span>Chỉnh sửa thông tin</span>
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Navigation Tabs (Hidden on Mobile) */}
        <div className="hidden md:flex gap-1.5 sm:gap-3 border-b border-slate-200 overflow-x-auto hide-scrollbar pb-px -mx-1 px-1">
          <button 
            className={`whitespace-nowrap flex-shrink-0 py-2.5 sm:py-3 px-3 sm:px-4 font-medium text-xs sm:text-sm transition-all relative flex items-center gap-1.5 sm:gap-2 rounded-t-xl ${activeTab === 'profile' ? 'text-[#0f766e] font-bold bg-teal-50/70 border-b-2 border-[#0f766e]' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'}`}
            onClick={() => setActiveTab('profile')}
          >
            <User className="w-4 h-4 text-[#0f766e]" /> Hồ sơ con em
          </button>

          <button 
            className={`whitespace-nowrap flex-shrink-0 py-2.5 sm:py-3 px-3 sm:px-4 font-medium text-xs sm:text-sm transition-all relative flex items-center gap-1.5 sm:gap-2 rounded-t-xl ${activeTab === 'weekly_plan' ? 'text-[#0f766e] font-bold bg-teal-50/70 border-b-2 border-[#0f766e]' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'}`}
            onClick={() => setActiveTab('weekly_plan')}
          >
            <ClipboardList className="w-4 h-4 text-[#0f766e]" /> 
            <span>Kế hoạch tuần</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
              activeTab === 'weekly_plan' ? 'bg-[#0f766e] text-white' : 'bg-amber-100 text-amber-800'
            }`}>
              Tuần {currentWeekNumber}
            </span>
          </button>
          
          <button 
            className={`whitespace-nowrap flex-shrink-0 py-2.5 sm:py-3 px-3 sm:px-4 font-medium text-xs sm:text-sm transition-all relative flex items-center gap-1.5 sm:gap-2 rounded-t-xl ${activeTab === 'attendance' ? 'text-[#0f766e] font-bold bg-teal-50/70 border-b-2 border-[#0f766e]' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'}`}
            onClick={() => setActiveTab('attendance')}
          >
            <CalendarCheck className="w-4 h-4 text-[#0f766e]" /> Hoạt động & Điểm danh
          </button>
          
          <button 
            className={`whitespace-nowrap flex-shrink-0 py-2.5 sm:py-3 px-3 sm:px-4 font-medium text-xs sm:text-sm transition-all relative flex items-center gap-1.5 sm:gap-2 rounded-t-xl ${activeTab === 'schedule' ? 'text-[#0f766e] font-bold bg-teal-50/70 border-b-2 border-[#0f766e]' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'}`}
            onClick={() => setActiveTab('schedule')}
          >
            <Calendar className="w-4 h-4 text-[#0f766e]" /> Thời khoá biểu
          </button>
          
          <button 
            className={`whitespace-nowrap flex-shrink-0 py-2.5 sm:py-3 px-3 sm:px-4 font-medium text-xs sm:text-sm transition-all relative flex items-center gap-1.5 sm:gap-2 rounded-t-xl ${activeTab === 'lunch_menu' ? 'text-[#0f766e] font-bold bg-teal-50/70 border-b-2 border-[#0f766e]' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'}`}
            onClick={() => setActiveTab('lunch_menu')}
          >
            <Utensils className="w-4 h-4 text-[#0f766e]" /> Thực đơn ăn trưa
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'profile' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            {!isEditingProfile ? (
              /* View Mode */
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 sm:p-5 bg-gradient-to-r from-teal-50/70 to-teal-100/30 border-b border-teal-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold font-display text-slate-800 text-base sm:text-lg flex items-center gap-2">
                      <IdCard className="w-5 h-5 text-[#0f766e]" />
                      Thông tin hồ sơ học sinh
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                      Phụ huynh có thể kiểm tra và cập nhật thông tin con em mình bên dưới
                    </p>
                  </div>

                  <button
                    onClick={handleStartEditing}
                    className="self-start sm:self-auto px-4 py-2 bg-[#0f766e] hover:bg-teal-800 text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Chỉnh sửa thông tin</span>
                  </button>
                </div>

                <div className="p-4 sm:p-6 space-y-6">
                  {/* Notice */}
                  <div className="p-3.5 sm:p-4 bg-[#f0fdfa] border border-[#5eead4] rounded-xl flex items-start gap-3">
                    <Info className="w-5 h-5 text-[#0f766e] shrink-0 mt-0.5" />
                    <p className="text-xs sm:text-sm text-teal-950 leading-relaxed">
                      Quý phụ huynh có thể rà soát và chỉnh sửa thông tin nhân thân (Họ tên, ngày sinh, nơi sinh, địa chỉ, số điện thoại, CCCD/Định danh). Sau khi bấm <strong>Lưu thay đổi</strong>, dữ liệu sẽ được cập nhật trực tiếp lên hệ thống trường học.
                    </p>
                  </div>

                  {/* Section 1: Thông tin nhân thân */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-display mb-3 flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-[#0f766e]" /> Thông tin nhân thân
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      <div className="p-3 sm:p-3.5 bg-slate-50/80 rounded-xl border border-slate-100">
                        <span className="text-[11px] font-medium text-slate-500 block mb-1">Họ và Tên</span>
                        <span className="font-bold text-slate-800 text-sm font-display">
                          {student.fullName}
                        </span>
                      </div>

                      <div className="p-3 sm:p-3.5 bg-slate-50/80 rounded-xl border border-slate-100">
                        <span className="text-[11px] font-medium text-slate-500 block mb-1">Giới tính</span>
                        <span className="font-medium text-slate-800 text-sm">
                          {student.gender}
                        </span>
                      </div>

                      <div className="p-3 sm:p-3.5 bg-slate-50/80 rounded-xl border border-slate-100">
                        <span className="text-[11px] font-medium text-slate-500 block mb-1">Ngày sinh</span>
                        <span className="font-medium text-slate-800 text-sm">
                          {student.dob || 'Chưa cập nhật'}
                        </span>
                      </div>

                      <div className="p-3 sm:p-3.5 bg-slate-50/80 rounded-xl border border-slate-100">
                        <span className="text-[11px] font-medium text-slate-500 block mb-1">Dân tộc</span>
                        <span className="font-medium text-slate-800 text-sm">
                          {student.ethnicity || 'Kinh'}
                        </span>
                      </div>

                      <div className="p-3 sm:p-3.5 bg-slate-50/80 rounded-xl border border-slate-100">
                        <span className="text-[11px] font-medium text-slate-500 block mb-1">Quốc tịch</span>
                        <span className="font-medium text-slate-800 text-sm">
                          {student.nationality || 'Việt Nam'}
                        </span>
                      </div>

                      <div className="p-3 sm:p-3.5 bg-slate-50/80 rounded-xl border border-slate-100">
                        <span className="text-[11px] font-medium text-slate-500 block mb-1">Tôn giáo</span>
                        <span className="font-medium text-slate-800 text-sm">
                          {student.religion || 'Không'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Nơi ở & Liên hệ */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-display mb-3 flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[#0f766e]" /> Nơi ở & Liên hệ
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      <div className="p-3 sm:p-3.5 bg-slate-50/80 rounded-xl border border-slate-100">
                        <span className="text-[11px] font-medium text-slate-500 block mb-1">Nơi sinh</span>
                        <span className="font-medium text-slate-800 text-sm">
                          {student.pob || 'Chưa cập nhật'}
                        </span>
                      </div>

                      <div className="p-3 sm:p-3.5 bg-slate-50/80 rounded-xl border border-slate-100 sm:col-span-2">
                        <span className="text-[11px] font-medium text-slate-500 block mb-1">Chỗ ở hiện nay</span>
                        <span className="font-medium text-slate-800 text-sm">
                          {student.currentAddress || 'Chưa cập nhật'}
                        </span>
                      </div>

                      <div className="p-3 sm:p-3.5 bg-slate-50/80 rounded-xl border border-slate-100">
                        <span className="text-[11px] font-medium text-slate-500 block mb-1">Số điện thoại phụ huynh</span>
                        <span className="font-semibold text-slate-800 text-sm">
                          {student.phone || student.parentPhone || 'Chưa cập nhật'}
                        </span>
                      </div>

                      <div className="p-3 sm:p-3.5 bg-slate-50/80 rounded-xl border border-slate-100 sm:col-span-2">
                        <span className="text-[11px] font-medium text-slate-500 block mb-1">Họ tên phụ huynh / Giám hộ</span>
                        <span className="font-medium text-slate-800 text-sm">
                          {student.parentName || 'Chưa cập nhật'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Học vụ & Định danh */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-display mb-3 flex items-center gap-2">
                      <CreditCard className="w-3.5 h-3.5 text-[#0f766e]" /> Học vụ & Định danh
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="p-3 sm:p-3.5 bg-slate-50/80 rounded-xl border border-slate-100">
                        <span className="text-[11px] font-medium text-slate-500 block mb-1">Mã học sinh</span>
                        <span className="font-mono font-bold text-[#0f766e] bg-[#ccfbf1]/80 px-2 py-0.5 rounded text-xs">
                          {student.code || 'Chưa có'}
                        </span>
                      </div>

                      <div className="p-3 sm:p-3.5 bg-slate-50/80 rounded-xl border border-slate-100">
                        <span className="text-[11px] font-medium text-slate-500 block mb-1">STT trong lớp</span>
                        <span className="font-semibold text-slate-800 text-sm">
                          {student.stt || 1}
                        </span>
                      </div>

                      <div className="p-3 sm:p-3.5 bg-slate-50/80 rounded-xl border border-slate-100">
                        <span className="text-[11px] font-medium text-slate-500 block mb-1">Lớp đang theo học</span>
                        <span className="font-semibold text-[#0f766e] text-sm">
                          Lớp {currentClass?.name || student.classId} {schoolYearName ? `(${schoolYearName})` : ''}
                        </span>
                      </div>

                      <div className="p-3 sm:p-3.5 bg-slate-50/80 rounded-xl border border-slate-100">
                        <span className="text-[11px] font-medium text-slate-500 block mb-1">Số CCCD / Định danh</span>
                        <span className="font-mono font-medium text-slate-800 text-sm">
                          {student.citizenId || 'Chưa cập nhật'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Edit Mode */
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 sm:p-5 bg-gradient-to-r from-teal-50 to-teal-100/60 border-b border-teal-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Edit className="w-5 h-5 text-[#0f766e]" />
                    <div>
                      <h3 className="font-bold font-display text-slate-800 text-base sm:text-lg">
                        Chỉnh sửa thông tin học sinh
                      </h3>
                      <p className="text-xs text-slate-500">
                        Thông tin sẽ được cập nhật trực tiếp vào hệ thống
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleCancelEditing}
                    className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-white rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveProfile} className="p-4 sm:p-6 space-y-5 sm:space-y-6">
                  {/* Fixed notice for non-editable system keys */}
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
                    <div>
                      <span className="text-slate-400">Mã học sinh:</span>{' '}
                      <span className="font-mono font-bold text-teal-800">{student.code}</span>
                    </div>
                    <span>•</span>
                    <div>
                      <span className="text-slate-400">Lớp:</span>{' '}
                      <span className="font-bold text-teal-800">{currentClass?.name || student.classId}</span>
                    </div>
                    <span>•</span>
                    <span className="text-slate-500 italic">Mã số và Lớp do nhà trường phân công cố định</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-4">
                    {/* Họ và tên */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Họ và Tên học sinh <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={editFormData.fullName}
                        onChange={e => setEditFormData({ ...editFormData, fullName: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0f766e] focus:border-[#0f766e]"
                        placeholder="Nhập họ và tên đầy đủ"
                      />
                    </div>

                    {/* Giới tính */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Giới tính
                      </label>
                      <select
                        value={editFormData.gender}
                        onChange={e => setEditFormData({ ...editFormData, gender: e.target.value as 'Nam' | 'Nữ' })}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0f766e] focus:border-[#0f766e]"
                      >
                        <option value="Nam">Nam</option>
                        <option value="Nữ">Nữ</option>
                      </select>
                    </div>

                    {/* Ngày sinh */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Ngày sinh
                      </label>
                      <input
                        type="text"
                        value={editFormData.dob}
                        onChange={e => setEditFormData({ ...editFormData, dob: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0f766e] focus:border-[#0f766e]"
                        placeholder="DD/MM/YYYY (VD: 20/04/2015)"
                      />
                    </div>

                    {/* Dân tộc */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Dân tộc
                      </label>
                      <input
                        type="text"
                        value={editFormData.ethnicity}
                        onChange={e => setEditFormData({ ...editFormData, ethnicity: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0f766e] focus:border-[#0f766e]"
                        placeholder="VD: Kinh"
                      />
                    </div>

                    {/* Quốc tịch */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Quốc tịch
                      </label>
                      <input
                        type="text"
                        value={editFormData.nationality}
                        onChange={e => setEditFormData({ ...editFormData, nationality: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0f766e] focus:border-[#0f766e]"
                        placeholder="VD: Việt Nam"
                      />
                    </div>

                    {/* Tôn giáo */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Tôn giáo
                      </label>
                      <input
                        type="text"
                        value={editFormData.religion}
                        onChange={e => setEditFormData({ ...editFormData, religion: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0f766e] focus:border-[#0f766e]"
                        placeholder="VD: Không"
                      />
                    </div>

                    {/* Nơi sinh */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Nơi sinh
                      </label>
                      <input
                        type="text"
                        value={editFormData.pob}
                        onChange={e => setEditFormData({ ...editFormData, pob: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0f766e] focus:border-[#0f766e]"
                        placeholder="VD: Tỉnh Đắk Lắk"
                      />
                    </div>

                    {/* Chỗ ở hiện nay */}
                    <div className="sm:col-span-3">
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Chỗ ở hiện nay
                      </label>
                      <input
                        type="text"
                        value={editFormData.currentAddress}
                        onChange={e => setEditFormData({ ...editFormData, currentAddress: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0f766e] focus:border-[#0f766e]"
                        placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố..."
                      />
                    </div>

                    {/* Số điện thoại */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Số điện thoại phụ huynh
                      </label>
                      <input
                        type="tel"
                        value={editFormData.phone}
                        onChange={e => setEditFormData({ ...editFormData, phone: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0f766e] focus:border-[#0f766e]"
                        placeholder="VD: 0912345678"
                      />
                    </div>

                    {/* Số định danh cá nhân / CCCD */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Số định danh cá nhân (CCCD)
                      </label>
                      <input
                        type="text"
                        value={editFormData.citizenId}
                        onChange={e => setEditFormData({ ...editFormData, citizenId: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0f766e] focus:border-[#0f766e]"
                        placeholder="12 chữ số CCCD / định danh"
                      />
                    </div>

                    {/* Họ tên phụ huynh */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Họ tên phụ huynh / Giám hộ
                      </label>
                      <input
                        type="text"
                        value={editFormData.parentName}
                        onChange={e => setEditFormData({ ...editFormData, parentName: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0f766e] focus:border-[#0f766e]"
                        placeholder="Họ và tên cha / mẹ"
                      />
                    </div>
                  </div>

                  {/* Submit / Cancel Buttons */}
                  <div className="pt-4 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3">
                    <button
                      type="button"
                      onClick={handleCancelEditing}
                      disabled={isSaving}
                      className="px-4 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-sm font-medium transition-colors text-center"
                    >
                      Hủy bỏ
                    </button>

                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-5 py-2.5 bg-[#0f766e] hover:bg-teal-800 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Đang lưu...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          <span>Lưu thay đổi</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* Tab Attendance */}
        {activeTab === 'attendance' && (
          <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto">
            {/* Quick Stats on Mobile & Desktop */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
              <div className="p-3.5 sm:p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
                <span className="text-[11px] sm:text-xs font-medium text-slate-500 block">Tổng số ngày</span>
                <span className="text-xl sm:text-2xl font-bold font-display text-slate-800">{attendanceStats.total}</span>
              </div>
              <div className="p-3.5 sm:p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100 shadow-2xs">
                <span className="text-[11px] sm:text-xs font-medium text-emerald-700 block">Có mặt</span>
                <span className="text-xl sm:text-2xl font-bold font-display text-emerald-700">{attendanceStats.present}</span>
              </div>
              <div className="p-3.5 sm:p-4 bg-rose-50/60 rounded-2xl border border-rose-100 shadow-2xs">
                <span className="text-[11px] sm:text-xs font-medium text-rose-700 block">Vắng mặt</span>
                <span className="text-xl sm:text-2xl font-bold font-display text-rose-700">{attendanceStats.absent}</span>
              </div>
              <div className="p-3.5 sm:p-4 bg-amber-50/60 rounded-2xl border border-amber-100 shadow-2xs">
                <span className="text-[11px] sm:text-xs font-medium text-amber-700 block">Đi trễ / Xin về</span>
                <span className="text-xl sm:text-2xl font-bold font-display text-amber-700">{attendanceStats.late + attendanceStats.leaveEarly}</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-4 bg-gradient-to-r from-teal-50/70 to-teal-100/30 border-b border-teal-100">
                <h3 className="font-bold font-display text-slate-800 flex items-center gap-2 text-base sm:text-lg">
                  <CalendarCheck className="w-5 h-5 text-[#0f766e]" />
                  Lịch sử điểm danh & Hoạt động
                </h3>
              </div>
              <div className="p-4 sm:p-6">
                {!currentViewStudent.attendanceRecords || Object.keys(currentViewStudent.attendanceRecords).length === 0 ? (
                  <div className="text-center text-slate-500 py-8">Chưa có dữ liệu điểm danh.</div>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(currentViewStudent.attendanceRecords)
                      .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
                      .map(([date, record]) => (
                        <div key={date} className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:p-4 bg-slate-50/80 rounded-xl border border-slate-100 gap-3">
                          <div className="flex items-center gap-3.5">
                            <div className="w-12 h-12 bg-white rounded-xl shadow-2xs border border-slate-200 flex flex-col items-center justify-center shrink-0">
                              <span className="text-[10px] font-medium text-slate-500 uppercase">{new Date(date).toLocaleDateString('vi-VN', { month: 'short' })}</span>
                              <span className="text-base font-bold text-[#0f766e] leading-none">{new Date(date).getDate()}</span>
                            </div>
                            <div>
                              <div className="font-semibold text-slate-800 text-sm">{new Date(date).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                              {record.reason && (
                                <div className="text-xs text-slate-600 bg-white px-2.5 py-1 rounded-md border border-slate-100 italic mt-1 inline-block">
                                  <span className="font-medium not-italic text-slate-700 mr-1">Lý do:</span>
                                  {record.reason}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="self-start sm:self-auto">
                            {record.status === 'present' ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 font-semibold rounded-lg text-xs border border-emerald-200">
                                <UserCheck className="w-3.5 h-3.5" /> Có mặt
                              </span>
                            ) : record.status === 'absent' ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-700 font-semibold rounded-lg text-xs border border-rose-200">
                                <UserX className="w-3.5 h-3.5" /> Vắng mặt
                              </span>
                            ) : record.status === 'leave_early' ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 font-semibold rounded-lg text-xs border border-amber-200">
                                Xin về sớm
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 text-orange-700 font-semibold rounded-lg text-xs border border-orange-200">
                                <Clock className="w-3.5 h-3.5" /> Đi trễ
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

        {activeTab === 'weekly_plan' && (
          <ParentWeeklyPlan classId={currentViewStudent.classId} schoolYearName={schoolYearName} />
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

      {/* Mobile Bottom Navigation Bar (md:hidden) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.07)] md:hidden">
        <div className="grid grid-cols-5 h-16 max-w-md mx-auto px-1.5 items-center">
          {/* Tab 1: Hồ sơ */}
          <button
            onClick={() => { setActiveTab('profile'); setShowMoreMenu(false); }}
            className={`flex flex-col items-center justify-center gap-1 transition-all py-1 ${
              activeTab === 'profile' ? 'text-[#0f766e]' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-all ${activeTab === 'profile' ? 'bg-[#ccfbf1] text-[#0f766e]' : ''}`}>
              <User className="w-5 h-5" />
            </div>
            <span className={`text-[10px] leading-tight ${activeTab === 'profile' ? 'font-bold text-[#0f766e]' : 'font-medium'}`}>
              Hồ sơ
            </span>
          </button>

          {/* Tab 2: Kế hoạch */}
          <button
            onClick={() => { setActiveTab('weekly_plan'); setShowMoreMenu(false); }}
            className={`flex flex-col items-center justify-center gap-1 transition-all py-1 relative ${
              activeTab === 'weekly_plan' ? 'text-[#0f766e]' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-all relative ${activeTab === 'weekly_plan' ? 'bg-[#ccfbf1] text-[#0f766e]' : ''}`}>
              <ClipboardList className="w-5 h-5" />
              <span className="absolute -top-1 -right-2 text-[9px] font-bold px-1 bg-amber-400 text-teal-950 rounded-full shadow-xs">
                T{currentWeekNumber}
              </span>
            </div>
            <span className={`text-[10px] leading-tight ${activeTab === 'weekly_plan' ? 'font-bold text-[#0f766e]' : 'font-medium'}`}>
              Kế hoạch
            </span>
          </button>

          {/* Tab 3: Điểm danh */}
          <button
            onClick={() => { setActiveTab('attendance'); setShowMoreMenu(false); }}
            className={`flex flex-col items-center justify-center gap-1 transition-all py-1 ${
              activeTab === 'attendance' ? 'text-[#0f766e]' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-all ${activeTab === 'attendance' ? 'bg-[#ccfbf1] text-[#0f766e]' : ''}`}>
              <CalendarCheck className="w-5 h-5" />
            </div>
            <span className={`text-[10px] leading-tight ${activeTab === 'attendance' ? 'font-bold text-[#0f766e]' : 'font-medium'}`}>
              Điểm danh
            </span>
          </button>

          {/* Tab 4: Lịch học */}
          <button
            onClick={() => { setActiveTab('schedule'); setShowMoreMenu(false); }}
            className={`flex flex-col items-center justify-center gap-1 transition-all py-1 ${
              activeTab === 'schedule' ? 'text-[#0f766e]' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-all ${activeTab === 'schedule' ? 'bg-[#ccfbf1] text-[#0f766e]' : ''}`}>
              <Calendar className="w-5 h-5" />
            </div>
            <span className={`text-[10px] leading-tight ${activeTab === 'schedule' ? 'font-bold text-[#0f766e]' : 'font-medium'}`}>
              Lịch học
            </span>
          </button>

          {/* Tab 5: Thêm (hoặc Thực đơn) */}
          <button
            onClick={() => setShowMoreMenu(prev => !prev)}
            className={`flex flex-col items-center justify-center gap-1 transition-all py-1 ${
              activeTab === 'lunch_menu' || showMoreMenu ? 'text-[#0f766e]' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-all ${
              activeTab === 'lunch_menu' || showMoreMenu ? 'bg-[#ccfbf1] text-[#0f766e]' : ''
            }`}>
              {activeTab === 'lunch_menu' && !showMoreMenu ? (
                <Utensils className="w-5 h-5" />
              ) : (
                <MoreHorizontal className="w-5 h-5" />
              )}
            </div>
            <span className={`text-[10px] leading-tight ${
              activeTab === 'lunch_menu' || showMoreMenu ? 'font-bold text-[#0f766e]' : 'font-medium'
            }`}>
              {activeTab === 'lunch_menu' && !showMoreMenu ? 'Thực đơn' : 'Thêm'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile More Options Sheet (Bottom Drawer) */}
      {showMoreMenu && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setShowMoreMenu(false)}
          />
          
          {/* Sheet container */}
          <div className="relative bg-white rounded-t-3xl border-t border-slate-200 shadow-2xl p-5 space-y-4 max-h-[85vh] overflow-y-auto z-10">
            {/* Handle pill */}
            <div className="w-12 h-1 bg-slate-300 rounded-full mx-auto" />

            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <div>
                <h3 className="font-bold font-display text-slate-800 text-base">Tính năng & Tiện ích</h3>
                <p className="text-xs text-slate-500">Xem thêm các chức năng dành cho phụ huynh</p>
              </div>
              <button 
                onClick={() => setShowMoreMenu(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5 pt-1">
              {/* Thực đơn ăn trưa */}
              <button
                onClick={() => {
                  setActiveTab('lunch_menu');
                  setShowMoreMenu(false);
                }}
                className={`w-full p-3.5 rounded-2xl flex items-center justify-between transition-all border ${
                  activeTab === 'lunch_menu' 
                    ? 'bg-[#f0fdfa] border-[#5eead4] text-[#0f766e]' 
                    : 'bg-slate-50/70 border-slate-100 hover:bg-slate-100/80 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                    <Utensils className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-sm text-slate-800 font-display">Thực đơn ăn trưa</div>
                    <div className="text-xs text-slate-500">Khẩu phần dinh dưỡng hàng ngày của học sinh</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              {/* Chỉnh sửa thông tin con em */}
              <button
                onClick={() => {
                  setActiveTab('profile');
                  handleStartEditing();
                  setShowMoreMenu(false);
                }}
                className="w-full p-3.5 rounded-2xl flex items-center justify-between transition-all border bg-slate-50/70 border-slate-100 hover:bg-slate-100/80 text-slate-700"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#ccfbf1] text-[#0f766e] flex items-center justify-center shrink-0">
                    <Edit className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-sm text-slate-800 font-display">Chỉnh sửa hồ sơ con em</div>
                    <div className="text-xs text-slate-500">Cập nhật thông tin liên hệ, chỗ ở, CCCD</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              {/* Lịch học & Thời khoá biểu */}
              <button
                onClick={() => {
                  setActiveTab('schedule');
                  setShowMoreMenu(false);
                }}
                className={`w-full p-3.5 rounded-2xl flex items-center justify-between transition-all border ${
                  activeTab === 'schedule' 
                    ? 'bg-[#f0fdfa] border-[#5eead4] text-[#0f766e]' 
                    : 'bg-slate-50/70 border-slate-100 hover:bg-slate-100/80 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-sm text-slate-800 font-display">Thời khoá biểu học tập</div>
                    <div className="text-xs text-slate-500">Các tiết học sáng và chiều trong tuần</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              {/* Thông tin lớp & Học sinh */}
              <div className="p-3.5 rounded-2xl bg-teal-50/60 border border-teal-100 flex items-center gap-3 mt-2">
                <div className="w-10 h-10 rounded-xl bg-teal-100 text-[#0f766e] flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div className="text-left flex-1">
                  <div className="font-semibold text-xs text-teal-950">
                    Lớp {currentClass?.name || student.classId} {schoolYearName ? `• ${schoolYearName}` : ''}
                  </div>
                  <div className="text-[11px] text-teal-700 mt-0.5">Mã học sinh: {student.code || 'Chưa cập nhật'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

