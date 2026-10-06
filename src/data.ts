
export interface AppSettings {
  pageTitle: string;
  pageIcon: string;
  portalBackground: string;
  portalLogo: string;
  loginLogo: string;
  loginBackground: string;
  appName: string;
  disablePortal?: boolean;
  specialSubjects?: string;
}

export const defaultSettings: AppSettings = {
  pageTitle: "Trường Phổ Thông Duy Tân",
  pageIcon: "",
  portalBackground: "",
  portalLogo: "",
  loginLogo: "",
  loginBackground: "",
  appName: "Trường Phổ Thông Duy Tân",
  disablePortal: false,
  specialSubjects: "Math, Tiếng Anh"
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
  // Chế độ BGH: Khóa toàn bộ quyền chỉnh sửa dữ liệu (Chỉ xem full & Xuất dữ liệu)
  lockEdit?: boolean;
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
  // Báo cáo & Thống kê
  reports?: 'view' | 'edit';
  // Quản lý lớp học
  classes?: 'view' | 'edit';
  // Quản lý năm học
  schoolYears?: 'view' | 'edit';
  // Quản lý tài khoản & phân quyền
  accounts?: 'view' | 'edit';
  // Cài đặt hệ thống
  systemConfig?: 'view' | 'edit';
  // Tin tức hoạt động
  news?: 'view' | 'edit';
}

export interface UserAccount {
  isDeleted?: boolean;
  id: string;
  username: string;
  password?: string;
  role: 'admin' | 'teacher' | 'subject_teacher' | 'staff' | 'media';
  teacherType?: 'gvcn' | 'gvbm';
  adminPermissionType?: 'full' | 'readonly'; // 'full': Toàn quyền, 'readonly': Khóa chỉnh sửa (Chỉ xem full & Xuất dữ liệu)
  fullName: string;
  homeroomClasses?: string[];
  subjectClasses?: string[];
  subjects?: string[];
  permissions?: UserPermissions;
}

export interface SchoolActivityNews {
  id: string;
  title: string;
  category: 'stem' | 'sports' | 'arts' | 'extracurricular' | 'events' | string;
  categoryLabel: string;
  imageUrl: string; // Ảnh banner đại diện của bài viết
  galleryImages?: string[]; // Danh sách nhiều hình ảnh trong album bài viết
  content?: string; // Nội dung bài viết chi tiết đầy đủ
  date: string; // YYYY-MM-DD
  author: string;
  description: string; // Lời dẫn / Tóm tắt bài viết (Sa-pô)
  isFeatured?: boolean; // Tiêu biểu
  isRecent?: boolean;   // Ảnh mới đăng
  likesCount?: number;
  likedBy?: string[];
  createdAt?: string;
  isDeleted?: boolean;
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
  avatarUrl?: string;
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
  password?: string;
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
  { id: 'u3', username: 'staff', password: 'staff', role: 'staff', fullName: 'Giáo vụ' },
  { id: 'u4', username: 'truyenthong', password: 'truyenthong', role: 'media', fullName: 'Phòng Truyền Thông' }
];

