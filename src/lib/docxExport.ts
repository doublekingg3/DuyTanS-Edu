import { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel, Table, TableRow, TableCell, BorderStyle, WidthType } from 'docx';
import { saveAs } from 'file-saver';

export async function exportWeeklyPlanToDocx(
  className: string, 
  schoolYearName: string, 
  weekData: any
) {
  if (!weekData) {
    alert("Không có dữ liệu tuần để xuất.");
    return;
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
                top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                insideVertical: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({
                            text: "TRƯỜNG THCS & THPT",
                            bold: true,
                            font: "Times New Roman",
                            size: 26, // 13pt
                          }),
                        ],
                      }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({
                            text: "TỔ CHỦ NHIỆM",
                            bold: true,
                            underline: { type: "single" },
                            font: "Times New Roman",
                            size: 26, // 13pt
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({
                            text: "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM",
                            bold: true,
                            font: "Times New Roman",
                            size: 26, // 13pt
                          }),
                        ],
                      }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({
                            text: "Độc lập - Tự do - Hạnh phúc",
                            bold: true,
                            underline: { type: "single" },
                            font: "Times New Roman",
                            size: 28, // 14pt
                          }),
                        ],
                      }),
                    ],
                  })
                ]
              })
            ]
          }),

          new Paragraph({
            text: "",
            spacing: { after: 400 },
          }),
          
          // Title
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "KẾ HOẠCH CHỦ NHIỆM",
                bold: true,
                font: "Times New Roman",
                size: 32, // 16pt
              }),
            ],
            spacing: { after: 200 },
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: `Lớp: ${className} - Năm học: ${schoolYearName}`,
                bold: true,
                font: "Times New Roman",
                size: 28, // 14pt
              }),
            ],
            spacing: { after: 400 },
          }),

          // Week Info
          new Paragraph({
            children: [
              new TextRun({
                text: `TUẦN ${weekData.id}: `,
                bold: true,
                font: "Times New Roman",
                size: 28, // 14pt
              }),
              new TextRun({
                text: `Từ ngày ${new Date(weekData.startDate).toLocaleDateString('vi-VN')} đến ngày ${new Date(weekData.endDate).toLocaleDateString('vi-VN')}`,
                italics: true,
                font: "Times New Roman",
                size: 26, // 13pt
              }),
            ],
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Tổ trực nhật: ${weekData.dutyTeam}`,
                bold: true,
                font: "Times New Roman",
                size: 26, // 13pt
              }),
            ],
            spacing: { after: 400 },
          }),

          // Tasks section
          new Paragraph({
            children: [
              new TextRun({
                text: "Nội dung công việc trong tuần:",
                bold: true,
                font: "Times New Roman",
                size: 28, // 14pt
              }),
            ],
            spacing: { after: 200 },
          }),

          ...(weekData.tasks && weekData.tasks.length > 0 
            ? weekData.tasks.map((task: string, index: number) => 
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `${index + 1}. ${task}`,
                      font: "Times New Roman",
                      size: 28, // 14pt
                    }),
                  ],
                  spacing: { after: 120 },
                })
              )
            : [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "Chưa có nội dung công việc.",
                      italics: true,
                      font: "Times New Roman",
                      size: 28, // 14pt
                    }),
                  ],
                })
              ]
          ),
          
          new Paragraph({
            text: "",
            spacing: { after: 600 },
          }),

          // Signatures table
          new Table({
            width: {
                size: 100,
                type: WidthType.PERCENTAGE,
            },
            borders: {
                top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                insideVertical: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({
                            text: "XÁC NHẬN CỦA BGH",
                            bold: true,
                            font: "Times New Roman",
                            size: 26,
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({
                            text: "GIÁO VIÊN CHỦ NHIỆM",
                            bold: true,
                            font: "Times New Roman",
                            size: 26,
                          }),
                        ],
                      }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({
                            text: "(Ký và ghi rõ họ tên)",
                            italics: true,
                            font: "Times New Roman",
                            size: 24,
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `Ke-hoach-chu-nhiem-${className}-Tuan-${weekData.id}.docx`);
}
