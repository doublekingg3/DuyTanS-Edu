const fs = require('fs');
const file = 'src/components/TeacherSchedule.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "import { Upload, Calendar, Search, Monitor, Smartphone } from 'lucide-react';",
  "import { Upload, Calendar, Search, Monitor, Smartphone, Download } from 'lucide-react';"
);

const handleDownloadHtml = `
  const handleDownloadTemplate = () => {
    const csvContent = \`\\ufeffTHỜI KHOÁ BIỂU - LỚP MẪU,,,,,
,,,,,
Tiết / Thứ,Thứ 2,Thứ 3,Thứ 4,Thứ 5,Thứ 6,Thứ 7
Sáng - Tiết 1 (7:00-7:45),Toán,Văn,Anh,,,,
Sáng - Tiết 2 (7:50-8:35),Lý,Hóa,Sinh,,,,
Sáng - Tiết 3 (8:55-9:40),,,,,,,
Sáng - Tiết 4 (9:45-10:30),,,,,,,
Chiều - Tiết 1 (13:30-14:15),,,,,,,
Chiều - Tiết 2 (14:20-15:05),,,,,,,
Chiều - Tiết 3 (15:25-16:10),,,,,,,
Chiều - Tiết 4 (16:15-17:00),,,,,,,\`;
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'TKB_Mau.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {`;

content = content.replace("  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {", handleDownloadHtml);


const buttonsHtml = `          <button 
            onClick={handleDownloadTemplate}
            className="px-4 py-2 bg-white text-slate-700 font-medium rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm"
          >
            <Download className="w-4 h-4 text-slate-500" />
            Tải mẫu (CSV)
          </button>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm"
          >
            <Upload className="w-4 h-4" />
            Tải lên TKB (CSV/Excel)
          </button>`;

content = content.replace(`          <button \n            onClick={() => fileInputRef.current?.click()}\n            className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm"\n          >\n            <Upload className="w-4 h-4" />\n            Tải lên TKB (CSV/Excel)\n          </button>`, buttonsHtml);

fs.writeFileSync(file, content);
