import React, { useState, useEffect } from 'react';
import { X, Save, Calculator } from 'lucide-react';
import { SubjectDetail } from '../data';

interface GradeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName: string;
  subjectName: string;
  initialData?: SubjectDetail;
  onSave: (data: SubjectDetail) => void;
}

export default function GradeDetailModal({ isOpen, onClose, studentName, subjectName, initialData, onSave }: GradeDetailModalProps) {
  const [tx, setTx] = useState<string[]>(['', '', '', '', '', '']);
  const [gk, setGk] = useState<string>('');
  const [ck, setCk] = useState<string>('');
  const [tb, setTb] = useState<string>('');
  const [isPassFail, setIsPassFail] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        const initialTx = initialData.tx || [];
        setTx([
          initialTx[0]?.toString() || '',
          initialTx[1]?.toString() || '',
          initialTx[2]?.toString() || '',
          initialTx[3]?.toString() || '',
          initialTx[4]?.toString() || '',
          initialTx[5]?.toString() || ''
        ]);
        setGk(initialData.gk?.toString() || '');
        setCk(initialData.ck?.toString() || '');
        setTb(initialData.tb?.toString() || '');
        
        // Determine if it's a pass/fail subject based on previous data
        const allValues = [...initialTx, initialData.gk, initialData.ck, initialData.tb].map(v => v?.toString().toUpperCase());
        if (allValues.some(v => v === 'Đ' || v === 'CĐ')) {
          setIsPassFail(true);
        } else {
          // If no data, check subject name
          setIsPassFail(['GD thể chất', 'GD địa phương', 'HĐTN, HN'].includes(subjectName));
        }
      } else {
        setTx(['', '', '', '', '', '']);
        setGk('');
        setCk('');
        setTb('');
        setIsPassFail(['GD thể chất', 'GD địa phương', 'HĐTN, HN'].includes(subjectName));
      }
    }
  }, [isOpen, initialData, subjectName]);

  const computeAverage = () => {
    if (isPassFail) {
      // Logic for Pass/Fail: usually if CK is Đ and enough TX/GK are Đ
      // For simplicity, just use CK if present, else empty
      if (ck === 'Đ' || ck === 'CĐ') return ck;
      if (gk === 'Đ' || gk === 'CĐ') return gk;
      const lastTx = tx.slice().reverse().find(v => v === 'Đ' || v === 'CĐ');
      return lastTx || '';
    }

    const txValues = tx.map(v => parseFloat(v)).filter(v => !isNaN(v));
    const gkValue = parseFloat(gk);
    const ckValue = parseFloat(ck);

    let totalScore = 0;
    let totalWeight = 0;

    txValues.forEach(val => {
      totalScore += val;
      totalWeight += 1;
    });

    if (!isNaN(gkValue)) {
      totalScore += gkValue * 2;
      totalWeight += 2;
    }

    if (!isNaN(ckValue)) {
      totalScore += ckValue * 3;
      totalWeight += 3;
    }

    if (totalWeight === 0) return '';
    return (Math.round((totalScore / totalWeight) * 10) / 10).toFixed(1);
  };

  const handleAutoCalc = () => {
    setTb(computeAverage());
  };

  const handleSave = () => {
    onSave({
      tx: tx.filter(v => v.trim() !== ''),
      gk,
      ck,
      tb
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Chi tiết điểm</h2>
            <p className="text-sm text-slate-500">{studentName} • Môn: {subjectName}</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">ĐĐG Thường xuyên (TX)</h3>
            <div className="grid grid-cols-3 gap-3">
              {tx.map((val, idx) => (
                <div key={idx}>
                  <label className="block text-xs text-slate-500 mb-1">TX {idx + 1}</label>
                  <input
                    type="text"
                    value={val}
                    onChange={(e) => {
                      const newTx = [...tx];
                      newTx[idx] = e.target.value.toUpperCase();
                      setTx(newTx);
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-center font-medium"
                    placeholder={isPassFail ? 'Đ/CĐ' : '0-10'}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">ĐĐG Giữa kỳ (GK)</h3>
              <input
                type="text"
                value={gk}
                onChange={(e) => setGk(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-center font-medium"
                placeholder={isPassFail ? 'Đ/CĐ' : 'Hệ số 2'}
              />
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">ĐĐG Cuối kỳ (CK)</h3>
              <input
                type="text"
                value={ck}
                onChange={(e) => setCk(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-center font-medium text-indigo-700"
                placeholder={isPassFail ? 'Đ/CĐ' : 'Hệ số 3'}
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-end gap-4">
            <div className="flex-1">
              <label className="block text-sm font-bold text-slate-700 mb-1">Điểm Trung bình môn (TB)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tb}
                  onChange={(e) => setTb(e.target.value.toUpperCase())}
                  className="flex-1 px-3 py-2 border border-indigo-200 bg-indigo-50/50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold text-indigo-700"
                  placeholder="Tính tự động hoặc nhập"
                />
                <button
                  onClick={handleAutoCalc}
                  className="p-2 border border-indigo-200 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
                  title="Tự động tính theo TT22"
                >
                  <Calculator className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
          <p className="text-xs text-slate-500">Ghi chú: Điểm TB = (Tổng TX + 2*GK + 3*CK) / (Số cột TX + 5)</p>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-lg hover:bg-slate-50 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-indigo-600 text-white flex items-center gap-2 text-sm font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Save className="w-4 h-4" /> Lưu điểm
          </button>
        </div>
      </div>
    </div>
  );
}
