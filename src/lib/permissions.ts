import { UserAccount, UserPermissions, getUserTeacherType } from '../data';

export type PermissionModule = keyof UserPermissions;

/**
 * Checks whether a user is specifically a Subject Teacher (GVBM).
 */
export function isUserGVBM(
  user: UserAccount | undefined | null,
  role: string | undefined
): boolean {
  if (role === 'admin' || user?.role === 'admin' || role === 'staff' || user?.role === 'staff') {
    return false;
  }
  if (user) {
    return getUserTeacherType(user) === 'gvbm';
  }
  return role === 'subject_teacher';
}

/**
 * Checks whether a user can edit a specific module.
 * - Admin (Tổng thể BGH) has full 'edit' permissions on every module.
 * - GVBM (Giáo viên Bộ môn):
 *     - Điểm danh (attendance): ĐƯỢC quyền điểm danh các lớp giảng dạy.
 *     - Hồ sơ học sinh (students), Kế hoạch tuần (weeklyPlan), Lịch học (schedule): CHỈ XEM (view only, không được edit, xoá sửa).
 * - GVCN (Giáo viên Chủ nhiệm):
 *     - Toàn quyền quản lý lớp của mình (Hồ sơ học sinh, Điểm số, Kế hoạch tuần, Điểm danh).
 *     - Thực đơn bán trú: Chỉ xem (view only).
 * - Staff (Giáo vụ): Quản lý thực đơn bán trú, xem các mục học vụ.
 */
export function canUserEdit(
  user: UserAccount | undefined | null,
  role: string | undefined,
  module: PermissionModule
): boolean {
  // 1. Admin (Tổng thể BGH) has full privileges
  if (role === 'admin' || user?.role === 'admin') {
    return true;
  }

  // 2. Phân hệ Thực đơn bán trú:
  // Giáo viên và Phụ huynh CHỈ CÓ QUYỀN XEM (view-only), không được thay đổi.
  // Chỉ có Admin và Giáo vụ (staff) mới có quyền thay đổi.
  if (module === 'lunchMenu') {
    if (role === 'staff' || user?.role === 'staff') {
      if (user?.permissions?.lunchMenu) {
        return user.permissions.lunchMenu === 'edit';
      }
      return true;
    }
    return false;
  }

  // 3. Nếu là Giáo viên Bộ môn (GVBM):
  // "GVBM sẽ chỉ có chức năng view mấy cái của lớp họ cần xem, và GVBM được quyền điểm danh các lớp, chứ ko được edit, xoá sửa gì cả."
  if (isUserGVBM(user, role)) {
    if (module === 'attendance') {
      // GVBM được quyền điểm danh các lớp
      return true;
    }
    if (module === 'grades' && user?.permissions?.grades === 'edit') {
      return true;
    }
    return false;
  }

  // 4. If user has explicit granular permissions configured
  if (user?.permissions && user.permissions[module]) {
    return user.permissions[module] === 'edit';
  }

  // 5. Fallback defaults by role
  if (role === 'teacher' || user?.role === 'teacher') {
    return true;
  }

  if (role === 'subject_teacher' || user?.role === 'subject_teacher') {
    if (module === 'attendance' || module === 'grades') return true;
    return false;
  }

  if (role === 'staff' || user?.role === 'staff') {
    return false;
  }

  return false;
}

/**
 * Checks whether a user can view a specific module.
 * Everyone authenticated can view by default unless restricted.
 */
export function canUserView(
  user: UserAccount | undefined | null,
  role: string | undefined,
  _module: PermissionModule
): boolean {
  return true;
}
