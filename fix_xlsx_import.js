import fs from 'fs';
let code = fs.readFileSync('src/components/AdminView.tsx', 'utf8');

if (!code.includes("import * as XLSX from 'xlsx';")) {
  code = code.replace(
    "import React, { useState, useRef } from 'react';",
    "import React, { useState, useRef } from 'react';\nimport * as XLSX from 'xlsx';"
  );
  fs.writeFileSync('src/components/AdminView.tsx', code);
}
