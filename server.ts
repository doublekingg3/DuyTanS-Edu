import express from 'express';
import path from 'path';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';


dotenv.config();



async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // AI Review Endpoint
  app.post('/api/ai-review', async (req, res) => {
    try {
      const { student, periodType, adminInfo } = req.body;
      
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server.' });
      }

      const ai = new GoogleGenAI({ 
        apiKey,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });

      const prompt = `
Bạn là một trợ lý AI chuyên nghiệp hỗ trợ giáo viên và nhà trường trong việc nhận xét tình hình học tập của học sinh. 
Vui lòng phân tích các thông tin dưới đây và đưa ra một bản nhận xét ngắn gọn, mang tính định hướng cho phụ huynh:
- Cảnh báo sớm nếu học sinh có nguy cơ hổng kiến thức hoặc sa sút.
- Gợi ý định hướng (hoặc khen ngợi, khuyến khích) phù hợp, bao gồm cả định hướng nghề nghiệp sớm nếu có thể.
- Gợi ý các thông tin/khoá học liên quan từ nhà trường (sử dụng thông tin admin cung cấp).
- Trình bày dạng Markdown, cấu trúc rõ ràng, thân thiện với phụ huynh.

Thông tin học sinh:
- Tên: ${student.name}
- Lớp: ${student.classId}
- Giai đoạn: ${periodType}
- Điểm số và thông tin đánh giá: ${JSON.stringify(student.grades, null, 2)}
- Các đánh giá chi tiết (nếu có): ${JSON.stringify(student.weeklyData || {}, null, 2)}

Thông tin từ nhà trường (Admin):
${adminInfo}
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          systemInstruction: 'Bạn là chuyên gia giáo dục, tư vấn chuyên nghiệp, tận tâm.',
        }
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error('Gemini API Error:', error);
      res.status(500).json({ error: error.message || 'Failed to generate review' });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production, static files are inside dist/ (the client bundle is usually emitted to dist/, 
    // but with our esbuild, server.cjs is in dist/ and the client might be in dist/ as well, or dist/client depending on vite config. 
    // Wait, standard vite build outputs to dist/ directly.
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
