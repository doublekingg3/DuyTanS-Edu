const fs = require('fs');
let c = fs.readFileSync('src/components/ParentView.tsx', 'utf8');

c = c.replace(/<button[^>]*>[\s\S]*?<BookOpen className="w-4 h-4" \/> Bảng điểm chi tiết[\s\S]*?<\/button>/g, '');
c = c.replace(/<button[^>]*>[\s\S]*?<Bell className="w-4 h-4" \/> Thông báo & Nhận xét[\s\S]*?<\/button>/g, '');
c = c.replace(/<button[^>]*>[\s\S]*?<BookOpen className="w-4 h-4" \/> Lịch sử học tập[\s\S]*?<\/button>/g, '');

c = c.replace(/\{activeTab === 'grades' && \([\s\S]*?\{activeTab === 'notifications' && \(/, '{activeTab === \'notifications\' && (');
// The grades block is huge. Let's do it via line sed or a robust regex.
