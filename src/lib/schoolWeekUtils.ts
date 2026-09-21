/**
 * Quản lý tính toán Tuần học theo lịch thực tế của trường:
 * Lịch chuẩn:
 * Tuần 1: 17/08 - 21/08
 * Tuần 2: 24/08 - 28/08
 * Tuần 3: 31/08 - 04/09
 * Tuần 4: 07/09 - 11/09
 * Tuần 5: 14/09 - 18/09
 * Tuần 6: 21/09 - 25/09
 * ... các tuần tiếp theo cách đều 7 ngày (Thứ 2 đến Thứ 6)
 */

export interface SchoolWeekSchedule {
  id: number;
  name: string;
  startDate: string; // YYYY-MM-DD (Thứ 2)
  endDate: string;   // YYYY-MM-DD (Thứ 6)
  startFormatted: string; // DD/MM
  endFormatted: string;   // DD/MM
  isCurrent?: boolean;
}

// Lấy ngày thứ Hai của tuần 1 dựa theo năm học.
// Mặc định tuần 1 bắt đầu từ ngày 17/08
export function getBaseWeek1StartDate(schoolYearName?: string, referenceDate: Date = new Date()): Date {
  let year = referenceDate.getFullYear();
  if (schoolYearName) {
    const match = schoolYearName.match(/\d{4}/);
    if (match) {
      year = parseInt(match[0], 10);
    }
  } else {
    // Nếu tháng hiện tại là tháng 1-7, năm học bắt đầu từ năm trước (ví dụ 02/2027 là năm học 2026-2027)
    if (referenceDate.getMonth() < 7) {
      year = year - 1;
    }
  }
  // Ngày 17/08 của năm bắt đầu năm học
  return new Date(year, 7, 17); // Month index 7 = August (Tháng 8)
}

/**
 * Định dạng ngày YYYY-MM-DD
 */
export function formatDateISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Định dạng ngày DD/MM
 */
export function formatDateShort(date: Date): string {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${d}/${m}`;
}

/**
 * Tạo danh sách 42 tuần học theo lịch trường (Thứ 2 đến Thứ 6)
 */
export function generateSchoolWeeks(schoolYearName?: string, totalWeeks: number = 42, referenceDate: Date = new Date()): SchoolWeekSchedule[] {
  const baseStart = getBaseWeek1StartDate(schoolYearName, referenceDate);
  const currentWeekNumber = getCurrentSchoolWeek(schoolYearName, referenceDate);

  const weeks: SchoolWeekSchedule[] = [];

  for (let i = 0; i < totalWeeks; i++) {
    const weekId = i + 1;
    // Thứ Hai của tuần thứ weekId
    const sDate = new Date(baseStart);
    sDate.setDate(baseStart.getDate() + (i * 7));

    // Thứ Sáu của tuần thứ weekId (cộng 4 ngày: Thứ 2 + 4 = Thứ 6)
    const eDate = new Date(sDate);
    eDate.setDate(sDate.getDate() + 4);

    weeks.push({
      id: weekId,
      name: `Tuần ${weekId}`,
      startDate: formatDateISO(sDate),
      endDate: formatDateISO(eDate),
      startFormatted: formatDateShort(sDate),
      endFormatted: formatDateShort(eDate),
      isCurrent: weekId === currentWeekNumber
    });
  }

  return weeks;
}

/**
 * Tính số tuần hiện tại theo thời gian thực tế
 * Tuần 1: 17/08 - 21/08
 * Tuần 2: 24/08 - 28/08
 * Tuần 3: 31/08 - 04/09
 * Tuần 4: 07/09 - 11/09
 * Tuần 5: 14/09 - 18/09
 * Tuần 6: 21/09 - 25/09
 * Các ngày cuối tuần (T7, CN) tính thuộc tuần vừa hoàn thành hoặc tuần chuẩn bị bắt đầu.
 */
export function getCurrentSchoolWeek(schoolYearName?: string, referenceDate: Date = new Date()): number {
  const baseStart = getBaseWeek1StartDate(schoolYearName, referenceDate);
  
  // Đưa về 00:00:00 của ngày
  const startOfBase = new Date(baseStart.getFullYear(), baseStart.getMonth(), baseStart.getDate());
  const now = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate());

  // Khoảng cách theo ngày
  const diffTime = now.getTime() - startOfBase.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    // Trước ngày 17/08 thì tính là Tuần 1
    return 1;
  }

  // Mỗi tuần 7 ngày
  const weekIndex = Math.floor(diffDays / 7);
  const weekNum = weekIndex + 1;

  // Giới hạn trong khoảng 1 đến 42 tuần
  return Math.min(Math.max(weekNum, 1), 42);
}
