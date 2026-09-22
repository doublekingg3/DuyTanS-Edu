import React, { useState, useEffect } from 'react';
import { Shield, BookOpen, UserCircle, GraduationCap, Lock, User, ArrowLeft, Eye, EyeOff, CheckSquare, Square } from 'lucide-react';
import { SchoolClass, Student, UserAccount, AppSettings } from '../data';

export default function Login({ 
  classes, 
  students,
  users,
  onLogin,
  onBack,
  settings
}: { 
  classes: SchoolClass[],
  students: Student[],
  users: UserAccount[],
  onLogin: (role: 'admin' | 'teacher' | 'subject_teacher' | 'parent' | 'staff', parentStudentId?: string, loggedInUserId?: string) => void,
  onBack?: () => void,
  settings?: AppSettings
}) {
  const [selectedRole, setSelectedRole] = useState<'admin' | 'teacher' | 'parent' | 'staff'>('teacher');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [studentCode, setStudentCode] = useState('');
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Restore remembered credentials on initial mount
  useEffect(() => {
    try {
      const isRemembered = localStorage.getItem('edumanage_remember_me') === 'true';
      if (isRemembered) {
        setRememberMe(true);
        const savedUsername = localStorage.getItem('edumanage_saved_username') || '';
        const savedPassword = localStorage.getItem('edumanage_saved_password') || '';
        const savedRole = localStorage.getItem('edumanage_saved_role') as 'admin' | 'teacher' | 'parent' | 'staff';
        const savedStudentCode = localStorage.getItem('edumanage_saved_student_code') || '';

        if (savedRole) setSelectedRole(savedRole);
        if (savedUsername) setUsername(savedUsername);
        if (savedPassword) setPassword(savedPassword);
        if (savedStudentCode) setStudentCode(savedStudentCode);
      }
    } catch (e) {
      console.error('Error loading remembered credentials:', e);
    }
  }, []);

  const handleClearSaved = () => {
    try {
      localStorage.removeItem('edumanage_remember_me');
      localStorage.removeItem('edumanage_saved_username');
      localStorage.removeItem('edumanage_saved_password');
      localStorage.removeItem('edumanage_saved_role');
      localStorage.removeItem('edumanage_saved_student_code');
    } catch (e) {
      console.error(e);
    }
    setUsername('');
    setPassword('');
    setStudentCode('');
    setRememberMe(false);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Save or clear remembered credentials upon login attempt
    const persistCredentials = () => {
      try {
        if (rememberMe) {
          localStorage.setItem('edumanage_remember_me', 'true');
          localStorage.setItem('edumanage_saved_role', selectedRole);
          if (selectedRole === 'parent') {
            localStorage.setItem('edumanage_saved_student_code', studentCode.trim());
            localStorage.setItem('edumanage_saved_password', password);
          } else {
            localStorage.setItem('edumanage_saved_username', username.trim());
            localStorage.setItem('edumanage_saved_password', password);
          }
        } else {
          localStorage.removeItem('edumanage_remember_me');
          localStorage.removeItem('edumanage_saved_username');
          localStorage.removeItem('edumanage_saved_password');
          localStorage.removeItem('edumanage_saved_role');
          localStorage.removeItem('edumanage_saved_student_code');
        }
      } catch (err) {
        console.error('Error updating remembered credentials:', err);
      }
    };

    if (selectedRole === 'teacher' || selectedRole === 'admin' || selectedRole === 'staff') {
      const user = users.find(u => u.username === username && u.password === password && ['admin', 'teacher', 'staff'].includes(u.role));
      if (user) {
        persistCredentials();
        onLogin(user.role, undefined, user.id);
      } else {
        setError(`Tài khoản hoặc mật khẩu không đúng.`);
      }
    } else if (selectedRole === 'parent') {
      if (!studentCode.trim()) {
        setError('Vui lòng nhập mã học sinh.');
        return;
      }
      if (password !== '12345678' && password !== 'admin') {
        setError('Tài khoản hoặc mật khẩu không đúng.');
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
        persistCredentials();
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
            persistCredentials();
            onLogin('parent', student.id);
            return;
          }
        }
      }
      
      setError('Không tìm thấy học sinh với mã này. (Nhập mã HS-xxx hoặc Lớp-STT)');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 relative flex items-center p-4 sm:p-8 overflow-hidden" style={{ 
      backgroundImage: settings?.loginBackground ? `url(${settings.loginBackground})` : 'none',
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }}>
      {settings?.loginBackground && <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-0"></div>}
      
      {onBack && !settings?.disablePortal && (
        <button 
          onClick={onBack}
          className="absolute top-4 left-4 sm:top-8 sm:left-8 flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-xl shadow-sm border border-white/20 text-slate-700 hover:text-indigo-600 transition-all font-medium z-20"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Về Portal</span>
        </button>
      )}

      <div className="w-full max-w-lg relative z-10 mx-auto lg:mx-0 lg:ml-auto lg:mr-[100px]">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-indigo-600 p-8 text-center text-white">
          {settings?.loginLogo ? (
            <img src={settings.loginLogo} alt="Logo" className="w-24 h-24 rounded-full object-cover mx-auto mb-4 drop-shadow-md border-4 border-white/20" />
          ) : (
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
          )}
          <h1 className="text-2xl font-bold font-display">{settings?.appName || "EduManage Pro"}</h1>
          <p className="text-indigo-100 mt-2">Hệ thống quản lý học sinh online</p>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-xl mb-6">
            <button 
              type="button"
              onClick={() => { setSelectedRole('teacher'); setError(''); }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${(selectedRole === 'teacher' || selectedRole === 'admin' || selectedRole === 'staff') ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <BookOpen className="w-4 h-4" /> Giáo viên / Nhân viên
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
                  Mã học sinh là <strong>Mã định danh</strong><br/>
                  Mật khẩu mặc định: <strong>12345678</strong>
                </p>
              </div>
            )}
            
            {(selectedRole === 'admin' || selectedRole === 'teacher' || selectedRole === 'staff') && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tài khoản</label>
                  <div className="relative">
                    <User className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                      type="text" 
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      placeholder='Tài khoản'
                      className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Mật khẩu</label>
                  <div className="relative">
                    <Lock className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                      type={showPassword ? "text" : "password"} 
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••"
                      className="w-full pl-10 pr-10 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                      tabIndex={-1}
                      title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </>
            )}

            {selectedRole === 'parent' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Mã Học sinh</label>
                  <div className="relative">
                    <UserCircle className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                      type="text" 
                      value={studentCode}
                      onChange={e => setStudentCode(e.target.value)}
                      placeholder="VD: 54011xxxxxx"
                      className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Mật khẩu</label>
                  <div className="relative">
                    <Lock className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                      type={showPassword ? "text" : "password"} 
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Mật khẩu"
                      className="w-full pl-10 pr-10 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                      tabIndex={-1}
                      title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-sm text-slate-600 hover:text-slate-800">
                <input 
                  type="checkbox" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer"
                />
                <span className="font-medium text-slate-700">Ghi nhớ đăng nhập</span>
              </label>

              {rememberMe && (username || studentCode) && (
                <button
                  type="button"
                  onClick={handleClearSaved}
                  className="text-xs text-slate-400 hover:text-rose-500 transition-colors"
                  title="Xoá thông tin tài khoản đã lưu trên thiết bị"
                >
                  Xoá tài khoản đã lưu
                </button>
              )}
            </div>

            <button 
              type="submit"
              className="w-full py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2 mt-6"
            >
              Đăng nhập
            </button>
            
            {selectedRole === 'parent' && (
              <div className="text-center mt-4">
                <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  Mã học sinh là <strong>Mã định danh</strong><br/>
                  Mật khẩu mặc định: <strong>12345678</strong>
                </p>
              </div>
            )}

          </form>
        </div>
      </div>
      </div>
    </div>
  );
}
