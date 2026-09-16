const fs = require('fs');
let c = fs.readFileSync('src/components/ParentView.tsx', 'utf8');
const search = `      const res = await fetch('/api/ai-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student: currentViewStudent, periodType, adminInfo })
      });
      const data = await res.json();
      if (data.error) {
        setAiReviewText('❌ Lỗi: ' + data.error);
      } else {
        setAiReviewText(data.text);
      }`;
const replace = `      const res = await fetch('/api/ai-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student: currentViewStudent, periodType, adminInfo })
      });
      
      let data;
      try {
        data = await res.json();
      } catch (e) {
        // Fallback for non-JSON response (e.g. 502 Bad Gateway)
        throw new Error('Máy chủ phản hồi không đúng định dạng. Có thể do lỗi kết nối hoặc cấu hình API.');
      }
      
      if (!res.ok) {
        if (data.error && data.error.includes('GEMINI_API_KEY')) {
          throw new Error('Chưa cấu hình GEMINI_API_KEY trên máy chủ. Vui lòng liên hệ Admin (hoặc cài đặt trong AI Studio).');
        }
        throw new Error(data.error || 'Lỗi không xác định từ máy chủ AI.');
      }
      
      if (data.error) {
        throw new Error(data.error);
      } else {
        setAiReviewText(data.text);
      }`;
      
const oldCatch = `    } catch (e) {
      setAiReviewText('❌ Lỗi kết nối tới máy chủ AI.');
    } finally {`;
const newCatch = `    } catch (e: any) {
      setAiReviewText('❌ Lỗi: ' + (e.message || 'Không thể kết nối tới máy chủ AI.'));
    } finally {`;
    
c = c.replace(search, replace).replace(oldCatch, newCatch);
fs.writeFileSync('src/components/ParentView.tsx', c);
