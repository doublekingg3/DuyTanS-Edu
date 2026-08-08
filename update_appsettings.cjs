const fs = require('fs');
const file = 'src/data.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace("loginLogo: string;", "loginLogo: string;\n  loginBackground: string;");
content = content.replace("loginLogo: \"\",", "loginLogo: \"\",\n  loginBackground: \"\",");

fs.writeFileSync(file, content);
