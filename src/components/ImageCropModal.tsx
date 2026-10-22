import React, { useState, useRef, useEffect } from 'react';
import { X, Check, Crop, ZoomIn, ZoomOut, RotateCw, Move, Sliders, RefreshCw } from 'lucide-react';
import { uploadImageToStorage } from '../lib/firebase';

interface ImageCropModalProps {
  imageUrl: string;
  onClose: () => void;
  onSave: (croppedImageUrl: string) => void;
}

export default function ImageCropModal({ imageUrl, onClose, onSave }: ImageCropModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [scale, setScale] = useState<number>(1);
  const [offsetX, setOffsetX] = useState<number>(0);
  const [offsetY, setOffsetY] = useState<number>(0);
  const [rotation, setRotation] = useState<number>(0); // 0, 90, 180, 270
  const [aspectRatio, setAspectRatio] = useState<'21:9' | '16:9' | '4:3'>('21:9');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [loadedImage, setLoadedImage] = useState<HTMLImageElement | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Load image object
  useEffect(() => {
    if (!imageUrl) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setLoadedImage(img);
      setOffsetX(0);
      setOffsetY(0);
      setScale(1);
      setRotation(0);
    };
    img.onerror = () => {
      // Fallback without crossOrigin if CORS issues occur
      const imgFallback = new Image();
      imgFallback.onload = () => {
        setLoadedImage(imgFallback);
        setOffsetX(0);
        setOffsetY(0);
        setScale(1);
        setRotation(0);
      };
      imgFallback.src = imageUrl;
    };
    img.src = imageUrl;
  }, [imageUrl]);

  // Determine canvas export dimensions
  const getCanvasDimensions = () => {
    if (aspectRatio === '21:9') return { width: 1050, height: 450 };
    if (aspectRatio === '16:9') return { width: 960, height: 540 };
    return { width: 800, height: 600 }; // 4:3
  };

  // Render crop preview on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !loadedImage) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = getCanvasDimensions();
    canvas.width = width;
    canvas.height = height;

    // Clear background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    ctx.save();

    // Translate to center of canvas
    ctx.translate(width / 2 + offsetX, height / 2 + offsetY);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(scale, scale);

    // Calculate image draw size keeping cover aspect
    const imgAspect = loadedImage.width / loadedImage.height;
    const canvasAspect = width / height;

    let drawW = width;
    let drawH = height;

    if (imgAspect > canvasAspect) {
      drawH = height;
      drawW = height * imgAspect;
    } else {
      drawW = width;
      drawH = width / imgAspect;
    }

    ctx.drawImage(loadedImage, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();

    // Draw subtle grid overlay
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(width / 3, 0); ctx.lineTo(width / 3, height);
    ctx.moveTo((width * 2) / 3, 0); ctx.lineTo((width * 2) / 3, height);
    ctx.moveTo(0, height / 3); ctx.lineTo(width, height / 3);
    ctx.moveTo(0, (height * 2) / 3); ctx.lineTo(width, (height * 2) / 3);
    ctx.stroke();

  }, [loadedImage, scale, offsetX, offsetY, rotation, aspectRatio]);

  // Dragging handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offsetX, y: e.clientY - offsetY });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    setOffsetX(e.clientX - dragStart.x);
    setOffsetY(e.clientY - dragStart.y);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handlers for mobile
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX - offsetX, y: e.touches[0].clientY - offsetY });
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDragging || e.touches.length !== 1) return;
    setOffsetX(e.touches[0].clientX - dragStart.x);
    setOffsetY(e.touches[0].clientY - dragStart.y);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleReset = () => {
    setOffsetX(0);
    setOffsetY(0);
    setScale(1);
    setRotation(0);
  };

  const handleSaveCrop = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsProcessing(true);
    try {
      const croppedBase64 = canvas.toDataURL('image/jpeg', 0.88);
      
      // Attempt to upload cropped image to Storage for optimal performance
      try {
        const response = await fetch(croppedBase64);
        const blob = await response.blob();
        const file = new File([blob], `cropped_banner_${Date.now()}.jpg`, { type: 'image/jpeg' });
        const storageUrl = await uploadImageToStorage(file, 'news/banners');
        if (storageUrl) {
          onSave(storageUrl);
          setIsProcessing(false);
          onClose();
          return;
        }
      } catch (err) {
        console.warn('Storage upload fallback to data URL:', err);
      }

      onSave(croppedBase64);
    } catch (e) {
      console.error('Error cropping image:', e);
    }
    setIsProcessing(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 flex justify-between items-center bg-slate-900/80">
          <div className="flex items-center gap-2 text-white">
            <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold">
              <Crop className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base leading-tight">Căn Chỉnh & Cắt Khung Ảnh Bìa</h3>
              <p className="text-[11px] text-slate-400">Kéo rê hình hoặc dùng nút chỉnh để chọn góc ảnh đẹp nhất cho Banner</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Canvas Workspace */}
        <div className="p-4 sm:p-6 flex-1 flex flex-col items-center justify-center bg-slate-950/60 overflow-hidden relative">
          <div className="relative w-full max-w-2xl flex items-center justify-center border border-teal-500/30 rounded-2xl overflow-hidden shadow-2xl bg-black">
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className="max-w-full max-h-[50vh] object-contain cursor-move touch-none"
              title="Nhấp giữ và kéo rê để di chuyển góc ảnh"
            />
            <div className="absolute top-2 left-2 px-2.5 py-1 bg-black/60 text-white/80 rounded-lg text-[10px] font-bold backdrop-blur-xs flex items-center gap-1.5">
              <Move className="w-3 h-3 text-teal-400" /> Kéo thả để căn chỉnh tâm ảnh
            </div>
          </div>

          {/* Ratio Selector */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
            <span className="text-xs font-bold text-slate-400 mr-1 flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5 text-teal-400" /> Tỉ lệ khung:
            </span>
            {(['21:9', '16:9', '4:3'] as const).map(ratio => (
              <button
                key={ratio}
                type="button"
                onClick={() => setAspectRatio(ratio)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  aspectRatio === ratio
                    ? 'bg-teal-600 text-white shadow-md'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {ratio} {ratio === '21:9' ? '(Banner Trang Chủ)' : ratio === '16:9' ? '(Chuẩn TV/Màn hình)' : '(Khung Ngắn)'}
              </button>
            ))}
          </div>
        </div>

        {/* Controls Toolbar */}
        <div className="p-4 border-t border-slate-800 bg-slate-900 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            {/* Zoom Controls (+ and - buttons + Slider) */}
            <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 rounded-2xl border border-slate-800">
              <button
                type="button"
                onClick={() => setScale(prev => Math.max(0.8, Number((prev - 0.1).toFixed(2))))}
                className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 hover:text-white text-teal-400 font-black text-lg flex items-center justify-center transition-all cursor-pointer active:scale-95 border border-slate-700 shrink-0 shadow-xs"
                title="Thu nhỏ ảnh (-)"
              >
                -
              </button>
              
              <div className="flex-1 flex items-center gap-1.5">
                <ZoomOut className="w-3.5 h-3.5 text-slate-500 shrink-0 hidden sm:block" />
                <input
                  type="range"
                  min="0.8"
                  max="2.5"
                  step="0.05"
                  value={scale}
                  onChange={(e) => setScale(parseFloat(e.target.value))}
                  className="w-full accent-teal-500 cursor-pointer"
                />
                <ZoomIn className="w-3.5 h-3.5 text-slate-500 shrink-0 hidden sm:block" />
              </div>

              <button
                type="button"
                onClick={() => setScale(prev => Math.min(2.5, Number((prev + 0.1).toFixed(2))))}
                className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 hover:text-white text-teal-400 font-black text-lg flex items-center justify-center transition-all cursor-pointer active:scale-95 border border-slate-700 shrink-0 shadow-xs"
                title="Phóng to ảnh (+)"
              >
                +
              </button>
              
              <span className="text-xs font-mono font-bold text-teal-400 w-11 text-right shrink-0">{Math.round(scale * 100)}%</span>
            </div>

            {/* Rotation & Reset Buttons */}
            <div className="flex items-center gap-2 justify-end">
              <button
                type="button"
                onClick={handleRotate}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-2xl flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCw className="w-3.5 h-3.5 text-teal-400" /> Xoay 90°
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-2xl flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-amber-400" /> Mặc định
              </button>
            </div>
          </div>

          {/* Action Footer Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-bold text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              onClick={handleSaveCrop}
              disabled={isProcessing}
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center gap-2 shadow-lg transition-colors cursor-pointer disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{isProcessing ? 'Đang lưu ảnh...' : 'Áp Dụng & Lưu Khung Ảnh'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
