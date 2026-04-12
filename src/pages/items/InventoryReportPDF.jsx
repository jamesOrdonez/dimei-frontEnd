import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import numeral from 'numeral';

const fCurrency = (number) => numeral(number).format('$0,0');

const styles = StyleSheet.create({
  page: { 
    padding: 30, 
    fontSize: 9, 
    fontFamily: 'Helvetica', 
    color: '#334155' 
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#3b82f6',
    paddingBottom: 10,
  },
  logo: { width: 100, height: 40 },
  headerTextContainer: { textAlign: 'right' },
  title: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#1e40af',
    marginBottom: 2
  },
  subtitle: { 
    fontSize: 10, 
    color: '#64748b' 
  },
  
  // Summary Cards Section
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 10,
  },
  summaryCard: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  summaryLabel: {
    fontSize: 8,
    color: '#64748b',
    textTransform: 'uppercase',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0f172a',
  },

  // Table Styles
  table: {
    display: 'flex',
    flexDirection: 'column',
    width: 'auto',
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderBottomWidth: 1,
    borderBottomColor: '#cbd5e1',
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#e2e8f0',
    paddingVertical: 6,
    paddingHorizontal: 4,
    alignItems: 'center',
  },
  colId: { width: '6%' },
  colDesc: { width: '25%' },
  colLocation: { width: '18%' },
  colGroup: { width: '12%' },
  colQty: { width: '8%', textAlign: 'center' },
  colPrice: { width: '14%', textAlign: 'right' },
  colTotal: { width: '17%', textAlign: 'right' },
  
  boldText: { fontWeight: 'bold' },
  
  // Footer
  footer: {
    marginTop: 30,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 8,
    color: '#94a3b8',
  }
});

export default function InventoryReportPDF({ data, stats, user }) {
  const dateStr = new Date().toLocaleDateString();
  
  return (
    <Document title="Reporte de Inventario">
      <Page size="A4" style={styles.page}>
        {/* HEADER */}
        <View style={styles.headerContainer}>
          <Image style={styles.logo} src="/img/logo.png" />
          <View style={styles.headerTextContainer}>
            <Text style={styles.title}>REPORTE DE INVENTARIO</Text>
            <Text style={styles.subtitle}>Generado el {dateStr}</Text>
          </View>
        </View>

        {/* SUMMARY CARDS */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Items Registrados</Text>
            <Text style={styles.summaryValue}>{stats.distinctItems}</Text>
          </View>
          <View style={[styles.summaryCard, { borderLeftWidth: 4, borderLeftColor: '#10b981' }]}>
            <Text style={styles.summaryLabel}>Valor Total del Inventario</Text>
            <Text style={[styles.summaryValue, { color: '#059669' }]}>{fCurrency(stats.totalValue)}</Text>
          </View>
        </View>

        {/* TABLE */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.colId, styles.boldText]}>ID</Text>
            <Text style={[styles.colDesc, styles.boldText]}>Descripción</Text>
            <Text style={[styles.colLocation, styles.boldText]}>Ubicación</Text>
            <Text style={[styles.colGroup, styles.boldText]}>Grupo</Text>
            <Text style={[styles.colQty, styles.boldText, { textAlign: 'center' }]}>Cant.</Text>
            <Text style={[styles.colPrice, styles.boldText, { textAlign: 'right' }]}>Precio</Text>
            <Text style={[styles.colTotal, styles.boldText, { textAlign: 'right' }]}>Subtotal</Text>
          </View>

          {data.map((item, index) => (
            <View key={index} style={styles.tableRow} wrap={false}>
              <Text style={styles.colId}>{item.id}</Text>
              <Text style={styles.colDesc}>{item.description}</Text>
              <Text style={styles.colLocation}>{item.location || '-'}</Text>
              <Text style={styles.colGroup}>{item.Grupo || 'N/A'}</Text>
              <Text style={styles.colQty}>{item.amount}</Text>
              <Text style={styles.colPrice}>{fCurrency(item.price)}</Text>
              <Text style={[styles.colTotal, styles.boldText]}>{fCurrency(Number(item.amount) * Number(item.price || 0))}</Text>
            </View>
          ))}
        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Generado por: {user}</Text>
          <Text style={styles.footerText}>DIMEI - Sistema de Gestión de Inventarios</Text>
        </View>
      </Page>
    </Document>
  );
}
