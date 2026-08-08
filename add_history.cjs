const fs = require('fs');
const file = 'src/data.ts';
let code = fs.readFileSync(file, 'utf8');

if (!code.includes('historicalRecords?')) {
    code = code.replace(
        "notifications: Notification[];",
        "notifications: Notification[];\n  historicalRecords?: { schoolYearId?: string, classId: string, className?: string, grades: Grades, term1Grades?: Grades, term2Grades?: Grades, yearGrades?: Grades, academicPerformance?: string, conduct?: string }[];"
    );
    fs.writeFileSync(file, code);
}
