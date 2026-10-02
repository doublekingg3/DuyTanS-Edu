import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Sparkles, 
  Layers, 
  Grid, 
  RotateCcw, 
  Upload, 
  Heart, 
  Maximize2, 
  Trash2, 
  Edit3, 
  ChevronLeft, 
  ChevronRight, 
  Pause, 
  Play, 
  Calendar, 
  User, 
  X, 
  Plus, 
  Image as ImageIcon,
  CheckCircle,
  ExternalLink,
  Flame,
  Clock,
  BookOpen,
  FileText,
  Share2,
  Copy,
  Check,
  Tag,
  Camera,
  Images,
  ArrowRight
} from 'lucide-react';
import { SchoolActivityNews, UserAccount, initialSchoolActivities } from '../data';
import { useLanguage } from '../contexts/LanguageContext';

interface SchoolNewsGalleryProps {
  activities: SchoolActivityNews[];
  onAddActivity?: (activity: Omit<SchoolActivityNews, 'id'>) => Promise<void> | void;
  onUpdateActivity?: (id: string, updates: Partial<SchoolActivityNews>) => Promise<void> | void;
  onDeleteActivity?: (id: string) => Promise<void> | void;
  canEdit?: boolean;
  currentUser?: UserAccount | null;
  className?: string;
  onSelectArticleExternal?: (act: SchoolActivityNews) => void;
  externalArticleToView?: SchoolActivityNews | null;
  onCloseExternalArticle?: () => void;
  triggerUploadModal?: boolean;
  onResetTriggerUpload?: () => void;
}

const CATEGORIES = [
  { id: 'all', label: 'Tất cả' },
  { id: 'stem', label: 'Học tập & STEM' },
  { id: 'sports', label: 'Thể dục thể thao' },
  { id: 'arts', label: 'Văn nghệ & Hội trại' },
  { id: 'extracurricular', label: 'Ngoại khóa & Trải nghiệm' },
  { id: 'events', label: 'Lễ hội & Sự kiện' },
];

/**
 * Nén ảnh tự động qua canvas trước khi lưu
 */
