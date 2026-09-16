const fs = require('fs');
let c = fs.readFileSync('src/components/AdminView.tsx', 'utf8');

const buttonTarget = `<button 
                  onClick={handleSortAndGenerateStudentIDs}
                  className="px-4 py-2 bg-amber-500 text-white font-medium rounded-lg hover:bg-amber-600 transition-colors flex items-center gap-2 shadow-sm"
                  title="Tự động xếp Mã Học Sinh toàn trường theo A-Z (Ví dụ: 26270001)"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg> Sắp xếp mã học sinh
                </button>`;

const buttonReplace = `{/* Nút gán mã tự động tạm ẩn do trường sử dụng mã CSDL Ngành
                <button 
                  onClick={handleSortAndGenerateStudentIDs}
                  className="px-4 py-2 bg-amber-500 text-white font-medium rounded-lg hover:bg-amber-600 transition-colors flex items-center gap-2 shadow-sm"
                  title="Tự động xếp Mã Học Sinh toàn trường theo A-Z (Ví dụ: 26270001)"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg> Sắp xếp mã học sinh
                </button>
*/}`;

c = c.replace(buttonTarget, buttonReplace);
fs.writeFileSync('src/components/AdminView.tsx', c);
