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

  colMain: { width: '75%', textAlign: 'left', paddingLeft: 5 },
  colQty: { width: '25%', textAlign: 'center' },

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

  projectInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#f8fafc',
    borderRadius: 5,
  },

  infoItem: {
    width: '45%',
    marginBottom: 5,
  },

  label: { fontWeight: 'bold', color: '#64748b' },

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
    marginTop: 20,
    borderTop: '1 solid #475569',
    width: '100%',
    textAlign: 'center',
    paddingTop: 5,
    fontSize: 9,
    fontWeight: 'bold',
  },
});

export default function DeliveryActPdf({ project, user }) {
  const fecha = new Date().toLocaleDateString();

  return (
    <Document title={`Acta de Entrega - Proyecto ${project.id}`}>
      <Page size="A4" style={styles.page}>
        {/* ENCABEZADO */}
        <View style={styles.headerContainer}>
          <Image style={styles.logo} src={{ uri: '/img/logo.png' }} />
          <View>
            <Text style={styles.headerText}>ACTA DE ENTREGA FINAL</Text>
            <Text style={{ textAlign: 'right', fontSize: 10, color: '#64748b' }}>Proyecto #: {project.id}</Text>
          </View>
        </View>

        {/* INFORMACIÓN DEL PROYECTO */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información General del Proyecto</Text>
          <View style={styles.projectInfo}>
            <View style={styles.infoItem}>
              <Text style={styles.label}>Cliente:</Text>
              <Text>{project.customer || 'N/A'}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.label}>Fecha de Cierre:</Text>
              <Text>{fecha}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.label}>Tipo de Ascensor:</Text>
              <Text>{project.elevatorType || 'N/A'}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.label}>Sistema Motriz:</Text>
              <Text>{project.typeDriveSystem || 'N/A'}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.label}>N° de Paradas:</Text>
              <Text>{project.stopNumber || 0}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.label}>Recorrido:</Text>
              <Text>{project.travel || 0} m</Text>
            </View>
          </View>
        </View>

        <Text style={{ marginBottom: 15, lineHeight: 1.5 }}>
          Por medio de la presente se hace entrega formal de los elementos y sistemas correspondientes al proyecto mencionado anteriormente. 
          A continuación se detallan los productos e ítems entregados y remisionados satisfactoriamente:
        </Text>

        {/* PRODUCTOS ENTREGADOS */}
        {project.products && project.products.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Productos Entregados</Text>
            <View style={[styles.row, styles.tableHeader]}>
              <Text style={styles.colMain}>Descripción del Producto</Text>
              <Text style={styles.colQty}>Cantidad</Text>
            </View>
            {project.products.map((prod, idx) => (
              <View key={`prod-${idx}`} style={styles.row}>
                <Text style={styles.colMain}>{prod.product_name}</Text>
                <Text style={styles.colQty}>{prod.remitted_quantity}</Text>
              </View>
            ))}
          </View>
        )}

        {/* ITEMS ADICIONALES ENTREGADOS */}
        {project.items && project.items.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ítems Adicionales Entregados</Text>
            <View style={[styles.row, styles.tableHeader]}>
              <Text style={styles.colMain}>Descripción del Ítem</Text>
              <Text style={styles.colQty}>Cantidad</Text>
            </View>
            {project.items.map((item, idx) => (
              <View key={`item-${idx}`} style={styles.row}>
                <Text style={styles.colMain}>{item.item_name}</Text>
                <Text style={styles.colQty}>{item.remitted_quantity}</Text>
              </View>
            ))}
          </View>
        )}

        <Text style={{ marginTop: 20, fontSize: 9, color: '#64748b', fontStyle: 'italic' }}>
          La firma del presente documento certifica que los elementos fueron recibidos en las cantidades estipuladas y 
          que el proyecto cumple con los requisitos técnicos de entrega.
        </Text>

        {/* FIRMAS */}
        <View style={styles.firmasContainer}>
          <View style={styles.firmaBox}>
            <Text style={{ marginBottom: 2 }}>{user || 'Responsable Técnico'}</Text>
            <Text style={styles.firmaLinea}>Entregado por (DIMEI)</Text>
          </View>
          <View style={styles.firmaBox}>
            <View style={{ height: 20 }} />
            <Text style={styles.firmaLinea}>Recibido por (Cliente)</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
