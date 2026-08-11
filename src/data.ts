
export interface AppSettings {
  pageTitle: string;
  pageIcon: string;
  portalBackground: string;
  portalLogo: string;
  loginLogo: string;
  loginBackground: string;
  appName: string;
}

export const defaultSettings: AppSettings = {
  pageTitle: "EduManage Pro",
  pageIcon: "",
  portalBackground: "",
  portalLogo: "",
  loginLogo: "",
  loginBackground: "",
  appName: "EduManage Pro"
};

export interface GamificationData {
  study: string;
  achievement: string;
  reward: string;
  comment: string;
  goldCards: number;
  silverCards: number;
  bronzeCards: number;
  penaltyLevel: 0 | 1 | 2 | 3; // 0: None, 1: Yellow (Nhắc nhở), 2: Orange (Cảnh cáo), 3: Red (Vi phạm nặng)
}

export interface WeeklyData extends GamificationData {}
export interface MonthlyData extends GamificationData {}

export interface Grades {
  math: number | string;
  physics: number | string;
  chemistry: number | string;
  biology: number | string;
  it: number | string;
  technology: number | string;
  localEdu: string;
  literature: number | string;
  history: number | string;
  geography: number | string;
  civicEdu: number | string;
  foreignLanguage: number | string;
  pe: string;
  defense: number | string;
  japanese: number | string;
  experiential: string;
}

export interface Comment {
  id: string;
  teacherId: string;
  text: string;
  date: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  isRead: boolean;
}

export interface UserAccount {
  id: string;
  username: string;
  password?: string;
  role: 'admin' | 'teacher';
  fullName: string;
  homeroomClasses?: string[];
  subjectClasses?: string[];
  subjects?: string[];
}


export interface SchoolYear {
  id: string;
  name: string; // e.g., 2024-2025
}

export const initialSchoolYears: SchoolYear[] = [
  { id: '20242025', name: '2024-2025' }
];

export interface SchoolClass {
  id: string;
  name: string;
  homeroomTeacher: string;
  schoolYearId?: string;
  specialization?: 'Tự Nhiên' | 'Xã Hội' | 'Cơ Bản' | string;
}

export interface SubjectDetail {
  tx: (number | string)[]; // Thường xuyên (usually 1-4)
  gk: number | string; // Giữa kỳ
  ck: number | string; // Cuối kỳ
  tb: number | string; // Trung bình computed or overridden
}

export type DetailedGrades = Partial<Record<keyof Grades, SubjectDetail>>;

export interface Student {
  id: string;
  code: string;
  classId: string;
  stt: number;
  fullName: string;
  gender: 'Nam' | 'Nữ';
  ethnicity: string;
  dob?: string;
  pob?: string;
  grades: Grades;
  term1Grades?: Grades;
  term2Grades?: Grades;
  yearGrades?: Grades;
  term1Details?: DetailedGrades;
  term2Details?: DetailedGrades;
  term1IsExcellent?: boolean;
  term2IsExcellent?: boolean;
  yearIsExcellent?: boolean;
  term1RankOverride?: string;
  term2RankOverride?: string;
  yearRankOverride?: string;
  academicPerformance: 'Tốt' | 'Khá' | 'Đạt' | 'Chưa đạt' | string;
  conduct: 'Tốt' | 'Khá' | 'Đạt' | 'Chưa đạt' | string;
  cp: number;
  kp: number;
  award: 'HSG' | 'HSXS' | '' | string;
  status: string;
  parentName?: string;
  parentPhone?: string;
  attendanceRecords?: Record<string, { status: 'present' | 'late' | 'absent' | 'leave_early', reason?: string, time: string }>;
  weeklyData?: Record<number, WeeklyData>;
  monthlyData?: Record<number, MonthlyData>;
  comments: Comment[];
  notifications: Notification[];
  historicalRecords?: { schoolYearId?: string, classId: string, className?: string, grades: Grades, term1Grades?: Grades, term2Grades?: Grades, yearGrades?: Grades, academicPerformance?: string, conduct?: string }[];
}

export const initialUsers: UserAccount[] = [
  { id: 'u1', username: 'admin', password: 'admin', role: 'admin', fullName: 'Ban Giám Hiệu' },
  { id: 'u2', username: 'teacher', password: 'teacher', role: 'teacher', fullName: 'Giáo viên' }
];

