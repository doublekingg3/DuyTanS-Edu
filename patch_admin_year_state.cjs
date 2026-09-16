const fs = require('fs');
let c = fs.readFileSync('src/components/AdminView.tsx', 'utf8');

c = c.replace(
  "  const [yearFormData, setYearFormData] = useState({ name: '' });",
  "  const [yearFormData, setYearFormData] = useState({ name: '' });\n  const [selectedYearIds, setSelectedYearIds] = useState<string[]>([]);\n  const [isYearTrashModalOpen, setIsYearTrashModalOpen] = useState(false);\n  const [selectedTrashYearIds, setSelectedTrashYearIds] = useState<string[]>([]);"
);

fs.writeFileSync('src/components/AdminView.tsx', c);
