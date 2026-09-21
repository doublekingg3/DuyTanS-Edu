import { SchedulePeriod } from '../data';

export interface StandardPeriod {
  id: string;
  session: 'morning' | 'afternoon';
  periodNumber?: number;
  isBreak?: boolean;
  name: string;
  timeRange: string;
  fullTimeLabel: string;
}

export const STANDARD_SCHEDULE_PERIODS: StandardPeriod[] = [
  // Sáng
  {
    id: 'morning_1',
    session: 'morning',
    periodNumber: 1,
    name: 'Tiết 1',
    timeRange: '7:30 - 8:15',
    fullTimeLabel: 'Sáng - Tiết 1 (7:30 - 8:15)',
  },
  {
    id: 'morning_2',
    session: 'morning',
    periodNumber: 2,
    name: 'Tiết 2',
    timeRange: '8:20 - 9:05',
    fullTimeLabel: 'Sáng - Tiết 2 (8:20 - 9:05)',
  },
  {
    id: 'morning_break',
    session: 'morning',
    isBreak: true,
    name: 'Ra chơi (Break Time)',
    timeRange: '9:05 - 9:25',
    fullTimeLabel: 'Sáng - Ra chơi (9:05 - 9:25)',
  },
  {
    id: 'morning_3',
    session: 'morning',
    periodNumber: 3,
    name: 'Tiết 3',
    timeRange: '9:25 - 10:10',
    fullTimeLabel: 'Sáng - Tiết 3 (9:25 - 10:10)',
  },
  {
    id: 'morning_4',
    session: 'morning',
    periodNumber: 4,
    name: 'Tiết 4',
    timeRange: '10:15 - 11:00',
    fullTimeLabel: 'Sáng - Tiết 4 (10:15 - 11:00)',
  },

  // Chiều
  {
    id: 'afternoon_1',
    session: 'afternoon',
    periodNumber: 1,
    name: 'Tiết 1',
    timeRange: '13:15 - 14:00',
    fullTimeLabel: 'Chiều - Tiết 1 (13:15 - 14:00)',
  },
  {
    id: 'afternoon_2',
    session: 'afternoon',
    periodNumber: 2,
    name: 'Tiết 2',
    timeRange: '14:03 - 14:48',
    fullTimeLabel: 'Chiều - Tiết 2 (14:03 - 14:48)',
  },
  {
    id: 'afternoon_break',
    session: 'afternoon',
    isBreak: true,
    name: 'Ra chơi (Break Time)',
    timeRange: '14:48 - 15:08',
    fullTimeLabel: 'Chiều - Ra chơi (14:48 - 15:08)',
  },
  {
    id: 'afternoon_3',
    session: 'afternoon',
    periodNumber: 3,
    name: 'Tiết 3',
    timeRange: '15:08 - 15:53',
    fullTimeLabel: 'Chiều - Tiết 3 (15:08 - 15:53)',
  },
  {
    id: 'afternoon_4',
    session: 'afternoon',
    periodNumber: 4,
    name: 'Tiết 4',
    timeRange: '15:55 - 16:40',
    fullTimeLabel: 'Chiều - Tiết 4 (15:55 - 16:40)',
  },
];

/**
 * Normalizes any raw time string from imported files or Firestore
 * to the exact time specified by the user.
 */