export const initialClasses: SchoolClass[] = [
  { id: 'c1', name: '10QT3A', homeroomTeacher: 'Cô Lan', specialization: 'Tự Nhiên' },
  { id: 'c2', name: '10QT3B', homeroomTeacher: 'Thầy Hùng', specialization: 'Xã Hội' },
];

// Initial mock data based on the provided CSV
export const initialStudents: Student[] = [
  {
    id: 's1', code: 'HS-001',
    classId: 'c1',
    stt: 1,
    fullName: 'Trần Phạm Băng Băng',
    gender: 'Nữ',
    ethnicity: 'Kinh',
    grades: {
      math: 7, physics: 9, chemistry: 7.6, biology: 8.2, it: 9.9, technology: 8, geography: 8, civicEdu: 9, localEdu: 'Đ', literature: 7.1, history: 9.1, foreignLanguage: 8.1, pe: 'Đ', defense: 9.5, japanese: 9.1, experiential: 'Đ'
    },
    academicPerformance: 'T',
    conduct: 'T',
    cp: 6, kp: 0, award: 'HSG', status: 'Lên lớp',
    comments: [], notifications: []
  },
  {
    id: 's2', code: 'HS-002',
    classId: 'c1',
    stt: 2,
    fullName: 'Phạm Ngọc Bội Bội',
    gender: 'Nữ',
    ethnicity: 'Kinh',
    grades: {
      math: 9, physics: 9, chemistry: 8.9, biology: 8.4, it: 9.9, technology: 9, geography: 9, civicEdu: 9, localEdu: 'Đ', literature: 7.3, history: 9.2, foreignLanguage: 8.7, pe: 'Đ', defense: 9.7, japanese: 9.4, experiential: 'Đ'
    },
    academicPerformance: 'T',
    conduct: 'T',
    cp: 3, kp: 0, award: 'HSG', status: 'Lên lớp',
    comments: [], notifications: []
  },
  {
    id: 's3', code: 'HS-003',
    classId: 'c1',
    stt: 3,
    fullName: 'Nguyễn Ngọc Yến Chi',
    gender: 'Nữ',
    ethnicity: 'Kinh',
    grades: {
      math: 9.2, physics: 9.3, chemistry: 9.5, biology: 8.1, it: 9.9, technology: 9, geography: 9, civicEdu: 9, localEdu: 'Đ', literature: 7.1, history: 9, foreignLanguage: 9.7, pe: 'Đ', defense: 9.5, japanese: 9.4, experiential: 'Đ'
    },
    academicPerformance: 'T',
    conduct: 'T',
    cp: 8, kp: 0, award: 'HSXS', status: 'Lên lớp',
    comments: [{ id: 'c1', teacherId: 't1', text: 'Em học rất tốt, cần phát huy hơn nữa ở môn Văn.', date: new Date().toISOString() }],
    notifications: [{ id: 'n1', title: 'Thông báo kết quả học tập', message: 'Yến Chi đã đạt danh hiệu Học sinh Xuất sắc. Chúc mừng gia đình!', date: new Date().toISOString(), isRead: false }]
  },
  {
    id: 's4', code: 'HS-004',
    classId: 'c2',
    stt: 1,
    fullName: 'Ngô Mạnh Dũng',
    gender: 'Nam',
    ethnicity: 'Kinh',
    grades: {
      math: 9.3, physics: 9.6, chemistry: 9.4, biology: 9, it: 9.9, technology: 9.5, geography: 9, civicEdu: 9.2, localEdu: 'Đ', literature: 7.1, history: 9.4, foreignLanguage: 9.5, pe: 'Đ', defense: 9.5, japanese: 9.1, experiential: 'Đ'
    },
    academicPerformance: 'T',
    conduct: 'T',
    cp: 0, kp: 0, award: 'HSXS', status: 'Lên lớp',
    comments: [], notifications: []
  },
  {
    id: 's5', code: 'HS-005',
    classId: 'c2',
    stt: 2,
    fullName: 'Võ Huỳnh Duy Đôn',
    gender: 'Nam',
    ethnicity: 'Kinh',
    grades: {
      math: 7.3, physics: 8, chemistry: 7.6, biology: 7.5, it: 9, technology: 8, geography: 8.5, civicEdu: 8, localEdu: 'Đ', literature: 5.5, history: 9, foreignLanguage: 6.5, pe: 'Đ', defense: 9.4, japanese: 8.3, experiential: 'Đ'
    },
    academicPerformance: 'K',
    conduct: 'T',
    cp: 1, kp: 0, award: '', status: 'Lên lớp',
    comments: [], notifications: []
  },
  {
    id: 's10', code: 'HS-010',
    classId: 'c2',
    stt: 3,
    fullName: 'Vũ Quốc Huy',
    gender: 'Nam',
    ethnicity: 'Kinh',
    grades: {
      math: 9.6, physics: 9.7, chemistry: 9.3, biology: 8, it: 9.9, technology: 9.2, geography: 9.1, civicEdu: 9.5, localEdu: 'Đ', literature: 6.7, history: 9.1, foreignLanguage: 7.7, pe: 'Đ', defense: 9.7, japanese: 9, experiential: 'Đ'
    },
    academicPerformance: 'T',
    conduct: 'T',
    cp: 0, kp: 0, award: 'HSXS', status: 'Lên lớp',
    comments: [], notifications: []
  }
];

