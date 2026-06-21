import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: 'Helvetica', color: '#334155' },

  section: { marginBottom: 15 },

  row: {
    flexDirection: 'row',
    borderBottom: '0.5 solid #e2e8f0',
    paddingVertical: 5,
    alignItems: 'center',
  },

  tableHeader: {
    backgroundColor: '#f1f5f9',
    fontWeight: 'bold',
    color: '#0f172a',
    borderBottom: '1.5 solid #cbd5e1',
  },

  colMain: { width: '60%', textAlign: 'left', paddingLeft: 5 },
  colLoc: { width: '25%', textAlign: 'left', fontSize: 9 },
  colQty: { width: '15%', textAlign: 'center' },

  // Sub-items (Components)
  subRow: {
    flexDirection: 'row',
    paddingVertical: 3,
    paddingLeft: 20,
    backgroundColor: '#f8fafc',
    fontSize: 9,
    fontStyle: 'italic',
    color: '#64748b',
    borderBottom: '0.5 solid #f1f5f9',
  },

  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 8,
    color: '#1e293b',
    textDecoration: 'underline',
  },

  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    borderBottom: '2 solid #3b82f6',
    paddingBottom: 10,
  },

  logo: { width: 100, height: 40 },

  headerText: {
    textAlign: 'right',
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e40af',
  },

  // Firmas
  firmasContainer: {
    marginTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },

  firmaBox: {
    width: '35%',
    alignItems: 'center',
  },

  firmaLinea: {
    marginTop: 10,
    borderTop: '1 solid #475569',
    width: '100%',
    textAlign: 'center',
    paddingTop: 5,
    fontSize: 9,
    fontWeight: 'bold',
  },
});

export default function RemisionPDF({ remision }) {
  return (
    <Document title={`Remisión ${remision.remisionId}`}>
      <Page size="A4" style={styles.page}>
        {/* ENCABEZADO */}
        <View style={styles.headerContainer}>
          <Image style={styles.logo} src={{ uri: '/img/logo.png' }} />
          <View>
            <Text style={styles.headerText}>REMISIÓN DE INVENTARIO</Text>
            <Text style={{ textAlign: 'right', fontSize: 10, color: '#64748b' }}>Remisión #: {remision.remisionId}</Text>
          </View>
        </View>

        {/* DATOS GENERALES */}
        <View style={styles.section}>
          <Text style={{ fontWeight: 'bold' }}>Fecha: <Text style={{ fontWeight: 'normal' }}>{remision.fecha}</Text></Text>
          <Text style={{ fontWeight: 'bold', marginTop: 4 }}>Cliente: <Text style={{ fontWeight: 'normal' }}>{remision.cliente || 'S/N'}</Text></Text>
          <Text style={{ fontWeight: 'bold', marginTop: 4 }}>Descripción: <Text style={{ fontWeight: 'normal' }}>{remision.description}</Text></Text>
          <Text style={{ fontWeight: 'bold', marginTop: 4 }}>Proyecto: <Text style={{ fontWeight: 'normal' }}>#{remision.projectId}</Text></Text>
        </View>

        {/* SECCIÓN DE PRODUCTOS */}
        {remision.products && remision.products.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Productos en Remisión</Text>
            <View style={[styles.row, styles.tableHeader]}>
              <Text style={styles.colMain}>Producto / Componente</Text>
              <Text style={styles.colLoc}>Ubicación</Text>
              <Text style={styles.colQty}>Cantidad</Text>
            </View>

            {remision.products.map((prod, pIdx) => (
              <View key={`prod-${pIdx}`}>
                {/* COMPONENTES DEL PRODUCTO */}
                {(prod.components || []).map((comp, cIdx) => (
                  <View key={`comp-${pIdx}-${cIdx}`} style={styles.subRow}>
                    <Text style={styles.colMain}>• #{comp.item_id || comp.id} - {comp.name}</Text>
                    <Text style={styles.colLoc}>{comp.ubicacion}</Text>
                    <Text style={styles.colQty}>{comp.totalQuantity}</Text>
                  </View>
                ))}
                <View style={styles.row}>
                  <Text style={[styles.colMain, { fontWeight: 'bold' }]}>#{prod.product_id || prod.id} - {prod.name}</Text>
                  <Text style={styles.colLoc}></Text>
                  <Text style={[styles.colQty, { fontWeight: 'bold' }]}>{prod.cantidad}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* SECCIÓN DE ITEMS INDIVIDUALES */}
        {remision.items && remision.items.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Items Adicionales</Text>
            <View style={[styles.row, styles.tableHeader]}>
              <Text style={styles.colMain}>Item</Text>
              <Text style={styles.colLoc}>Ubicación</Text>
              <Text style={styles.colQty}>Cantidad</Text>
            </View>

            {remision.items.map((item, index) => (
              <View key={`item-${index}`} style={styles.row}>
                <Text style={styles.colMain}>#{item.item_id || item.id} - {item.description}</Text>
                <Text style={styles.colLoc}>{item.ubicacion}</Text>
                <Text style={styles.colQty}>{item.cantidad}</Text>
              </View>
            ))}
          </View>
        )}

        {/* FIRMAS */}
        <View style={styles.firmasContainer}>
          <View style={styles.firmaBox}>
            <Text style={{ marginBottom: 2 }}>{remision.elaboradoPor || ' '}</Text>
            <Text style={styles.firmaLinea}>Elaborado por</Text>
          </View>
          <View style={styles.firmaBox}>
            <Text style={{ marginBottom: 2 }}>{remision.aprobadoPor || ' '}</Text>
            <Text style={styles.firmaLinea}>Recibido conforme</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
