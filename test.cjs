const fs = require('fs');
let c = fs.readFileSync('src/components/ParentView.tsx', 'utf8');
const search = `      const data = await res.json();
      if (data.error) {
        setAiReviewText('❌ Lỗi: ' + data.error);
      } else {
        setAiReviewText(data.text);
      }`;
console.log(c.includes(search));
