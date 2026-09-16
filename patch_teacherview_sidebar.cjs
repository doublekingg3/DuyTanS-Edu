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

c = c.replace(menuItemsSearch, menuItemsReplace);

const settingsBtnSearch = `          <div className="p-4 border-t border-slate-100">
            <button onClick={() => setActiveMenu('settings')} className={\`w-full flex items-center gap-4 px-3 py-3 rounded-xl font-medium transition-colors \${activeMenu === 'settings' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}\`}>
              <Settings className="w-5 h-5 flex-shrink-0 text-slate-400" />
              <span className={\`transition-opacity duration-300 \${isSidebarHovered ? 'opacity-100' : 'opacity-0'}\`}>
                Cấu hình
              </span>
            </button>
          </div>`;

c = c.replace(settingsBtnSearch, '');

const titleSearch = `{activeMenu === 'settings' ? 'Cấu hình' : menuItems.find(m => m.id === activeMenu)?.label}`;
c = c.replace(titleSearch, `{menuItems.find(m => m.id === activeMenu)?.label}`);

const adminViewSearch = `{activeMenu === 'settings' && (
          role === 'admin' && users && settings ? (
             <AdminView classes={classes || []} students={students} users={users} schoolYears={schoolYears || []} settings={settings} />
          ) : (
             <div className="p-8"><p>Cấu hình giáo viên đang được cập nhật.</p></div>
          )
        )}`;

const adminViewReplace = `{activeMenu.startsWith('admin_') && (
          role === 'admin' && users && settings ? (
             <div className="p-6">
                <AdminView 
                  classes={classes || []} 
                  students={students} 
                  users={users} 
                  schoolYears={schoolYears || []} 
                  settings={settings} 
                  externalActiveTab={
                    activeMenu === 'admin_classes' ? 'classes' :
                    activeMenu === 'admin_school_years' ? 'school_years' :
                    activeMenu === 'admin_accounts' ? 'accounts' :
                    activeMenu === 'admin_reports' ? 'reports' :
                    'firebase' // Fallback for settings (contains backup, firebase, ai_config inside AdminView. Wait, if it's external, I need to pass exactly one. Let's create an external tab wrapper or just map admin_settings to 'backup' and let them see the others? AdminView has tabs: classes, school_years, accounts, reports, backup, ai_config, firebase. If I only expose 5, how do they get to firebase?)
                  }
                />
             </div>
          ) : (
             <div className="p-8"><p>Không có quyền truy cập.</p></div>
          )
        )}`;

// Wait, if I map `admin_settings` to one of the config tabs, how do they access the other config tabs?
// Maybe I should NOT use `externalActiveTab` for `admin_settings`. If externalActiveTab is falsy, AdminView shows its internal tab bar! 
// Let's adjust AdminView to show the internal tab bar BUT filter out classes, school_years, accounts, reports!
