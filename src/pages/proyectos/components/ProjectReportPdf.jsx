import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { fCurrency } from '../../../utils/formatNumber';

const styles = StyleSheet.create({
  page: {
    paddingTop: 28,
    paddingBottom: 40,
    paddingHorizontal: 32,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#1A1A2E',
    backgroundColor: '#FFFFFF',
  },

  // Header
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1565C0',
    borderRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  headerTitle: { fontSize: 16, fontFamily: 'Helvetica-Bold', color: '#FFFFFF' },
  headerSubtitle: { fontSize: 9, color: '#BBDEFB', marginTop: 3 },
  logo: { width: 100, maxHeight: 50, objectFit: 'contain' },

  // Info card
  infoCard: {
    backgroundColor: '#E3F2FD',
    borderRadius: 4,
    padding: 12,
    marginBottom: 18,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  infoItem: { width: '33%', marginBottom: 8 },
  infoLabel: {
    fontSize: 8,
    color: '#1565C0',
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  infoValue: { fontSize: 10, color: '#1A1A2E', fontFamily: 'Helvetica-Bold' },

  // Section
  section: { marginBottom: 18 },
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#1565C0',
    borderBottomWidth: 2,
    borderBottomColor: '#1565C0',
    paddingBottom: 4,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Table
  table: {
    borderWidth: 1,
    borderColor: '#CFD8DC',
    borderRadius: 3,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1565C0',
    paddingVertical: 7,
    paddingHorizontal: 8,
  },
  thText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },

  // Product rows
  productRow: {
    flexDirection: 'row',
    paddingVertical: 7,
    paddingHorizontal: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#CFD8DC',
  },
  productRowAlt: { backgroundColor: '#F8FBFF' },
  productName: { fontFamily: 'Helvetica-Bold', fontSize: 10, color: '#1A1A2E' },
  productQty: { fontFamily: 'Helvetica-Bold', fontSize: 10, color: '#1565C0', textAlign: 'center' },
  productPrice: { fontFamily: 'Helvetica-Bold', fontSize: 10, textAlign: 'right', color: '#455A64' },
  productSubtotal: { fontFamily: 'Helvetica-Bold', fontSize: 10, textAlign: 'right', color: '#2E7D32' },

  // Component breakdown
  componentBlock: {
    backgroundColor: '#F1F5F9',
    paddingLeft: 24,
    paddingRight: 8,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#CFD8DC',
  },
  componentHeader: {
    flexDirection: 'row',
    marginBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#CFD8DC',
    paddingBottom: 3,
  },
  componentHeaderText: { fontSize: 8, color: '#78909C', fontFamily: 'Helvetica-Oblique' },
  componentRow: { flexDirection: 'row', marginBottom: 3 },
  compDesc:  { width: '50%', fontSize: 9, color: '#455A64' },
  compQty:   { width: '15%', textAlign: 'center', fontSize: 9, color: '#455A64' },
  compPrice: { width: '17%', textAlign: 'right', fontSize: 9, color: '#455A64' },
  compTotal: { width: '18%', textAlign: 'right', fontSize: 9, color: '#455A64' },

  // Summary row
  summaryRow: {
    flexDirection: 'row',
    paddingVertical: 7,
    paddingHorizontal: 8,
    backgroundColor: '#E8F0FE',
    borderTopWidth: 2,
    borderTopColor: '#1565C0',
  },
  summaryLabel:    { fontFamily: 'Helvetica-Bold', fontSize: 10, color: '#1565C0' },
  summaryPrice:    { fontFamily: 'Helvetica-Bold', fontSize: 10, textAlign: 'right', color: '#1565C0' },
  summarySubtotal: { fontFamily: 'Helvetica-Bold', fontSize: 10, textAlign: 'right', color: '#1565C0' },

  // Grand total
  grandTotalBlock: {
    marginTop: 20,
    backgroundColor: '#1565C0',
    borderRadius: 4,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  grandTotalLabel:  { fontFamily: 'Helvetica-Bold', fontSize: 13, color: '#BBDEFB', marginRight: 20, textTransform: 'uppercase' },
  grandTotalAmount: { fontFamily: 'Helvetica-Bold', fontSize: 16, color: '#FFFFFF' },

  // Columns — products table (2 cols: desc+qty merged, subtotal)
  colDescWide: { width: '70%' },
  colSubtotalWide: { width: '30%', textAlign: 'right' },
  // Columns — items table (4 cols)
  colDesc:  { width: '50%' },
  colQty:   { width: '15%', textAlign: 'center' },
  colPrice: { width: '17%', textAlign: 'right' },
  colTotal: { width: '18%', textAlign: 'right' },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 16,
    left: 32,
    right: 32,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#CFD8DC',
    paddingTop: 5,
  },
  footerText: { fontSize: 8, color: '#78909C' },
});

export default function ProjectReportPdf({ project }) {
  if (!project) return null;

  const travelVal = parseFloat(project.travel) || 0;
  const necesitaEncerramiento = project.necesita_encerramiento === 1 || project.necesita_encerramiento === true;
  const metrosCuadrados = parseFloat(project.metros_cuadrados) || 0;

  const processedProducts = (project.products || []).map((prod) => {
    let productTotalUnit = 0;

    const esPorMetros = prod.por_metros_cuadrados === 1 || prod.por_metros_cuadrados === true;
    const productQty = (necesitaEncerramiento && esPorMetros && metrosCuadrados > 0)
      ? (Number(prod.quantity) || 1) * metrosCuadrados
      : (Number(prod.quantity) || 1);

    const processedItems = (prod.items || []).map((item) => {
      let finalQuantity = Number(item.quantity) || 1;

      if (item.variable === 1 || item.variable === '1') {
        const val1 = Number(item.value1) || 0;
        const val2 = Number(item.value2) || 0;
        finalQuantity = parseFloat(((travelVal * val1) + val2).toFixed(2));
      }

      const itemPrice = Number(item.price) || 0;
      const itemTotal = finalQuantity * itemPrice;
      productTotalUnit += itemTotal;

      return { ...item, quantity: finalQuantity, total: itemTotal };
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

  const totalPrecioUnit = processedProducts.reduce((acc, p) => acc + (p.total_price || 0), 0);
  const totalSubtotal   = processedProducts.reduce((acc, p) => acc + (p.subtotal    || 0), 0);

  const additionalItemsTotal = (project.items || []).reduce(
    (acc, item) => acc + (Number(item.price) * Number(item.quantity) || Number(item.total) || 0),
    0
  );

  const grandTotal = totalSubtotal + additionalItemsTotal;
  const today = new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <Document>
      <Page size="A4" style={styles.page}>

        {/* HEADER */}
        <View style={styles.headerBar}>
          <View>
            <Text style={styles.headerTitle}>Presupuesto de Proyecto #{project.id}</Text>
            <Text style={styles.headerSubtitle}>
              {project.customerName || project.customer || ''}  {'\u00b7'}  {today}
            </Text>
          </View>
          <Image style={styles.logo} src="/img/logo.png" />
        </View>

        {/* INFO CARD */}
        <View style={styles.infoCard}>
          {(project.customerName || project.customer) ? (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Cliente</Text>
              <Text style={styles.infoValue}>{project.customerName || project.customer}</Text>
            </View>
          ) : null}
          {project.elevatorTypeName ? (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Sistema Motriz</Text>
              <Text style={styles.infoValue}>{project.elevatorTypeName}</Text>
            </View>
          ) : null}
          {project.typeDriveSystemName ? (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Tipo de Ascensor</Text>
              <Text style={styles.infoValue}>{project.typeDriveSystemName}</Text>
            </View>
          ) : null}
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>N{'\u00b0'} Paradas</Text>
            <Text style={styles.infoValue}>{project.stopNumber || 0}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Recorrido</Text>
            <Text style={styles.infoValue}>{project.travel || 0} m</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Capacidad</Text>
            <Text style={styles.infoValue}>{project.capacity || 0} kg</Text>
          </View>
          {necesitaEncerramiento && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Encerramiento</Text>
              <Text style={styles.infoValue}>{'S\u00ed \u2014 '}{metrosCuadrados} m{'\u00b2'}</Text>
            </View>
          )}
        </View>

        {/* PRODUCTS TABLE */}
        {processedProducts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Productos del Proyecto</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.colDescWide,    styles.thText]}>{'Descripci\u00f3n'}</Text>
                <Text style={[styles.colSubtotalWide,styles.thText]}>Subtotal</Text>
              </View>

              {processedProducts.map((prod, index) => (
                <View key={`prod-${index}`}>
                  {prod.items && prod.items.length > 0 && (
                    <View style={styles.componentBlock}>
                      <View style={styles.componentHeader}>
                        <Text style={[styles.compDesc,  styles.componentHeaderText]}>Componentes de: {prod.product_name}</Text>
                        <Text style={[styles.compQty,   styles.componentHeaderText]}>Cant.</Text>
                        <Text style={[styles.compPrice, styles.componentHeaderText]}>P. Unit</Text>
                        <Text style={[styles.compTotal, styles.componentHeaderText]}>Subtotal</Text>
                      </View>
                      {prod.items.map((item, idx) => (
                        <View style={styles.componentRow} key={`pitem-${idx}`}>
                          <Text style={styles.compDesc}>{' \u203a '}{item.item_name || 'Item'}</Text>
                          <Text style={styles.compQty}>{item.quantity}</Text>
                          <Text style={styles.compPrice}>{fCurrency(item.price)}</Text>
                          <Text style={styles.compTotal}>{fCurrency(item.total)}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  <View style={[styles.productRow, index % 2 !== 0 && styles.productRowAlt]}>
                    <Text style={[styles.colDescWide, styles.productName]}>
                      {prod.product_name || 'Producto sin nombre'}
                      <Text style={{ fontFamily: 'Helvetica-Bold' }}>{'  X'}{prod.quantity}{prod.quantity === 1 ? ' unidad' : ' unidades'}</Text>
                    </Text>
                    <Text style={[styles.colSubtotalWide, styles.productSubtotal]}>{fCurrency(prod.subtotal)}</Text>
                  </View>
                </View>
              ))}

              <View style={styles.summaryRow}>
                <Text style={[styles.colDescWide,     styles.summaryLabel]}>TOTAL PRODUCTOS</Text>
                <Text style={[styles.colSubtotalWide, styles.summarySubtotal]}>{fCurrency(totalSubtotal)}</Text>
              </View>
            </View>
          </View>
        )}

        {/* ADDITIONAL ITEMS TABLE */}
        {project.items && project.items.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Items Adicionales</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.colDesc,  styles.thText]}>{'Descripci\u00f3n'}</Text>
                <Text style={[styles.colQty,   styles.thText]}>Cantidad</Text>
                <Text style={[styles.colPrice, styles.thText]}>Precio Unit.</Text>
                <Text style={[styles.colTotal, styles.thText]}>Subtotal</Text>
              </View>

              {project.items.map((item, idx) => (
                <View style={[styles.productRow, idx % 2 !== 0 && styles.productRowAlt]} key={`additem-${idx}`}>
                  <Text style={[styles.colDesc,  styles.productName]}>{item.item_name || 'Item'}</Text>
                  <Text style={[styles.colQty,   styles.productQty]}>{item.quantity}</Text>
                  <Text style={[styles.colPrice, styles.productPrice]}>{fCurrency(item.price)}</Text>
                  <Text style={[styles.colTotal, styles.productSubtotal]}>
                    {fCurrency(Number(item.price) * Number(item.quantity) || Number(item.total))}
                  </Text>
                </View>
              ))}

              <View style={styles.summaryRow}>
                <Text style={[styles.colDesc,  styles.summaryLabel]}>TOTAL ITEMS ADICIONALES</Text>
                <Text style={styles.colQty}>{''}</Text>
                <Text style={styles.colPrice}>{''}</Text>
                <Text style={[styles.colTotal, styles.summarySubtotal]}>{fCurrency(additionalItemsTotal)}</Text>
              </View>
            </View>
          </View>
        )}

        {/* GRAND TOTAL */}
        <View style={styles.grandTotalBlock}>
          <Text style={styles.grandTotalLabel}>Presupuesto Total:</Text>
          <Text style={styles.grandTotalAmount}>{fCurrency(grandTotal)}</Text>
        </View>

        {/* FOOTER */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>{'Dimei \u2014 Documento generado el '}{today}</Text>
          <Text style={styles.footerText} render={({ pageNumber, totalPages }) => `P\u00e1g. ${pageNumber} / ${totalPages}`} />
        </View>

      </Page>
    </Document>
  );
}
