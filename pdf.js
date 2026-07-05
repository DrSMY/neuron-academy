'use strict';
// Minimal single-page PDF writer — enough for a certificate, zero dependencies.

function sanitize(s) {
  return String(s)
    .replace(/[‘’]/g, "'").replace(/[“”]/g, '"')
    .replace(/—/g, '--').replace(/–/g, '-')
    .replace(/[^\x20-\x7E]/g, '?')
    .replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

// Rough Helvetica width estimate (per pt of font size) for centering.
function textWidth(s, size, bold) {
  return s.length * size * (bold ? 0.56 : 0.52);
}

const PAGE_W = 842;
const PAGE_H = 595;

function centered(text, y, size, font, color, letterSpace = 0) {
  const t = sanitize(letterSpace ? text.split('').join(' ') : text);
  const x = (PAGE_W - textWidth(t, size, font === 'F1')) / 2;
  return `BT /${font} ${size} Tf ${color} rg ${x.toFixed(1)} ${y} Td (${t}) Tj ET\n`;
}

function makeCertificatePdf({ name, moduleTitle, date, code, verifyUrl }) {
  let content = '';
  // background
  content += `0.035 0.047 0.086 rg 0 0 ${PAGE_W} ${PAGE_H} re f\n`;
  // outer accent border + inner hairline
  content += `0.84 0.70 0.42 RG 2.5 w 28 28 ${PAGE_W - 56} ${PAGE_H - 56} re S\n`;
  content += `0.45 0.42 0.34 RG 0.7 w 38 38 ${PAGE_W - 76} ${PAGE_H - 76} re S\n`;
  // top + bottom accent bars
  content += `0.84 0.70 0.42 rg ${PAGE_W / 2 - 40} 500 80 3 re f\n`;
  content += `0.84 0.70 0.42 rg ${PAGE_W / 2 - 40} 118 80 2 re f\n`;

  content += centered('NEUROSEED', 522, 15, 'F1', '0.91 0.78 0.50', 1);
  content += centered('CERTIFICATE OF COMPLETION', 458, 30, 'F1', '0.93 0.93 0.95');
  content += centered('This certifies that', 404, 14, 'F2', '0.55 0.57 0.62');
  content += centered(name, 352, 38, 'F1', '1 1 1');
  content += centered('has successfully completed the module', 308, 14, 'F2', '0.55 0.57 0.62');
  content += centered(moduleTitle, 262, 25, 'F1', '0.84 0.72 0.46');
  content += centered(`Completed on ${date}`, 210, 13, 'F2', '0.72 0.74 0.78');
  content += centered(`Certificate no. ${code}`, 158, 12, 'F2', '0.55 0.57 0.62');
  content += centered(`Verify at ${verifyUrl}`, 86, 10, 'F2', '0.42 0.44 0.50');

  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>`,
    `<< /Length ${content.length} >>\nstream\n${content}endstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ];

  let pdf = '%PDF-1.4\n';
  const offsets = [];
  objects.forEach((obj, i) => {
    offsets.push(pdf.length);
    pdf += `${i + 1} 0 obj\n${obj}\nendobj\n`;
  });
  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.forEach((o) => { pdf += `${String(o).padStart(10, '0')} 00000 n \n`; });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
  return Buffer.from(pdf, 'latin1');
}

module.exports = { makeCertificatePdf };
