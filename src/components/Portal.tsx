import React from 'react';
import { Calendar, GraduationCap, ArrowRight } from 'lucide-react';

export default function Portal({ onSelectEduManager }: { onSelectEduManager: () => void }) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-200 mb-6">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold font-display text-slate-800 mb-4">Ứng dụng quản lý lớp học thông minh và ứng dụng sắp xếp thời khoá biểu AI.</h1>
          <p className="text-slate-500 text-lg">Vui lòng chọn hệ thống bạn muốn truy cập</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* 
            ↓↓↓ BẠN DÁN LINK TKB CỦA BẠN VÀO THUỘC TÍNH href Ở BÊN DƯỚI NHÉ ↓↓↓ 
            Ví dụ: href="https://tkb.truongcuaban.edu.vn" 
          */}
          <a
            href="https://tkb-081225.vercel.app/" 
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all duration-300 relative overflow-hidden flex flex-col items-center text-center"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 text-blue-600 group-hover:scale-110 transition-transform duration-300 relative z-10">
              <Calendar className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-3 relative z-10">Hệ thống TKB</h2>
            <p className="text-slate-500 mb-8 relative z-10">
              Phần mềm sắp xếp và quản lý thời khoá biểu thông minh dành cho nhà trường.
            </p>
            <div className="mt-auto flex items-center text-blue-600 font-semibold relative z-10 group-hover:gap-2 transition-all">
              <span>Truy cập TKB</span>
              <ArrowRight className="w-5 h-5 ml-1 transition-transform group-hover:translate-x-1" />
            </div>
          </a>
          {/* ↑↑↑ DÁN LINK VÀO ĐOẠN TRÊN ↑↑↑ */}

          <button
            onClick={onSelectEduManager}
            className="group bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-300 transition-all duration-300 relative overflow-hidden flex flex-col items-center text-center w-full"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-purple-50/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-20 h-20 bg-indigo-100 rounded-2xl flex items-center justify-center mb-6 text-indigo-600 group-hover:scale-110 transition-transform duration-300 relative z-10">
              <GraduationCap className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-3 relative z-10">EduManager Pro</h2>
            <p className="text-slate-500 mb-8 relative z-10">
              Hệ thống quản lý học sinh, điểm số, và thông tin học vụ toàn diện.
            </p>
            <div className="mt-auto flex items-center text-indigo-600 font-semibold relative z-10 group-hover:gap-2 transition-all">
              <span>Truy cập EduManager</span>
              <ArrowRight className="w-5 h-5 ml-1 transition-transform group-hover:translate-x-1" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
