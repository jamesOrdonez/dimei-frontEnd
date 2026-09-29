import XLSX from 'xlsx-js-style';

/**
 * Procesa los productos e ítems de un proyecto calculando subtotales y totales presupuestales
 * siguiendo exactamente la misma lógica de cálculo del PDF de presupuesto.
 */
export function processProjectBudget(project) {
  if (!project) return null;

  const travelVal = parseFloat(project.travel) || 0;
  const necesitaEncerramiento =
    project.necesita_encerramiento === 1 ||
    project.necesita_encerramiento === true ||
    project.necesita_encerramiento === '1';
  const metrosCuadrados = parseFloat(project.metros_cuadrados) || 0;

  const processedProducts = (project.products || []).map((prod) => {
    let productTotalUnit = 0;

    const esPorMetros = prod.por_metros_cuadrados === 1 || prod.por_metros_cuadrados === true;
    const productQty =
      necesitaEncerramiento && esPorMetros && metrosCuadrados > 0
        ? (Number(prod.quantity) || 1) * metrosCuadrados
        : Number(prod.quantity) || 1;

    const processedItems = (prod.items || []).map((item) => {
      let finalQuantity = Number(item.quantity) || 1;

      if (item.variable === 1 || item.variable === '1') {
        const val1 = Number(item.value1) || 0;
        const val2 = Number(item.value2) || 0;
        finalQuantity = parseFloat((travelVal * val1 + val2).toFixed(2));
      }

      const itemPrice = Number(item.price) || 0;
      const itemTotal = finalQuantity * itemPrice;
      productTotalUnit += itemTotal;

      return {
        ...item,
        quantity: finalQuantity,
        price: itemPrice,
        total: itemTotal,
        location: item.location || 'S/N',
      };
    });

    return {
      ...prod,
      quantity: productQty,
      items: processedItems,
      total_price: productTotalUnit,
      subtotal: productTotalUnit * productQty,
      esPorMetros,
    };
  });

  const totalSubtotal = processedProducts.reduce((acc, p) => acc + (p.subtotal || 0), 0);

  const processedAdditionalItems = (project.items || []).map((item) => {
    const qty = Number(item.quantity) || 1;
    const price = Number(item.price) || 0;
    const total = Number(item.total) || qty * price;
    return {
      ...item,
      quantity: qty,
      price,
      total,
      location: item.location || 'S/N',
    };
  });

  const additionalItemsTotal = processedAdditionalItems.reduce(
    (acc, item) => acc + (item.total || 0),
    0
  );
  const grandTotal = totalSubtotal + additionalItemsTotal;

  return {
    travelVal,
    necesitaEncerramiento,
    metrosCuadrados,
    processedProducts,
    processedAdditionalItems,
    totalSubtotal,
    additionalItemsTotal,
    grandTotal,
  };
}

/**
 * Bordes y estilos visuales para Excel idénticos al formato solicitado
 */
const thinBorder = { style: 'thin', color: { rgb: '000000' } };
const thickBottomBorder = { style: 'medium', color: { rgb: '000000' } };

const cellBorders = {
  top: thinBorder,
  bottom: thinBorder,
  left: thinBorder,
  right: thinBorder,
};

const summaryCellBorders = {
  top: thinBorder,
  bottom: thickBottomBorder,
  left: thinBorder,
  right: thinBorder,
};

/**
 * Exporta el presupuesto a Excel (.xlsx) con celdas, bordes y negrita exactos a la imagen:
 *  - Hoja 1: "Información del Proyecto" (Cliente, Descripción/Observaciones, datos técnicos y totales con cuadrícula)
 *  - Hoja 2: "Productos" (Encabezados en negrita con bordes, componentes con cuadrícula, fila resumen combinada en negrita y borde inferior grueso)
 *  - Hoja 3: "Items" (Ítems adicionales con el mismo formato estándar de celdas y negritas)
 */
