const fs = require('fs');
let content = fs.readFileSync('src/data.ts', 'utf8');
content = content.replace(
  "attendanceRecords?: Record<string, { status: 'present' | 'late' | 'absent', reason?: string, time: string }>;",
  "attendanceRecords?: Record<string, { status: 'present' | 'late' | 'absent' | 'leave_early', reason?: string, time: string }>;"
);
fs.writeFileSync('src/data.ts', content);
