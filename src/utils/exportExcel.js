import * as XLSX from 'xlsx';

/**
 * Utilidad para exportar datos a Microsoft Excel en formato estándar .xlsx
 * con ajuste automático de anchos de columna.
 */
export function exportStyledExcel({
  filename,
  sheetName = 'Reporte',
  headers,
  data,
  isOvertimeRow = () => false,
  isOvertimeCell = () => false,
}) {
  const ws = XLSX.utils.json_to_sheet(data, { header: headers });

  // Ajuste automático de ancho de columnas para visualización clara
  const colWidths = headers.map((h) => {
    const maxValLen = data.reduce((max, row) => {
      const valStr = row[h] !== undefined && row[h] !== null ? String(row[h]) : '';
      return Math.max(max, valStr.length);
    }, h.length);
    return { wch: Math.min(Math.max(maxValLen + 3, 12), 40) };
  });
  ws['!cols'] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName.substring(0, 31));

  const cleanName = filename.endsWith('.xlsx')
    ? filename
    : `${filename.replace(/\.[^/.]+$/, '')}.xlsx`;

  XLSX.writeFile(wb, cleanName);
}