export const initialSchoolActivities: SchoolActivityNews[] = [
  {
    id: 'act-1',
    title: 'Hội Thi Sáng Tạo Robot & Ngày Hội STEM Duy Tân 2026',
    category: 'stem',
    categoryLabel: 'Học tập & STEM',
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1000&q=80'
    ],
    date: '2026-09-30',
    author: 'Thầy Trần Quốc Toản',
    description: 'Học sinh các khối lớp hào hứng tranh tài lập trình robot và trình diễn các dự án khoa học kỹ thuật sáng tạo ứng dụng thực tế tại khuôn viên trường.',
    content: `Ngày hội STEM & Hội thi Sáng tạo Robot 2026 của Trường Phổ Thông Duy Tân đã diễn ra thành công rực rỡ với sự tham gia của hơn 40 đội thi đến từ các khối lớp THCS và THPT.

Tại ngày hội, các em học sinh đã tự tay lắp ráp và lập trình các mô hình robot thông minh thực hiện nhiệm vụ dò đường, phân loại rác tự động, xe tự hành tránh vật cản và cánh tay robot ứng dụng trong dây chuyền sản xuất nông nghiệp công nghệ cao.

Ban Giám khảo đánh giá cao tư duy logic, sự am hiểu về vi điều khiển Arduino, cảm biến siêu âm cũng như kỹ năng làm việc nhóm nhuần nhuyễn của các đội. Không chỉ dừng lại ở thi đấu, ngày hội còn mở ra không gian trải nghiệm thực tế ảo VR, kính thiên văn ngắm mặt trời và các thí nghiệm hóa học vui thu hút đông đảo phụ huynh và học sinh tham quan.

Kết quả chung cuộc, giải Nhất khối THPT thuộc về đội "Duy Tân CyberBot 10QT3A" với dự án Robot cứu hộ khẩn cấp; giải Nhất khối THCS thuộc về đội "STEM Star 9A" với mô hình nhà kính thông minh giám sát độ ẩm qua IoT.`,
    isFeatured: true,
    isRecent: true,
    likesCount: 24,
    createdAt: '2026-09-30T08:00:00.000Z'
  },
  {
    id: 'act-2',
    title: 'Giải Bóng Đá Nam Nữ Thiếu Niên Duy Tân Cup 2026',
    category: 'sports',
    categoryLabel: 'Thể dục thể thao',
    imageUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?auto=format&fit=crop&w=1000&q=80'
    ],
    date: '2026-09-28',
    author: 'Thầy Hoàng Nam',
    description: 'Những pha bóng đẹp mắt, tinh thần fair-play và sự cổ vũ cuồng nhiệt từ các cổ động viên đã tạo nên bầu không khí thể thao sôi động.',
    content: `Sau 2 tuần tranh tài sôi nổi với 24 trận cầu kịch tính, Giải bóng đá Nam Nữ Thiếu Niên Duy Tân Cup 2026 đã khép lại bằng trận chung kết nảy lửa trên sân vận động trung tâm của trường.

Khán đài luôn chật kín các cổ động viên với cờ hoa, trống hội và những tiếng reo hò không ngớt tiếp lửa cho các cầu thủ nhí. Các đội bóng đã cống hiến cho khán giả những pha ban bật nhịp nhàng, những cú sút xa uy lực và tinh thần thi đấu kiên cường, fair-play đúng chất thể thao học đường.

Đặc biệt, giải bóng đá nữ năm nay ghi nhận bước tiến vượt bậc về chiến thuật và sự dẻo dai của các nữ cầu thủ, mang đến nhiều khoảnh khắc xúc động và bất ngờ cho ban huấn luyện.

Ban Tổ chức đã trao cúp vô địch cho đội tuyển liên quân khối 11, giải Nhì cho khối 10 và giải Cầu thủ xuất sắc nhất thuộc về em Nguyễn Hữu Thắng (lớp 11A1) với 8 bàn thắng được ghi trong suốt giải đấu.`,
    isFeatured: true,
    isRecent: true,
    likesCount: 18,
    createdAt: '2026-09-28T15:30:00.000Z'
  },
  {
    id: 'act-3',
    title: 'Đêm Nhạc Hội & Lửa Trại Chào Đón Khóa Mới',
    category: 'arts',
    categoryLabel: 'Văn nghệ & Hội trại',
    imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=1000&q=80'
    ],
    date: '2026-09-25',
    author: 'Cô Lan Anh',
    description: 'Đêm hội ngập tràn thanh âm và ánh sáng với các tiết mục nhảy hiện đại, acoustic và thắp sáng ngọn lửa nhiệt huyết tuổi trẻ Duy Tân.',
    content: `Trong không khí rạo rực của mùa thu, Đêm hội văn nghệ và Lửa trại truyền thống chào đón tân học sinh đã để lại những kỷ niệm khó phai trong lòng toàn thể thầy cô và học sinh Trường Phổ Thông Duy Tân.

Sân khấu ngoài trời bùng nổ với các màn trình diễn ca múa nhạc đa màu sắc: từ những làn điệu dân ca quê hương được phối lại theo phong cách hiện đại, đến những vũ điệu flashmob sôi động và ban nhạc acoustic học sinh với những giai điệu mộc mạc về tuổi học trò.

Khoảnh khắc thiêng liêng nhất là khi ngọn đuốc truyền thống được Ban Giám Hiệu thắp lên giữa đống lửa trại, ngọn lửa tượng trưng cho tri thức, lòng nhiệt huyết và tinh thần đoàn kết của đại gia đình Duy Tân. Thầy cô và học sinh cùng nắm chặt tay nhau nối thành vòng tròn lớn, cùng cất cao bài ca truyền thống của mái trường.`,
    isFeatured: true,
    isRecent: false,
    likesCount: 42,
    createdAt: '2026-09-25T19:00:00.000Z'
  },
  {
    id: 'act-4',
    title: 'Hành Trình Về Nguồn & Trải Nghiệm Sinh Thái Rừng Vàng Biển Bạc',
    category: 'extracurricular',
    categoryLabel: 'Ngoại khóa & Trải nghiệm',
    imageUrl: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=1200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1000&q=80'
    ],
    date: '2026-09-22',
    author: 'Phòng Truyền Thông',
    description: 'Chuyến tham quan thực tế rèn luyện kỹ năng sinh tồn, nâng cao ý thức bảo vệ môi trường và gắn kết tình bạn giữa các thành viên trong lớp.',
    content: `Hơn 300 học sinh các khối lớp đã có một chuyến đi thực tế bổ ích tại Khu bảo tồn sinh thái và di tích lịch sử địa phương.

Chuyến hành trình không chỉ giúp các em trau dồi kiến thức môn Lịch sử và Địa lý thông qua việc dâng hương tưởng niệm các anh hùng liệt sĩ, mà còn mang đến trải nghiệm học tập môn Sinh học ngoài trời vô cùng thú vị. Dưới sự hướng dẫn của các nhà nghiên cứu, học sinh đã quan sát thảm thực vật bản địa, đo đạc chỉ số môi trường nước và thu thập mẫu lá cây cho bài tập nghiên cứu khoa học.

Các hoạt động kỹ năng sinh tồn như dựng lều trại, sơ cấp cứu dã ngoại và nấu ăn tập thể đã giúp học sinh thêm tự lập, gắn kết tình bạn và thấu hiểu hơn về tinh thần tương thân tương ái.`,
    isFeatured: false,
    isRecent: true,
    likesCount: 15,
    createdAt: '2026-09-22T07:30:00.000Z'
  },
  {
    id: 'act-5',
    title: 'Lễ Khai Giảng Năm Học Mới Rực Rỡ Sắc Cờ Hoa',
    category: 'events',
    categoryLabel: 'Lễ hội & Sự kiện',
    imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1000&q=80'
    ],
    date: '2026-09-05',
    author: 'Ban Giám Hiệu',
    description: 'Tiếng trống khai trường rộn rã chính thức mở ra một năm học mới đầy hứng khởi, quyết tâm gặt hái nhiều thành tích xuất sắc.',
    content: `Sáng ngày 05/09, trong sắc cờ hoa rực rỡ và ánh nắng mùa thu, toàn thể cán bộ, giáo viên, nhân viên cùng hơn 1.200 học sinh Trường Phổ Thông Duy Tân đã long trọng tổ chức Lễ Khai giảng năm học mới.

Buổi lễ diễn ra trang trọng với nghi thức đón học sinh đầu cấp, lễ chào cờ thiêng liêng và thư chúc mừng năm học mới của Chủ tịch nước. Thầy Hiệu trưởng nhà trường đã phát biểu khai giảng, nhấn mạnh phương châm giáo dục toàn diện: "Tri thức vững vàng - Kỹ năng hội nhập - Đạo đức sáng trong".

Tiếng trống khai trường giòn giã vang lên báo hiệu một chặng đường học tập và rèn luyện mới bắt đầu. Đại diện hội cha mẹ học sinh và các tổ chức đối tác cũng đã trao tặng nhiều suất học bổng khuyến học cho các học sinh vượt khó vươn lên đạt thành tích học tập xuất sắc.`,
    isFeatured: true,
    isRecent: false,
    likesCount: 68,
    createdAt: '2026-09-05T08:00:00.000Z'
  }
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

export const getSubjectName = (key: keyof Grades, isEn: boolean = false) => {
  if (isEn) {
    const enNames: Record<keyof Grades, string> = {
      math: 'Mathematics',
      physics: 'Physics',
      chemistry: 'Chemistry',
      biology: 'Biology',
      it: 'Informatics',
      technology: 'Technology',
      localEdu: 'Local Education',
      literature: 'Literature',
      history: 'History',
      geography: 'Geography',
      civicEdu: 'Civic & Legal Edu',
      foreignLanguage: 'Foreign Language',
      pe: 'Physical Education',
      defense: 'Defense & Security',
      japanese: 'Japanese',
      experiential: 'Experiential Activities'
    };
    return enNames[key] || key;
  }
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
  return names[key] || key;
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
