import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { fCurrency } from '../../../utils/formatNumber';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#333',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingBottom: 10,
  },
  headerTextContainer: {
    flex: 1,
  },
  logo: {
    width: 120,
    maxHeight: 60,
    objectFit: 'contain',
    marginLeft: 20,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: '#1a1a1a',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 8,
    color: '#2b2b2b',
    backgroundColor: '#f4f6f8',
    padding: 4,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  colLabel: {
    width: '30%',
    fontFamily: 'Helvetica-Bold',
  },
  colValue: {
    width: '70%',
  },
  table: {
    display: 'flex',
    flexDirection: 'column',
    width: 'auto',
    marginTop: 10,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f4f6f8',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  tableColDesc: { width: '50%' },
  tableColQty: { width: '15%', textAlign: 'center' },
  tableColPrice: { width: '15%', textAlign: 'right' },
  tableColTotal: { width: '20%', textAlign: 'right' },
  colHeader: { fontFamily: 'Helvetica-Bold' },
  productItemsContainer: {
    paddingLeft: 20,
    paddingRight: 4,
    paddingTop: 4,
    paddingBottom: 4,
    backgroundColor: '#fcfcfc',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  itemTextDesc: { width: '50%', color: '#666', fontSize: 9 },
  itemTextQty: { width: '15%', textAlign: 'center', color: '#666', fontSize: 9 },
  itemTextPrice: { width: '15%', textAlign: 'right', color: '#666', fontSize: 9 },
  itemTextTotal: { width: '20%', textAlign: 'right', color: '#666', fontSize: 9 },
  totalSection: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: 10,
    borderTopWidth: 2,
    borderTopColor: '#333',
  },
  totalLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 14,
    marginRight: 15,
  },
  totalAmount: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 14,
  },
});

export default function ProjectReportPdf({ project }) {
  if (!project) return null;

  const travelVal = parseFloat(project.travel) || 0;
  const necesitaEncerramiento = project.necesita_encerramiento === 1 || project.necesita_encerramiento === true;
  const metrosCuadrados = parseFloat(project.metros_cuadrados) || 0;

  const processedProducts = (project.products || []).map((prod) => {
    let productTotalUnit = 0;

    // If this product is "por_metros_cuadrados" and project has encerramiento, scale the qty
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
      
      return {
        ...item,
        quantity: finalQuantity,
        total: itemTotal
      };
    });

    return {
      ...prod,
      quantity: productQty,
      items: processedItems,
      total_price: productTotalUnit,
      esPorMetros,
    };
  });

  const productsTotal = processedProducts.reduce(
    (acc, prod) => acc + (prod.total_price || 0) * (prod.quantity || 0),
    0
  );
  
  const additionalItemsTotal = (project.items || []).reduce(
    (acc, item) => acc + (item.total || 0),
    0
  );

  const grandTotal = productsTotal + additionalItemsTotal;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerContainer}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.title}>Presupuesto de Proyecto #{project.id}</Text>
            <Text style={styles.subtitle}>Detalle completo de productos, items y costos</Text>
          </View>
          <Image style={styles.logo} src="/img/logo.png" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información del Proyecto</Text>
          <View style={styles.row}>
            <Text style={styles.colLabel}>Cliente:</Text>
            <Text style={styles.colValue}>{project.customerName || project.customer || 'N/A'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.colLabel}>Sistema Motriz:</Text>
            <Text style={styles.colValue}>{project.elevatorTypeName || 'N/A'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.colLabel}>Tipo de Ascensor:</Text>
            <Text style={styles.colValue}>{project.typeDriveSystemName || 'N/A'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.colLabel}>Número de Paradas:</Text>
            <Text style={styles.colValue}>{project.stopNumber || 0}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.colLabel}>Recorrido:</Text>
            <Text style={styles.colValue}>{project.travel || 0} m</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.colLabel}>Capacidad:</Text>
            <Text style={styles.colValue}>{project.capacity || 0} kg</Text>
          </View>
          {necesitaEncerramiento && (
            <View style={styles.row}>
              <Text style={styles.colLabel}>Encerramiento:</Text>
              <Text style={styles.colValue}>Sí — {metrosCuadrados} m²</Text>
            </View>
          )}
        </View>

        {processedProducts && processedProducts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Productos del Proyecto</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableColDesc, styles.colHeader]}>Descripción</Text>
                <Text style={[styles.tableColQty, styles.colHeader]}>Cantidad</Text>
                <Text style={[styles.tableColPrice, styles.colHeader]}>Precio Unit.</Text>
                <Text style={[styles.tableColTotal, styles.colHeader]}>Total</Text>
              </View>

              {processedProducts.map((prod, index) => (
                <View key={`prod-${index}`}>
                  {/* Desglose de Items del Producto (primero) */}
                  {prod.items && prod.items.length > 0 && (
                    <View style={styles.productItemsContainer}>
                      <View style={styles.itemRow}>
                        <Text style={[styles.itemTextDesc, { fontFamily: 'Helvetica-Oblique' }]}>Detalle de componentes:</Text>
                        <Text style={[styles.itemTextQty, { fontFamily: 'Helvetica-Oblique' }]}>Cant.</Text>
                        <Text style={[styles.itemTextPrice, { fontFamily: 'Helvetica-Oblique' }]}>P. Unit</Text>
                        <Text style={[styles.itemTextTotal, { fontFamily: 'Helvetica-Oblique' }]}>Subtotal</Text>
                      </View>
                      {prod.items.map((item, idx) => (
                        <View style={styles.itemRow} key={`pitem-${idx}`}>
                          <Text style={styles.itemTextDesc}>- {item.item_name || 'Item'}</Text>
                          <Text style={styles.itemTextQty}>{item.quantity}</Text>
                          <Text style={styles.itemTextPrice}>{fCurrency(item.price)}</Text>
                          <Text style={styles.itemTextTotal}>{fCurrency(item.total)}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                  
                  {/* Resumen del Producto (debajo) */}
                  <View style={styles.tableRow}>
                    <Text style={[styles.tableColDesc, { fontFamily: 'Helvetica-Bold' }]}>
                      {prod.product_name || 'Producto sin nombre'}
                    </Text>
                    <Text style={styles.tableColQty}>{prod.quantity}</Text>
                    <Text style={styles.tableColPrice}>{fCurrency(prod.total_price)}</Text>
                    <Text style={styles.tableColTotal}>{fCurrency(prod.total_price * prod.quantity)}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {project.items && project.items.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Items Adicionales</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableColDesc, styles.colHeader]}>Descripción</Text>
                <Text style={[styles.tableColQty, styles.colHeader]}>Cantidad</Text>
                <Text style={[styles.tableColPrice, styles.colHeader]}>Precio Unit.</Text>
                <Text style={[styles.tableColTotal, styles.colHeader]}>Total</Text>
              </View>

              {project.items.map((item, idx) => (
                <View style={styles.tableRow} key={`additem-${idx}`}>
                  <Text style={styles.tableColDesc}>{item.item_name || 'Item'}</Text>
                  <Text style={styles.tableColQty}>{item.quantity}</Text>
                  <Text style={styles.tableColPrice}>{fCurrency(item.price)}</Text>
                  <Text style={styles.tableColTotal}>{fCurrency(item.total)}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.totalSection}>
          <Text style={styles.totalLabel}>PRESUPUESTO TOTAL:</Text>
          <Text style={styles.totalAmount}>{fCurrency(grandTotal)}</Text>
        </View>
      </Page>
    </Document>
  );
}
