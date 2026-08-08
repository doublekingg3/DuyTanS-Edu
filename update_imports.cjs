const fs = require('fs');
const file = 'src/components/TeacherStudents.tsx';
let code = fs.readFileSync(file, 'utf8');

if (!code.includes("from '../lib/firebase'")) {
    code = code.replace(
        "import { useAlert } from \"../contexts/AlertContext\";",
        "import { useAlert } from \"../contexts/AlertContext\";\nimport { db } from '../lib/firebase';\nimport { doc, runTransaction } from 'firebase/firestore';"
    );
    fs.writeFileSync(file, code);
}
