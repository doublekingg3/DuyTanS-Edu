const fs = require('fs');
let c = fs.readFileSync('src/components/AdminView.tsx', 'utf8');

const backupSearch = `{activeTab === 'backup' && (
          <div className="max-w-3xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold font-display text-slate-800">Sao lưu dữ liệu</h1>
              <p className="text-slate-500 mt-1">Xuất toàn bộ dữ liệu của hệ thống để dự phòng</p>
            </div>
            
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-4">
                <Database className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">Tạo bản sao lưu cục bộ</h2>
              <p className="text-slate-600 mb-8 max-w-md mx-auto">
                Tải xuống tệp JSON chứa toàn bộ dữ liệu hệ thống hiện tại, bao gồm danh sách năm học, lớp học, học sinh và tài khoản người dùng.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => {
                    const dataToExport = {
                      schoolYears,
                      classes,
                      students,
                      users
                    };
                    const dataStr = JSON.stringify(dataToExport, null, 2);
                    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
                    const exportFileDefaultName = \`edumanage_backup_\${new Date().toISOString().split('T')[0]}.json\`;
                    const linkElement = document.createElement('a');
                    linkElement.setAttribute('href', dataUri);
                    linkElement.setAttribute('download', exportFileDefaultName);
                    linkElement.click();
                  }}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <Download className="w-5 h-5" />
                  Tải xuống JSON
                </button>
                <button
                  className="px-6 py-3 bg-white hover:bg-slate-50 text-slate-700 font-medium rounded-xl border border-slate-200 transition-colors flex items-center justify-center gap-2 shadow-sm"
                  onClick={() => showAlert('Tính năng phục hồi đang được phát triển', 'info')}
                >
                  <Upload className="w-5 h-5" />
                  Khôi phục dữ liệu
                </button>
              </div>
            </div>
          </div>
        )}`;

const backupReplace = `{activeTab === 'backup' && (
          <div className="max-w-3xl mx-auto">
            <div className="mb-8 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-indigo-100">
                <Database className="w-8 h-8 text-indigo-600" />
              </div>
              <h1 className="text-3xl font-bold font-display text-slate-800">Sao Lưu Hệ Thống</h1>
              <p className="text-slate-500 mt-2 max-w-lg">Bảo vệ an toàn dữ liệu của nhà trường. Xuất toàn bộ thông tin tài khoản, danh sách lớp và điểm số thành tệp dự phòng.</p>
            </div>
            
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-800 mb-2">Tạo bản sao lưu cục bộ</h3>
                  <p className="text-slate-500 mb-6 leading-relaxed">
                    Hệ thống sẽ tổng hợp toàn bộ dữ liệu hiện tại thành một tệp JSON tiêu chuẩn. Bạn có thể sử dụng tệp này để lưu trữ hoặc khôi phục dữ liệu sau này.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <button
                      onClick={() => {
                        const dataToExport = { schoolYears, classes, students, users };
                        const dataStr = JSON.stringify(dataToExport, null, 2);
                        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
                        const exportFileDefaultName = \`edumanage_backup_\${new Date().toISOString().split('T')[0]}.json\`;
                        const linkElement = document.createElement('a');
                        linkElement.setAttribute('href', dataUri);
                        linkElement.setAttribute('download', exportFileDefaultName);
                        linkElement.click();
                      }}
                      className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all shadow-md shadow-indigo-500/20 flex items-center gap-2"
                    >
                      <Download className="w-5 h-5" /> Tải Xuống JSON
                    </button>
                    <button
                      className="px-6 py-3 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-xl border border-slate-200 transition-colors flex items-center gap-2"
                      onClick={() => showAlert('Tính năng phục hồi đang được cập nhật', 'info')}
                    >
                      <Upload className="w-5 h-5" /> Khôi Phục
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}`;

c = c.replace(backupSearch, backupReplace);

const aiSearch = `{activeTab === 'ai_config' && (
          <div className="max-w-3xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold font-display text-slate-800">Cấu hình Trợ lý AI</h1>
              <p className="text-slate-500 mt-1">Thông tin nhà trường cung cấp để AI sử dụng khi nhận xét học sinh</p>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <label className="block text-sm font-bold text-slate-700 mb-2">Thông tin chính thống (Fanpage, SĐT, Khoá học,...)</label>
              <textarea
                className="w-full h-48 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none transition-all"
                value={aiConfigText}
                onChange={(e) => setAiConfigText(e.target.value)}
                placeholder="Nhập thông tin tại đây..."
              />
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => {
                    localStorage.setItem('aiAdminConfig', aiConfigText);
                    showAlert('Đã lưu cấu hình AI', 'success');
                  }}
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors flex items-center gap-2"
                >
                  <Save className="w-4 h-4" /> Lưu cấu hình
                </button>
              </div>
            </div>
          </div>
        )}`;

