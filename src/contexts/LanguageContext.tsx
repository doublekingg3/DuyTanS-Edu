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
    studentCodeShort: 'Mã',
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
    resetAllSuccess: 'Đã đặt lại mật khẩu thành công cho',

    // Student Profile (ParentView)
    personalInfoTitle: 'Thông tin hồ sơ học sinh',
    personalInfoSubtitle: 'Phụ huynh có thể kiểm tra và cập nhật thông tin con em mình bên dưới',
    editInfoBtn: 'Chỉnh sửa thông tin',
    editInfoTitle: 'Chỉnh sửa thông tin học sinh',
    editInfoSubtitle: 'Thông tin sẽ được cập nhật trực tiếp vào hệ thống',
    personalNotice: 'Quý phụ huynh có thể rà soát và chỉnh sửa thông tin nhân thân (Họ tên, ngày sinh, nơi sinh, địa chỉ, số điện thoại, CCCD/Định danh). Sau khi bấm Lưu thay đổi, dữ liệu sẽ được cập nhật trực tiếp lên hệ thống trường học.',
    sectionPersonalInfo: 'Thông tin nhân thân',
    sectionAddressContact: 'Nơi ở & Liên hệ',
    sectionAcademicIdentity: 'Học vụ & Định danh',
    fullName: 'Họ và Tên',
    gender: 'Giới tính',
    male: 'Nam',
    female: 'Nữ',
    dob: 'Ngày sinh',
    pob: 'Nơi sinh',
    ethnicity: 'Dân tộc',
    nationality: 'Quốc tịch',
    religion: 'Tôn giáo',
    currentAddress: 'Chỗ ở hiện nay',
    parentPhone: 'Số điện thoại phụ huynh',
    parentName: 'Họ tên phụ huynh / Giám hộ',
    studentCode: 'Mã học sinh',
    classStt: 'STT trong lớp',
    enrolledClass: 'Lớp đang theo học',
    citizenId: 'Số CCCD / Định danh',
    notUpdated: 'Chưa cập nhật',
    saveChanges: 'Lưu thay đổi',
    cancelChanges: 'Hủy bỏ',
    saving: 'Đang lưu...',

    // Attendance (Parent & Teacher)
    totalDays: 'Tổng số ngày',
    present: 'Có mặt',
    absent: 'Vắng mặt',
    lateOrLeaveEarly: 'Đi trễ / Xin về',
    attendanceHistoryTitle: 'Lịch sử điểm danh & Hoạt động của học sinh',
    noAttendanceData: 'Chưa có dữ liệu điểm danh.',
    reason: 'Lý do',
    excusedAbsent: 'Có phép',
    unexcusedAbsent: 'Không phép',
    leaveEarly: 'Xin về sớm',
    late: 'Đi trễ',
    attendanceTitle: 'Điểm danh',
    todayLabel: 'Hôm nay',
    previousDay: 'Ngày hôm trước',
    nextDay: 'Ngày tiếp theo',
    allPresentBtn: 'Tất cả có mặt',
    exportExcelBtn: 'Xuất Excel',
    unmarked: 'Chưa điểm danh',
    searchStudentPlaceholder: 'Tìm học sinh theo tên, mã...',
    colStt: 'STT',
    colStudent: 'Học sinh',
    colCode: 'Mã HS',
    colStatus: 'Trạng thái',
    colReasonNote: 'Lý do / Ghi chú',
    colActions: 'Thao tác',
    saveReason: 'Lưu lý do',
    enrollmentCount: 'Sĩ số',
    attendanceRateShort: 'Tỉ lệ',
    homeroomShort: 'GVCN',
    subjectTeacherShort: 'GV Bộ môn',
    dailyAttendanceManage: 'Quản lý chuyên cần • Chạm nhanh để điểm danh trực tiếp',

    // Timetable & Schedule
    noScheduleTitle: 'Chưa có thời khoá biểu',
    noScheduleSubtitle: 'Nhà trường hoặc giáo viên chưa cập nhật thời khoá biểu cho lớp.',
    periodAndTime: 'TIẾT / THỜI GIAN',
    morningSession: 'BUỔI SÁNG',
    afternoonSession: 'BUỔI CHIỀU',
    lunchBreak: 'NGHỈ TRƯA',
    morningBreakText: 'Ra chơi & Thư giãn giữa các tiết học sáng (20 phút)',
    afternoonBreakText: 'Ra chơi & Thư giãn giữa các tiết học chiều (20 phút)',
    period: 'Tiết',
    dayMon: 'Thứ 2',
    dayTue: 'Thứ 3',
    dayWed: 'Thứ 4',
    dayThu: 'Thứ 5',
    dayFri: 'Thứ 6',
    daySat: 'Thứ 7',
    daySun: 'Chủ nhật',

    // Boarding Lunch Menu
    lunchMenuTitle: 'Thực đơn Bán trú Dinh dưỡng',
    lunchMenuSubtitle: 'Theo dõi khẩu phần ăn & thực đơn từng ngày trong tuần của học sinh',
    weekLabel: 'Tuần',
    noDishesListed: 'Chưa có món ăn cập nhật cho ngày này',
    dessert: 'Tráng miệng',

    // Weekly Plan
    weeklyPlanTitle: 'Kế hoạch công tác & Tuần học',
    weeklyPlanSubtitle: 'Theo dõi nhiệm vụ, lịch học và nội dung trọng tâm từng tuần',
    dutyTeamLabel: 'Đội trực tuần / Phụ trách',
    keyTasksLabel: 'Nội dung công việc trọng tâm trong tuần',
    noTasksListed: 'Chưa có nội dung công việc nào được lưu cho tuần này.',
    selectWeek: 'Chọn Tuần',
    viewingWeek: 'Đang xem',
    weekList: 'Danh sách Tuần',
    approvedStatus: 'Đã duyệt',
    draftStatus: 'Bản nháp',
    emptyStatus: 'Chưa cập nhật',

    // Parent Lunch Menu
    dailyLunchNutrition: 'Dinh dưỡng hàng ngày của học sinh tại trường',
    downloadPdf: 'Tải về (.pdf)',
    selectMenuWeek: 'Chọn tuần',
    approvedOfficial: 'Đã duyệt chính thức',
    updatingMenu: 'Đang cập nhật',
    timePeriod: 'Thời gian',
    from: 'từ',
    to: 'đến',

    // Schedule badges
    morningBreakLabel: '4 Tiết học • Ra chơi 9:05 - 9:25',
    afternoonBreakLabel: '4 Tiết học • Ra chơi 14:48 - 15:08',
    morningRecessText: 'Ra chơi: 9:05 - 9:25 (20 phút)',
    afternoonRecessText: 'Ra chơi: 14:48 - 15:08 (20 phút)',
    regularClassBadge: 'Chính khóa',

    // News & Categories
    catAll: 'Tất cả',
    catStem: 'Học tập & STEM',
    catSports: 'Thể dục thể thao',
    catArts: 'Văn nghệ & Hội trại',
    catExtracurricular: 'Ngoại khóa & Trải nghiệm',
    catEvents: 'Lễ hội & Sự kiện',
    newsSectionTitle: 'Bản Tin & Phong Trào Hoạt Động Duy Tân',
    newsSectionSubtitle: 'Cập nhật tin tức học tập, văn thể mỹ, trải nghiệm ngoại khóa dành cho Phụ Huynh & Học Sinh',
    readArticle: 'Đọc bài viết',
    viewAlbum: 'Xem album ảnh',
    share: 'Chia sẻ',
    like: 'Thích',
    liked: 'Đã thích',
    copiedLink: 'Đã sao chép liên kết bài viết!',
    articleDetails: 'Xem bài viết chi tiết',
    postedOn: 'Đăng ngày',
    authorBy: 'Tác giả',
    photosCount: 'ảnh',
    postsCount: 'bài đăng',

    // Login screen
    loginWelcome: 'CỔNG THÔNG TIN ĐIỆN TỬ',
    loginSubtitle: 'Hệ thống quản lý học sinh và sổ liên lạc điện tử DuyTan Student360',
    loginParentTab: 'Phụ huynh',
    loginTeacherTab: 'Giáo viên',
    loginAdminTab: 'Ban Giám Hiệu',
    loginStaffTab: 'Giáo vụ',
    loginMediaTab: 'Truyền thông',
    studentIdField: 'Mã định danh học sinh',
    studentIdHint: 'Nhập mã học sinh (VD: DT001 hoặc 672-001) in trên thẻ HS hoặc do GVCN cấp',
    usernameField: 'Tên đăng nhập / Email',
    passwordField: 'Mật khẩu',
    rememberMeCheckbox: 'Ghi nhớ đăng nhập trên thiết bị này',
    loginButton: 'Đăng nhập vào hệ thống',
    backToPortalBtn: 'Quay lại Trang Chủ Portal',
    clearSavedCreds: 'Xóa thông tin đã lưu',
    parentLoginNotice: 'Quý phụ huynh đăng nhập bằng Mã định danh học sinh (Ví dụ: DT001) và Mật khẩu (Mặc định: 12345678).',
    loginErrorStudentCodeEmpty: 'Vui lòng nhập mã học sinh.',
    loginErrorInvalidStudent: 'Không tìm thấy học sinh với mã này trên hệ thống.',
    loginErrorIncorrectPassword: 'Mật khẩu không chính xác. Mật khẩu mặc định là 12345678.',
    loginErrorCredentialsEmpty: 'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.',
    loginErrorInvalidTeacher: 'Tài khoản hoặc mật khẩu không chính xác.',

    // Change Password Modal
    changePasswordHeader: 'Đổi Mật Khẩu Tài Khoản',
    changePasswordDesc: 'Cập nhật mật khẩu bảo mật mới cho tài khoản',
    currentPassword: 'Mật khẩu hiện tại',
    newPassword: 'Mật khẩu mới',
    confirmNewPassword: 'Xác nhận mật khẩu mới',
    confirmPasswordMismatch: 'Mật khẩu mới không khớp.',
    passwordLengthNotice: 'Mật khẩu mới phải có ít nhất 8 ký tự.',
    oldPasswordMismatch: 'Mật khẩu cũ không chính xác.',
    changePasswordSuccessMsg: 'Đổi mật khẩu thành công!',
    studentPasswordChangedSuccess: 'Đổi mật khẩu tài khoản học sinh thành công!'
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
    studentCodeShort: 'Code',
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
    resetAllSuccess: 'Successfully reset passwords for',

    // Student Profile (ParentView)
    personalInfoTitle: 'Student Profile Information',
    personalInfoSubtitle: 'Parents can verify and update their child\'s information below',
    editInfoBtn: 'Edit Information',
    editInfoTitle: 'Edit Student Information',
    editInfoSubtitle: 'Information will be directly updated in the system',
    personalNotice: 'Parents can review and edit personal info (Full name, DOB, POB, address, phone, Citizen ID). After clicking Save Changes, data is updated directly in the school system.',
    sectionPersonalInfo: 'Personal Information',
    sectionAddressContact: 'Address & Contact',
    sectionAcademicIdentity: 'Academic & Identity',
    fullName: 'Full Name',
    gender: 'Gender',
    male: 'Male',
    female: 'Female',
    dob: 'Date of Birth',
    pob: 'Place of Birth',
    ethnicity: 'Ethnicity',
    nationality: 'Nationality',
    religion: 'Religion',
    currentAddress: 'Current Address',
    parentPhone: 'Parent Phone Number',
    parentName: 'Parent / Guardian Name',
    studentCode: 'Student ID',
    classStt: 'Class Roll No.',
    enrolledClass: 'Enrolled Class',
    citizenId: 'Citizen ID / National ID',
    notUpdated: 'Not updated',
    saveChanges: 'Save Changes',
    cancelChanges: 'Cancel',
    saving: 'Saving...',

    // Attendance (Parent & Teacher)
    totalDays: 'Total Days',
    present: 'Present',
    absent: 'Absent',
    lateOrLeaveEarly: 'Late / Early Dismissal',
    attendanceHistoryTitle: 'Student Attendance History & Records',
    noAttendanceData: 'No attendance records available yet.',
    reason: 'Reason',
    excusedAbsent: 'Excused',
    unexcusedAbsent: 'Unexcused',
    leaveEarly: 'Left Early',
    late: 'Late',
    attendanceTitle: 'Attendance',
    todayLabel: 'Today',
    previousDay: 'Previous Day',
    nextDay: 'Next Day',
    allPresentBtn: 'Mark All Present',
    exportExcelBtn: 'Export Excel',
    unmarked: 'Unmarked',
    searchStudentPlaceholder: 'Search student by name, ID...',
    colStt: 'No.',
    colStudent: 'Student',
    colCode: 'Student ID',
    colStatus: 'Status',
    colReasonNote: 'Reason / Note',
    colActions: 'Actions',
    saveReason: 'Save Reason',
    enrollmentCount: 'Enrollment',
    attendanceRateShort: 'Rate',
    homeroomShort: 'Homeroom',
    subjectTeacherShort: 'Subject Tch',
    dailyAttendanceManage: 'Daily Attendance • Quick tap to record attendance',

    // Timetable & Schedule
    noScheduleTitle: 'No Timetable Available',
    noScheduleSubtitle: 'The school or teacher has not published the timetable for this class yet.',
    periodAndTime: 'PERIOD / TIME',
    morningSession: 'MORNING',
    afternoonSession: 'AFTERNOON',
    lunchBreak: 'LUNCH BREAK',
    morningBreakText: 'Morning recess & break between classes (20 mins)',
    afternoonBreakText: 'Afternoon recess & break between classes (20 mins)',
    period: 'Period',
    dayMon: 'Mon',
    dayTue: 'Tue',
    dayWed: 'Wed',
    dayThu: 'Thu',
    dayFri: 'Fri',
    daySat: 'Sat',
    daySun: 'Sun',

    // Boarding Lunch Menu
    lunchMenuTitle: 'Nutritional Boarding Lunch Menu',
    lunchMenuSubtitle: 'Track daily meals & nutritional menus for students throughout the week',
    weekLabel: 'Week',
    noDishesListed: 'No dishes updated for this day',
    dessert: 'Dessert',

    // Weekly Plan
    weeklyPlanTitle: 'Weekly Academic Plan & Tasks',
    weeklyPlanSubtitle: 'Track assignments, schedule and key focus tasks each week',
    dutyTeamLabel: 'On-Duty Team / In-Charge',
    keyTasksLabel: 'Key Focus Tasks of the Week',
    noTasksListed: 'No focus tasks recorded for this week yet.',
    selectWeek: 'Select Week',
    viewingWeek: 'Viewing',
    weekList: 'School Weeks',
    approvedStatus: 'Approved',
    draftStatus: 'Draft',
    emptyStatus: 'Pending',

    // Parent Lunch Menu
    dailyLunchNutrition: 'Daily nutritional meal plan for boarding students',
    downloadPdf: 'Download (.pdf)',
    selectMenuWeek: 'Select Week',
    approvedOfficial: 'Officially Approved',
    updatingMenu: 'Updating',
    timePeriod: 'Duration',
    from: 'from',
    to: 'to',

    // Schedule badges
    morningBreakLabel: '4 Periods • Recess 9:05 - 9:25',
    afternoonBreakLabel: '4 Periods • Recess 14:48 - 15:08',
    morningRecessText: 'Recess: 9:05 - 9:25 (20 mins)',
    afternoonRecessText: 'Recess: 14:48 - 15:08 (20 mins)',
    regularClassBadge: 'Regular',

    // News & Categories
    catAll: 'All',
    catStem: 'Academics & STEM',
    catSports: 'Sports & Athletics',
    catArts: 'Arts & Cultural',
    catExtracurricular: 'Extracurricular & Tours',
    catEvents: 'Events & Ceremonies',
    newsSectionTitle: 'Duy Tan School News & Activities',
    newsSectionSubtitle: 'Latest updates on academic achievements, extracurriculars, arts and campus life',
    readArticle: 'Read Article',
    viewAlbum: 'View Album',
    share: 'Share',
    like: 'Like',
    liked: 'Liked',
    copiedLink: 'Article link copied to clipboard!',
    articleDetails: 'Article Details',
    postedOn: 'Published on',
    authorBy: 'Author',
    photosCount: 'photos',
    postsCount: 'posts',

    // Login screen
    loginWelcome: 'ELECTRONIC SCHOOL PORTAL',
    loginSubtitle: 'DuyTan Student360 Student Management & Electronic Contact Book',
    loginParentTab: 'Parent',
    loginTeacherTab: 'Teacher',
    loginAdminTab: 'School Board',
    loginStaffTab: 'Staff',
    loginMediaTab: 'Media',
    studentIdField: 'Student Identification ID',
    studentIdHint: 'Enter student code (e.g. DT001 or 672-001) from student ID card or homeroom teacher',
    usernameField: 'Username / Email',
    passwordField: 'Password',
    rememberMeCheckbox: 'Remember sign-in on this device',
    loginButton: 'Sign In to System',
    backToPortalBtn: 'Back to Portal Homepage',
    clearSavedCreds: 'Clear saved credentials',
    parentLoginNotice: 'Parents sign in using Student ID (e.g. DT001) and Password (Default: 12345678).',
    loginErrorStudentCodeEmpty: 'Please enter student ID.',
    loginErrorInvalidStudent: 'Student ID not found in system.',
    loginErrorIncorrectPassword: 'Password is incorrect. Default password is 12345678.',
    loginErrorCredentialsEmpty: 'Please enter both username and password.',
    loginErrorInvalidTeacher: 'Invalid username or password.',

    // Change Password Modal
    changePasswordHeader: 'Change Account Password',
    changePasswordDesc: 'Update a new secure password for your account',
    currentPassword: 'Current Password',
    newPassword: 'New Password',
    confirmNewPassword: 'Confirm New Password',
    confirmPasswordMismatch: 'New passwords do not match.',
    passwordLengthNotice: 'New password must be at least 8 characters long.',
    oldPasswordMismatch: 'Current password is incorrect.',
    changePasswordSuccessMsg: 'Password changed successfully!',
    studentPasswordChangedSuccess: 'Student account password updated successfully!'
  }
};

