import React from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export type AlertType = 'success' | 'error' | 'info';

interface AlertModalProps {
  isOpen: boolean;
  message: string;
  type: AlertType;
  onClose: () => void;
}

export default function AlertModal({ isOpen, message, type, onClose }: AlertModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`p-2 rounded-full ${
              type === 'success' ? 'bg-green-100 text-green-600' : 
              type === 'error' ? 'bg-red-100 text-red-600' : 
              'bg-blue-100 text-blue-600'
            }`}>
              {type === 'success' && <CheckCircle className="w-6 h-6" />}
              {type === 'error' && <AlertCircle className="w-6 h-6" />}
              {type === 'info' && <Info className="w-6 h-6" />}
            </div>
            <div className="flex-1 pt-1">
              <h3 className="text-lg font-bold text-slate-800 mb-1">
                {type === 'success' ? 'Thành công' : 
                 type === 'error' ? 'Lỗi' : 
                 'Thông báo'}
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">{message}</p>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
