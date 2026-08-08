import React, { useState } from 'react';
import { Shield, BookOpen, UserCircle, GraduationCap, ArrowRight, Lock, User, ArrowLeft } from 'lucide-react';
import { SchoolClass, Student, UserAccount } from '../data';

export default function Login({ 
  classes, 
  students,
  users,
  onLogin,
  onBack 
}: { 
  classes: SchoolClass[],
  students: Student[],
  users: UserAccount[],
  onLogin: (role: 'admin' | 'teacher' | 'parent', parentStudentId?: string, loggedInUserId?: string) => void,
  onBack?: () => void
}) {
  const [selectedRole, setSelectedRole] = useState<'admin' | 'teacher' | 'parent'>('admin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [studentCode, setStudentCode] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (selectedRole === 'admin' || selectedRole === 'teacher') {
      const user = users.find(u => u.username === username && u.password === password && u.role === selectedRole);
      if (user) {
        onLogin(selectedRole, undefined, user.id);
      } else {
        setError(`Tài khoản hoặc mật khẩu ${selectedRole === 'admin' ? 'quản trị' : 'giáo viên'} không đúng.`);
      }
    } else if (selectedRole === 'parent') {
      if (!studentCode.trim()) {
        setError('Vui lòng nhập mã học sinh.');
        return;
      }
      
      const codeInput = studentCode.trim().toUpperCase();
      const codeInputNoHyphen = codeInput.replace(/-/g, '');
      
      // Try to find by direct code (e.g., HS-001 or 20252026-001 or 20252026001)
      const studentByCode = students.find(s => 
        s.code?.toUpperCase() === codeInput || 
        s.code?.toUpperCase() === codeInputNoHyphen
      );
      
      if (studentByCode) {
        onLogin('parent', studentByCode.id);
        return;
      }

      // Fallback for backward compatibility (Lớp-STT)
      const parts = codeInput.split('-');
      if (parts.length === 2) {
        const className = parts[0];
        const stt = parseInt(parts[1], 10);

        const classObj = classes.find(c => c.name.toLowerCase() === className.toLowerCase());
        if (classObj) {
          const student = students.find(s => s.classId === classObj.id && s.stt === stt);
          if (student) {
            onLogin('parent', student.id);
            return;
          }
        }
      }
      
      setError('Không tìm thấy học sinh với mã này. (Nhập mã HS-xxx hoặc Lớp-STT)');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 relative">
      {onBack && (
        <button 
          onClick={onBack}
          className="absolute top-4 left-4 sm:top-8 sm:left-8 flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-200 transition-all font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="hidden sm:inline">Về Portal</span>
        </button>
      )}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-indigo-600 p-8 text-center text-white">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold font-display">EduManage Pro</h1>
          <p className="text-indigo-100 mt-2">Hệ thống quản lý điểm số thông minh</p>
        </div>

        <div className="p-8">
          <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
            <button 
              type="button"
              onClick={() => { setSelectedRole('admin'); setError(''); }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${selectedRole === 'admin' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Shield className="w-4 h-4" /> Admin
            </button>
            <button 
              type="button"
              onClick={() => { setSelectedRole('teacher'); setError(''); }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${selectedRole === 'teacher' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <BookOpen className="w-4 h-4" /> Giáo viên
            </button>
            <button 
              type="button"
              onClick={() => { setSelectedRole('parent'); setError(''); }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${selectedRole === 'parent' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <UserCircle className="w-4 h-4" /> Phụ huynh
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-100">
                {error}
              </div>
            )}

            {selectedRole === 'parent' && (
              <div className="text-center mt-4">
                <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <strong>Tài Khoản Demo</strong><br/>
                  Phụ huynh đăng nhập theo mẫu: <strong>năm học-stt</strong><br/>
                  Ví dụ: <strong>20252026-001</strong>
                </p>
              </div>
            )}
            
            {(selectedRole === 'admin' || selectedRole === 'teacher') && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tài khoản</label>
                  <div className="relative">
                    <User className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                      type="text" 
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      placeholder={selectedRole === 'admin' ? 'admin' : 'teacher'}
                      className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Mật khẩu</label>
                  <div className="relative">
                    <Lock className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                      type="password" 
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••"
                      className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                </div>
              </>
            )}

            {selectedRole === 'parent' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Mã Học sinh</label>
                <div className="relative">
                  <UserCircle className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    value={studentCode}
                    onChange={e => setStudentCode(e.target.value)}
                    placeholder="VD: 20252026-001"
                    className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono"
                  />
                </div>
                
              </div>
            )}

            <button 
              type="submit"
              className="w-full py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2 mt-6"
            >
              Đăng nhập <ArrowRight className="w-4 h-4" />
            </button>
            
            {selectedRole === 'parent' && (
              <div className="text-center mt-4">
                <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <strong>Tài Khoản Demo</strong><br/>
                  Phụ huynh đăng nhập theo mẫu: <strong>năm học-stt</strong><br/>
                  Ví dụ: <strong>20252026-001</strong>
                </p>
              </div>
            )}

            {(selectedRole === 'admin' || selectedRole === 'teacher') && (
              <div className="text-center mt-4">
                <p className="text-xs text-slate-500">
                  Gợi ý đăng nhập mẫu:<br/>
                  Tài khoản: <strong>{selectedRole}</strong> / Mật khẩu: <strong>{selectedRole}</strong>
                </p>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
