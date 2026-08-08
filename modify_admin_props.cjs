const fs = require('fs');
const file = 'src/components/AdminView.tsx';
let content = fs.readFileSync(file, 'utf8');

const importData = `import { SchoolClass, Student, UserAccount, SchoolYear, AppSettings, defaultSettings } from '../data';`;
content = content.replace(/import \{ SchoolClass, Student, UserAccount, SchoolYear \} from '\.\.\/data';/, importData);

const propsSignature = `export default function AdminView({ classes, students, users, schoolYears, settings }: { classes: SchoolClass[], students: Student[], users: UserAccount[], schoolYears: SchoolYear[], settings?: AppSettings }) {`;
content = content.replace(/export default function AdminView\(\{ classes, students, users, schoolYears \}: \{ classes: SchoolClass\[\], students: Student\[\], users: UserAccount\[\], schoolYears: SchoolYear\[\] \}\) \{/, propsSignature);

fs.writeFileSync(file, content);
