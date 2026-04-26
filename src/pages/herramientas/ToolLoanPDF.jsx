import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 10, color: '#1a1a2e' },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 20, 
    borderBottom: '2px solid #1e40af', 
    paddingBottom: 12 
  },
  logo: { width: 100, height: 40 },
  headerTextContainer: { alignItems: 'flex-end' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#1e40af', marginBottom: 4, textAlign: 'right' },
  subtitle: { fontSize: 11, color: '#6b7280', textAlign: 'right' },
  loanId: { fontSize: 12, fontWeight: 'bold', color: '#374151', marginTop: 4, textAlign: 'right' },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 11, fontWeight: 'bold', color: '#1e40af', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 },
  row: { flexDirection: 'row', marginBottom: 4 },
  label: { width: 140, color: '#6b7280', fontWeight: 'bold' },
  value: { flex: 1, color: '#111827' },
  table: { marginTop: 8 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#1e40af', padding: '6 8', borderRadius: 4 },
  tableHeaderText: { color: '#ffffff', fontWeight: 'bold', fontSize: 9 },
  tableRow: { flexDirection: 'row', padding: '6 8', borderBottom: '1px solid #f0f0f0' },
  tableRowAlt: { flexDirection: 'row', padding: '6 8', borderBottom: '1px solid #f0f0f0', backgroundColor: '#f9fafb' },
  col60: { width: '60%' },
  col20: { width: '20%', textAlign: 'center' },
  col20R: { width: '20%', textAlign: 'right' },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40 },
  footerDivider: { borderTop: '1px solid #e5e7eb', paddingTop: 8, flexDirection: 'row', justifyContent: 'space-between' },
  footerText: { fontSize: 8, color: '#9ca3af' },
  badge: { backgroundColor: '#dbeafe', color: '#1e40af', padding: '2 6', borderRadius: 4, fontSize: 9, fontWeight: 'bold' },
  signatureSection: { flexDirection: 'row', marginTop: 40, gap: 40 },
  signatureBox: { flex: 1, borderTop: '1px solid #374151', paddingTop: 4 },
  signatureLabel: { fontSize: 8, color: '#6b7280', textAlign: 'center' },
});

export default function ToolLoanPDF({ loan }) {
  const { loanId, date, borrowerName, createdByName, observations, tools } = loan;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* HEADER */}
        <View style={styles.header}>
          <Image style={styles.logo} src={{ uri: '/img/logo.png' }} />
          <View style={styles.headerTextContainer}>
            <Text style={styles.title}>Comprobante de Préstamo</Text>
            <Text style={styles.subtitle}>Sistema de gestión de herramientas</Text>
            <Text style={styles.loanId}>Préstamo #{loanId}</Text>
          </View>
        </View>

        {/* INFO */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información del Préstamo</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Fecha:</Text>
            <Text style={styles.value}>{date}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Prestado a:</Text>
            <Text style={styles.value}>{borrowerName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Registrado por:</Text>
            <Text style={styles.value}>{createdByName}</Text>
          </View>
          {observations && (
            <View style={styles.row}>
              <Text style={styles.label}>Observaciones:</Text>
              <Text style={styles.value}>{observations}</Text>
            </View>
          )}
          <View style={styles.row}>
            <Text style={styles.label}>Estado:</Text>
            <Text style={[styles.value, { color: '#1e40af', fontWeight: 'bold' }]}>Prestado</Text>
          </View>
        </View>

        {/* TOOLS TABLE */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Herramientas Prestadas</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, styles.col60]}>Herramienta</Text>
              <Text style={[styles.tableHeaderText, styles.col20]}>Grupo</Text>
              <Text style={[styles.tableHeaderText, styles.col20R]}>Cantidad</Text>
            </View>
            {(tools || []).map((item, idx) => (
              <View key={idx} style={idx % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                <Text style={styles.col60}>{item.description || `Herramienta #${item.id}`}</Text>
                <Text style={[styles.col20, { textAlign: 'center' }]}>{item.group || '-'}</Text>
                <Text style={[styles.col20R, { textAlign: 'right' }]}>{item.quantity}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* SIGNATURES */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLabel}>{createdByName}</Text>
            <Text style={styles.signatureLabel}>Quien entrega</Text>
          </View>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLabel}>{borrowerName}</Text>
            <Text style={styles.signatureLabel}>Quien recibe</Text>
          </View>
        </View>

        {/* FOOTER */}
        <View style={styles.footer} fixed>
          <View style={styles.footerDivider}>
            <Text style={styles.footerText}>Préstamo #{loanId} — {date}</Text>
            <Text style={styles.footerText}>Documento generado automáticamente</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
