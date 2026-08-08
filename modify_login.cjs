const fs = require('fs');
const file = 'src/components/Login.tsx';
let content = fs.readFileSync(file, 'utf8');

const importStatement = `import React, { useState } from 'react';
import { Shield, BookOpen, UserCircle, GraduationCap, ArrowRight, Lock, User, ArrowLeft } from 'lucide-react';
import { SchoolClass, Student, UserAccount, AppSettings } from '../data';`;

content = content.replace(/import React, \{ useState \} from 'react';\nimport \{ Shield, BookOpen, UserCircle, GraduationCap, ArrowRight, Lock, User, ArrowLeft \} from 'lucide-react';\nimport \{ SchoolClass, Student, UserAccount \} from '\.\.\/data';/, importStatement);

const propsSignature = `export default function Login({ 
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
  onLogin: (role: 'admin' | 'teacher' | 'parent', parentStudentId?: string, loggedInUserId?: string) => void,
  onBack?: () => void,
  settings?: AppSettings
}) {`;

content = content.replace(/export default function Login\(\{ \s*classes, \s*students,\s*users,\s*onLogin,\s*onBack\s*\}\: \{\s*classes: SchoolClass\[\],\s*students: Student\[\],\s*users: UserAccount\[\],\s*onLogin: \(role: 'admin' \| 'teacher' \| 'parent', parentStudentId\?: string, loggedInUserId\?: string\) => void,\s*onBack\?: \(\) => void\s*\}\) \{/, propsSignature);

const logoRender = `        <div className="bg-indigo-600 p-8 text-center text-white">
          {settings?.loginLogo ? (
            <img src={settings.loginLogo} alt="Logo" className="h-20 object-contain mx-auto mb-4 drop-shadow-md" />
          ) : (
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
          )}
          <h1 className="text-2xl font-bold font-display">{settings?.appName || "EduManage Pro"}</h1>`;

content = content.replace(/        <div className="bg-indigo-600 p-8 text-center text-white">\n          <div className="w-16 h-16 bg-white\/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">\n            <GraduationCap className="w-8 h-8 text-white" \/>\n          <\/div>\n          <h1 className="text-2xl font-bold font-display">EduManage Pro<\/h1>/, logoRender);

fs.writeFileSync(file, content);
