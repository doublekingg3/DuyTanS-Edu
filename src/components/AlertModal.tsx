import React from 'react';
import { CheckCircle, AlertCircle, Info, Loader2 } from 'lucide-react';

export type AlertType = 'success' | 'error' | 'info';

interface AlertModalProps {
  isOpen: boolean;
  message: string;
  type: AlertType;
  onClose: () => void;
}

export default function AlertModal({ isOpen, message, type, onClose }: AlertModalProps) {
  if (!isOpen) return null;

  // Tự động nhận diện khi hệ thống đang trong tiến trình xử lý / tải ảnh
  const isProcessing = type === 'info' && (
    message.toLowerCase().includes('đang') || 
    message.toLowerCase().includes('xử lý') || 
    message.toLowerCase().includes('tải') ||
    message.toLowerCase().includes('processing')
  );

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4"
      onClick={isProcessing ? undefined : onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`p-2.5 rounded-2xl shrink-0 ${
              isProcessing ? 'bg-teal-50 text-teal-600 border border-teal-200' :
              type === 'success' ? 'bg-emerald-100 text-emerald-600' : 
              type === 'error' ? 'bg-rose-100 text-rose-600' : 
              'bg-blue-100 text-blue-600'
            }`}>
              {isProcessing ? (
                <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
              ) : type === 'success' ? (
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              ) : type === 'error' ? (
                <AlertCircle className="w-6 h-6 text-rose-600" />
              ) : (
                <Info className="w-6 h-6 text-blue-600" />
              )}
            </div>
            <div className="flex-1 pt-0.5">
              <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-1">
                {isProcessing ? 'Đang xử lý...' :
                 type === 'success' ? 'Thành công' : 
                 type === 'error' ? 'Thông báo lỗi' : 
                 'Thông báo'}
              </h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-medium">{message}</p>
            </div>
          </div>
        </div>

        {/* Ẩn hoàn toàn nút Đóng khi hệ thống đang xử lý ảnh/dữ liệu để tránh thao tác sai */}
        {!isProcessing && (
          <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white text-sm font-bold rounded-xl transition-colors cursor-pointer shadow-2xs"
            >
              Đóng
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
