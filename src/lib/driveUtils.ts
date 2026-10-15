/**
 * Chuyển đổi link Google Drive bất kỳ thành đường dẫn ảnh hiển thị trực tiếp (Direct Image URL)
 */
export function convertGoogleDriveUrl(url: string): string {
  if (!url) return '';
  const trimmed = url.trim();

  // Kiểm tra xem có phải link Google Drive hay không
  if (trimmed.includes('drive.google.com') || trimmed.includes('docs.google.com') || trimmed.includes('googleusercontent.com')) {
    // Trích xuất ID tệp tin từ các dạng đường dẫn Google Drive phổ biến:
    // 1. https://drive.google.com/file/d/1ABC123xyz.../view?usp=sharing
    // 2. https://drive.google.com/open?id=1ABC123xyz...
    // 3. https://drive.google.com/uc?id=1ABC123xyz...
    const match = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || 
                  trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/) ||
                  trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);

    if (match && match[1]) {
      const fileId = match[1];
      // Sử dụng CDN chính thức của Google để hiển thị hình ảnh trực tiếp sắc nét
      return `https://lh3.googleusercontent.com/d/${fileId}`;
    }
  }

  return trimmed;
}
