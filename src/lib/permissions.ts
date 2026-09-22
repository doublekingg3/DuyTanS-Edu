import { UserAccount, UserPermissions } from '../data';

export type PermissionModule = keyof UserPermissions;

/**
 * Checks whether a user can edit a specific module.
 * - Admin (Tổng thể BGH) has full 'edit' permissions on every module.
 * - If user has custom permissions specified in user.permissions:
 *     - If module permission is explicitly 'edit', returns true.
 *     - If module permission is explicitly 'view', returns false.
 * - If no custom permission is set for this module (undefined):
 *     - Falls back to default role-based capability:
 *         - 'admin' -> true
 *         - 'teacher' -> true (for teaching duties)
 *         - 'subject_teacher' -> false for homeroom-specific (students, attendance), true for grades
 *         - 'staff' -> view only for academic tasks
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

  // 3. If user has explicit granular permissions configured
  if (user?.permissions && user.permissions[module]) {
    return user.permissions[module] === 'edit';
  }

  // 4. Fallback defaults by role
  if (role === 'teacher' || user?.role === 'teacher') {
    return true;
  }

  if (role === 'subject_teacher' || user?.role === 'subject_teacher') {
    if (module === 'grades') return true;
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
