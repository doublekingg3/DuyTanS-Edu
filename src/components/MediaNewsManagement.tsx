import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  Upload, 
  Search, 
  Filter, 
  Heart, 
  Calendar, 
  User, 
  Edit3, 
  Trash2, 
  Maximize2, 
  Flame, 
  CheckCircle2, 
  Share2, 
  ShieldCheck, 
  Camera, 
  FolderPlus,
  Radio,
  BookOpen,
  Plus,
  Images,
  ArrowRight,
  ExternalLink,
  FileText
} from 'lucide-react';
import { SchoolActivityNews, UserAccount, initialSchoolActivities } from '../data';
import SchoolNewsGallery from './SchoolNewsGallery';

interface MediaNewsManagementProps {
  activities: SchoolActivityNews[];
  onAddActivity: (activity: Omit<SchoolActivityNews, 'id'>) => Promise<void> | void;
  onUpdateActivity: (id: string, updates: Partial<SchoolActivityNews>) => Promise<void> | void;
  onDeleteActivity: (id: string) => Promise<void> | void;
  currentUser?: UserAccount | null;
  role?: string;
}

export default function MediaNewsManagement({
  activities = [],
  onAddActivity,
  onUpdateActivity,
  onDeleteActivity,
  currentUser,
  role
}: MediaNewsManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const canEdit = role === 'admin' || role === 'media';

  const effectiveActivities = useMemo(() => {
    return activities && activities.length > 0 ? activities : initialSchoolActivities;
  }, [activities]);

  const stats = useMemo(() => {
    const total = effectiveActivities.length;
    const featured = effectiveActivities.filter(a => a.isFeatured).length;
    const totalLikes = effectiveActivities.reduce((acc, a) => acc + (a.likesCount || 0), 0);
    const categoriesCount = new Set(effectiveActivities.map(a => a.category)).size;
    return { total, featured, totalLikes, categoriesCount };
  }, [effectiveActivities]);

  const filteredList = useMemo(() => {
    return effectiveActivities.filter(act => {
      const matchCat = selectedCategory === 'all' || act.category === selectedCategory;
      const matchSearch = !searchTerm.trim() || 
        act.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        act.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        act.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (act.content && act.content.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [effectiveActivities, selectedCategory, searchTerm]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto bg-[#f0fdfa]/40 min-h-full">
      {/* Top Banner Card */}
      <div className="bg-white rounded-[22px] p-5 sm:p-6 border border-teal-100 shadow-sm shadow-teal-500/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm">
            <Camera className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-xl sm:text-2xl font-bold font-display text-slate-800 tracking-tight">
                Quản Lý Tin Tức & Hoạt Động Nhà Trường
              </h1>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                {role === 'media' ? 'Ban Truyền Thông' : 'Ban Giám Hiệu Quản Trị'}
              </span>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Trực tuyến
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Đăng bài viết phóng sự, hình ảnh phong trào học tập, văn thể mỹ, trải nghiệm sáng tạo tại Trường Phổ Thông Duy Tân
            </p>
          </div>
        </div>

        {/* User Badge */}
        <div className="flex items-center gap-3 shrink-0 self-start md:self-auto bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
          <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
            {role === 'media' ? 'TT' : 'BGH'}
          </div>
          <div className="text-left text-xs">
            <span className="block font-bold text-slate-800">{currentUser?.fullName || 'Phòng Truyền Thông'}</span>
            <span className="text-slate-400 text-[11px]">
              {role === 'media' ? 'Quyền Biên tập & Đăng tin' : 'Quyền Quản trị viên'}
            </span>
          </div>
        </div>
      </div>

      {/* 4 Summary Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase block mb-1">TỔNG SỐ BÀI ĐĂNG</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-800">{stats.total}</span>
            <span className="text-xs text-slate-500">bài viết</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-200/80 shadow-2xs bg-amber-50/20">
          <span className="text-[11px] font-bold text-amber-600 uppercase block mb-1 flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 fill-current" /> BÀI VIẾT TIÊU BIỂU
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-700">{stats.featured}</span>
            <span className="text-xs text-amber-600 font-medium">nổi bật trên banner</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-rose-200/80 shadow-2xs bg-rose-50/20">
          <span className="text-[11px] font-bold text-rose-600 uppercase block mb-1 flex items-center gap-1">
            <Heart className="w-3.5 h-3.5 fill-current" /> LƯỢT TƯƠNG TÁC
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-rose-700">{stats.totalLikes}</span>
            <span className="text-xs text-rose-600 font-medium">lượt yêu thích</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-teal-200/80 shadow-2xs bg-teal-50/20">
          <span className="text-[11px] font-bold text-teal-700 uppercase block mb-1">CHUYÊN MỤC PHONG TRÀO</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-teal-800">{stats.categoriesCount}</span>
            <span className="text-xs text-teal-700 font-medium">chủ đề hoạt động</span>
          </div>
        </div>
      </div>

      {/* Main Interactive Gallery Widget (Banner trượt + Xem bài viết đầy đủ) */}
      <SchoolNewsGallery
        activities={activities}
        onAddActivity={onAddActivity}
        onUpdateActivity={onUpdateActivity}
        onDeleteActivity={onDeleteActivity}
        canEdit={canEdit}
        currentUser={currentUser}
      />

      {/* Management Data Table */}
      <div className="bg-white rounded-[22px] border border-teal-100 shadow-sm shadow-teal-500/5 overflow-hidden flex flex-col">
        {/* Table Header with Search, Filter and Actions */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <h3 className="text-sm sm:text-base font-bold text-slate-800 uppercase tracking-wide">
              DANH SÁCH BÀI ĐĂNG HOẠT ĐỘNG
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 font-bold border border-teal-200">
              {filteredList.length} bài
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Box */}
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm tiêu đề, người đăng, nội dung..."
                className="w-48 sm:w-60 pl-8 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>

            {/* Category filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white font-medium cursor-pointer"
            >
              <option value="all">Tất cả chuyên mục</option>
              <option value="stem">Học tập & STEM</option>
              <option value="sports">Thể dục thể thao</option>
              <option value="arts">Văn nghệ & Hội trại</option>
              <option value="extracurricular">Ngoại khóa & Trải nghiệm</option>
              <option value="events">Lễ hội & Sự kiện</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto max-h-[460px] overflow-y-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead className="bg-[#0f766e] text-white uppercase text-[10px] sm:text-[11px] font-bold tracking-wider sticky top-0 z-10 select-none shadow-xs">
              <tr>
                <th className="px-3 sm:px-4 py-3 text-center w-12 text-teal-100">STT</th>
                <th className="px-3 sm:px-4 py-3 text-white whitespace-nowrap">ẢNH BÌA</th>
                <th className="px-3 sm:px-4 py-3 text-white whitespace-nowrap">TIÊU ĐỀ & LỜI DẪN BÀI VIẾT</th>
                <th className="px-3 py-3 text-center text-white whitespace-nowrap">ALBUM ẢNH</th>
                <th className="px-3 py-3 text-white whitespace-nowrap">CHUYÊN MỤC</th>
                <th className="hidden md:table-cell px-3 py-3 text-white whitespace-nowrap">NGƯỜI ĐĂNG</th>
                <th className="px-3 py-3 text-center text-white whitespace-nowrap">NGÀY ĐĂNG</th>
                <th className="px-2 py-3 text-center text-white whitespace-nowrap">YÊU THÍCH</th>
                <th className="px-2 py-3 text-center text-white whitespace-nowrap">TIÊU BIỂU</th>
                <th className="px-3 py-3 text-center text-white whitespace-nowrap">THAO TÁC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredList.length > 0 ? (
                filteredList.map((act, index) => (
                  <tr key={act.id} className="hover:bg-teal-50/40 transition-colors">
                    <td className="px-3 sm:px-4 py-3 text-center text-slate-400 font-bold">{index + 1}</td>
                    
                    <td className="px-3 sm:px-4 py-2.5">
                      <div className="w-16 h-11 rounded-lg overflow-hidden border border-slate-200 shrink-0 bg-slate-900">
                        <img 
                          src={act.imageUrl} 
                          alt={act.title} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                    </td>

                    <td className="px-3 sm:px-4 py-3">
                      <div className="font-bold text-slate-800 line-clamp-1 max-w-sm sm:max-w-md hover:text-teal-700 transition-colors">
                        {act.title}
                      </div>
                      <div className="text-[11px] text-slate-400 line-clamp-1">{act.description}</div>
                    </td>

                    <td className="px-3 py-3 text-center whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        <Images className="w-3 h-3 text-indigo-600" />
                        <span>{act.galleryImages?.length || 1} ảnh</span>
                      </span>
                    </td>

                    <td className="px-3 py-3 whitespace-nowrap">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200">
                        {act.categoryLabel}
                      </span>
                    </td>

                    <td className="hidden md:table-cell px-3 py-3 text-slate-600 text-xs whitespace-nowrap">
                      {act.author}
                    </td>

                    <td className="px-3 py-3 text-center text-slate-600 text-xs whitespace-nowrap">
                      {act.date}
                    </td>

                    <td className="px-2 py-3 text-center">
                      <span className="inline-flex items-center gap-1 font-bold text-rose-600 text-xs">
                        <Heart className="w-3.5 h-3.5 fill-current" />
                        <span>{act.likesCount || 0}</span>
                      </span>
                    </td>

                    <td className="px-2 py-3 text-center">
                      {act.isFeatured ? (
                        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-extrabold">
                          <Flame className="w-2.5 h-2.5 fill-current" /> Tiêu biểu
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">-</span>
                      )}
                    </td>

                    <td className="px-3 py-3 text-center whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        {canEdit && (
                          <button
                            onClick={() => {
                              if (window.confirm(`Bạn có chắc muốn xóa bài viết "${act.title}"?`)) {
                                onDeleteActivity(act.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Xóa bài đăng"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="px-6 py-8 text-center text-slate-400 italic">
                    Không tìm thấy bài viết hoạt động nào phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
