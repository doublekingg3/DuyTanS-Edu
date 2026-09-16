const fs = require('fs');
let c = fs.readFileSync('src/components/TeacherStudents.tsx', 'utf8');

c = c.replace(
  /const fileInputRef = useRef<HTMLInputElement>\(null\);/,
  `const fileInputRef = useRef<HTMLInputElement>(null);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [newStudentCode, setNewStudentCode] = useState('');
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentGender, setNewStudentGender] = useState('Nam');
  const [newStudentDob, setNewStudentDob] = useState('');
  const [newStudentEthnicity, setNewStudentEthnicity] = useState('Kinh');`
);

fs.writeFileSync('src/components/TeacherStudents.tsx', c);