export function translateCategory(catId: string, isEn: boolean): string {
  if (!isEn) {
    const viMap: Record<string, string> = {
      'all': 'Tất cả',
      'stem': 'Học tập & STEM',
      'sports': 'Thể dục thể thao',
      'arts': 'Văn nghệ & Hội trại',
      'extracurricular': 'Ngoại khóa & Trải nghiệm',
      'events': 'Lễ hội & Sự kiện'
    };
    return viMap[catId] || catId;
  }
  const enMap: Record<string, string> = {
    'all': 'All',
    'stem': 'Academics & STEM',
    'sports': 'Sports & Athletics',
    'arts': 'Arts & Cultural',
    'extracurricular': 'Extracurricular & Tours',
    'events': 'Events & Ceremonies'
  };
  return enMap[catId] || catId;
}

export function translateDish(dish: string, isEn: boolean): string {
  if (!isEn || !dish) return dish;
  const map: Record<string, string> = {
    'Cơm trắng, Thịt kho trứng': 'Steamed rice, Braised pork with eggs',
    'Canh bí đỏ thịt bằm': 'Pumpkin soup with minced pork',
    'Tráng miệng: Dưa hấu': 'Dessert: Watermelon',
    'Bún bò xào': 'Stir-fried beef noodles',
    'Canh cải ngọt tôm': 'Bok choy soup with shrimp',
    'Tráng miệng: Chuối': 'Dessert: Banana',
    'Cơm trắng, Gà ram sả ớt': 'Steamed rice, Lemongrass chili braised chicken',
    'Canh chua cá lóc': 'Sweet and sour snakehead fish soup',
    'Tráng miệng: Thanh long': 'Dessert: Dragon fruit',
    'Phở gà': 'Chicken Pho noodle soup',
    'Tráng miệng: Sữa chua': 'Dessert: Yogurt',
    'Cơm chiên Dương Châu': 'Yangzhou fried rice',
    'Canh súp rau củ': 'Vegetable soup',
    'Tráng miệng: Bánh flan': 'Dessert: Caramel flan',
    'Cơm dinh dưỡng': 'Nutritious lunch portion'
  };
  return map[dish] || dish;
}