export function exportProjectBudgetExcel(project) {
  const budget = processProjectBudget(project);
  if (!budget) return;

  const {
    necesitaEncerramiento,
    metrosCuadrados,
    processedProducts,
    processedAdditionalItems,
    totalSubtotal,
    additionalItemsTotal,
    grandTotal,
  } = budget;

  const wb = XLSX.utils.book_new();

  // ════════════════════════════════════════════════════════════════════════════
  // ── HOJA 1: Información del Proyecto (Formato Horizontal) ───────────────────
  // ════════════════════════════════════════════════════════════════════════════
  const infoHeaders = [
    'ID Proyecto',
    'Cliente',
    'Descripción / Observaciones',
    'Estado',
    'Sistema Motriz',
    'Tipo de Ascensor',
    'Número de Paradas',
    'Recorrido (m)',
    'Capacidad (kg)',
    'Encerramiento',
    'Metros Cuadrados (m²)',
    'Total Productos (COP)',
    'Total Items Adicionales (COP)',
    'Presupuesto Total (COP)',
  ];

  const infoDataRow = [
    project.id,
    project.customerName || project.customer || '—',
    project.observaciones || project.descripcion || '—',
    project.state || '—',
    project.elevatorTypeName || '—',
    project.typeDriveSystemName || '—',
    project.stopNumber || 0,
    project.travel || 0,
    project.capacity || 0,
    necesitaEncerramiento ? 'Sí' : 'No',
    necesitaEncerramiento ? metrosCuadrados : 0,
    totalSubtotal,
    additionalItemsTotal,
    grandTotal,
  ];

  const wsInfo = XLSX.utils.aoa_to_sheet([infoHeaders, infoDataRow]);
  wsInfo['!cols'] = [
    { wch: 14 }, // ID Proyecto
    { wch: 28 }, // Cliente
    { wch: 45 }, // Descripción / Observaciones
    { wch: 14 }, // Estado
    { wch: 20 }, // Sistema Motriz
    { wch: 20 }, // Tipo de Ascensor
    { wch: 18 }, // Número de Paradas
    { wch: 15 }, // Recorrido (m)
    { wch: 16 }, // Capacidad (kg)
    { wch: 15 }, // Encerramiento
    { wch: 22 }, // Metros Cuadrados (m²)
    { wch: 24 }, // Total Productos (COP)
    { wch: 26 }, // Total Items Adicionales (COP)
    { wch: 24 }, // Presupuesto Total (COP)
  ];

  for (let c = 0; c < infoHeaders.length; c++) {
    const headerRef = XLSX.utils.encode_cell({ r: 0, c });
    if (wsInfo[headerRef]) {
      wsInfo[headerRef].s = {
        font: { name: 'Calibri', sz: 11, bold: true, color: { rgb: '000000' } },
        alignment: { vertical: 'center', horizontal: 'center' },
        border: cellBorders,
        fill: { fgColor: { rgb: 'F2F4F7' } },
      };
    }
    const dataRef = XLSX.utils.encode_cell({ r: 1, c });
    if (wsInfo[dataRef]) {
      wsInfo[dataRef].s = {
        font: { name: 'Calibri', sz: 11, bold: false, color: { rgb: '000000' } },
        alignment: { vertical: 'center', horizontal: 'center' },
        border: cellBorders,
      };
    }
  }

  XLSX.utils.book_append_sheet(wb, wsInfo, 'Información del Proyecto');

  // ════════════════════════════════════════════════════════════════════════════
  // ── HOJA 2: Productos (Estructura de 5 columnas idéntica a la imagen) ───────
  // ════════════════════════════════════════════════════════════════════════════
  if (processedProducts.length > 0) {
    const productRows = [];
    const productMerges = [];
    const rowStyles = [];

    processedProducts.forEach((prod) => {
      const prodName = prod.product_name || prod.name || 'Producto sin nombre';
      const prodQty = prod.quantity;
      const subtotalProd = prod.subtotal || 0;

      // 1. Encabezado de la tabla del producto (5 columnas)
      rowStyles.push({ type: 'header' });
      productRows.push([
        `Componentes de: ${prodName}`,
        'Cant.',
        'P. Unitario (COP)',
        'Subtotal (COP)',
        'Total',
      ]);

      // 2. Filas de componentes / ítems
      const itemsCount = prod.items ? prod.items.length : 0;
      const firstItemRow = productRows.length;

      if (itemsCount > 0) {
        prod.items.forEach((item, idx) => {
          rowStyles.push({ type: 'item' });
          productRows.push([
            `› ${item.item_name || item.description || 'Ítem'}`,
            item.quantity,
            item.price,
            item.total,
            idx === 0 ? subtotalProd : '',
          ]);
        });
      }

      // 3. Fila de resumen del producto (Cols A-C combinadas, Col D con P. Unitario, Col E combinada con Total)
      const summaryRowIdx = productRows.length;
      rowStyles.push({ type: 'summary' });
      productRows.push([
        `${prodName}  X${prodQty} ${prodQty === 1 ? 'unidad' : 'unidades'}`,
        '',
        '',
        prod.total_price || 0,
        itemsCount === 0 ? subtotalProd : '',
      ]);
      productMerges.push({
        s: { r: summaryRowIdx, c: 0 },
        e: { r: summaryRowIdx, c: 2 },
      });

      // Merge Columna E a lo largo de toda la tabla del producto (incluyendo la fila de resumen)
      if (firstItemRow < summaryRowIdx) {
        productMerges.push({
          s: { r: firstItemRow, c: 4 },
          e: { r: summaryRowIdx, c: 4 },
        });
      }

      // 4. Fila en blanco para separar el siguiente producto (sin bordes)
      rowStyles.push({ type: 'blank' });
      productRows.push([]);
    });

    // 5. Fila final de Total General Productos (Cols A-D combinadas, Col E con total general)
    const grandTotalRowIdx = productRows.length;
    rowStyles.push({ type: 'grandTotal' });
    productRows.push([
      'TOTAL GENERAL PRODUCTOS',
      '',
      '',
      '',
      totalSubtotal,
    ]);
    productMerges.push({
      s: { r: grandTotalRowIdx, c: 0 },
      e: { r: grandTotalRowIdx, c: 3 },
    });

    const wsProducts = XLSX.utils.aoa_to_sheet(productRows);
    wsProducts['!cols'] = [
      { wch: 55 }, // Componentes de: Producto (Col A)
      { wch: 10 }, // Cant. (Col B)
      { wch: 20 }, // P. Unitario (COP) (Col C)
      { wch: 20 }, // Subtotal (COP) (Col D)
      { wch: 18 }, // Total (Col E)
    ];
    wsProducts['!merges'] = productMerges;

    // Aplicar estilos de celda (bordes y negritas exactos como en la captura)
    rowStyles.forEach((info, r) => {
      if (info.type === 'blank') return;

      for (let c = 0; c < 5; c++) {
        const cellRef = XLSX.utils.encode_cell({ r, c });
        if (!wsProducts[cellRef]) {
          wsProducts[cellRef] = { t: 'z', v: '' };
        }

        if (info.type === 'header') {
          wsProducts[cellRef].s = {
            font: { name: 'Calibri', sz: 11, bold: true, color: { rgb: '000000' } },
            alignment: { vertical: 'center', horizontal: c === 4 ? 'center' : 'left' },
            border: cellBorders,
          };
        } else if (info.type === 'item') {
          if (c === 4) {
            // Col E: Total del producto centrado vertical y horizontalmente en negrita
            wsProducts[cellRef].s = {
              font: { name: 'Calibri', sz: 11, bold: true, color: { rgb: '000000' } },
              alignment: { vertical: 'center', horizontal: 'center' },
              border: cellBorders,
            };
          } else {
            wsProducts[cellRef].s = {
              font: { name: 'Calibri', sz: 11, bold: false, color: { rgb: '000000' } },
              alignment: {
                vertical: 'center',
                horizontal: c === 0 ? 'left' : 'right',
              },
              border: cellBorders,
            };
          }
        } else if (info.type === 'summary') {
          wsProducts[cellRef].s = {
            font: { name: 'Calibri', sz: 11, bold: true, color: { rgb: '000000' } },
            alignment: {
              vertical: 'center',
              horizontal: (c <= 2 || c === 4) ? 'center' : 'right',
            },
            border: summaryCellBorders,
          };
        } else if (info.type === 'grandTotal') {
          wsProducts[cellRef].s = {
            font: { name: 'Calibri', sz: 11, bold: true, color: { rgb: '000000' } },
            alignment: { vertical: 'center', horizontal: 'center' },
            border: summaryCellBorders,
          };
        }
      }
    });

    XLSX.utils.book_append_sheet(wb, wsProducts, 'Productos');
  }

  // ════════════════════════════════════════════════════════════════════════════
  // ── HOJA 3: Items Adicionales (Mismo formato con bordes y negrita) ──────────
  // ════════════════════════════════════════════════════════════════════════════
  if (processedAdditionalItems.length > 0) {
    const itemRows = [
      ['Descripción', 'Cant.', 'P. Unitario (COP)', 'Subtotal (COP)', 'Total'],
    ];
    const itemRowStyles = [{ type: 'header' }];
    const itemMerges = [];

    processedAdditionalItems.forEach((item) => {
      itemRowStyles.push({ type: 'item' });
      itemRows.push([
        `› ${item.item_name || item.description || 'Ítem'}`,
        item.quantity,
        item.price,
        item.total,
        item.total,
      ]);
    });

    // Fila final de Total Items Adicionales (Cols A-D combinadas, Col E con el total)
    const itemsSummaryRowIdx = itemRows.length;
    itemRowStyles.push({ type: 'summary' });
    itemRows.push([
      'TOTAL ITEMS ADICIONALES',
      '',
      '',
      '',
      additionalItemsTotal,
    ]);
    itemMerges.push({
      s: { r: itemsSummaryRowIdx, c: 0 },
      e: { r: itemsSummaryRowIdx, c: 3 },
    });

    const wsItems = XLSX.utils.aoa_to_sheet(itemRows);
    wsItems['!cols'] = [
      { wch: 55 }, // Descripción
      { wch: 10 }, // Cant.
      { wch: 20 }, // P. Unitario (COP)
      { wch: 20 }, // Subtotal (COP)
      { wch: 18 }, // Total
    ];
    wsItems['!merges'] = itemMerges;

    // Aplicar estilos de celda (bordes y negritas)
    itemRowStyles.forEach((info, r) => {
      for (let c = 0; c < 5; c++) {
        const cellRef = XLSX.utils.encode_cell({ r, c });
        if (!wsItems[cellRef]) {
          wsItems[cellRef] = { t: 'z', v: '' };
        }

        if (info.type === 'header') {
          wsItems[cellRef].s = {
            font: { name: 'Calibri', sz: 11, bold: true, color: { rgb: '000000' } },
            alignment: { vertical: 'center', horizontal: c === 4 ? 'center' : 'left' },
            border: cellBorders,
          };
        } else if (info.type === 'item') {
          wsItems[cellRef].s = {
            font: { name: 'Calibri', sz: 11, bold: false, color: { rgb: '000000' } },
            alignment: {
              vertical: 'center',
              horizontal: c === 0 ? 'left' : (c === 4 ? 'center' : 'right'),
            },
            border: cellBorders,
          };
        } else if (info.type === 'summary') {
          wsItems[cellRef].s = {
            font: { name: 'Calibri', sz: 11, bold: true, color: { rgb: '000000' } },
            alignment: { vertical: 'center', horizontal: 'center' },
            border: summaryCellBorders,
          };
        }
      }
    });

    XLSX.utils.book_append_sheet(wb, wsItems, 'Items');
  }

  const fileName = `presupuesto_proyecto_${project.id}.xlsx`;

  XLSX.writeFile(wb, fileName);
}
