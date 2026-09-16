const fs = require('fs');
let c = fs.readFileSync('src/components/AdminView.tsx', 'utf8');

c = c.replace(
  "const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);",
  "const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);\n  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);\n  const [isClassTrashModalOpen, setIsClassTrashModalOpen] = useState(false);\n  const [selectedTrashClassIds, setSelectedTrashClassIds] = useState<string[]>([]);"
);

fs.writeFileSync('src/components/AdminView.tsx', c);