export function translateSubject(subject: string, isEn: boolean): string {
  if (!isEn || !subject) return subject;
  const s = subject.trim();
  const map: Record<string, string> = {
    'Toán': 'Mathematics',
    'Toán học': 'Mathematics',
    'Vật lí': 'Physics',
    'Vật lý': 'Physics',
    'Hóa học': 'Chemistry',
    'Hóa': 'Chemistry',
    'Sinh học': 'Biology',
    'Sinh': 'Biology',
    'Tin học': 'Informatics',
    'Tin': 'Informatics',
    'Công nghệ': 'Technology',
    'GD địa phương': 'Local Education',
    'Giáo dục địa phương': 'Local Education',
    'Ngữ Văn': 'Literature',
    'Ngữ văn': 'Literature',
    'Văn': 'Literature',
    'Lịch sử': 'History',
    'Sử': 'History',
    'Địa lý': 'Geography',
    'Địa lí': 'Geography',
    'Địa': 'Geography',
    'GDKT & PL': 'Civic & Legal Edu',
    'GDCD': 'Civic Education',
    'Ngoại ngữ': 'Foreign Language',
    'Tiếng Anh': 'English',
    'Anh': 'English',
    'Tiếng Nhật': 'Japanese',
    'GD thể chất': 'Physical Education',
    'Thể dục': 'Physical Education',
    'GDQP AN': 'Defense & Security',
    'GDQP-AN': 'Defense & Security',
    'GDQP': 'Defense & Security',
    'HĐTN, HN': 'Experiential Activities',
    'HĐTN': 'Experiential Activities',
    'Chào cờ': 'Flag Saluting',
    'SHL': 'Class Meeting',
    'Sinh hoạt lớp': 'Class Meeting',
    'Nghỉ': 'Off',
    'Nghỉ trưa': 'Lunch Break'
  };
  return map[s] || s;
}

export function translateDay(day: string, isEn: boolean): string {
  if (!isEn || !day) return day;
  const map: Record<string, string> = {
    'Thứ 2': 'Monday',
    'Thứ 3': 'Tuesday',
    'Thứ 4': 'Wednesday',
    'Thứ 5': 'Thursday',
    'Thứ 6': 'Friday',
    'Thứ 7': 'Saturday',
    'Chủ nhật': 'Sunday'
  };
  return map[day] || day;
}

export function translateStatus(status: string, isEn: boolean): string {
  if (!isEn || !status) return status;
  const map: Record<string, string> = {
    'present': 'Present',
    'absent': 'Absent',
    'late': 'Late',
    'leave_early': 'Left Early',
    'Có mặt': 'Present',
    'Vắng mặt': 'Absent',
    'Vắng': 'Absent',
    'Đi trễ': 'Late',
    'Về sớm': 'Left Early',
    'Xin về sớm': 'Left Early',
    'Có phép': 'Excused',
    'Không phép': 'Unexcused',
    'Chưa điểm danh': 'Unmarked'
  };
  return map[status] || status;
}

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
