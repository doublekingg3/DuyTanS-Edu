const fs = require('fs');
const file = 'src/components/AdminView.tsx';
let content = fs.readFileSync(file, 'utf8');

const stateBlock = `
  const [appSettings, setAppSettings] = useState<AppSettings>(settings || defaultSettings);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  
  React.useEffect(() => {
    if (settings) {
      setAppSettings(settings);
    }
  }, [settings]);

  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    try {
      const settingsRef = doc(db, 'settings', 'general');
      await setDoc(settingsRef, appSettings);
      showAlert('Đã lưu cấu hình giao diện thành công!', 'success');
    } catch (error) {
      showAlert('Lỗi khi lưu cấu hình', 'error');
    } finally {
      setIsSavingSettings(false);
    }
  };
`;

content = content.replace("  const { showAlert, showConfirm } = useAlert();", "  const { showAlert, showConfirm } = useAlert();\n" + stateBlock);

const importLayoutTemplate = `import { Building2, Users, Search, Plus, Edit2, Trash2, Download, Upload, Shield, Key, Calendar, ArrowRight, Database, Save, Cloud, Server, Sparkles, LayoutTemplate } from 'lucide-react';`;
content = content.replace(/import \{ Building2, Users, Search, Plus, Edit2, Trash2, Download, Upload, Shield, Key, Calendar, ArrowRight, Database, Save, Cloud, Server, Sparkles \} from 'lucide-react';/, importLayoutTemplate);

fs.writeFileSync(file, content);
