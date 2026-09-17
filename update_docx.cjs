const fs = require('fs');
let c = fs.readFileSync('src/lib/docxExport.ts', 'utf8');

c = c.replace(/export async function exportWeeklyPlanToDocx\([\s\S]*?weekData:\s*any\s*\) \{/,
`export async function exportWeeklyPlanToDocx(
  className: string, 
  schoolYearName: string, 
  weekData: any,
  teacherName: string
) {`);

// 1. Update School Name
c = c.replace(/text:\s*"TRƯỜNG THCS & THPT"/, `text: "TRƯỜNG PT DUY TÂN"`);

// 2. Add Teacher Name
const oldSignature = `new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({
                            text: "(Ký và ghi rõ họ tên)",
                            italics: true,
                            font: "Times New Roman",
                            size: 24,
                          }),
                        ],
                      }),`;

const newSignature = `new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({
                            text: "(Ký và ghi rõ họ tên)",
                            italics: true,
                            font: "Times New Roman",
                            size: 24,
                          }),
                        ],
                        spacing: { after: 1200 }, // Khoảng trống cho chữ ký
                      }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({
                            text: teacherName || "",
                            bold: true,
                            font: "Times New Roman",
                            size: 26,
                          }),
                        ],
                      }),`;

c = c.replace(oldSignature, newSignature);

fs.writeFileSync('src/lib/docxExport.ts', c);
