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
  // Preparamos los datos planos para que json_to_sheet inicialice la hoja correctamente
  const flatData = data.map((row) => {
    const flatRow = {};
    headers.forEach((h) => {
      const val = row[h];
      if (val && typeof val === 'object' && val.text !== undefined) {
        flatRow[h] = val.text;
      } else {
        flatRow[h] = val;
      }
    });
    return flatRow;
  });

  const ws = XLSX.utils.json_to_sheet(flatData, { header: headers });

  // Asignamos hipervínculos activos a las celdas que contienen enlace
  data.forEach((row, rowIdx) => {
    headers.forEach((colName, colIdx) => {
      const cellVal = row[colName];
      if (cellVal && typeof cellVal === 'object' && cellVal.link) {
        const cellRef = XLSX.utils.encode_cell({ r: rowIdx + 1, c: colIdx });
        const label = String(cellVal.text || cellVal.link);
        ws[cellRef] = {
          t: 's',
          v: label,
          f: `HYPERLINK("${cellVal.link}", "${label.replace(/"/g, '""')}")`,
          l: { Target: cellVal.link, Tooltip: label },
        };
      }
    });
  });

  // Ajuste automático de ancho de columnas para visualización clara
  const colWidths = headers.map((h) => {
    const maxValLen = data.reduce((max, row) => {
      const rawVal = row[h];
      const valStr = rawVal && typeof rawVal === 'object' && rawVal.text !== undefined
        ? String(rawVal.text)
        : rawVal !== undefined && rawVal !== null
        ? String(rawVal)
        : '';
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