const aiReplace = `{activeTab === 'ai_config' && (
          <div className="max-w-3xl mx-auto">
            <div className="mb-8 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-purple-100">
                <Sparkles className="w-8 h-8 text-purple-600" />
              </div>
              <h1 className="text-3xl font-bold font-display text-slate-800">Cấu hình Trợ Lý AI</h1>
              <p className="text-slate-500 mt-2 max-w-lg">Định hướng phong cách và cung cấp thông tin chuẩn của nhà trường để AI hỗ trợ giáo viên tốt nhất.</p>
            </div>
            
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
              <div className="mb-6">
                <label className="block text-lg font-bold text-slate-800 mb-2">Thông tin nền của Nhà trường</label>
                <p className="text-slate-500 text-sm mb-4">Nhập Fanpage, Số điện thoại, các khóa học kỹ năng, hoặc triết lý giáo dục để Trợ lý AI tự động lồng ghép vào lời nhận xét.</p>
                <textarea
                  className="w-full h-56 px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 resize-none transition-all text-slate-700 leading-relaxed"
                  value={aiConfigText}
                  onChange={(e) => setAiConfigText(e.target.value)}
                  placeholder="Ví dụ: Trường THPT Duy Tân. Slogan: 'Vươn tầm tri thức'. Hotlines: 0901234567..."
                />
              </div>
              <div className="flex justify-end border-t border-slate-100 pt-6">
                <button
                  onClick={() => {
                    localStorage.setItem('aiAdminConfig', aiConfigText);
                    showAlert('Cập nhật cấu hình Trợ lý AI thành công!', 'success');
                  }}
                  className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-all shadow-md shadow-purple-500/20 flex items-center gap-2"
                >
                  <Save className="w-5 h-5" /> Lưu Cấu Hình
                </button>
              </div>
            </div>
          </div>
        )}`;

c = c.replace(aiSearch, aiReplace);

const firebaseSearch = `{activeTab === 'firebase' && (
          <div className="max-w-3xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold font-display text-slate-800">Cấu hình kết nối Firebase</h1>
              <p className="text-slate-500 mt-1">Thiết lập cơ sở dữ liệu riêng biệt để đưa ứng dụng vào sử dụng chính thức</p>
            </div>
            
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-start gap-4 mb-6 p-4 bg-indigo-50 text-indigo-800 rounded-xl">
                <Server className="w-6 h-6 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold mb-1">Tại sao cần cấu hình Firebase riêng?</h3>
                  <p className="text-sm">
                    Theo mặc định, ứng dụng sử dụng cơ sở dữ liệu mẫu. Để đưa ứng dụng lên hệ thống thật cho giáo viên sử dụng, bạn cần cung cấp <strong>firebaseConfig</strong> của dự án Firebase (Firestore) do trường bạn quản lý. Dữ liệu sẽ được lưu trữ an toàn trên đó.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">JSON Cấu hình Firebase (firebaseConfig)</label>
                  <textarea
                    value={firebaseConfigStr}
                    onChange={(e) => setFirebaseConfigStr(e.target.value)}
                    placeholder="Dán cấu hình dạng JSON vào đây. Ví dụ:
{
  &quot;apiKey&quot;: &quot;AIzaSy...&quot;,
  &quot;authDomain&quot;: &quot;your-app.firebaseapp.com&quot;,
  &quot;projectId&quot;: &quot;your-app&quot;,
  ...
}"
                    className="w-full h-48 px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl font-mono text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
                    spellCheck={false}
                  />
                </div>
                
                <div className="flex items-center gap-2 pt-4">
                  <button 
                    onClick={handleSaveFirebase}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" /> Lưu cấu hình Firebase
                  </button>
                  <button 
                    onClick={() => setFirebaseConfigStr('')}
                    className="px-6 py-2.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium rounded-xl transition-colors"
                  >
                    Xóa trống
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}`;

const firebaseReplace = `{activeTab === 'firebase' && (
          <div className="max-w-3xl mx-auto">
            <div className="mb-8 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-amber-100">
                <Cloud className="w-8 h-8 text-amber-600" />
              </div>
              <h1 className="text-3xl font-bold font-display text-slate-800">Kết Nối Đám Mây</h1>
              <p className="text-slate-500 mt-2 max-w-lg">Đưa ứng dụng lên hệ thống lưu trữ Firebase chính thức của nhà trường để triển khai đồng bộ.</p>
            </div>
            
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
              <div className="flex items-start gap-4 mb-8 p-5 bg-blue-50/80 text-blue-800 rounded-2xl border border-blue-100">
                <Server className="w-6 h-6 flex-shrink-0 mt-0.5 text-blue-600" />
                <div>
                  <h3 className="font-bold text-blue-900 mb-1">Chuyển sang cơ sở dữ liệu thực</h3>
                  <p className="text-sm text-blue-700 leading-relaxed">
                    Theo mặc định, ứng dụng sử dụng dữ liệu giả lập. Vui lòng dán <strong>firebaseConfig</strong> của dự án Firebase (Firestore) do trường quản lý để dữ liệu được lưu trữ an toàn, liên tục và bảo mật.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-lg font-bold text-slate-800 mb-4">Cấu hình JSON (firebaseConfig)</label>
                  <textarea
                    value={firebaseConfigStr}
                    onChange={(e) => setFirebaseConfigStr(e.target.value)}
                    placeholder="Dán mã JSON cấu hình vào đây..."
                    className="w-full h-64 px-5 py-4 bg-slate-900 text-emerald-400 border border-slate-800 rounded-2xl font-mono text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none placeholder-slate-600"
                    spellCheck={false}
                  />
                </div>
                
                <div className="flex justify-end gap-3 border-t border-slate-100 pt-6">
                  <button 
                    onClick={() => setFirebaseConfigStr('')}
                    className="px-6 py-3 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800 font-semibold rounded-xl transition-colors"
                  >
                    Xóa Trống
                  </button>
                  <button 
                    onClick={handleSaveFirebase}
                    className="px-8 py-3 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-xl transition-all shadow-md shadow-slate-900/20 flex items-center gap-2"
                  >
                    <Cloud className="w-5 h-5" /> Kết Nối Dữ Liệu
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}`;

c = c.replace(firebaseSearch, firebaseReplace);
fs.writeFileSync('src/components/AdminView.tsx', c);
