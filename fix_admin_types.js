import fs from 'fs';
let code = fs.readFileSync('src/components/AdminView.tsx', 'utf8');

// Fix docRef(db, 'schoolYears', yearId) -> doc(db, 'schoolYears', yearId)
code = code.replace(
  "await deleteDoc(docRef(db, 'schoolYears', yearId));",
  "await deleteDoc(doc(db, 'schoolYears', yearId));"
);

// Fix Array.from(promoteClassData.studentsToPromote)
code = code.replace(
  "Array.from(promoteClassData.studentsToPromote).forEach(studentId => {",
  "Array.from(promoteClassData.studentsToPromote as Set<string>).forEach((studentId: string) => {"
);

// Fix userData type
code = code.replace(
  "const userData = {",
  "const userData: any = {"
);

// Fix openEditModal type
code = code.replace(
  "const openEditModal = (c) => {",
  "const openEditModal = (c: SchoolClass) => {"
);

// Fix handleDeleteYear and handleDeleteClass param types
code = code.replace(
  "const handleDeleteYear = async (yearId) => {",
  "const handleDeleteYear = async (yearId: string) => {"
);
code = code.replace(
  "const handleDeleteClass = async (classId) => {",
  "const handleDeleteClass = async (classId: string) => {"
);

fs.writeFileSync('src/components/AdminView.tsx', code);
