const fs = require('fs');
let c = fs.readFileSync('src/components/TeacherView.tsx', 'utf8');

c = c.replace(/import \{ LayoutDashboard, Users, FileSpreadsheet, Calendar as CalendarIcon, Settings \} from 'lucide-react';/, 
  "import { LayoutDashboard, Users, FileSpreadsheet, Calendar as CalendarIcon, Settings, Building2, Shield, BarChart2, Calendar } from 'lucide-react';");

const menuItemsSearch = `  const menuItems = [
    { id: "overview", icon: LayoutDashboard, label: "Tổng quan" },
    ...(role !== 'staff' ? [{ id: "students", icon: Users, label: "Danh sách lớp" }] : []),
    ...(role !== 'staff' ? [{ id: "weekly_plan", icon: ClipboardList, label: "Kế hoạch tuần" }] : []),
    { id: "lunch_menu", icon: Utensils, label: "Thực đơn ăn trưa" }
  ];`;

const menuItemsReplace = `  const adminMenuItems = role === 'admin' ? [
    { id: "admin_classes", icon: Building2, label: "Quản lý Lớp học" },
    { id: "admin_school_years", icon: Calendar, label: "Quản lý Năm học" },
    { id: "admin_accounts", icon: Shield, label: "Tài khoản & Quyền" },
    { id: "admin_reports", icon: BarChart2, label: "Báo cáo thống kê" },
    { id: "admin_settings", icon: Settings, label: "Cấu hình hệ thống" },
  ] : [];

  const menuItems = [
    { id: "overview", icon: LayoutDashboard, label: "Tổng quan" },
    ...(role !== 'staff' ? [{ id: "students", icon: Users, label: "Danh sách lớp" }] : []),
    ...(role !== 'staff' ? [{ id: "weekly_plan", icon: ClipboardList, label: "Kế hoạch tuần" }] : []),
    { id: "lunch_menu", icon: Utensils, label: "Thực đơn ăn trưa" },
    ...adminMenuItems
  ];`;

if (c.includes(menuItemsSearch)) {
  c = c.replace(menuItemsSearch, menuItemsReplace);
} else {
  console.log("Could not find menuItemsSearch!");
}

const settingsBtnSearch = `          <div className="p-4 border-t border-slate-100">
            <button onClick={() => setActiveMenu('settings')} className={\`w-full flex items-center gap-4 px-3 py-3 rounded-xl font-medium transition-colors \${activeMenu === 'settings' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}\`}>
              <Settings className="w-5 h-5 flex-shrink-0 text-slate-400" />
              <span className={\`transition-opacity duration-300 \${isSidebarHovered ? 'opacity-100' : 'opacity-0'}\`}>
                Cấu hình
              </span>
            </button>
          </div>`;
if (c.includes(settingsBtnSearch)) {
  c = c.replace(settingsBtnSearch, '');
}

fs.writeFileSync('src/components/TeacherView.tsx', c);
