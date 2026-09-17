import React, { useState } from 'react';
import { X, Lock, Save } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserAccount, Student } from '../data';

interface ChangePasswordModalProps {
  onClose: () => void;
  userRole: 'admin' | 'teacher' | 'subject_teacher' | 'parent' | 'staff';
  currentUser?: UserAccount;
  currentStudent?: Student;
}

export default function ChangePasswordModal({ onClose, userRole, currentUser, currentStudent }: ChangePasswordModalProps) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu mới không khớp.');
      return;
    }
    
    if (newPassword.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }

    setLoading(true);
    try {
      if (userRole === 'parent' && currentStudent) {
        // Parent changes student's password
        // In our mock/firebase setup, parent might not have old password check if default was 12345678, but let's assume they do.
        // Actually for this demo, let's just update the password field on the student doc, or alert it's not fully implemented for parents if we didn't add password field to students.
        alert('Cập nhật mật khẩu phụ huynh. Trong hệ thống thực tế sẽ lưu vào database (hiện tính năng này đang ở dạng demo cho phụ huynh).');
        setSuccess('Đổi mật khẩu thành công!');
      } else if (currentUser) {
        // Teacher / Admin
        if (currentUser.password !== oldPassword) {
          setError('Mật khẩu cũ không chính xác.');
          setLoading(false);
          return;
        }

        // Update in firebase
        await updateDoc(doc(db, 'users', currentUser.id), {
          password: newPassword
        });
        
        setSuccess('Đổi mật khẩu thành công!');
      }
    } catch (err) {
      console.error(err);
      setError('Có lỗi xảy ra khi đổi mật khẩu.');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
            <Lock className="w-5 h-5 text-indigo-600" />
            Đổi Mật Khẩu
          </h3>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-100">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-emerald-50 text-emerald-600 rounded-lg text-sm font-medium border border-emerald-100">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {userRole !== 'parent' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Mật khẩu cũ</label>
                <input 
                  type="password" 
                  value={oldPassword}
                  onChange={e => setOldPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Mật khẩu mới</label>
              <input 
                type="password" 
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nhập lại mật khẩu mới</label>
              <input 
                type="password" 
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            
            <div className="pt-4 flex justify-end gap-3">
              <button 
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Hủy
              </button>
              <button 
                type="submit"
                disabled={loading || !!success}
                className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" /> Lưu thay đổi
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
