const escapePdfText = (value) =>
  String(value || "-")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/\r?\n/g, " ");

const wrapLine = (value, limit = 82) => {
  const words = String(value || "-").split(/\s+/);
  const lines = [];
  let line = "";

  words.forEach((word) => {
    if (`${line} ${word}`.trim().length > limit) {
      lines.push(line);
      line = word;
      return;
    }
    line = `${line} ${word}`.trim();
  });

  if (line) lines.push(line);
  return lines.length ? lines : ["-"];
};

const formatDateTime = () =>
  new Date().toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const createPdfBlob = (report) => {
  const title = escapePdfText(report.title || "Stat Report");
  let y = 780;
  const content = [`BT /F1 22 Tf 50 ${y} Td (${title}) Tj ET`];
  y -= 28;
  content.push(`BT /F1 10 Tf 50 ${y} Td (Generated: ${escapePdfText(formatDateTime())}) Tj ET`);
  y -= 28;

  if (report.description) {
    wrapLine(report.description).forEach((line) => {
      content.push(`BT /F1 11 Tf 50 ${y} Td (${escapePdfText(line)}) Tj ET`);
      y -= 16;
    });
    y -= 8;
  }

  (report.metrics || []).forEach((metric) => {
    if (y < 60) return;
    content.push(`BT /F1 12 Tf 50 ${y} Td (${escapePdfText(metric.label)}: ${escapePdfText(metric.value)}) Tj ET`);
    y -= 20;
  });

  if ((report.rows || []).length) {
    y -= 8;
    content.push(`BT /F1 13 Tf 50 ${y} Td (Details) Tj ET`);
    y -= 22;

    report.rows.forEach((row) => {
      if (y < 60) return;
      wrapLine(row).forEach((line) => {
        if (y < 60) return;
        content.push(`BT /F1 10 Tf 58 ${y} Td (${escapePdfText(line)}) Tj ET`);
        y -= 15;
      });
      y -= 4;
    });
  }

  const stream = content.join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
  ];

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return new Blob([pdf], { type: "application/pdf" });
};

export const downloadStatReportPdf = (report) => {
  const blob = createPdfBlob(report);
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  const name = String(report.title || "stat-report").replace(/[^a-z0-9_-]+/gi, "-").replace(/^-|-$/g, "") || "stat-report";

  link.href = url;
  link.download = `${name}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};