export function normalizePeriodTime(rawTime: string, fallbackIdx?: number, totalCount?: number): {
  id: string;
  session: 'morning' | 'afternoon';
  isBreak: boolean;
  name: string;
  timeRange: string;
  fullTimeLabel: string;
} {
  const trimmed = (rawTime || '').trim();
  const lower = trimmed.toLowerCase();

  // 1. If part of a standard 10-period schedule (5 morning + 5 afternoon) and index is provided
  if (totalCount === 10 && fallbackIdx !== undefined && fallbackIdx >= 0 && fallbackIdx < STANDARD_SCHEDULE_PERIODS.length) {
    const std = STANDARD_SCHEDULE_PERIODS[fallbackIdx];
    return {
      id: std.id,
      session: std.session,
      isBreak: !!std.isBreak,
      name: std.name,
      timeRange: std.timeRange,
      fullTimeLabel: std.fullTimeLabel,
    };
  }

  // 2. Direct match against STANDARD_SCHEDULE_PERIODS by fullTimeLabel, id, or exact name
  const directMatch = STANDARD_SCHEDULE_PERIODS.find(
    p => p.id === trimmed ||
         p.fullTimeLabel.toLowerCase() === lower ||
         `${p.name} (${p.timeRange})`.toLowerCase() === lower ||
         p.timeRange.toLowerCase() === lower
  );
  if (directMatch) {
    return {
      id: directMatch.id,
      session: directMatch.session,
      isBreak: !!directMatch.isBreak,
      name: directMatch.name,
      timeRange: directMatch.timeRange,
      fullTimeLabel: directMatch.fullTimeLabel,
    };
  }

  // 3. Check for break time
  const isBreak = /ra\s*chơi|rachoi|break|giải\s*lao/i.test(lower);

  // 4. Session detection (Morning vs Afternoon)
  const isExplicitMorning = /sáng|sang|am|ca sáng|buổi sáng/i.test(lower);
  const isExplicitAfternoon = /chiều|chieu|pm|ca chiều|buổi chiều/i.test(lower) || 
    /\b(13|14|15|16)[:h]\d{2}\b/.test(lower);

  let session: 'morning' | 'afternoon' = 'morning';
  if (isExplicitAfternoon) {
    session = 'afternoon';
  } else if (isExplicitMorning) {
    session = 'morning';
  } else if (fallbackIdx !== undefined && fallbackIdx >= 5 && fallbackIdx < 10) {
    session = 'afternoon';
  }

  // Handle break
  if (isBreak) {
    if (session === 'morning') {
      return {
        id: 'morning_break',
        session: 'morning',
        isBreak: true,
        name: 'Ra chơi (Break Time)',
        timeRange: '9:05 - 9:25',
        fullTimeLabel: 'Sáng - Ra chơi (9:05 - 9:25)',
      };
    } else {
      return {
        id: 'afternoon_break',
        session: 'afternoon',
        isBreak: true,
        name: 'Ra chơi (Break Time)',
        timeRange: '14:48 - 15:08',
        fullTimeLabel: 'Chiều - Ra chơi (14:48 - 15:08)',
      };
    }
  }

  // 5. Match by exact period number (Tiết 1..4, Tiết 5..8, or I..IV)
  let periodNum: number | null = null;
  const periodMatch = lower.match(/(?:tiết|tiet|t|tiếng|tieng)\s*([1-8]|iv|iii|ii|i)\b/i) || lower.match(/^([1-8])\b/);
  if (periodMatch) {
    const rawVal = periodMatch[1].toLowerCase();
    if (rawVal === '1' || rawVal === 'i') periodNum = 1;
    else if (rawVal === '2' || rawVal === 'ii') periodNum = 2;
    else if (rawVal === '3' || rawVal === 'iii') periodNum = 3;
    else if (rawVal === '4' || rawVal === 'iv') periodNum = 4;
    else if (rawVal === '5') {
      if (session === 'afternoon') periodNum = 1;
      else periodNum = 4;
    } else if (rawVal === '6') {
      session = 'afternoon';
      periodNum = 2;
    } else if (rawVal === '7') {
      session = 'afternoon';
      periodNum = 3;
    } else if (rawVal === '8') {
      session = 'afternoon';
      periodNum = 4;
    }
  }

  // 6. Match by specific time pattern in string
  if (!periodNum) {
    if (session === 'morning') {
      if (/7[:h]30|8[:h]15/.test(lower)) periodNum = 1;
      else if (/8[:h]20|9[:h]05/.test(lower)) periodNum = 2;
      else if (/9[:h]25|10[:h]10/.test(lower)) periodNum = 3;
      else if (/10[:h]15|11[:h]00/.test(lower)) periodNum = 4;
    } else {
      if (/13[:h]15|14[:h]00/.test(lower)) periodNum = 1;
      else if (/14[:h]03|14[:h]48|14[:h]05|14[:h]50/.test(lower)) periodNum = 2;
      else if (/15[:h]08|15[:h]53|15[:h]10/.test(lower)) periodNum = 3;
      else if (/15[:h]55|16[:h]40|16[:h]00|16[:h]45/.test(lower)) periodNum = 4;
    }
  }

  // 7. Standard period lookup if periodNum found
  if (periodNum && periodNum >= 1 && periodNum <= 4) {
    const target = STANDARD_SCHEDULE_PERIODS.find(
      p => p.session === session && p.periodNumber === periodNum && !p.isBreak
    );
    if (target) {
      return {
        id: target.id,
        session: target.session,
        isBreak: false,
        name: target.name,
        timeRange: target.timeRange,
        fullTimeLabel: target.fullTimeLabel,
      };
    }
  }

  // 8. Fallback by index if valid
  if (fallbackIdx !== undefined && fallbackIdx >= 0 && fallbackIdx < STANDARD_SCHEDULE_PERIODS.length) {
    const std = STANDARD_SCHEDULE_PERIODS[fallbackIdx];
    return {
      id: std.id,
      session: std.session,
      isBreak: !!std.isBreak,
      name: std.name,
      timeRange: std.timeRange,
      fullTimeLabel: std.fullTimeLabel,
    };
  }

  // Generic fallback
  return {
    id: `custom_${fallbackIdx ?? Math.random().toString(36).slice(2, 7)}`,
    session,
    isBreak: false,
    name: trimmed || 'Tiết học',
    timeRange: '',
    fullTimeLabel: trimmed || '',
  };
}

