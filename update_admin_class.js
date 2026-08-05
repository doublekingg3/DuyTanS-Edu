import fs from 'fs';
let code = fs.readFileSync('src/components/AdminView.tsx', 'utf8');

code = code.replace(
  "      homeroomTeacher: formData.homeroomTeacher,\n      specialization: formData.specialization",
  "      homeroomTeacher: formData.homeroomTeacher,\n      schoolYearId: formData.schoolYearId,\n      specialization: formData.specialization"
);

fs.writeFileSync('src/components/AdminView.tsx', code);