export const getWeeksForMonth = (month: number): number[] => {
  switch (month) {
    case 9: return [1, 2, 3, 4];
    case 10: return [5, 6, 7, 8];
    case 11: return [9, 10, 11, 12];
    case 12: return [13, 14, 15, 16];
    case 1: return [17, 18, 19, 20];
    case 2: return [21, 22, 23, 24];
    case 3: return [25, 26, 27, 28];
    case 4: return [29, 30, 31, 32];
    case 5: return [33, 34, 35];
    default: return [];
  }
};

export const computeMonthlyGamificationData = (student: Student, month: number): MonthlyData => {
  const weeks = getWeeksForMonth(month);
  const monthlyData: MonthlyData = {
    study: '',
    achievement: '',
    reward: '',
    comment: '',
    goldCards: 0,
    silverCards: 0,
    bronzeCards: 0,
    penaltyLevel: 0,
  };
  
  const studyArr: string[] = [];
  const achievementArr: string[] = [];
  const rewardArr: string[] = [];
  const commentArr: string[] = [];

  weeks.forEach(w => {
    const wd = student.weeklyData?.[w];
    if (wd) {
      if (wd.study) studyArr.push(`Tuần ${w}: ${wd.study}`);
      if (wd.achievement) achievementArr.push(`Tuần ${w}: ${wd.achievement}`);
      if (wd.reward) rewardArr.push(`Tuần ${w}: ${wd.reward}`);
      if (wd.comment) commentArr.push(`Tuần ${w}: ${wd.comment}`);
      
      monthlyData.goldCards += wd.goldCards || 0;
      monthlyData.silverCards += wd.silverCards || 0;
      monthlyData.bronzeCards += wd.bronzeCards || 0;
      if ((wd.penaltyLevel || 0) > monthlyData.penaltyLevel) {
        monthlyData.penaltyLevel = wd.penaltyLevel;
      }
    }
  });

  monthlyData.study = studyArr.join('\n');
  monthlyData.achievement = achievementArr.join('\n');
  monthlyData.reward = rewardArr.join('\n');
  monthlyData.comment = commentArr.join('\n');

  return monthlyData;
};

export const getSubjectName = (key: keyof Grades) => {
  const names: Record<keyof Grades, string> = {
    math: 'Toán',
    physics: 'Vật lí',
    chemistry: 'Hóa học',
    biology: 'Sinh học',
    it: 'Tin học',
    technology: 'Công nghệ',
    localEdu: 'GD địa phương',
    literature: 'Ngữ Văn',
    history: 'Lịch sử',
    geography: 'Địa lý',
    civicEdu: 'GDKT & PL',
    foreignLanguage: 'Ngoại ngữ',
    pe: 'GD thể chất',
    defense: 'GDQP AN',
    japanese: 'Tiếng Nhật',
    experiential: 'HĐTN, HN'
  };
  return names[key];
};


export interface SchedulePeriod {
  time: string;
  t2: string;
  t3: string;
  t4: string;
  t5: string;
  t6: string;
  t7: string;
}

export interface ClassSchedule {
  classId: string;
  periods: SchedulePeriod[];
  updatedAt: number;
}
