import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

import { fCurrency } from '../../../utils/formatNumber';

const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 10, fontFamily: 'Helvetica' },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingBottom: 10,
  },
  headerTextContainer: { flex: 1 },
  logo: { width: 120, maxHeight: 60, marginLeft: 20 },
  title: { fontSize: 16, fontFamily: 'Helvetica-Bold', color: '#1e293b', marginBottom: 4 },
  subtitle: { fontSize: 10, color: '#64748b' },
  table: { display: 'flex', flexDirection: 'column', width: 'auto', marginTop: 10, borderStyle: 'solid', borderWidth: 1, borderColor: '#e2e8f0' },
  tableHeader: { flexDirection: 'row', backgroundColor: '#f8fafc', borderBottomWidth: 1, borderBottomColor: '#e2e8f0', paddingVertical: 6, paddingHorizontal: 4 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#e2e8f0', paddingVertical: 6, paddingHorizontal: 4 },
  colId: { width: '6%', textAlign: 'center' },
  colItem: { width: '24%' },
  colTotalInv: { width: '10%', textAlign: 'center' },
  colComp: { width: '10%', textAlign: 'center' },
  colLibre: { width: '10%', textAlign: 'center' },
  colBuy: { width: '12%', textAlign: 'center' },
  colPrice: { width: '14%', textAlign: 'right' },
  colTotalBuy: { width: '14%', textAlign: 'right' },
  colHeader: { fontFamily: 'Helvetica-Bold', fontSize: 9, color: '#475569' },
  rowText: { fontSize: 9, color: '#334155' },
  rowTextBold: { fontSize: 9, color: '#334155', fontFamily: 'Helvetica-Bold' },
  rowTextRed: { fontSize: 9, color: '#e11d48', fontFamily: 'Helvetica-Bold' },
  summaryContainer: { marginTop: 20, flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 2, borderTopColor: '#e2e8f0', paddingTop: 10 },
  summaryBox: { width: '23%', padding: 10, backgroundColor: '#f8fafc', borderRadius: 4, borderWidth: 1, borderColor: '#e2e8f0' },
  summaryLabel: { fontSize: 9, color: '#64748b', marginBottom: 4, fontFamily: 'Helvetica-Bold' },
  summaryValue: { fontSize: 12, color: '#1e293b', fontFamily: 'Helvetica-Bold' },
  summaryValueRed: { fontSize: 12, color: '#e11d48', fontFamily: 'Helvetica-Bold' },
});

export default function InventoryComparisonPdf({ data, categories, summary, projectName }) {
  if (!data) return null;

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.headerContainer}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.title}>Reporte de Comparativa de Inventario</Text>
            {projectName && (
              <Text style={[styles.subtitle, { fontFamily: 'Helvetica-Bold', color: '#1e293b', fontSize: 11, marginBottom: 4 }]}>
                Proyecto: {projectName}
              </Text>
            )}
            <Text style={styles.subtitle}>Stock total, comprometido en proyectos, libre y déficit de compras.</Text>
            <Text style={styles.subtitle}>Generado el {new Date().toLocaleDateString()}</Text>
          </View>
          <Image style={styles.logo} src="/img/logo.png" />
        </View>

        <View style={styles.summaryContainer}>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>TOTAL ÍTEMS</Text>
            <Text style={styles.summaryValue}>{summary.totalItems}</Text>
          </View>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>COMPROMETIDO</Text>
            <Text style={styles.summaryValue}>{summary.committed} unds.</Text>
          </View>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>TOTAL DISP. LIBRE</Text>
            <Text style={styles.summaryValue}>{summary.available} unds.</Text>
          </View>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>TOTAL A COMPRAR</Text>
            <Text style={styles.summaryValueRed}>{summary.toBuyUnits} unds.</Text>
            <Text style={styles.summaryValueRed}>{fCurrency(summary.toBuyCost)}</Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.colId, styles.colHeader]}>ID</Text>
            <Text style={[styles.colItem, styles.colHeader]}>ÍTEM</Text>
            <Text style={[styles.colTotalInv, styles.colHeader]}>TOTAL INV.</Text>
            <Text style={[styles.colComp, styles.colHeader]}>COMPROMETIDO</Text>
            <Text style={[styles.colLibre, styles.colHeader]}>DISP. LIBRE</Text>
            <Text style={[styles.colBuy, styles.colHeader]}>A COMPRAR</Text>
            <Text style={[styles.colPrice, styles.colHeader]}>P. UNIT</Text>
            <Text style={[styles.colTotalBuy, styles.colHeader]}>SUMATORIA</Text>
          </View>

          {data.map((row, index) => {
            const catObj = categories.find(c => String(c.id) === String(row.category));
            const catName = catObj ? catObj.description || catObj.name : 'SIN CATEGORÍA';
            
            const total = Math.max(0, row.total_inventory);
            const comp = Math.max(0, row.separated_inventory);
            const lib = Math.max(0, row.available_inventory);
            const deficit = row.available_inventory < 0 ? Math.abs(row.available_inventory) : 0;
            const isBuy = row.available_inventory < 0;

            return (
              <View key={index} style={styles.tableRow} wrap={false}>
                <Text style={[styles.colId, styles.rowText]}>{row.id}</Text>
                <View style={styles.colItem}>
                  <Text style={styles.rowTextBold}>{row.item_name}</Text>
                  <Text style={{ fontSize: 8, color: '#94a3b8' }}>{catName}</Text>
                </View>
                <Text style={[styles.colTotalInv, styles.rowText]}>{total}</Text>
                <Text style={[styles.colComp, styles.rowText]}>{comp > 0 ? comp : '—'}</Text>
                <Text style={[styles.colLibre, styles.rowText]}>{lib}</Text>
                <Text style={[styles.colBuy, isBuy ? styles.rowTextRed : styles.rowText]}>{deficit > 0 ? deficit : '—'}</Text>
                <Text style={[styles.colPrice, styles.rowText]}>{fCurrency(row.price || 0)}</Text>
                <Text style={[styles.colTotalBuy, isBuy ? styles.rowTextRed : styles.rowText]}>{deficit > 0 ? fCurrency(deficit * (row.price || 0)) : '—'}</Text>
              </View>
            );
          })}
        </View>
      </Page>
    </Document>
  );
}
