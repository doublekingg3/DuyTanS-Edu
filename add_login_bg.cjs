const fs = require('fs');
const file = 'src/components/AdminView.tsx';
let content = fs.readFileSync(file, 'utf8');

const loginBgHtml = `
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Hình nền Trang Đăng nhập (URL)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={appSettings.loginBackground}
                      onChange={(e) => setAppSettings({ ...appSettings, loginBackground: e.target.value })}
                      className="flex-1 min-w-0 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Nhập URL hoặc tải ảnh lên"
                    />
                    <label className="cursor-pointer shrink-0 px-3 py-2 bg-slate-100 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-1" title="Tải ảnh lên">
                      <Upload className="w-4 h-4" />
                      <span className="hidden sm:inline">Tải lên</span>
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'loginBackground')} />
                    </label>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">URL hình ảnh nền cho trang Đăng nhập.</p>
                </div>`;

content = content.replace("Sẽ thay thế icon cái mũ ở trang Đăng nhập.</p>\n                </div>", "Sẽ thay thế icon cái mũ ở trang Đăng nhập.</p>\n                </div>\n" + loginBgHtml);

fs.writeFileSync(file, content);
