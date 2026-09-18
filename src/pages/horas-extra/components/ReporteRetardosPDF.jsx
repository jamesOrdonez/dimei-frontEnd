import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    paddingTop: 28,
    paddingBottom: 28,
    paddingHorizontal: 28,
    fontSize: 8,
    fontFamily: 'Helvetica',
    color: '#1e293b',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    borderBottomWidth: 1.5,
    borderBottomColor: '#dc2626',
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
    fontSize: 15,
    fontWeight: 'bold',
    color: '#991b1b',
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
    marginBottom: 12,
  },
  metaItem: {
    fontSize: 8,
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
    marginBottom: 14,
    gap: 10,
  },
  summaryCard: {
    flex: 1,
    padding: 8,
    borderRadius: 4,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  summaryCardRed: {
    backgroundColor: '#fff5f5',
    borderColor: '#fecaca',
  },
  summaryCardOrange: {
    backgroundColor: '#fffaf5',
    borderColor: '#fed7aa',
  },
  summaryLabel: {
    fontSize: 7,
    color: '#64748b',
    textTransform: 'uppercase',
    fontWeight: 'bold',
    marginBottom: 3,
    textAlign: 'center',
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  summaryValueRed: {
    color: '#dc2626',
  },
  summaryValueOrange: {
    color: '#c2410c',
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
    paddingVertical: 6,
    paddingHorizontal: 4,
    alignItems: 'center',
  },
  tableHeaderCell: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 7.5,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#e2e8f0',
    paddingVertical: 5,
    paddingHorizontal: 4,
    alignItems: 'center',
  },
  tableRowLate: {
    backgroundColor: '#fff5f5',
  },
  tableRowAlt: {
    backgroundColor: '#f8fafc',
  },
  tableCell: {
    fontSize: 7.5,
    color: '#334155',
    textAlign: 'center',
  },
  cellTextLeft: {
    textAlign: 'left',
    paddingLeft: 4,
  },
  cellBold: {
    fontWeight: 'bold',
  },
  lateNumber: {
    color: '#dc2626',
    fontWeight: 'bold',
  },
  punctualBadge: {
    color: '#15803d',
    fontWeight: 'bold',
  },

  // Anchos de Columna (Total 100%)
  colEmpleado: { width: '20%' },
  colRol: { width: '15%' },
  colFecha: { width: '13%' },
  colHorario: { width: '13%' },
  colEntrada: { width: '13%' },
  colRetardo: { width: '13%' },
  colEstado: { width: '13%' },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 12,
    left: 28,
    right: 28,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 0.5,
    borderTopColor: '#cbd5e1',
    paddingTop: 4,
  },
  footerText: {
    fontSize: 7,
    color: '#94a3b8',
  },
});

