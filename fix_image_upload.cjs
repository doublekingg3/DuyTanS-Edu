const fs = require('fs');
const file = 'src/components/AdminView.tsx';
let content = fs.readFileSync(file, 'utf8');

const newUpload = `
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: keyof AppSettings) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showAlert('Kích thước ảnh quá lớn. Vui lòng chọn ảnh < 2MB.', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        // Compress image using canvas
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Max dimensions
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;
          
          if (width > height) {
            if (width > MAX_WIDTH) {
              height = Math.round((height * MAX_WIDTH) / width);
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = Math.round((width * MAX_HEIGHT) / height);
              height = MAX_HEIGHT;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Compress to JPEG with 0.7 quality
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
          
          // Check size of base64 (approximate)
          if (compressedDataUrl.length > 800000) {
             showAlert('Ảnh sau khi nén vẫn quá lớn. Vui lòng chọn ảnh khác đơn giản hơn.', 'error');
             return;
          }
          
          setAppSettings(prev => ({ ...prev, [field]: compressedDataUrl }));
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    try {
      const settingsRef = doc(db, 'settings', 'general');
      await setDoc(settingsRef, appSettings);
      showAlert('Đã lưu cấu hình giao diện thành công!', 'success');
    } catch (error) {
      console.error(error);
      showAlert('Lỗi khi lưu cấu hình. Vui lòng thử lại với ảnh dung lượng nhỏ hơn.', 'error');
    } finally {
      setIsSavingSettings(false);
    }
  };
`;

const oldUpload = `
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: keyof AppSettings) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 800 * 1024) {
        showAlert('Kích thước ảnh quá lớn. Vui lòng chọn ảnh < 800KB để đảm bảo lưu trữ.', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAppSettings(prev => ({ ...prev, [field]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    try {
      const settingsRef = doc(db, 'settings', 'general');
      await setDoc(settingsRef, appSettings);
      showAlert('Đã lưu cấu hình giao diện thành công!', 'success');
    } catch (error) {
      showAlert('Lỗi khi lưu cấu hình', 'error');
    } finally {
      setIsSavingSettings(false);
    }
  };
`;

content = content.replace(oldUpload.trim(), newUpload.trim());

fs.writeFileSync(file, content);
