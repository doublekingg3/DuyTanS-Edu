import { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel, Table, TableRow, TableCell, BorderStyle, WidthType } from 'docx';
import { saveAs } from 'file-saver';

export async function exportWeeklyPlanToDocx(
  className: string, 
  schoolYearName: string, 
  weekData: any,
  teacherName: string
) {
  if (!weekData) {
    alert("Không có dữ liệu tuần để xuất.");
    return;
  }

  // Màu sắc chủ đạo
  const lightBlue = "2E74B5"; // Xanh dương nhẹ (theme chuẩn Office)
  const lightBgColor = "D9E2F3"; // Xanh lạt làm nền cho header bảng

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Phần tiêu ngữ và quốc hiệu
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
                            text: "TRƯỜNG PT DUY TÂN",
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
          
          // Tiêu đề KẾ HOẠCH CHỦ NHIỆM
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "KẾ HOẠCH CHỦ NHIỆM",
                bold: true,
                font: "Times New Roman",
                size: 32, // 16pt
                color: lightBlue, // Màu xanh nhẹ nhàng
              }),
            ],
            spacing: { after: 300 },
          }),

          // BẢNG THÔNG TIN CHUNG
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1, color: lightBlue },
              bottom: { style: BorderStyle.SINGLE, size: 1, color: lightBlue },
              left: { style: BorderStyle.SINGLE, size: 1, color: lightBlue },
              right: { style: BorderStyle.SINGLE, size: 1, color: lightBlue },
              insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: lightBlue },
              insideVertical: { style: BorderStyle.SINGLE, size: 1, color: lightBlue },
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    shading: { fill: lightBgColor },
                    margins: { top: 100, bottom: 100, left: 100, right: 100 },
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: "Lớp:", bold: true, font: "Times New Roman", size: 28, color: lightBlue })],
                      }),
                    ],
                  }),
                  new TableCell({
                    margins: { top: 100, bottom: 100, left: 100, right: 100 },
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: className, font: "Times New Roman", size: 28 })],
                      }),
                    ],
                  }),
                  new TableCell({
                    shading: { fill: lightBgColor },
                    margins: { top: 100, bottom: 100, left: 100, right: 100 },
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: "Năm học:", bold: true, font: "Times New Roman", size: 28, color: lightBlue })],
                      }),
                    ],
                  }),
                  new TableCell({
                    margins: { top: 100, bottom: 100, left: 100, right: 100 },
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: schoolYearName, font: "Times New Roman", size: 28 })],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    shading: { fill: lightBgColor },
                    margins: { top: 100, bottom: 100, left: 100, right: 100 },
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: "Tuần:", bold: true, font: "Times New Roman", size: 28, color: lightBlue })],
                      }),
                    ],
                  }),
                  new TableCell({
                    margins: { top: 100, bottom: 100, left: 100, right: 100 },
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: `${weekData.id}`, font: "Times New Roman", size: 28 })],
                      }),
                    ],
                  }),
                  new TableCell({
                    shading: { fill: lightBgColor },
                    margins: { top: 100, bottom: 100, left: 100, right: 100 },
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: "Tổ trực nhật:", bold: true, font: "Times New Roman", size: 28, color: lightBlue })],
                      }),
                    ],
                  }),
                  new TableCell({
                    margins: { top: 100, bottom: 100, left: 100, right: 100 },
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: weekData.dutyTeam, font: "Times New Roman", size: 28 })],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    shading: { fill: lightBgColor },
                    margins: { top: 100, bottom: 100, left: 100, right: 100 },
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: "Từ ngày:", bold: true, font: "Times New Roman", size: 28, color: lightBlue })],
                      }),
                    ],
                  }),
                  new TableCell({
                    margins: { top: 100, bottom: 100, left: 100, right: 100 },
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: new Date(weekData.startDate).toLocaleDateString('vi-VN'), font: "Times New Roman", size: 28 })],
                      }),
                    ],
                  }),
                  new TableCell({
                    shading: { fill: lightBgColor },
                    margins: { top: 100, bottom: 100, left: 100, right: 100 },
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: "Đến ngày:", bold: true, font: "Times New Roman", size: 28, color: lightBlue })],
                      }),
                    ],
                  }),
                  new TableCell({
                    margins: { top: 100, bottom: 100, left: 100, right: 100 },
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: new Date(weekData.endDate).toLocaleDateString('vi-VN'), font: "Times New Roman", size: 28 })],
                      }),
                    ],
                  }),
                ],
              })
            ]
          }),

          new Paragraph({
            text: "",
            spacing: { after: 300 },
          }),

          // BẢNG NỘI DUNG CÔNG VIỆC
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1, color: lightBlue },
              bottom: { style: BorderStyle.SINGLE, size: 1, color: lightBlue },
              left: { style: BorderStyle.SINGLE, size: 1, color: lightBlue },
              right: { style: BorderStyle.SINGLE, size: 1, color: lightBlue },
              insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: lightBlue },
              insideVertical: { style: BorderStyle.SINGLE, size: 1, color: lightBlue },
            },
            rows: [
              // Bảng NỘI DUNG CÔNG VIỆC - Header Table
              new TableRow({
                tableHeader: true,
                children: [
                  new TableCell({
                    width: { size: 10, type: WidthType.PERCENTAGE },
                    shading: { fill: lightBgColor },
                    margins: { top: 100, bottom: 100, left: 100, right: 100 },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [new TextRun({ text: "STT", bold: true, font: "Times New Roman", size: 28, color: lightBlue })],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 90, type: WidthType.PERCENTAGE },
                    shading: { fill: lightBgColor },
                    margins: { top: 100, bottom: 100, left: 100, right: 100 },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [new TextRun({ text: "NỘI DUNG CÔNG VIỆC", bold: true, font: "Times New Roman", size: 28, color: lightBlue })],
                      }),
                    ],
                  }),
                ],
              }),
              // Nội dung map tasks
              ...(weekData.tasks && weekData.tasks.length > 0 
                ? weekData.tasks.map((task: string, index: number) => 
                    new TableRow({
                      children: [
                        new TableCell({
                          margins: { top: 100, bottom: 100, left: 100, right: 100 },
                          children: [
                            new Paragraph({
                              alignment: AlignmentType.CENTER,
                              children: [new TextRun({ text: `${index + 1}`, font: "Times New Roman", size: 28 })],
                            }),
                          ],
                        }),
                        new TableCell({
                          margins: { top: 100, bottom: 100, left: 100, right: 100 },
                          children: [
                            new Paragraph({
                              children: [new TextRun({ text: task, font: "Times New Roman", size: 28 })],
                            }),
                          ],
                        }),
                      ]
                    })
                  )
                : [
                    new TableRow({
                      children: [
                        new TableCell({
                          margins: { top: 100, bottom: 100, left: 100, right: 100 },
                          children: [
                            new Paragraph({
                              alignment: AlignmentType.CENTER,
                              children: [new TextRun({ text: "-", font: "Times New Roman", size: 28 })],
                            }),
                          ],
                        }),
                        new TableCell({
                          margins: { top: 100, bottom: 100, left: 100, right: 100 },
                          children: [
                            new Paragraph({
                              children: [new TextRun({ text: "Chưa có nội dung công việc.", italics: true, font: "Times New Roman", size: 28 })],
                            }),
                          ],
                        }),
                      ]
                    })
                  ]
              ),
            ]
          }),
          
          new Paragraph({
            text: "",
            spacing: { after: 600 },
          }),

          // Bảng chữ ký
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
