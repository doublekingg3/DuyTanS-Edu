const fs = require('fs');
const file = 'src/components/AdminView.tsx';
let content = fs.readFileSync(file, 'utf8');

const uiBlock = `
            {/* Cấu hình Giao diện */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col mb-8">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <LayoutTemplate className="w-5 h-5 text-indigo-600" />
                  Cấu hình Giao diện
                </h2>
                <button
                  onClick={handleSaveSettings}
                  disabled={isSavingSettings}
                  className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {isSavingSettings ? 'Đang lưu...' : 'Lưu Cấu hình'}
                </button>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tên Ứng dụng (Page Title)</label>
                  <input
                    type="text"
                    value={appSettings.pageTitle}
                    onChange={(e) => setAppSettings({ ...appSettings, pageTitle: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="EduManage Pro"
                  />
                  <p className="text-xs text-slate-500 mt-1">Sẽ hiển thị ở tiêu đề trang (thẻ browser).</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tên Hiển thị (Login/EduManager)</label>
                  <input
                    type="text"
                    value={appSettings.appName}
                    onChange={(e) => setAppSettings({ ...appSettings, appName: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="EduManage Pro"
                  />
                  <p className="text-xs text-slate-500 mt-1">Sẽ hiển thị ở trang đăng nhập thay cho EduManage Pro.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Hình nền Giao diện Portal (URL)</label>
                  <input
                    type="text"
                    value={appSettings.portalBackground}
                    onChange={(e) => setAppSettings({ ...appSettings, portalBackground: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="https://example.com/bg.jpg"
                  />
                  <p className="text-xs text-slate-500 mt-1">URL hình ảnh nền cho trang Portal.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Icon Tiêu đề (Favicon URL)</label>
                  <input
                    type="text"
                    value={appSettings.pageIcon}
                    onChange={(e) => setAppSettings({ ...appSettings, pageIcon: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="https://example.com/icon.png"
                  />
                  <p className="text-xs text-slate-500 mt-1">URL hình ảnh nhỏ trên thẻ trình duyệt.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Logo Giao diện Portal (URL)</label>
                  <input
                    type="text"
                    value={appSettings.portalLogo}
                    onChange={(e) => setAppSettings({ ...appSettings, portalLogo: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="https://example.com/logo.png"
                  />
                  <p className="text-xs text-slate-500 mt-1">Sẽ thay thế icon cái mũ ở trang Portal.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Logo Trang Đăng nhập (URL)</label>
                  <input
                    type="text"
                    value={appSettings.loginLogo}
                    onChange={(e) => setAppSettings({ ...appSettings, loginLogo: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="https://example.com/login-logo.png"
                  />
                  <p className="text-xs text-slate-500 mt-1">Sẽ thay thế icon cái mũ ở trang Đăng nhập.</p>
                </div>
              </div>
            </div>
`;

content = content.replace("{activeTab === 'accounts' && (\n          <>", "{activeTab === 'accounts' && (\n          <>\n" + uiBlock);

fs.writeFileSync(file, content);