function formatMinutes(mins) {
  if (!mins || mins <= 0) return '0 min';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m} min`;
}

function formatTimeOnly(dateStr) {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
  } catch (e) {
    return '—';
  }
}

export default function ReporteRetardosPDF({ rows, startDate, endDate, companyName = 'DIMEI' }) {
  const retardosValidos = rows.filter((r) => (r.minutosRetardo || 0) >= 10);
  const totalMinutosRetardo = retardosValidos.reduce((acc, r) => acc + (r.minutosRetardo || 0), 0);
  const totalCasosRetardo = retardosValidos.length;
  const promedioRetardo = totalCasosRetardo > 0 ? Math.round(totalMinutosRetardo / totalCasosRetardo) : 0;

  const generationDate = new Date().toLocaleString('es-CO');

  return (
    <Document title={`Reporte_Retardos_${startDate}_${endDate}`}>
      <Page size="A4" orientation="portrait" style={styles.page}>
        {/* Encabezado */}
        <View style={styles.header}>
          <Image style={styles.logo} src="/img/logo.png" />
          <View style={styles.headerRight}>
            <Text style={styles.title}>REPORTE OFICIAL DE RETARDOS</Text>
            <Text style={styles.subtitle}>Empresa: {companyName} · Generado el {generationDate}</Text>
          </View>
        </View>

        {/* Metadatos */}
        <View style={styles.metaContainer}>
          <Text style={styles.metaItem}>
            <Text style={styles.metaBold}>Período:</Text> {startDate} al {endDate}
          </Text>
          <Text style={styles.metaItem}>
            <Text style={styles.metaBold}>Criterio:</Text> Retardos ≥ 10 minutos
          </Text>
          <Text style={styles.metaItem}>
            <Text style={styles.metaBold}>Total Evaluados:</Text> {rows.length} registros
          </Text>
        </View>

        {/* Resumen KPIs */}
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, styles.summaryCardRed]}>
            <Text style={[styles.summaryLabel, { color: '#991b1b' }]}>Tiempo Total en Retardos</Text>
            <Text style={[styles.summaryValue, styles.summaryValueRed]}>
              {formatMinutes(totalMinutosRetardo)}
            </Text>
          </View>
          <View style={[styles.summaryCard, styles.summaryCardOrange]}>
            <Text style={[styles.summaryLabel, { color: '#9a3412' }]}>Llegadas Tarde (≥ 10m)</Text>
            <Text style={[styles.summaryValue, styles.summaryValueOrange]}>
              {totalCasosRetardo}
            </Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Promedio por Retardo</Text>
            <Text style={styles.summaryValue}>{promedioRetardo} min</Text>
          </View>
        </View>

        {/* Tabla */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.colEmpleado]}>EMPLEADO</Text>
            <Text style={[styles.tableHeaderCell, styles.colRol]}>ROL</Text>
            <Text style={[styles.tableHeaderCell, styles.colFecha]}>FECHA</Text>
            <Text style={[styles.tableHeaderCell, styles.colHorario]}>HORARIO OFICIAL</Text>
            <Text style={[styles.tableHeaderCell, styles.colEntrada]}>ENTRADA REAL</Text>
            <Text style={[styles.tableHeaderCell, styles.colRetardo]}>RETARDO</Text>
            <Text style={[styles.tableHeaderCell, styles.colEstado]}>ESTADO</Text>
          </View>

          {rows.map((row, index) => {
            const delay = row.minutosRetardo || 0;
            const isLate = delay >= 10;
            const rowStyle = isLate
              ? styles.tableRowLate
              : index % 2 === 1
              ? styles.tableRowAlt
              : {};

            const scheduledTime = row.scheduledEntryTime
              ? row.scheduledEntryTime.substring(0, 5)
              : 'Sin horario';

            let estadoTexto = 'Puntual (<10m)';
            if (delay > 30) estadoTexto = 'Retardo Severo';
            else if (delay >= 20) estadoTexto = 'Retardo Moderado';
            else if (delay >= 10) estadoTexto = 'Retardo Leve';
            else if (!row.entryTime) estadoTexto = 'Sin Entrada';

            return (
              <View key={row.id || index} style={[styles.tableRow, rowStyle]}>
                <Text style={[styles.tableCell, styles.colEmpleado, styles.cellTextLeft, styles.cellBold]}>
                  {row.userName || '—'}
                </Text>
                <Text style={[styles.tableCell, styles.colRol, styles.cellTextLeft]}>
                  {row.rolName || '—'}
                </Text>
                <Text style={[styles.tableCell, styles.colFecha]}>{row.date || '—'}</Text>
                <Text style={[styles.tableCell, styles.colHorario]}>{scheduledTime}</Text>
                <Text style={[styles.tableCell, styles.colEntrada]}>
                  {formatTimeOnly(row.entryTime)}
                </Text>
                <Text style={[styles.tableCell, styles.colRetardo, isLate ? styles.lateNumber : {}]}>
                  {isLate ? `+${delay} min` : (row.entryTime ? '0 min' : '—')}
                </Text>
                <Text style={[styles.tableCell, styles.colEstado, isLate ? styles.lateNumber : styles.punctualBadge]}>
                  {estadoTexto}
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
