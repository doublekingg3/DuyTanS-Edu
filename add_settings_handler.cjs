const fs = require('fs');
const file = 'src/components/AdminView.tsx';
let content = fs.readFileSync(file, 'utf8');

const importFirebase = `import { doc, deleteDoc, updateDoc, writeBatch, collection, addDoc, setDoc } from 'firebase/firestore';`;
content = content.replace(/import \{ doc, deleteDoc, updateDoc, writeBatch, collection, addDoc \} from 'firebase\/firestore';/, importFirebase);

const handlerCode = `
  const [appSettings, setAppSettings] = useState<AppSettings>(settings || defaultSettings);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  
  useEffect(() => {
    if (settings) {
      setAppSettings(settings);
    }
  }, [settings]);

  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    try {
      const settingsRef = doc(db, 'settings', 'general');
      await setDoc(settingsRef, appSettings);
      addAlert('Đã lưu cấu hình giao diện thành công!', 'success');
    } catch (error) {
      addAlert('Lỗi khi lưu cấu hình', 'error');
    } finally {
      setIsSavingSettings(false);
    }
  };
`;

content = content.replace("  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);", "  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);\n" + handlerCode);

const lucideImport = `import { Users, BookOpen, GraduationCap, Upload, Download, Search, Edit2, Trash2, Shield, Calendar, Database, Eye, EyeOff, Save, Image as ImageIcon, LayoutTemplate, Sparkles, Cloud, Lock } from 'lucide-react';`;
content = content.replace(/import \{ Users, BookOpen, GraduationCap, Upload, Download, Search, Edit2, Trash2, Shield, Calendar, Database, Eye, EyeOff, Save, Image as ImageIcon, LayoutTemplate, Sparkles, Cloud \} from 'lucide-react';/, lucideImport);

fs.writeFileSync(file, content);
