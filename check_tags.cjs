const fs = require('fs');
let content = fs.readFileSync('src/components/AdminView.tsx', 'utf8');
const lines = content.split('\n');
for(let i=635; i<=785; i++) {
  console.log(`${i+1}: ${lines[i]}`);
}