const compressImageFile = (file: File, maxDim = 1200, quality = 0.78): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export default function SchoolNewsGallery({
  activities = [],
  onAddActivity,
  onUpdateActivity,
  onDeleteActivity,
  canEdit = false,
  currentUser,
  className = "",
  externalArticleToView = null,
  onCloseExternalArticle,
  triggerUploadModal = false,
  onResetTriggerUpload
}: SchoolNewsGalleryProps) {
  const { t, isEn } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'carousel' | 'grid'>('carousel');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [editingActivity, setEditingActivity] = useState<SchoolActivityNews | null>(null);
  const [fullscreenImage, setFullscreenImage] = useState<SchoolActivityNews | null>(null);
  const [likeAnimationId, setLikeAnimationId] = useState<string | null>(null);

  // Modal xem bài viết chi tiết đầy đủ (Article Reader Modal)
  const [selectedArticle, setSelectedArticle] = useState<SchoolActivityNews | null>(null);
  // Modal phóng to ảnh album chi tiết trong bài viết (Lightbox)
  const [lightboxPhotoIndex, setLightboxPhotoIndex] = useState<number | null>(null);
  const [copiedLinkToast, setCopiedLinkToast] = useState(false);

  // Synchronize external article view trigger
  useEffect(() => {
    if (externalArticleToView) {
      setSelectedArticle(externalArticleToView);
      setLightboxPhotoIndex(null);
    }
  }, [externalArticleToView]);

  // Synchronize external upload trigger
  useEffect(() => {
    if (triggerUploadModal) {
      setIsUploadModalOpen(true);
      setEditingActivity(null);
      setFormTitle('');
      setFormCategory('stem');
      setFormDate(new Date().toISOString().split('T')[0]);
      setFormAuthor(currentUser?.fullName || 'Phòng Truyền Thông');
      setFormDescription('');
      setFormContent('');
      setFormImageUrl('');
      setFormGalleryImages([]);
      setAlbumUrlInput('');
      setFormIsFeatured(true);
      onResetTriggerUpload?.();
    }
  }, [triggerUploadModal, currentUser, onResetTriggerUpload]);

  const handleCloseArticle = () => {
    setSelectedArticle(null);
    onCloseExternalArticle?.();
  };

  // Form states cho Đăng / Chỉnh sửa bài viết
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('stem');
  const [formDate, setFormDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [formAuthor, setFormAuthor] = useState(() => currentUser?.fullName || 'Phòng Truyền Thông');
  const [formDescription, setFormDescription] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formGalleryImages, setFormGalleryImages] = useState<string[]>([]);
  const [albumUrlInput, setAlbumUrlInput] = useState('');
  const [formIsFeatured, setFormIsFeatured] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const bannerFileInputRef = useRef<HTMLInputElement>(null);
  const galleryFileInputRef = useRef<HTMLInputElement>(null);

  // Effective activities with fallback
  const effectiveActivities = useMemo(() => {
    return activities && activities.length > 0 ? activities : initialSchoolActivities;
  }, [activities]);

  // Filter activities
  const filteredActivities = useMemo(() => {
    if (selectedCategory === 'all') return effectiveActivities;
    return effectiveActivities.filter(a => a.category === selectedCategory);
  }, [effectiveActivities, selectedCategory]);

  // Keep index in range
  useEffect(() => {
    if (currentIndex >= filteredActivities.length) {
      setCurrentIndex(0);
    }
  }, [filteredActivities.length, currentIndex]);

  // Autoplay carousel timer
  useEffect(() => {
    if (!isPlaying || viewMode !== 'carousel' || filteredActivities.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % filteredActivities.length);
    }, 5500);

    return () => clearInterval(timer);
  }, [isPlaying, viewMode, filteredActivities.length]);

  const currentActivity = filteredActivities[currentIndex] || filteredActivities[0];

  const handlePrev = () => {
    setCurrentIndex(prev => (prev - 1 + filteredActivities.length) % filteredActivities.length);
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev + 1) % filteredActivities.length);
  };

  const handleLike = async (act: SchoolActivityNews, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!onUpdateActivity) return;
    setLikeAnimationId(act.id);
    setTimeout(() => setLikeAnimationId(null), 800);

    const currentLikes = act.likesCount || 0;
    const newCount = currentLikes + 1;
    await onUpdateActivity(act.id, {
      likesCount: newCount
    });

    // Cập nhật realtime cho bài đang mở nếu trùng
    if (selectedArticle && selectedArticle.id === act.id) {
      setSelectedArticle(prev => prev ? { ...prev, likesCount: newCount } : null);
    }
  };

  const handleDelete = async (act: SchoolActivityNews, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!canEdit || !onDeleteActivity) return;
    if (window.confirm(`Bạn có chắc muốn xóa bài viết hoạt động "${act.title}"?`)) {
      await onDeleteActivity(act.id);
      if (selectedArticle && selectedArticle.id === act.id) {
        setSelectedArticle(null);
      }
      if (currentIndex > 0 && currentIndex >= filteredActivities.length - 1) {
        setCurrentIndex(prev => prev - 1);
      }
    }
  };

  // Mở modal Đăng bài viết / Chỉnh sửa bài viết
  const handleOpenUpload = (act?: SchoolActivityNews) => {
    if (act) {
      setEditingActivity(act);
      setFormTitle(act.title);
      setFormCategory(act.category || 'stem');
      setFormDate(act.date || new Date().toISOString().split('T')[0]);
      setFormAuthor(act.author || currentUser?.fullName || 'Phòng Truyền Thông');
      setFormDescription(act.description || '');
      setFormContent(act.content || '');
      setFormImageUrl(act.imageUrl || '');
      setFormGalleryImages(act.galleryImages || []);
      setFormIsFeatured(!!act.isFeatured);
    } else {
      setEditingActivity(null);
      setFormTitle('');
      setFormCategory(selectedCategory !== 'all' ? selectedCategory : 'stem');
      setFormDate(new Date().toISOString().split('T')[0]);
      setFormAuthor(currentUser?.fullName || 'Phòng Truyền Thông');
      setFormDescription('');
      setFormContent('');
      setFormImageUrl('');
      setFormGalleryImages([]);
      setFormIsFeatured(true);
    }
    setAlbumUrlInput('');
    setIsUploadModalOpen(true);
  };

  // Chọn ảnh banner từ máy
  const handleBannerFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImageFile(file, 1400, 0.8);
      setFormImageUrl(compressed);
    } catch (err) {
      console.warn('Lỗi nén ảnh, fallback sang đọc trực tiếp:', err);
      const reader = new FileReader();
      reader.onload = (re) => {
        if (re.target?.result) setFormImageUrl(re.target.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Chọn nhiều ảnh cho album bài viết từ máy
  const handleGalleryFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newPhotos: string[] = [];
    for (let i = 0; i < files.length; i++) {
      try {
        const compressed = await compressImageFile(files[i], 1200, 0.75);
        newPhotos.push(compressed);
      } catch (err) {
        console.warn('Lỗi nén ảnh album:', err);
      }
    }

    if (newPhotos.length > 0) {
      setFormGalleryImages(prev => [...prev, ...newPhotos]);
    }
    e.target.value = '';
  };

  // Thêm ảnh vào album qua liên kết URL
  const handleAddAlbumUrl = () => {
    if (!albumUrlInput.trim()) return;
    setFormGalleryImages(prev => [...prev, albumUrlInput.trim()]);
    setAlbumUrlInput('');
  };

  // Xóa 1 ảnh trong album khi đang soạn bài
  const handleRemoveGalleryPhoto = (index: number) => {
    setFormGalleryImages(prev => prev.filter((_, i) => i !== index));
  };

  // Lưu bài viết vào hệ thống
  const handleSaveActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      alert('Vui lòng nhập tiêu đề bài viết');
      return;
    }
    const finalImageUrl = formImageUrl.trim() || 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1200&q=80';

    setIsSubmitting(true);
    try {
      const catObj = CATEGORIES.find(c => c.id === formCategory);
      const categoryLabel = catObj ? catObj.label : 'Hoạt động nhà trường';

      const postData: Partial<SchoolActivityNews> = {
        title: formTitle.trim(),
        category: formCategory,
        categoryLabel,
        imageUrl: finalImageUrl,
        galleryImages: formGalleryImages,
        content: formContent.trim(),
        date: formDate,
        author: formAuthor.trim(),
        description: formDescription.trim(),
        isFeatured: formIsFeatured
      };

      if (editingActivity && onUpdateActivity) {
        await onUpdateActivity(editingActivity.id, postData);
        if (selectedArticle && selectedArticle.id === editingActivity.id) {
          setSelectedArticle(prev => prev ? ({ ...prev, ...postData } as SchoolActivityNews) : null);
        }
      } else if (onAddActivity) {
        await onAddActivity({
          title: formTitle.trim(),
          category: formCategory,
          categoryLabel,
          imageUrl: finalImageUrl,
          galleryImages: formGalleryImages,
          content: formContent.trim(),
          date: formDate,
          author: formAuthor.trim(),
          description: formDescription.trim(),
          isFeatured: formIsFeatured,
          isRecent: true,
          likesCount: 1,
          createdAt: new Date().toISOString()
        });
      }
      setIsUploadModalOpen(false);
    } catch (err) {
      console.error('Lỗi lưu bài viết:', err);
      alert('Có lỗi xảy ra khi lưu bài viết. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Sao chép link bài viết để chia sẻ
  const handleShareArticle = (act: SchoolActivityNews) => {
    try {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLinkToast(true);
      setTimeout(() => setCopiedLinkToast(false), 2500);
    } catch (e) {
      alert(`Đã sao chép liên kết bài viết: ${act.title}`);
    }
  };

  // Mở modal bài viết đầy đủ
  const handleOpenArticle = (act: SchoolActivityNews, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedArticle(act);
    setLightboxPhotoIndex(null);
  };

  // Danh sách ảnh trong album của bài viết đang xem
  const currentArticlePhotos = useMemo(() => {
    if (!selectedArticle) return [];
    const list = selectedArticle.galleryImages && selectedArticle.galleryImages.length > 0 
      ? selectedArticle.galleryImages 
      : [selectedArticle.imageUrl];
    return list;
  }, [selectedArticle]);

  return (
    <div className={`bg-white rounded-[24px] border border-teal-100 shadow-sm shadow-teal-500/5 overflow-hidden flex flex-col ${className}`}>
      
      {/* 1. TOP HEADER BAR */}
      <div className="p-4 sm:p-5 border-b border-teal-100/70 bg-gradient-to-r from-teal-50/70 via-white to-emerald-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-500 text-white flex items-center justify-center shadow-xs shrink-0">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold font-sans text-slate-800 tracking-tight">
                {t('schoolActivitiesHeader')}
              </h2>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 font-sans">
                <Sparkles className="w-3 h-3 text-teal-600" />
                {filteredActivities.length} {isEn ? 'posts' : 'bài đăng'}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-sans font-normal mt-0.5">
              {t('schoolActivitiesSub')}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          {/* View mode toggle (Carousel vs Grid) */}
          <div className="inline-flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600">
            <button
              onClick={() => setViewMode('carousel')}
              className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'carousel'
                  ? 'bg-white text-teal-800 font-bold shadow-xs'
                  : 'hover:text-slate-900'
              }`}
              title={isEn ? "Banner Carousel Slider Mode" : "Chế độ Trình diễn Banner lướt (Slider)"}
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{isEn ? 'Slider' : 'Trình diễn'}</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-teal-800 font-bold shadow-xs'
                  : 'hover:text-slate-900'
              }`}
              title={isEn ? "Article Grid Mode" : "Chế độ Lưới bài viết"}
            >
              <Grid className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{isEn ? 'Grid' : 'Lưới tin'}</span>
            </button>
          </div>

          {/* Reset slide button */}
          <button
            onClick={() => {
              setCurrentIndex(0);
              setIsPlaying(true);
            }}
            className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-600 transition-colors cursor-pointer"
            title={isEn ? "Restart from first slide" : "Xem lại từ đầu"}
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* ĐĂNG BÀI VIẾT BUTTON */}
          {canEdit && (
            <button
              onClick={() => handleOpenUpload()}
              className="bg-teal-gradient hover:opacity-95 text-white text-xs sm:text-sm font-bold px-4 py-2 rounded-xl shadow-xs flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
              title="Đăng bài viết mới"
            >
              <Plus className="w-4 h-4" />
              <span>Đăng bài viết</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. CATEGORY TABS BAR */}
      <div className="px-4 py-2.5 sm:px-6 bg-white border-b border-slate-100 flex items-center gap-2 overflow-x-auto text-xs no-scrollbar select-none">
        <span className="text-[11px] font-extrabold text-slate-400 tracking-wider uppercase shrink-0 mr-1">
          CHUYÊN MỤC:
        </span>
        {CATEGORIES.map(cat => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                setCurrentIndex(0);
              }}
              className={`px-3.5 py-1.5 rounded-full transition-all whitespace-nowrap font-medium cursor-pointer ${
                isActive
                  ? 'bg-[#0f766e] text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* 3. MAIN DISPLAY AREA */}
      {filteredActivities.length === 0 ? (
        <div className="p-12 text-center text-slate-400">
          <ImageIcon className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <p className="font-semibold text-slate-600">Chưa có bài viết hoạt động nào trong chuyên mục này.</p>
          {canEdit && (
            <button
              onClick={() => handleOpenUpload()}
              className="mt-3 px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold hover:bg-teal-700 transition-colors flex items-center gap-1.5 mx-auto cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Đăng bài viết ngay</span>
            </button>
          )}
        </div>
      ) : viewMode === 'carousel' ? (
        /* CAROUSEL SLIDER VIEW MODE */
        <div className="relative p-3 sm:p-5 bg-slate-900/5">
          <div className="relative rounded-[22px] overflow-hidden bg-slate-950 aspect-[16/9] md:aspect-[21/9] min-h-[380px] max-h-[460px] w-full shadow-lg group select-none">
            
            {/* Background Image (Cover Banner) */}
            <img 
              src={currentActivity?.imageUrl} 
              alt={currentActivity?.title}
              key={currentActivity?.id}
              className="w-full h-full object-cover object-center transition-all duration-700 ease-out transform group-hover:scale-102 cursor-pointer"
              onClick={() => currentActivity && handleOpenArticle(currentActivity)}
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80';
              }}
            />

            {/* Gradient Overlays */}
            <div 
              onClick={() => currentActivity && handleOpenArticle(currentActivity)}
              className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent cursor-pointer" 
            />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-transparent to-transparent pointer-events-none" />

            {/* Top-Left Badges */}
            <div className="absolute top-4 left-4 sm:top-5 sm:left-5 flex flex-wrap items-center gap-2 z-10">
              <span className="px-3 py-1 bg-teal-600/90 text-white text-xs font-bold rounded-full backdrop-blur-md shadow-xs border border-teal-400/30">
                {currentActivity?.categoryLabel || 'Hoạt động nhà trường'}
              </span>

              {currentActivity?.isFeatured && (
                <span className="px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-extrabold rounded-full backdrop-blur-md shadow-xs flex items-center gap-1 border border-amber-300/40">
                  <Flame className="w-3.5 h-3.5 fill-current" />
                  <span>Tiêu biểu</span>
                </span>
              )}

              {/* Photo album count badge */}
              <span className="px-2.5 py-1 bg-black/40 text-teal-300 text-xs font-bold rounded-full backdrop-blur-md shadow-xs border border-white/20 flex items-center gap-1">
                <Images className="w-3.5 h-3.5" />
                <span>{currentActivity?.galleryImages?.length || 1} ảnh</span>
              </span>
            </div>

            {/* Top-Right Action Controls */}
            <div className="absolute top-4 right-4 sm:top-5 sm:right-5 flex items-center gap-2 z-10">
              {/* Like Button */}
              <button
                onClick={(e) => currentActivity && handleLike(currentActivity, e)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-md transition-all shadow-xs cursor-pointer ${
                  likeAnimationId === currentActivity?.id
                    ? 'scale-110 bg-rose-600 text-white'
                    : 'bg-black/40 hover:bg-black/60 text-white'
                }`}
                title="Yêu thích bài viết"
              >
                <Heart className={`w-3.5 h-3.5 ${currentActivity?.likesCount ? 'fill-rose-500 text-rose-500' : 'text-white'}`} />
                <span>{currentActivity?.likesCount || 0}</span>
              </button>

              {/* Edit Button */}
              {canEdit && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (currentActivity) handleOpenUpload(currentActivity);
                  }}
                  className="p-2 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white transition-all shadow-xs cursor-pointer"
                  title="Chỉnh sửa bài viết"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              )}

              {/* Delete Button */}
              {canEdit && (
                <button
                  onClick={(e) => currentActivity && handleDelete(currentActivity, e)}
                  className="p-2 rounded-full bg-rose-600/80 hover:bg-rose-600 backdrop-blur-md text-white transition-all shadow-xs cursor-pointer"
                  title="Xóa bài viết này"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Navigation Arrows */}
            {filteredActivities.length > 1 && (
              <>
                <button
                  onClick={handlePrev}
                  className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/75 backdrop-blur-md text-white flex items-center justify-center transition-all z-10 shadow-md cursor-pointer hover:scale-105 active:scale-95"
                  title="Tin trước"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/75 backdrop-blur-md text-white flex items-center justify-center transition-all z-10 shadow-md cursor-pointer hover:scale-105 active:scale-95"
                  title="Tin tiếp theo"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Bottom Overlay Info & Click to Read */}
            <div 
              onClick={() => currentActivity && handleOpenArticle(currentActivity)}
              className="absolute bottom-16 sm:bottom-18 left-4 right-4 sm:left-6 sm:right-6 z-10 text-white cursor-pointer group/title"
            >
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 font-medium mb-1.5">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-teal-400" />
                  <span>{currentActivity?.date}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-teal-400" />
                  <span>{currentActivity?.author}</span>
                </span>
                <span>•</span>
                <span className="text-teal-300 font-bold">
                  Tin {currentIndex + 1} / {filteredActivities.length}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                <div className="max-w-3xl">
                  <h3 className="text-lg sm:text-2xl font-extrabold font-sans tracking-tight text-white mb-1.5 drop-shadow-md line-clamp-1 group-hover/title:text-teal-200 transition-colors">
                    {currentActivity?.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-200 font-medium line-clamp-2 drop-shadow">
                    {currentActivity?.description}
                  </p>
                </div>

                {/* Big Button: Xem bài viết đầy đủ */}
                <button
                  type="button"
                  onClick={(e) => currentActivity && handleOpenArticle(currentActivity, e)}
                  className="self-start sm:self-auto shrink-0 bg-white/20 hover:bg-teal-600 backdrop-blur-md text-white text-xs font-bold px-3.5 py-2 rounded-xl border border-white/30 flex items-center gap-1.5 transition-all shadow-sm hover:scale-105"
                >
                  <BookOpen className="w-4 h-4 text-teal-300" />
                  <span>Xem bài viết chi tiết</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Bottom Control Strip */}
            <div className="absolute bottom-0 inset-x-0 bg-slate-950/85 backdrop-blur-md px-3 sm:px-5 py-2.5 flex items-center justify-between gap-3 z-10 border-t border-white/10">
              {/* Play/Pause Autoplay button */}
              <button
                onClick={() => setIsPlaying(prev => !prev)}
                className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5 text-amber-400" />
                    <span>Tạm dừng</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 text-emerald-400 fill-current" />
                    <span>Tiếp tục</span>
                  </>
                )}
              </button>

              {/* Thumbnails strip */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar max-w-xl py-0.5">
                {filteredActivities.map((act, idx) => {
                  const isActive = idx === currentIndex;
                  return (
                    <button
                      key={act.id}
                      onClick={() => setCurrentIndex(idx)}
                      className={`relative w-12 h-8 sm:w-14 sm:h-9 rounded-lg overflow-hidden shrink-0 transition-all cursor-pointer border ${
                        isActive 
                          ? 'border-teal-400 ring-2 ring-teal-400/80 scale-105 opacity-100 z-10' 
                          : 'border-white/20 opacity-60 hover:opacity-100'
                      }`}
                      title={act.title}
                    >
                      <img 
                        src={act.imageUrl} 
                        alt={act.title} 
                        className="w-full h-full object-cover" 
                      />
                    </button>
                  );
                })}
              </div>

              {/* Read button in control bar */}
              <button
                onClick={() => currentActivity && handleOpenArticle(currentActivity)}
                className="text-xs text-teal-300 hover:text-white font-bold hidden sm:flex items-center gap-1 transition-colors cursor-pointer shrink-0"
              >
                <span>Mở bài viết</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* GRID GALLERY VIEW MODE */
        <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {filteredActivities.map((act) => (
            <div 
              key={act.id}
              onClick={() => handleOpenArticle(act)}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col group cursor-pointer"
            >
              {/* Image Container with Badges */}
              <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
                <img 
                  src={act.imageUrl} 
                  alt={act.title}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80';
                  }}
                />
                
                {/* Category Badge */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#0f766e]/90 text-white backdrop-blur-xs shadow-2xs">
                    {act.categoryLabel}
                  </span>
                  {act.isFeatured && (
                    <span className="p-1 rounded-full bg-amber-500 text-white shadow-2xs" title="Tiêu biểu">
                      <Flame className="w-3 h-3 fill-current" />
                    </span>
                  )}
                </div>

                {/* Album Photo Count Badge */}
                <div className="absolute bottom-2.5 right-2.5 bg-black/60 backdrop-blur-xs text-white text-[11px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1">
                  <Images className="w-3 h-3 text-teal-300" />
                  <span>{act.galleryImages?.length || 1} ảnh</span>
                </div>

                {/* Like Button on Thumbnail */}
                <button
                  onClick={(e) => handleLike(act, e)}
                  className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-black/50 hover:bg-black/70 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-2xs cursor-pointer transition-colors"
                >
                  <Heart className={`w-3 h-3 ${act.likesCount ? 'fill-rose-500 text-rose-500' : 'text-white'}`} />
                  <span>{act.likesCount || 0}</span>
                </button>
              </div>

              {/* Content Block */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium mb-1.5">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-teal-600" />
                      {act.date}
                    </span>
                    <span>•</span>
                    <span className="truncate">{act.author}</span>
                  </div>

                  <h3 className="font-bold text-slate-800 text-sm leading-snug line-clamp-2 group-hover:text-teal-700 transition-colors mb-1.5">
                    {act.title}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {act.description}
                  </p>
                </div>

                {/* Card Footer */}
                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-teal-700 flex items-center gap-1 group-hover:underline">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Xem bài viết</span>
                  </span>

                  {canEdit && (
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleOpenUpload(act)}
                        className="p-1 text-slate-400 hover:text-teal-600 rounded transition-colors"
                        title="Sửa bài viết"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(act, e)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                        title="Xóa bài viết"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================
          4. ARTICLE READER MODAL (XEM TOÀN BỘ BÀI VIẾT & ALBUM ẢNH)
          ======================================================== */}
      {selectedArticle && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-in fade-in"
          onClick={handleCloseArticle}
        >
          <div 
            className="bg-white rounded-[28px] border border-slate-100 shadow-2xl max-w-4xl w-full max-h-[92vh] overflow-hidden flex flex-col select-text"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Sticky Bar */}
            <div className="px-5 sm:px-7 py-3.5 border-b border-slate-100 bg-white/95 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <span className="px-3 py-1 bg-teal-50 text-teal-800 text-xs font-bold rounded-full border border-teal-200 shrink-0">
                  {selectedArticle.categoryLabel}
                </span>
                <span className="text-xs text-slate-400 hidden sm:inline">•</span>
                <span className="text-xs font-semibold text-slate-500 hidden sm:flex items-center gap-1 shrink-0">
                  <Calendar className="w-3.5 h-3.5 text-teal-600" />
                  {selectedArticle.date}
                </span>
              </div>

              {/* Controls right */}
              <div className="flex items-center gap-2">
                {/* Like Button */}
                <button
                  onClick={() => handleLike(selectedArticle)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    likeAnimationId === selectedArticle.id
                      ? 'bg-rose-50 text-rose-600 ring-2 ring-rose-400'
                      : 'bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-700'
                  }`}
                  title="Yêu thích bài viết"
                >
                  <Heart className={`w-4 h-4 ${selectedArticle.likesCount ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}`} />
                  <span>{selectedArticle.likesCount || 0}</span>
                </button>

                {/* Share Button */}
                <button
                  onClick={() => handleShareArticle(selectedArticle)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Chia sẻ liên kết bài viết"
                >
                  {copiedLinkToast ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span className="text-emerald-700">Đã chép link</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4 text-slate-500" />
                      <span>Chia sẻ</span>
                    </>
                  )}
                </button>

                {/* Edit Button for Admin/Media */}
                {canEdit && (
                  <button
                    onClick={() => {
                      handleOpenUpload(selectedArticle);
                    }}
                    className="p-2 text-slate-500 hover:text-teal-700 hover:bg-teal-50 rounded-xl transition-colors cursor-pointer"
                    title="Chỉnh sửa bài viết này"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                )}

                {/* Close Button */}
                <button
                  onClick={handleCloseArticle}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer ml-1"
                  title="Đóng bài viết"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Article Body */}
            <div className="overflow-y-auto p-5 sm:p-8 space-y-6">
              
              {/* Article Title & Metadata */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-medium">
                  <span className="flex items-center gap-1 text-teal-700 font-bold">
                    <User className="w-3.5 h-3.5" />
                    {selectedArticle.author || 'Phòng Truyền Thông'}
                  </span>
                  <span>•</span>
                  <span>{selectedArticle.date}</span>
                  <span>•</span>
                  <span className="text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Khoảng 3 phút đọc
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold font-sans text-slate-900 tracking-tight leading-snug">
                  {selectedArticle.title}
                </h1>
              </div>

              {/* Cover Banner Image */}
              <div className="space-y-1.5">
                <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 shadow-sm max-h-[440px]">
                  <img 
                    src={selectedArticle.imageUrl} 
                    alt={selectedArticle.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-semibold flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-teal-300" />
                    <span>Ảnh Banner chính</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 italic text-center">
                  * Hình ảnh hoạt động tiêu biểu tại Trường Phổ Thông Duy Tân ({selectedArticle.date})
                </p>
              </div>

              {/* Sapo / Lead Summary */}
              {selectedArticle.description && (
                <div className="p-4 sm:p-5 rounded-2xl bg-teal-50/70 border-l-4 border-teal-600 text-slate-700 text-sm sm:text-base font-semibold leading-relaxed italic shadow-2xs">
                  "{selectedArticle.description}"
                </div>
              )}

              {/* Detailed Article Content */}
              <div className="prose prose-slate max-w-none text-slate-800 text-sm sm:text-base leading-relaxed space-y-4">
                {selectedArticle.content ? (
                  selectedArticle.content.split('\n\n').map((paragraph, idx) => (
                    <p key={idx} className="leading-relaxed">
                      {paragraph}
                    </p>
                  ))
                ) : (
                  <>
                    <p>
                      Trường Phổ Thông Duy Tân luôn chú trọng tạo dựng môi trường học tập toàn diện, nơi các em học sinh không chỉ được trau dồi tri thức học thuật vững vàng mà còn được thỏa sức phát triển đam mê, kỹ năng sáng tạo và thể lực qua các phong trào ngoại khóa bổ ích.
                    </p>
                    <p>
                      Hoạt động <strong>"{selectedArticle.title}"</strong> là một trong những điểm nhấn nổi bật trong chuỗi chương trình giáo dục trải nghiệm của nhà trường năm học 2026. Sự kiện đã thu hút đông đảo thầy cô giáo, các em học sinh và sự đồng hành nhiệt tình từ quý phụ huynh.
                    </p>
                    <p>
                      Thông qua hoạt động này, các em học sinh được rèn luyện tinh thần làm việc nhóm, bản lĩnh tự tin trước đám đông và bồi dưỡng những giá trị nhân văn cao đẹp. Nhà trường xin gửi lời tri ân chân thành tới tập thể quý thầy cô, ban đại diện cha mẹ học sinh đã cùng chung tay tạo nên một ngày hội đầy ý nghĩa và thành công trọn vẹn.
                    </p>
                  </>
                )}
              </div>

              {/* ========================================================
                  PHOTO ALBUM / GALLERY CỦA BÀI VIẾT (NHIỀU HÌNH ẢNH HƠN)
                  ======================================================== */}
              <div className="pt-4 border-t border-slate-200 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Images className="w-5 h-5 text-teal-600" />
                    <h3 className="font-bold text-base sm:text-lg text-slate-800 font-sans">
                      Album hình ảnh hoạt động ({currentArticlePhotos.length} ảnh)
                    </h3>
                  </div>
                  <span className="text-xs text-slate-400 font-medium">
                    Nhấp vào ảnh để phóng to
                  </span>
                </div>

                {/* Photo Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-3.5">
                  {currentArticlePhotos.map((photoUrl, pIdx) => (
                    <div
                      key={pIdx}
                      onClick={() => setLightboxPhotoIndex(pIdx)}
                      className="group relative aspect-[4/3] rounded-xl overflow-hidden border border-slate-200 bg-slate-900 cursor-pointer shadow-2xs hover:shadow-md transition-all"
                    >
                      <img 
                        src={photoUrl} 
                        alt={`Ảnh ${pIdx + 1} - ${selectedArticle.title}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                        <Maximize2 className="w-5 h-5 drop-shadow" />
                      </div>
                      <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 bg-black/60 rounded text-[10px] text-white font-bold">
                        #{pIdx + 1}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Article Footer & Author Info */}
              <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 p-4 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-teal-700 text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
                    DT
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">
                      {selectedArticle.author || 'Phòng Truyền Thông'}
                    </h4>
                    <p className="text-xs text-slate-500">
                      Ban Truyền Thông & Sự Kiện • Trường Phổ Thông Duy Tân
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleLike(selectedArticle)}
                    className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-rose-200"
                  >
                    <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                    <span>Thả tim ({selectedArticle.likesCount || 0})</span>
                  </button>
                  <button
                    onClick={() => handleShareArticle(selectedArticle)}
                    className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Chia sẻ</span>
                  </button>
                </div>
              </div>

              {/* Related Activities Section */}
              <div className="pt-6 border-t border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wide">
                  CÁC BÀI VIẾT HOẠT ĐỘNG KHÁC
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {effectiveActivities
                    .filter(a => a.id !== selectedArticle.id)
                    .slice(0, 3)
                    .map(rel => (
                      <div
                        key={rel.id}
                        onClick={() => setSelectedArticle(rel)}
                        className="bg-white rounded-xl border border-slate-200 p-2.5 flex items-center gap-3 hover:border-teal-400 hover:shadow-xs transition-all cursor-pointer group"
                      >
                        <div className="w-16 h-12 rounded-lg overflow-hidden shrink-0 bg-slate-900">
                          <img 
                            src={rel.imageUrl} 
                            alt={rel.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] font-bold text-teal-700 block mb-0.5">
                            {rel.categoryLabel}
                          </span>
                          <h5 className="font-bold text-xs text-slate-800 line-clamp-1 group-hover:text-teal-700">
                            {rel.title}
                          </h5>
                          <span className="text-[10px] text-slate-400">{rel.date}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          5. ALBUM PHOTO LIGHTBOX (PHÓNG TO TỪNG ẢNH TRONG ALBUM)
          ======================================================== */}
      {lightboxPhotoIndex !== null && selectedArticle && (
        <div 
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/95 p-3 sm:p-6 backdrop-blur-md animate-in fade-in"
          onClick={() => setLightboxPhotoIndex(null)}
        >
          <div className="relative max-w-5xl w-full max-h-[92vh] flex flex-col items-center select-none" onClick={(e) => e.stopPropagation()}>
            {/* Top Bar with counter & close */}
            <div className="w-full flex items-center justify-between text-white mb-2.5 px-2">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-bold bg-white/20 px-3 py-1 rounded-full">
                  Ảnh {lightboxPhotoIndex + 1} / {currentArticlePhotos.length}
                </span>
                <span className="text-xs text-slate-300 truncate max-w-xs sm:max-w-md">
                  {selectedArticle.title}
                </span>
              </div>

              <button
                onClick={() => setLightboxPhotoIndex(null)}
                className="p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
                title="Đóng ảnh"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Photo Container */}
            <div className="relative rounded-2xl overflow-hidden max-h-[75vh] border border-white/20 shadow-2xl bg-black flex items-center justify-center">
              <img 
                src={currentArticlePhotos[lightboxPhotoIndex]} 
                alt={`Ảnh ${lightboxPhotoIndex + 1}`}
                className="max-h-[75vh] max-w-full w-auto object-contain mx-auto"
              />

              {/* Prev Photo */}
              {currentArticlePhotos.length > 1 && (
                <button
                  onClick={() => setLightboxPhotoIndex(prev => prev !== null ? (prev - 1 + currentArticlePhotos.length) % currentArticlePhotos.length : 0)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-colors cursor-pointer"
                  title="Ảnh trước"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              )}

              {/* Next Photo */}
              {currentArticlePhotos.length > 1 && (
                <button
                  onClick={() => setLightboxPhotoIndex(prev => prev !== null ? (prev + 1) % currentArticlePhotos.length : 0)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-colors cursor-pointer"
                  title="Ảnh sau"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              )}
            </div>

            {/* Mini thumbnails strip for quick navigation */}
            {currentArticlePhotos.length > 1 && (
              <div className="mt-3 flex items-center gap-1.5 overflow-x-auto max-w-full py-1">
                {currentArticlePhotos.map((pUrl, pI) => (
                  <button
                    key={pI}
                    onClick={() => setLightboxPhotoIndex(pI)}
                    className={`w-12 h-9 rounded-lg overflow-hidden shrink-0 border transition-all cursor-pointer ${
                      pI === lightboxPhotoIndex ? 'border-teal-400 ring-2 ring-teal-400 scale-105' : 'border-white/20 opacity-50 hover:opacity-100'
                    }`}
                  >
                    <img src={pUrl} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          6. MODAL ĐĂNG BÀI VIẾT MỚI / CHỈNH SỬA BÀI VIẾT
          ======================================================== */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[92vh]">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-teal-50 to-emerald-50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-800">
                    {editingActivity ? 'Chỉnh Sửa Bài Viết Hoạt Động' : 'Đăng Bài Viết Hoạt Động Mới'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Phòng Truyền Thông • Đăng phóng sự hoạt động kèm album nhiều hình ảnh
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveActivity} noValidate className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs">
              
              {/* Tiêu đề bài viết */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Tiêu đề bài viết <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Ví dụ: Hội thi Sáng tạo Robot STEM Duy Tân 2026..."
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs sm:text-sm"
                  required
                />
              </div>

              {/* Chuyên mục & Ngày diễn ra */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Chuyên mục hoạt động</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs"
                  >
                    {CATEGORIES.filter(c => c.id !== 'all').map(c => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ngày đăng bài</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs"
                  />
                </div>
              </div>

              {/* Tác giả / Người đăng */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tác giả / Ban biên tập phụ trách</label>
                <input
                  type="text"
                  value={formAuthor}
                  onChange={(e) => setFormAuthor(e.target.value)}
                  placeholder="Phòng Truyền Thông / Thầy Trần Quốc Toản..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs"
                />
              </div>

              {/* ẢNH BÌA ĐẠI DIỆN (BANNER CHÍNH) */}
              <div className="bg-slate-50 p-3.5 sm:p-4 rounded-2xl border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-slate-800 text-xs sm:text-sm">
                    Ảnh bìa đại diện của bài viết (Hiển thị trên Banner trang chủ) <span className="text-rose-500">*</span>
                  </label>
                  {formImageUrl && (
                    <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Đã tải ảnh lên thành công</span>
                    </span>
                  )}
                </div>
                
                <input
                  ref={bannerFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleBannerFileChange}
                  className="hidden"
                />

                {!formImageUrl ? (
                  <div 
                    onClick={() => bannerFileInputRef.current?.click()}
                    className="border-2 border-dashed border-teal-300 hover:border-teal-500 bg-teal-50/40 hover:bg-teal-50/70 rounded-2xl p-5 text-center cursor-pointer transition-all group flex flex-col items-center justify-center gap-2"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 group-hover:text-teal-700">
                        Nhấp vào đây để chọn ảnh từ máy
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Hỗ trợ định dạng JPG, PNG, WEBP, GIF (Khuyến nghị tỉ lệ 16:9 hoặc 21:9)
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="relative aspect-[21/9] rounded-xl overflow-hidden border border-slate-200 max-h-48 bg-slate-900 group shadow-xs">
                      <img 
                        src={formImageUrl} 
                        alt="Ảnh bìa xem trước" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => bannerFileInputRef.current?.click()}
                          className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Đổi ảnh khác</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormImageUrl('')}
                          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Gỡ ảnh</span>
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="text-emerald-700 font-medium flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Sẵn sàng xuất bản lên Banner tin tức
                      </span>
                      <button
                        type="button"
                        onClick={() => bannerFileInputRef.current?.click()}
                        className="text-teal-700 hover:underline font-semibold"
                      >
                        Chọn ảnh khác
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Lời dẫn / Tóm tắt bài viết (Sa-pô) */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Lời dẫn / Tóm tắt bài viết (Sa-pô)
                </label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  rows={2}
                  placeholder="Đoạn văn ngắn tóm tắt ý nghĩa, thời gian và địa điểm diễn ra hoạt động..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs"
                />
              </div>

              {/* NỘI DUNG CHI TIẾT BÀI VIẾT */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nội dung bài viết chi tiết (Các đoạn văn, thông tin chi tiết sự kiện)
                </label>
                <textarea
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  rows={6}
                  placeholder="Nhập toàn bộ nội dung bài viết phóng sự tại đây (xuống dòng 2 lần để tách đoạn văn)..."
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-slate-800 font-normal focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs sm:text-sm leading-relaxed"
                />
              </div>

              {/* ========================================================
                  ALBUM ẢNH CHI TIẾT CỦA BÀI VIẾT (NHIỀU HÌNH ẢNH HƠN)
                  ======================================================== */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-bold text-slate-800 text-xs block">
                      Album nhiều hình ảnh chi tiết của bài viết
                    </label>
                    <span className="text-[11px] text-slate-500">
                      Tải lên nhiều hình ảnh để người xem bấm vào bài viết xem trọn bộ album
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 font-bold text-[11px]">
                    {formGalleryImages.length} ảnh
                  </span>
                </div>

                {/* Upload multi-files & URL input */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={() => galleryFileInputRef.current?.click()}
                    className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
                  >
                    <Images className="w-4 h-4" />
                    <span>Tải thêm nhiều ảnh</span>
                  </button>
                  <input
                    ref={galleryFileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleGalleryFilesChange}
                    className="hidden"
                  />

                  <div className="flex-1 flex gap-1.5">
                    <input
                      type="text"
                      value={albumUrlInput}
                      onChange={(e) => setAlbumUrlInput(e.target.value)}
                      placeholder="Hoặc dán link ảnh (tùy chọn)..."
                      className="flex-1 px-3 py-1.5 rounded-xl border border-slate-300 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs bg-white"
                    />
                    <button
                      type="button"
                      onClick={handleAddAlbumUrl}
                      className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-bold transition-colors cursor-pointer"
                    >
                      Thêm
                    </button>
                  </div>
                </div>

                {/* Gallery Thumbnails List */}
                {formGalleryImages.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 pt-2">
                    {formGalleryImages.map((photoUrl, pIdx) => (
                      <div key={pIdx} className="relative aspect-[4/3] rounded-lg overflow-hidden border border-slate-200 bg-slate-900 group">
                        <img src={photoUrl} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveGalleryPhoto(pIdx)}
                          className="absolute top-1 right-1 p-1 bg-black/70 hover:bg-rose-600 text-white rounded-full transition-colors cursor-pointer"
                          title="Xóa ảnh này khỏi album"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <span className="absolute bottom-1 left-1 px-1 bg-black/60 rounded text-[9px] text-white">
                          #{pIdx + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Is Featured Checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isFeatured"
                  checked={formIsFeatured}
                  onChange={(e) => setFormIsFeatured(e.target.checked)}
                  className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300 cursor-pointer"
                />
                <label htmlFor="isFeatured" className="font-bold text-slate-700 cursor-pointer flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-amber-500 fill-current" />
                  <span>Đánh dấu là "Hoạt động tiêu biểu" (ưu tiên xuất hiện trên banner trang chủ)</span>
                </label>
              </div>

              {/* Form Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-teal-gradient text-white px-5 py-2 rounded-xl font-bold shadow-xs hover:opacity-95 transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>{editingActivity ? 'Lưu thay đổi bài viết' : 'Xuất bản bài viết'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
