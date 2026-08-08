const fs = require('fs');
const file = 'src/components/Login.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace("        </div>\n      </div>\n    </div>\n  );\n}", "        </div>\n      </div>\n      </div>\n    </div>\n  );\n}");

fs.writeFileSync(file, content);
