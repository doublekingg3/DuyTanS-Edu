const fs = require('fs');
let c = fs.readFileSync('src/components/TeacherStudents.tsx', 'utf8');

// 1. Imports
c = c.replace(
  "import { doc, runTransaction } from 'firebase/firestore';",
  "import { doc, runTransaction, writeBatch, deleteDoc } from 'firebase/firestore';"
);
c = c.replace(
  "import { Search, Plus, Upload, Download, Save, User as UserIcon, X, Check, FileSpreadsheet } from 'lucide-react';",
  "import { Search, Plus, Upload, Download, Save, User as UserIcon, X, Check, FileSpreadsheet, Trash2 } from 'lucide-react';"
);

// 2. State
c = c.replace(
  "const [searchTerm, setSearchTerm] = useState('');",
  "const [searchTerm, setSearchTerm] = useState('');\n  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);"
);

// 3. Delete Logic
const handlers = `
  const handleDeleteSelected = async () => {
    if (selectedStudentIds.length === 0) return;
    const isConfirmed = await showConfirm(\`Bạn có chắc chắn muốn xóa vĩnh viễn \${selectedStudentIds.length} học sinh đã chọn?\`);
    if (isConfirmed) {
      try {
        const batch = writeBatch(db);
        selectedStudentIds.forEach(id => {
          batch.delete(doc(db, 'students', id));
        });
        await batch.commit();
        setSelectedStudentIds([]);
        showAlert('Xóa học sinh thành công', 'success');
      } catch (e) {
        showAlert('Lỗi khi xóa học sinh', 'error');
      }
    }
  };

  const handleDeleteSingle = async (id: string) => {
    const isConfirmed = await showConfirm('Bạn có chắc chắn muốn xóa vĩnh viễn học sinh này?');
    if (isConfirmed) {
      try {
        await deleteDoc(doc(db, 'students', id));
        if (selectedStudentIds.includes(id)) {
          setSelectedStudentIds(selectedStudentIds.filter(sId => sId !== id));
        }
        showAlert('Xóa học sinh thành công', 'success');
      } catch (e) {
        showAlert('Lỗi khi xóa học sinh', 'error');
      }
    }
  };
`;
c = c.replace(
  "  const handleAddStudentSubmit = () => {",
  handlers + "\n  const handleAddStudentSubmit = () => {"
);

// 4. Checkbox in Header
const thReplaceStr = `              <tr>
                <th className="px-4 py-3 text-center w-12">
                  <input
                    type="checkbox"
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    checked={selectedStudentIds.length > 0 && filteredStudents.length > 0 && selectedStudentIds.length === filteredStudents.length}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedStudentIds(filteredStudents.map(s => s.id));
                      else setSelectedStudentIds([]);
                    }}
                  />
                </th>
                <th className="px-4 py-3 text-center w-12">STT</th>`;
c = c.replace(
  "              <tr>\n                <th className=\"px-4 py-3 text-center w-12\">STT</th>",
  thReplaceStr
);

// 5. Checkbox in Body & Action Buttons
const trReplaceStr = `                    <tr key={student.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-4 py-4 text-center">
                        <input
                          type="checkbox"
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          checked={selectedStudentIds.includes(student.id)}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedStudentIds([...selectedStudentIds, student.id]);
                            else setSelectedStudentIds(selectedStudentIds.filter(id => id !== student.id));
                          }}
                        />
                      </td>
                      <td className="px-4 py-4 text-center text-slate-500">{idx + 1}</td>`;
c = c.replace(
  "                    <tr key={student.id} className=\"hover:bg-slate-50/50 transition-colors group\">\n                      <td className=\"px-4 py-4 text-center text-slate-500\">{idx + 1}</td>",
  trReplaceStr
);

const actionReplaceStr = `                      <td className="px-4 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => setSelectedStudentForDetails(student)}
                            className="px-3 py-1.5 bg-indigo-50 text-indigo-700 font-medium text-xs rounded-lg hover:bg-indigo-100 transition-colors"
                          >
                            Hồ sơ
                          </button>
                          <button
                            onClick={() => handleDeleteSingle(student.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                            title="Xóa học sinh"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>`;
c = c.replace(
  `                      <td className="px-4 py-4 text-center">
                        <button 
                          onClick={() => setSelectedStudentForDetails(student)}
                          className="px-3 py-1.5 bg-indigo-50 text-indigo-700 font-medium text-xs rounded-lg hover:bg-indigo-100 transition-colors"
                        >
                          Hồ sơ
                        </button>
                      </td>`,
  actionReplaceStr
);

// 6. Colspan fix (empty state)
c = c.replace(
  "<td colSpan={6} className=\"px-4 py-12 text-center text-slate-500\">",
  "<td colSpan={7} className=\"px-4 py-12 text-center text-slate-500\">"
);

// 7. Header buttons
const headerButtonsReplaceStr = `            <div className="flex items-center gap-3">
              {selectedStudentIds.length > 0 && (
                <button
                  onClick={handleDeleteSelected}
                  className="px-4 py-2 bg-red-50 text-red-600 font-medium rounded-lg hover:bg-red-100 transition-colors flex items-center gap-2 shadow-sm border border-red-200"
                >
                  <Trash2 className="w-4 h-4" /> Xóa {selectedStudentIds.length} học sinh
                </button>
              )}
              <div className="relative">`;
c = c.replace(
  "            <div className=\"flex items-center gap-3\">\n              <div className=\"relative\">",
  headerButtonsReplaceStr
);

fs.writeFileSync('src/components/TeacherStudents.tsx', c);
