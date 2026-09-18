import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    paddingTop: 24,
    paddingBottom: 28,
    paddingHorizontal: 24,
    fontSize: 7.5,
    fontFamily: 'Helvetica',
    color: '#1e293b',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1.5,
    borderBottomColor: '#2563eb',
    paddingBottom: 8,
  },
  logo: {
    width: 95,
    height: 35,
    objectFit: 'contain',
  },
  headerRight: {
    textAlign: 'right',
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 8,
    color: '#64748b',
  },

  // Metadata de consulta
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 4,
    padding: 6,
    marginBottom: 10,
  },
  metaItem: {
    fontSize: 7.5,
    color: '#334155',
  },
  metaBold: {
    fontWeight: 'bold',
    color: '#0f172a',
  },

  // Tarjetas de Resumen
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 6,
  },
  summaryCard: {
    flex: 1,
    padding: 6,
    borderRadius: 4,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  summaryCardHighlight: {
    backgroundColor: '#f0fdf4',
    borderColor: '#86efac',
  },
  summaryLabel: {
    fontSize: 6.5,
    color: '#64748b',
    textTransform: 'uppercase',
    fontWeight: 'bold',
    marginBottom: 2,
    textAlign: 'center',
  },
  summaryValue: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  summaryValueGreen: {
    color: '#15803d',
  },

  // Tabla
  table: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 3,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    paddingVertical: 5,
    paddingHorizontal: 2,
    alignItems: 'center',
  },
  tableHeaderCell: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 6.8,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#e2e8f0',
    paddingVertical: 4,
    paddingHorizontal: 2,
    alignItems: 'center',
  },
  tableRowOvertime: {
    backgroundColor: '#f0fdf4',
  },
  tableRowAlt: {
    backgroundColor: '#f8fafc',
  },
  tableCell: {
    fontSize: 7,
    color: '#334155',
    textAlign: 'center',
  },
  cellTextLeft: {
    textAlign: 'left',
    paddingLeft: 3,
  },
  cellBold: {
    fontWeight: 'bold',
  },
  overtimeNumber: {
    color: '#15803d',
    fontWeight: 'bold',
  },

  // Anchos de Columna (Total 100%)
  colEmpleado: { width: '15%' },
  colRol: { width: '10%' },
  colFecha: { width: '9%' },
  colTipoDia: { width: '8%' },
  colEntrada: { width: '6%' },
  colAlmuerzo: { width: '8%' },
  colSalida: { width: '6%' },
  colLaborado: { width: '7%' },
  colHEDiurna: { width: '5%' },
  colHENocturna: { width: '5%' },
  colHEDiurnaDF: { width: '5%' },
  colHENocturnaDF: { width: '5%' },
  colTotalHE: { width: '6%' },
  colJustificacion: { width: '10%' },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 12,
    left: 24,
    right: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 0.5,
    borderTopColor: '#cbd5e1',
    paddingTop: 4,
  },
  footerText: {
    fontSize: 6.5,
    color: '#94a3b8',
  },
});

function formatTimeOnly(dateStr) {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
  } catch (e) {
    return '—';
  }
}

