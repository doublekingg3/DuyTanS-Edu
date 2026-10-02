import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

export type Language = 'vi' | 'en';

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, fallback?: string) => string;
  isEn: boolean;
  isVi: boolean;
}

const translations: Record<Language, Record<string, string>> = {
  vi: {
    // Top Bar & App Header
    appName: 'Trường Phổ Thông Duy Tân',
    appSubtitle: 'DuyTan Student360',
    class: 'Lớp',
    homeroomTeacher: 'GVCN',
    unassigned: 'Chưa phân công',
    notifications: 'Thông báo',
    changePassword: 'Đổi mật khẩu',
    backToPortal: 'Về trang Portal',
    logout: 'Đăng xuất',
    language: 'Ngôn ngữ',
    vietnamese: 'Tiếng Việt',
    english: 'English',
    switchLanguage: 'Chuyển sang Tiếng Anh (English)',

    // Roles
    roleAdmin: 'Ban Giám Hiệu',
    roleTeacher: 'Giáo viên',
    roleStaff: 'Giáo vụ',
    roleMedia: 'Phòng Truyền Thông',
    roleParent: 'Phụ huynh',
    roleHomeroom: 'Chủ nhiệm',
    roleShortAdmin: 'BGH',
    roleShortMedia: 'TT',
    roleShortStaff: 'GVụ',
    roleShortTeacher: 'GV',

    // Parent View Sidebar & Navigation
    parentPortalTitle: 'CỔNG THÔNG TIN PHỤ HUYNH',
    dashboard: 'Tổng quan',
    studentProfile: 'Hồ sơ con em',
    newsAndActivities: 'Tin tức & Phong trào',
    weeklyPlan: 'Kế hoạch tuần',
    activitiesAndAttendance: 'Hoạt động & Điểm danh',
    schedule: 'Thời khoá biểu',
    lunchMenu: 'Thực đơn ăn trưa',
    today: 'Hôm nay',
    week: 'Tuần',
    posts: 'bài',
    studentCode: 'Mã',
    studentYear: 'Học sinh niên khóa',
    academicYear: 'Năm học',

    // Parent Dashboard Widgets
    schoolActivitiesHeader: 'HOẠT ĐỘNG & SỰ KIỆN TIÊU BIỂU NHÀ TRƯỜNG',
    schoolActivitiesSub: 'Nhấp vào bài viết hoặc banner để xem đầy đủ nội dung bài viết và phóng sự hình ảnh',
    welcomeParent: 'Xin chào Quý phụ huynh!',
    parentOverviewDesc: 'Theo dõi toàn diện tình hình chuyên cần, học tập và hoạt động của con em tại trường Duy Tân',
    overallAttendanceRate: 'Tỉ lệ chuyên cần',
    presentDays: 'Có mặt',
    absentDays: 'Vắng mặt',
    lateDays: 'Đi trễ',
    earlyLeaveDays: 'Về sớm',
    totalSchoolDays: 'Tổng ngày học',
    lunchStatus: 'Bán trú & Ăn trưa',
    boardingRegistered: 'Đã đăng ký bán trú',
    boardingNotRegistered: 'Chưa đăng ký bán trú',
    todayLunchMenu: 'Thực đơn trưa hôm nay',
    viewFullLunchMenu: 'Xem toàn bộ thực đơn tuần',
    viewFullSchedule: 'Xem toàn bộ TKB',
    todaySchedule: 'Thời khoá biểu hôm nay',
    morningSchedule: 'Buổi Sáng',
    afternoonSchedule: 'Buổi Chiều',
    noScheduleToday: 'Hôm nay không có tiết học hoặc đang nghỉ',
    currentWeekPlan: 'Kế hoạch trọng tâm tuần',
    viewFullWeeklyPlan: 'Xem chi tiết kế hoạch',
    quickActions: 'Truy cập nhanh',
    personalInfo: 'Thông tin cá nhân',
    academicRecords: 'Hồ sơ học tập',
    contactTeacher: 'Liên hệ giáo viên',
    emergencyContact: 'Số điện thoại khẩn cấp',
    updateProfile: 'Cập nhật hồ sơ con em',
    saveProfile: 'Lưu thay đổi',
    cancel: 'Hủy',
    edit: 'Chỉnh sửa',

    // Teacher & Admin View Tabs & Menu
    managementSystem: 'HỆ THỐNG QUẢN LÝ',
    teacherWorkplace: 'Bàn làm việc Giáo viên',
    executiveDashboard: 'Tổng quan Ban Giám Hiệu',
    classList: 'Danh sách lớp',
    studentsCount: 'HS',
    attendanceMarking: 'Điểm danh',
    attendanceDone: 'Đã điểm danh',
    attendanceNotDone: 'Chưa điểm danh',
    attendanceReminder: 'Nhắc nhở điểm danh chuyên cần',
    openAttendanceBook: 'Mở sổ điểm danh lớp',
    classComparisonChart: 'BIỂU ĐỒ SO SÁNH CÁC LỚP',
    classComparisonSubtitle: 'Đối chiếu tỉ lệ chuyên cần, tình hình vắng trễ và sĩ số học sinh giữa các lớp',
    absentLateListTitle: 'DANH SÁCH CHI TIẾT HỌC SINH VẮNG, ĐI TRỄ',
    attendanceRateTableTitle: 'BẢNG THỐNG KÊ & ĐỐI CHIẾU TỈ LỆ CHUYÊN CẦN',
    classManagement: 'Quản lý Lớp học',
    schoolYearManagement: 'Quản lý Năm học',
    userManagement: 'Quản lý người dùng',
    systemConfig: 'Cấu hình hệ thống',
    mediaNews: 'Tin tức hoạt động',
    mediaDepartment: 'Truyền thông',
    boardingBadge: 'Bán trú',

    // Common Metrics & Actions
    totalStudents: 'Tổng số học sinh',
    presentCount: 'Có mặt',
    absentCount: 'Vắng',
    lateCount: 'Đi trễ',
    attendanceRatePercent: 'Tỉ lệ chuyên cần (%)',
    filterByGrade: 'Khối lớp',
    filterAll: 'Tất cả',
    grade6: 'Khối 6',
    grade7: 'Khối 7',
    grade8: 'Khối 8',
    grade9: 'Khối 9',
    grade10: 'Khối 10',
    grade11: 'Khối 11',
    grade12: 'Khối 12',
    search: 'Tìm kiếm',
    searchPlaceholder: 'Tìm kiếm tên, mã học sinh...',
    date: 'Ngày',
    status: 'Trạng thái',
    action: 'Thao tác',
    details: 'Chi tiết',
    exportReport: 'Xuất báo cáo',
    confirm: 'Xác nhận',
    close: 'Đóng',
    success: 'Thành công',
    warning: 'Cảnh báo',
    error: 'Lỗi',
    loading: 'Đang tải...',
    noData: 'Chưa có dữ liệu',

    // Chart modes
    metricAttendanceRate: 'Tỉ lệ chuyên cần (%)',
    metricAbsentLate: 'Số lượng vắng / trễ',
    metricEnrollment: 'Sĩ số & Có mặt',
    sortClassOrder: 'Thứ tự lớp',
    sortRateDesc: 'Tỉ lệ chuyên cần cao → thấp',
    sortRateAsc: 'Tỉ lệ chuyên cần thấp → cao',
    sortAbsentDesc: 'Nhiều học sinh vắng nhất',

    // Password reset in Parent Access
    parentAccessTitle: 'Mã truy cập Phụ huynh',
    resetPassword: 'Đặt lại mật khẩu',
    resetPasswordShort: 'Reset MK',
    resetPasswordForStudent: 'Đặt lại mật khẩu cho học sinh',
    currentPasswordLabel: 'Mật khẩu hiện tại',
    newPasswordLabel: 'Mật khẩu mới',
    resetToDefaultBtn: 'Đặt về mặc định (12345678)',
    generateRandomPin: 'Tạo 6 số ngẫu nhiên',
    saveNewPassword: 'Lưu mật khẩu mới',
    savingPassword: 'Đang lưu...',
    resetPasswordSuccess: 'Đã đặt lại mật khẩu thành công!',
    resetAllClassPasswords: 'Reset tất cả về 12345678',
    resetAllClassConfirm: 'Bạn có chắc chắn muốn đặt lại mật khẩu cho tất cả học sinh đang chọn về mặc định 12345678 không?',
    resetAllSuccess: 'Đã đặt lại mật khẩu thành công cho'
  },
  en: {
    // Top Bar & App Header
    appName: 'Duy Tan High School',
    appSubtitle: 'DuyTan Student360',
    class: 'Class',
    homeroomTeacher: 'Teacher',
    unassigned: 'Unassigned',
    notifications: 'Notifications',
    changePassword: 'Change Password',
    backToPortal: 'Back to Portal',
    logout: 'Sign Out',
    language: 'Language',
    vietnamese: 'Tiếng Việt',
    english: 'English',
    switchLanguage: 'Switch to Vietnamese (Tiếng Việt)',

    // Roles
    roleAdmin: 'School Board (Admin)',
    roleTeacher: 'Teacher',
    roleStaff: 'Academic Staff',
    roleMedia: 'Communications Dept.',
    roleParent: 'Parent',
    roleHomeroom: 'Homeroom',
    roleShortAdmin: 'Admin',
    roleShortMedia: 'Media',
    roleShortStaff: 'Staff',
    roleShortTeacher: 'Tch',

    // Parent View Sidebar & Navigation
    parentPortalTitle: 'PARENT PORTAL',
    dashboard: 'Overview',
    studentProfile: 'Student Profile',
    newsAndActivities: 'News & Activities',
    weeklyPlan: 'Weekly Plan',
    activitiesAndAttendance: 'Activities & Attendance',
    schedule: 'Class Timetable',
    lunchMenu: 'Lunch Menu',
    today: 'Today',
    week: 'Week',
    posts: 'posts',
    studentCode: 'Code',
    studentYear: 'Academic Year',
    academicYear: 'School Year',

    // Parent Dashboard Widgets
    schoolActivitiesHeader: 'OUTSTANDING SCHOOL ACTIVITIES & EVENTS',
    schoolActivitiesSub: 'Click on any post or banner to view full article details and photo gallery',
    welcomeParent: 'Welcome Parents!',
    parentOverviewDesc: 'Track your child\'s attendance, academic progress and extracurricular activities at Duy Tan School',
    overallAttendanceRate: 'Attendance Rate',
    presentDays: 'Present',
    absentDays: 'Absent',
    lateDays: 'Late',
    earlyLeaveDays: 'Left Early',
    totalSchoolDays: 'Total School Days',
    lunchStatus: 'Boarding & Lunch',
    boardingRegistered: 'Boarding Registered',
    boardingNotRegistered: 'Not Registered',
    todayLunchMenu: 'Today\'s Lunch Menu',
    viewFullLunchMenu: 'View Full Week Menu',
    viewFullSchedule: 'View Full Timetable',
    todaySchedule: 'Today\'s Timetable',
    morningSchedule: 'Morning',
    afternoonSchedule: 'Afternoon',
    noScheduleToday: 'No classes scheduled for today',
    currentWeekPlan: 'Key Weekly Plan',
    viewFullWeeklyPlan: 'View Detailed Plan',
    quickActions: 'Quick Access',
    personalInfo: 'Personal Information',
    academicRecords: 'Academic Records',
    contactTeacher: 'Contact Teacher',
    emergencyContact: 'Emergency Contact',
    updateProfile: 'Update Student Profile',
    saveProfile: 'Save Changes',
    cancel: 'Cancel',
    edit: 'Edit',

    // Teacher & Admin View Tabs & Menu
    managementSystem: 'MANAGEMENT SYSTEM',
    teacherWorkplace: 'Teacher Workplace',
    executiveDashboard: 'Executive Dashboard',
    classList: 'Class Roster',
    studentsCount: 'Students',
    attendanceMarking: 'Attendance',
    attendanceDone: 'Completed',
    attendanceNotDone: 'Pending',
    attendanceReminder: 'Attendance Reminder',
    openAttendanceBook: 'Open Class Attendance',
    classComparisonChart: 'CLASS COMPARISON CHART',
    classComparisonSubtitle: 'Compare attendance rates, absent/late statistics and student counts across classes',
    absentLateListTitle: 'DETAILED LIST OF ABSENT & LATE STUDENTS',
    attendanceRateTableTitle: 'ATTENDANCE RATE SUMMARY & COMPARISON',
    classManagement: 'Class Management',
    schoolYearManagement: 'School Year Management',
    userManagement: 'User Management',
    systemConfig: 'System Configuration',
    mediaNews: 'School News & Events',
    mediaDepartment: 'Media',
    boardingBadge: 'Boarding',

    // Common Metrics & Actions
    totalStudents: 'Total Students',
    presentCount: 'Present',
    absentCount: 'Absent',
    lateCount: 'Late',
    attendanceRatePercent: 'Attendance Rate (%)',
    filterByGrade: 'Grade Level',
    filterAll: 'All',
    grade6: 'Grade 6',
    grade7: 'Grade 7',
    grade8: 'Grade 8',
    grade9: 'Grade 9',
    grade10: 'Grade 10',
    grade11: 'Grade 11',
    grade12: 'Grade 12',
    search: 'Search',
    searchPlaceholder: 'Search name, student code...',
    date: 'Date',
    status: 'Status',
    action: 'Action',
    details: 'Details',
    exportReport: 'Export Report',
    confirm: 'Confirm',
    close: 'Close',
    success: 'Success',
    warning: 'Warning',
    error: 'Error',
    loading: 'Loading...',
    noData: 'No data available',

    // Chart modes
    metricAttendanceRate: 'Attendance Rate (%)',
    metricAbsentLate: 'Absent & Late Counts',
    metricEnrollment: 'Enrollment & Present',
    sortClassOrder: 'Class Order',
    sortRateDesc: 'Attendance: High to Low',
    sortRateAsc: 'Attendance: Low to High',
    sortAbsentDesc: 'Most Absences First',

    // Password reset in Parent Access
    parentAccessTitle: 'Parent Access Credentials',
    resetPassword: 'Reset Password',
    resetPasswordShort: 'Reset PW',
    resetPasswordForStudent: 'Reset password for student',
    currentPasswordLabel: 'Current password',
    newPasswordLabel: 'New password',
    resetToDefaultBtn: 'Reset to default (12345678)',
    generateRandomPin: 'Generate 6-digit PIN',
    saveNewPassword: 'Save New Password',
    savingPassword: 'Saving...',
    resetPasswordSuccess: 'Password reset successfully!',
    resetAllClassPasswords: 'Reset all to 12345678',
    resetAllClassConfirm: 'Are you sure you want to reset password for all selected students to default 12345678?',
    resetAllSuccess: 'Successfully reset passwords for'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('app_language');
    return (saved === 'en' || saved === 'vi') ? saved : 'vi';
  });

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app_language', lang);
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(language === 'vi' ? 'en' : 'vi');
  }, [language, setLanguage]);

  const t = useCallback((key: string, fallback?: string): string => {
    const localized = translations[language]?.[key];
    if (localized !== undefined) return localized;
    const defaultVi = translations['vi']?.[key];
    if (defaultVi !== undefined) return defaultVi;
    return fallback !== undefined ? fallback : key;
  }, [language]);

  return (
    <LanguageContext.Provider value={{
      language,
      setLanguage,
      toggleLanguage,
      t,
      isEn: language === 'en',
      isVi: language === 'vi'
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