/**
 * Generates sample CSV content with the user's updated timetable frames
 */
export function generateScheduleCsvTemplate(className: string = 'LỚP MẪU'): string {
  return `\ufeffTHỜI KHOÁ BIỂU - ${className.toUpperCase()},,,,,
,,,,,
Tiết / Thứ,Thứ 2,Thứ 3,Thứ 4,Thứ 5,Thứ 6,Thứ 7
Sáng - Tiết 1 (7:30 - 8:15),Chào cờ,Toán,Văn,Tiếng Anh,Lịch sử,Địa lí
Sáng - Tiết 2 (8:20 - 9:05),Toán,Toán,Ngữ văn,Vật lí,Hóa học,Sinh học
Sáng - Ra chơi (9:05 - 9:25),Ra chơi,Ra chơi,Ra chơi,Ra chơi,Ra chơi,Ra chơi
Sáng - Tiết 3 (9:25 - 10:10),Ngữ văn,Vật lí,Tin học,Sinh học,GDCD,Tiếng Anh
Sáng - Tiết 4 (10:15 - 11:00),Ngữ văn,Hóa học,Tin học,Công nghệ,Hoạt động TN,Sinh hoạt lớp
Chiều - Tiết 1 (13:15 - 14:00),Giáo dục thể chất,Toán tăng cường,Văn tăng cường,Anh tăng cường,Kỹ năng sống,
Chiều - Tiết 2 (14:03 - 14:48),Giáo dục thể chất,Toán tăng cường,Văn tăng cường,Anh tăng cường,Kỹ năng sống,
Chiều - Ra chơi (14:48 - 15:08),Ra chơi,Ra chơi,Ra chơi,Ra chơi,Ra chơi,Ra chơi
Chiều - Tiết 3 (15:08 - 15:53),Câu lạc bộ,Tự học,Tự học,Hoạt động STEM,Sinh hoạt bán trú,
Chiều - Tiết 4 (15:55 - 16:40),Câu lạc bộ,Tự học,Tự học,Hoạt động STEM,Sinh hoạt bán trú,`;
}

/**
 * Creates a standard blank schedule with the exact 10 periods (8 teaching + 2 break times)
 */
export function createBlankStandardSchedule(): SchedulePeriod[] {
  return STANDARD_SCHEDULE_PERIODS.map(p => ({
    time: p.fullTimeLabel,
    t2: p.isBreak ? 'Ra chơi' : '',
    t3: p.isBreak ? 'Ra chơi' : '',
    t4: p.isBreak ? 'Ra chơi' : '',
    t5: p.isBreak ? 'Ra chơi' : '',
    t6: p.isBreak ? 'Ra chơi' : '',
    t7: p.isBreak ? 'Ra chơi' : '',
  }));
}