export default function ReporteHorasExtraPDF({ rows, startDate, endDate, companyName = 'DIMEI' }) {
  const totales = rows.reduce(
    (acc, r) => ({
      diurna: acc.diurna + (r.diurna || 0),
      nocturna: acc.nocturna + (r.nocturna || 0),
      diurnaDF: acc.diurnaDF + (r.diurnaDF || 0),
      nocturnaDF: acc.nocturnaDF + (r.nocturnaDF || 0),
      total: acc.total + (r.totalExtra || 0),
    }),
    { diurna: 0, nocturna: 0, diurnaDF: 0, nocturnaDF: 0, total: 0 }
  );

  const generationDate = new Date().toLocaleString('es-CO');

  return (
    <Document title={`Reporte_Horas_Extra_${startDate}_${endDate}`}>
      <Page size="A4" orientation="landscape" style={styles.page}>
        {/* Encabezado */}
        <View style={styles.header}>
          <Image style={styles.logo} src="/img/logo.png" />
          <View style={styles.headerRight}>
            <Text style={styles.title}>REPORTE OFICIAL DE HORAS EXTRA</Text>
            <Text style={styles.subtitle}>Empresa: {companyName} · Generado el {generationDate}</Text>
          </View>
        </View>

        {/* Metadatos del Filtro */}
        <View style={styles.metaContainer}>
          <Text style={styles.metaItem}>
            <Text style={styles.metaBold}>Período:</Text> {startDate} al {endDate}
          </Text>
          <Text style={styles.metaItem}>
            <Text style={styles.metaBold}>Total de Registros:</Text> {rows.length}
          </Text>
          <Text style={styles.metaItem}>
            <Text style={styles.metaBold}>Registros con H.E.:</Text> {rows.filter((r) => (r.totalExtra || 0) > 0).length}
          </Text>
        </View>

        {/* Resumen de Totales */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>H.E. Diurnas</Text>
            <Text style={styles.summaryValue}>{totales.diurna}h</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>H.E. Nocturnas</Text>
            <Text style={styles.summaryValue}>{totales.nocturna}h</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>H.E. Diurnas D/F</Text>
            <Text style={styles.summaryValue}>{totales.diurnaDF}h</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>H.E. Nocturnas D/F</Text>
            <Text style={styles.summaryValue}>{totales.nocturnaDF}h</Text>
          </View>
          <View style={[styles.summaryCard, styles.summaryCardHighlight]}>
            <Text style={[styles.summaryLabel, { color: '#15803d' }]}>Total Horas Extra</Text>
            <Text style={[styles.summaryValue, styles.summaryValueGreen]}>{totales.total}h</Text>
          </View>
        </View>

        {/* Tabla Detallada */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.colEmpleado]}>EMPLEADO</Text>
            <Text style={[styles.tableHeaderCell, styles.colRol]}>ROL</Text>
            <Text style={[styles.tableHeaderCell, styles.colFecha]}>FECHA</Text>
            <Text style={[styles.tableHeaderCell, styles.colTipoDia]}>TIPO DÍA</Text>
            <Text style={[styles.tableHeaderCell, styles.colEntrada]}>ENTRADA</Text>
            <Text style={[styles.tableHeaderCell, styles.colAlmuerzo]}>ALMUERZO</Text>
            <Text style={[styles.tableHeaderCell, styles.colSalida]}>SALIDA</Text>
            <Text style={[styles.tableHeaderCell, styles.colLaborado]}>T. LAB.</Text>
            <Text style={[styles.tableHeaderCell, styles.colHEDiurna]}>DIUR.</Text>
            <Text style={[styles.tableHeaderCell, styles.colHENocturna]}>NOCT.</Text>
            <Text style={[styles.tableHeaderCell, styles.colHEDiurnaDF]}>D. D/F</Text>
            <Text style={[styles.tableHeaderCell, styles.colHENocturnaDF]}>N. D/F</Text>
            <Text style={[styles.tableHeaderCell, styles.colTotalHE]}>TOTAL</Text>
            <Text style={[styles.tableHeaderCell, styles.colJustificacion]}>JUSTIFICACIÓN</Text>
          </View>

          {rows.map((row, index) => {
            const hasOvertime = (row.totalExtra || 0) > 0;
            const rowStyle = hasOvertime
              ? styles.tableRowOvertime
              : index % 2 === 1
              ? styles.tableRowAlt
              : {};

            const lunchText =
              row.lunchStart && row.lunchEnd
                ? `${formatTimeOnly(row.lunchStart)}-${formatTimeOnly(row.lunchEnd)}`
                : '—';

            const tipoDia = row.isHoliday
              ? (row.holidayName ? `Festivo: ${row.holidayName.substring(0, 10)}` : 'Festivo')
              : row.esDominical
              ? 'Domingo'
              : row.esSabado
              ? 'Sábado'
              : 'Ordinario';

            const tiempoLab =
              row.minutosNeto > 0
                ? `${Math.floor(row.minutosNeto / 60)}h ${row.minutosNeto % 60}m`
                : '—';

            return (
              <View key={row.id || index} style={[styles.tableRow, rowStyle]}>
                <Text style={[styles.tableCell, styles.colEmpleado, styles.cellTextLeft, styles.cellBold]}>
                  {row.userName || '—'}
                </Text>
                <Text style={[styles.tableCell, styles.colRol, styles.cellTextLeft]}>
                  {row.rolName || '—'}
                </Text>
                <Text style={[styles.tableCell, styles.colFecha]}>{row.date || '—'}</Text>
                <Text style={[styles.tableCell, styles.colTipoDia]}>{tipoDia}</Text>
                <Text style={[styles.tableCell, styles.colEntrada]}>{formatTimeOnly(row.entryTime)}</Text>
                <Text style={[styles.tableCell, styles.colAlmuerzo]}>{lunchText}</Text>
                <Text style={[styles.tableCell, styles.colSalida]}>
                  {row.isPendingExit ? 'En curso' : formatTimeOnly(row.exitTime)}
                </Text>
                <Text style={[styles.tableCell, styles.colLaborado]}>{tiempoLab}</Text>
                <Text style={[styles.tableCell, styles.colHEDiurna, row.diurna > 0 ? styles.overtimeNumber : {}]}>
                  {row.diurna > 0 ? `${row.diurna}h` : '—'}
                </Text>
                <Text style={[styles.tableCell, styles.colHENocturna, row.nocturna > 0 ? styles.overtimeNumber : {}]}>
                  {row.nocturna > 0 ? `${row.nocturna}h` : '—'}
                </Text>
                <Text style={[styles.tableCell, styles.colHEDiurnaDF, row.diurnaDF > 0 ? styles.overtimeNumber : {}]}>
                  {row.diurnaDF > 0 ? `${row.diurnaDF}h` : '—'}
                </Text>
                <Text style={[styles.tableCell, styles.colHENocturnaDF, row.nocturnaDF > 0 ? styles.overtimeNumber : {}]}>
                  {row.nocturnaDF > 0 ? `${row.nocturnaDF}h` : '—'}
                </Text>
                <Text style={[styles.tableCell, styles.colTotalHE, hasOvertime ? styles.overtimeNumber : {}]}>
                  {hasOvertime ? `${row.totalExtra}h` : '—'}
                </Text>
                <Text style={[styles.tableCell, styles.colJustificacion, styles.cellTextLeft]}>
                  {row.overtimeJustification ? (row.overtimeJustification.length > 25 ? `${row.overtimeJustification.substring(0, 25)}...` : row.overtimeJustification) : '—'}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            DIMEI · Sistema de Gestión de Tiempos y Asistencia
          </Text>
          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  );
}
