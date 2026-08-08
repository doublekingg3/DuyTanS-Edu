const fs = require('fs');
const file = 'src/components/AdminView.tsx';
let content = fs.readFileSync(file, 'utf8');

const handlerFunc = `
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: keyof AppSettings) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 800 * 1024) {
        showAlert('Kích thước ảnh quá lớn. Vui lòng chọn ảnh < 800KB để đảm bảo lưu trữ.', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAppSettings(prev => ({ ...prev, [field]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };
`;

content = content.replace("  const handleSaveSettings = async", handlerFunc + "\n  const handleSaveSettings = async");

const replaceInput = (label, field, placeholder, helpText) => {
  const regex = new RegExp(
    `<div>\\s*<label className="block text-sm font-medium text-slate-700 mb-1">${label}</label>\\s*<input\\s*type="text"\\s*value=\\{appSettings\\.${field}\\}\\s*onChange=\\{\\(e\\) => setAppSettings\\(\\{ \\.\\.\\.appSettings, ${field}: e\\.target\\.value \\}\\)\\}\\s*className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"\\s*placeholder="[^"]*"\\s*/>\\s*<p className="text-xs text-slate-500 mt-1">${helpText}</p>\\s*</div>`
  );
  
  const replacement = `<div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">${label}</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={appSettings.${field}}
                      onChange={(e) => setAppSettings({ ...appSettings, ${field}: e.target.value })}
                      className="flex-1 min-w-0 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="${placeholder}"
                    />
                    <label className="cursor-pointer shrink-0 px-3 py-2 bg-slate-100 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-1" title="Tải ảnh lên">
                      <Upload className="w-4 h-4" />
                      <span className="hidden sm:inline">Tải lên</span>
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, '${field}')} />
                    </label>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">${helpText}</p>
                </div>`;
                
  content = content.replace(regex, replacement);
};

replaceInput("Hình nền Giao diện Portal \\(URL\\)", "portalBackground", "Nhập URL hoặc tải ảnh lên", "URL hình ảnh nền cho trang Portal.");
replaceInput("Icon Tiêu đề \\(Favicon URL\\)", "pageIcon", "Nhập URL hoặc tải ảnh lên", "URL hình ảnh nhỏ trên thẻ trình duyệt.");
replaceInput("Logo Giao diện Portal \\(URL\\)", "portalLogo", "Nhập URL hoặc tải ảnh lên", "Sẽ thay thế icon cái mũ ở trang Portal.");
replaceInput("Logo Trang Đăng nhập \\(URL\\)", "loginLogo", "Nhập URL hoặc tải ảnh lên", "Sẽ thay thế icon cái mũ ở trang Đăng nhập.");

fs.writeFileSync(file, content);
