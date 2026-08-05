import fs from 'fs';
let code = fs.readFileSync('src/components/AdminView.tsx', 'utf8');

code = code.replace(
  "  const [userFormData, setUserFormData] = useState<{username: string, password: string, fullName: string, role: 'admin'|'teacher', homeroomClasses: string[], subjectClasses: string[]}>({",
  "  const [userAssignmentYear, setUserAssignmentYear] = useState('');\n  const [userFormData, setUserFormData] = useState<{username: string, password: string, fullName: string, role: 'admin'|'teacher', isHomeroom: boolean, isSubject: boolean, subjects: string[], homeroomClasses: string[], subjectClasses: string[]}>({"
);

code = code.replace(
  "    role: 'teacher' as 'admin' | 'teacher',\n    homeroomClasses: [],\n    subjectClasses: []",
  "    role: 'teacher' as 'admin' | 'teacher',\n    isHomeroom: false,\n    isSubject: false,\n    subjects: [],\n    homeroomClasses: [],\n    subjectClasses: []"
);

// update all setUserFormData calls
code = code.replace(
  "setUserFormData({ username: '', password: '', fullName: '', role: 'teacher', homeroomClasses: [], subjectClasses: [] });",
  "setUserFormData({ username: '', password: '', fullName: '', role: 'teacher', isHomeroom: false, isSubject: false, subjects: [], homeroomClasses: [], subjectClasses: [] });"
);
code = code.replace(
  "setUserFormData({ username: '', password: '', fullName: '', role: 'teacher', homeroomClasses: [], subjectClasses: [] });",
  "setUserFormData({ username: '', password: '', fullName: '', role: 'teacher', isHomeroom: false, isSubject: false, subjects: [], homeroomClasses: [], subjectClasses: [] });"
);
code = code.replace(
  "setUserFormData({ username: u.username, password: '', fullName: u.fullName, role: u.role, homeroomClasses: u.homeroomClasses || [], subjectClasses: u.subjectClasses || [] });",
  "setUserFormData({ username: u.username, password: '', fullName: u.fullName, role: u.role, isHomeroom: !!u.homeroomClasses?.length, isSubject: !!u.subjectClasses?.length, subjects: u.subjects || [], homeroomClasses: u.homeroomClasses || [], subjectClasses: u.subjectClasses || [] });"
);

// We need to also add `subjects` to UserAccount in src/data.ts
const dataTsContent = fs.readFileSync('src/data.ts', 'utf8');
if (!dataTsContent.includes('subjects?: string[]')) {
  fs.writeFileSync('src/data.ts', dataTsContent.replace('subjectClasses?: string[];', 'subjectClasses?: string[];\n  subjects?: string[];'));
}

const saveUserData = `
    const userData: any = {
      id: userId,
      username: userFormData.username,
      fullName: userFormData.fullName,
      role: userFormData.role,
      subjects: userFormData.role === 'teacher' && userFormData.isSubject ? userFormData.subjects : [],
      homeroomClasses: userFormData.role === 'teacher' && userFormData.isHomeroom ? userFormData.homeroomClasses : [],
      subjectClasses: userFormData.role === 'teacher' && userFormData.isSubject ? userFormData.subjectClasses : []
    };
`;
code = code.replace(
  /const userData: any = \{[\s\S]*?subjectClasses: userFormData.role === 'teacher' \? userFormData.subjectClasses : \[\]\n\s*\};/,
  saveUserData.trim()
);

fs.writeFileSync('src/components/AdminView.tsx', code);
