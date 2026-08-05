const fs = require('fs');
const file = 'src/App.tsx';
let code = fs.readFileSync(file, 'utf8');

const target = `<iframe 
            src="https://example.com" 
            className="w-full h-full border-0"
            title="TKB System"
          />`;

const replace = `<div className="w-full h-full flex flex-col items-center justify-center p-8 text-center">
            <div className="w-24 h-24 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-6">
              <Calendar className="w-12 h-12" />
            </div>
            <h2 className="text-3xl font-bold text-slate-800 mb-4">Hệ thống Thời Khoá Biểu</h2>
            <p className="text-slate-500 text-lg max-w-lg mx-auto mb-8">
              Giao diện hệ thống TKB sẽ được tích hợp và hiển thị tại đây. Bạn có thể gắn link iframe hoặc chuyển hướng trang sau.
            </p>
            <a 
              href="#" 
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
            >
              Mở trong tab mới
            </a>
          </div>`;

code = code.replace(target, replace);
fs.writeFileSync(file, code);
