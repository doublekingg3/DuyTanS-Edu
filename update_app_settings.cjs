const fs = require('fs');
const file = 'src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

const importStatement = `import { initialStudents, initialClasses, initialUsers, initialSchoolYears, Student, SchoolClass, Grades, UserAccount, SchoolYear, AppSettings, defaultSettings } from './data';`;
content = content.replace(/import \{ initialStudents.*?\} from '\.\/data';/, importStatement);

const stateInsert = `  const [settings, setSettings] = useState<AppSettings>(defaultSettings);`;
content = content.replace(/  const \[parentStudentId, setParentStudentId\] = useState\(''\);/, "  const [parentStudentId, setParentStudentId] = useState('');\n" + stateInsert);

const refInsert = `    const schoolYearsRef = collection(db, 'schoolYears');
    const settingsRef = doc(db, 'settings', 'general');`;
content = content.replace(/    const schoolYearsRef = collection\(db, 'schoolYears'\);/, refInsert);

const loadInsert = `    let schoolYearsLoaded = false;
    let settingsLoaded = false;
    
    const checkLoading = () => {
      if (studentsLoaded && classesLoaded && usersLoaded && schoolYearsLoaded && settingsLoaded) {
        setLoading(false);
      }
    };`;
content = content.replace(/    let schoolYearsLoaded = false;\s*const checkLoading = \(\) => \{\s*if \(studentsLoaded && classesLoaded && usersLoaded && schoolYearsLoaded\) \{\s*setLoading\(false\);\s*\}\s*\};/, loadInsert);

const effectInsert = `    const unsubscribeSchoolYears = onSnapshot(schoolYearsRef, (snapshot) => {
      // ... existing code, wait we need to use a regex to find where to append unsubscribeSettings
`;

// It's better to just write a simple script to append the settings listener
fs.writeFileSync(file, content);
