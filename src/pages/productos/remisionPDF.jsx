import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 11 },

  section: { marginBottom: 12 },

  row: {
    flexDirection: 'row',
    borderBottom: '1 solid #ccc',
    paddingVertical: 6,
  },

  tableHeader: {
    backgroundColor: '#eee',
    fontWeight: 'bold',
  },

  col1: { width: '70%', textAlign: 'center' },
  col3: { width: '30%', textAlign: 'center' },

  // Encabezado
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },

  logo: {
    width: 120,
    height: 50,
  },

  headerText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: 'bold',
  },

  // Firmas
  firmasContainer: {
    marginTop: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  firmaBox: {
    width: '40%',
    alignItems: 'center',
  },

  firmaNombre: {
    marginBottom: 5,
    fontSize: 11,
  },

  firmaLinea: {
    marginTop: 10,
    borderTop: '1 solid #000',
    width: '100%',
    textAlign: 'center',
    paddingTop: 5,
    fontSize: 10,
  },
});

export default function RemisionPDF({ remision }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* ENCABEZADO */}
        <View style={styles.headerContainer}>
          <Image style={styles.logo} src={{ uri: '/img/logo.png' }} />

          <Text style={styles.headerText}>REMISIÓN DE INVENTARIO{'\n'}DIMEI</Text>
        </View>

        {/* DATOS */}
        <View style={styles.section}>
          <Text>Remisión #: {remision.remisionId}</Text>
          <Text>Fecha: {remision.fecha}</Text>
          <Text>Descripción: {remision.description}</Text>
        </View>

        {/* TABLA */}
        <View style={[styles.row, styles.tableHeader]}>
          <Text style={styles.col1}>Item</Text>
          <Text style={styles.col3}>Cantidad</Text>
        </View>

        {remision.items.map((item, index) => (
          <View key={index} style={styles.row}>
            <Text style={styles.col1}>{item.description}</Text>
            <Text style={styles.col3}>{item.cantidad}</Text>
          </View>
        ))}

        {/* FIRMAS */}
        <View style={styles.firmasContainer}>
          {/* Elaborado */}
          <View style={styles.firmaBox}>
            <Text style={styles.firmaNombre}>{remision.elaboradoPor}</Text>
            <Text style={styles.firmaLinea}>Elaborado por</Text>
          </View>

          {/* Aprobado */}
          <View style={styles.firmaBox}>
            <Text style={styles.firmaNombre}>{remision.aprobadoPor}</Text>
            <Text style={styles.firmaLinea}>Aprobado por</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
