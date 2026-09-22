
export interface AppSettings {
  pageTitle: string;
  pageIcon: string;
  portalBackground: string;
  portalLogo: string;
  loginLogo: string;
  loginBackground: string;
  appName: string;
  disablePortal?: boolean;
}

export const defaultSettings: AppSettings = {
  pageTitle: "Trường Phổ Thông Duy Tân",
  pageIcon: "",
  portalBackground: "",
  portalLogo: "",
  loginLogo: "",
  loginBackground: "",
  appName: "Trường Phổ Thông Duy Tân",
  disablePortal: false
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

export interface UserPermissions {
  // Lịch học & Thời khóa biểu
  schedule?: 'view' | 'edit';
  // Danh sách học sinh & Hồ sơ lớp
  students?: 'view' | 'edit';
  // Sổ điểm & Đánh giá
  grades?: 'view' | 'edit';
  // Kế hoạch tuần & Phê duyệt kế hoạch
  weeklyPlan?: 'view' | 'edit';
  // Thực đơn bán trú & Phê duyệt thực đơn
  lunchMenu?: 'view' | 'edit';
  // Điểm danh chuyên cần
  attendance?: 'view' | 'edit';
}

export interface UserAccount {
  isDeleted?: boolean;
  id: string;
  username: string;
  password?: string;
  role: 'admin' | 'teacher' | 'subject_teacher' | 'staff';
  teacherType?: 'gvcn' | 'gvbm';
  fullName: string;
  homeroomClasses?: string[];
  subjectClasses?: string[];
  subjects?: string[];
  permissions?: UserPermissions;
}

/**
 * Safely resolves teacher sub-role (GVCN vs GVBM).
 * Preserves 100% backward compatibility for existing users in Firestore.
 */
export function getUserTeacherType(u?: UserAccount | null): 'gvcn' | 'gvbm' {
  if (!u) return 'gvcn';
  if (u.teacherType === 'gvbm' || u.teacherType === 'gvcn') {
    return u.teacherType;
  }
  if (u.role === 'subject_teacher') return 'gvbm';
  // Existing data heuristic: if teacher has no homeroom classes but has subject classes, they are GVBM
  if ((!u.homeroomClasses || u.homeroomClasses.length === 0) && (u.subjectClasses && u.subjectClasses.length > 0)) {
    return 'gvbm';
  }
  // Otherwise, existing teacher data defaults to GVCN (preserving existing data)
  return 'gvcn';
}



export interface SchoolYear {
  id: string;
  name: string; // e.g., 2024-2025
  isDeleted?: boolean;
}

export const initialSchoolYears: SchoolYear[] = [
  { id: '20242025', name: '2024-2025' }
];

export interface SchoolClass {
  isDeleted?: boolean;
  id: string;
  name: string;
  homeroomTeacher: string;
  schoolYearId?: string;
  specialization?: 'Tự Nhiên' | 'Xã Hội' | 'Cơ Bản' | string;
  room?: string;
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
  nationality?: string;
  religion?: string;
  currentAddress?: string;
  phone?: string;
  citizenId?: string;
  isDeleted?: boolean;
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
  { id: 'u2', username: 'teacher', password: 'teacher', role: 'teacher', fullName: 'Giáo viên' },
  { id: 'u3', username: 'staff', password: 'staff', role: 'staff', fullName: 'Giáo vụ' }
];

export const initialClasses: SchoolClass[] = [
  { id: 'c1', name: '10QT3A', homeroomTeacher: 'Cô Lan', specialization: 'Tự Nhiên' },
  { id: 'c2', name: '10QT3B', homeroomTeacher: 'Thầy Hùng', specialization: 'Xã Hội' },
];

// Initial mock data based on user specifications and Hình 2.jpg
export const initialStudents: Student[] = [
  {
    id: 's-6694138270',
    code: '6694138270',
    classId: 'c1',
    stt: 1,
    fullName: 'Trần Ngọc Thi Ân',
    dob: '20/04/2015',
    gender: 'Nữ',
    ethnicity: 'Kinh',
    nationality: 'Việt Nam',
    religion: 'Không',
    pob: 'Tỉnh Đắk Lắk',
    currentAddress: 'Khu phố Phú An, Phường Tuy Hòa, Tỉnh Phú Yên',
    phone: '0903169946',
    citizenId: '054315005221',
    grades: {
      math: 8.5, physics: 9.0, chemistry: 8.0, biology: 8.5, it: 9.5, technology: 8.5, geography: 8.0, civicEdu: 9.0, localEdu: 'Đ', literature: 8.0, history: 8.5, foreignLanguage: 9.0, pe: 'Đ', defense: 9.5, japanese: 9.0, experiential: 'Đ'
    },
    academicPerformance: 'T',
    conduct: 'T',
    cp: 0, kp: 0, award: 'HSG', status: 'Đang học',
    comments: [], notifications: []
  },
  {
    id: 's-5441588055',
    code: '5441588055',
    classId: 'c1',
    stt: 2,
    fullName: 'Nguyễn Hoàng Bách',
    dob: '04/11/2015',
    gender: 'Nam',
    ethnicity: 'Kinh',
    nationality: 'Việt Nam',
    religion: 'Không',
    pob: 'Thành phố Hồ Chí Minh',
    currentAddress: 'Đường D1, khu phố Chu Văn An, phường Tuy Hòa',
    phone: '0985768910',
    citizenId: '054215004807',
    grades: {
      math: 9.0, physics: 9.0, chemistry: 8.5, biology: 8.5, it: 9.9, technology: 9.0, geography: 9.0, civicEdu: 9.0, localEdu: 'Đ', literature: 8.5, history: 9.0, foreignLanguage: 9.0, pe: 'Đ', defense: 9.5, japanese: 9.0, experiential: 'Đ'
    },
    academicPerformance: 'T',
    conduct: 'T',
    cp: 0, kp: 0, award: 'HSXS', status: 'Đang học',
    comments: [], notifications: []
  },
  {
    id: 's-5453341085',
    code: '5453341085',
    classId: 'c1',
    stt: 3,
    fullName: 'Nguyễn Sao Băng',
    dob: '28/04/2015',
    gender: 'Nữ',
    ethnicity: 'Kinh',
    nationality: 'Việt Nam',
    religion: 'Không',
    pob: 'Tỉnh Đắk Lắk',
    currentAddress: 'Khu phố Phú Đông 3, Phường Tuy Hòa, tỉnh Phú Yên',
    phone: '0976563868',
    citizenId: '054315006108',
    grades: {
      math: 8.0, physics: 8.5, chemistry: 8.0, biology: 8.5, it: 9.0, technology: 8.5, geography: 8.5, civicEdu: 9.0, localEdu: 'Đ', literature: 8.0, history: 8.5, foreignLanguage: 8.5, pe: 'Đ', defense: 9.0, japanese: 8.5, experiential: 'Đ'
    },
    academicPerformance: 'T',
    conduct: 'T',
    cp: 0, kp: 0, award: 'HSG', status: 'Đang học',
    comments: [], notifications: []
  },
  {
    id: 's1', code: 'HS-001',
    classId: 'c1',
    stt: 4,
    fullName: 'Trần Phạm Băng Băng',
    dob: '12/03/2015',
    gender: 'Nữ',
    ethnicity: 'Kinh',
    nationality: 'Việt Nam',
    religion: 'Không',
    pob: 'Phú Yên',
    currentAddress: 'Phường 7, TP. Tuy Hòa, Phú Yên',
    phone: '0912345678',
    citizenId: '054315009871',
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
    stt: 5,
    fullName: 'Phạm Ngọc Bội Bội',
    dob: '19/08/2015',
    gender: 'Nữ',
    ethnicity: 'Kinh',
    nationality: 'Việt Nam',
    religion: 'Không',
    pob: 'Phú Yên',
    currentAddress: 'Phường 5, TP. Tuy Hòa, Phú Yên',
    phone: '0923456789',
    citizenId: '054315009872',
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
    stt: 6,
    fullName: 'Nguyễn Ngọc Yến Chi',
    dob: '05/06/2015',
    gender: 'Nữ',
    ethnicity: 'Kinh',
    nationality: 'Việt Nam',
    religion: 'Không',
    pob: 'Phú Yên',
    currentAddress: 'Phường 9, TP. Tuy Hòa, Phú Yên',
    phone: '0934567890',
    citizenId: '054315009873',
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
    dob: '22/01/2015',
    gender: 'Nam',
    ethnicity: 'Kinh',
    nationality: 'Việt Nam',
    religion: 'Không',
    pob: 'Hà Nội',
    currentAddress: 'Phường 4, TP. Tuy Hòa, Phú Yên',
    phone: '0945678901',
    citizenId: '054215009874',
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
    dob: '15/10/2015',
    gender: 'Nam',
    ethnicity: 'Kinh',
    nationality: 'Việt Nam',
    religion: 'Không',
    pob: 'Phú Yên',
    currentAddress: 'Phường 2, TP. Tuy Hòa, Phú Yên',
    phone: '0956789012',
    citizenId: '054215009875',
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

export const sortClasses = <T extends { name: string }>(classes: T[]): T[] => {
  return [...classes].sort((a, b) => {
    const parse = (name: string) => {
      const match = (name || '').match(/^(\d+)(.*)$/);
      if (match) {
        return { num: parseInt(match[1], 10), str: match[2] };
      }
      return { num: 0, str: name || '' };
    };
    const pA = parse(a.name);
    const pB = parse(b.name);
    if (pA.num !== pB.num) return pA.num - pB.num;
    return pA.str.localeCompare(pB.str, 'vi', { numeric: true });
  });
};
