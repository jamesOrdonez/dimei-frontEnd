import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 9, fontFamily: 'Helvetica', color: '#334155' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottom: '2 solid #1e40af', paddingBottom: 10 },
  logo: { width: 100, height: 40 },
  headerText: { textAlign: 'right' },
  title: { fontSize: 16, fontWeight: 'bold', color: '#1e40af' },
  subtitle: { fontSize: 10, color: '#64748b', marginTop: 2 },
  
  section: { marginBottom: 15 },
  sectionTitle: { fontSize: 12, fontWeight: 'bold', backgroundColor: '#f1f5f9', padding: 5, marginBottom: 8, color: '#0f172a' },
  
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 },
  infoItem: { width: '50%', marginBottom: 4 },
  label: { fontWeight: 'bold', color: '#64748b', marginRight: 5 },
  
  questionsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  questionCard: { width: '48%', marginBottom: 10, paddingBottom: 8, borderBottom: '0.5 solid #e2e8f0', minHeight: 60 },
  questionText: { fontWeight: 'bold', marginBottom: 2, color: '#1e293b', fontSize: 8 },
  answerText: { marginLeft: 5, color: '#475569', fontSize: 8 },
  
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 3, marginTop: 4, marginLeft: 5 },
  photo: { width: 60, height: 60, borderRadius: 3, objectFit: 'cover' },
  
  signatureSection: { marginTop: 30, flexDirection: 'row', justifyContent: 'space-around' },
  signatureBox: { width: '40%', alignItems: 'center' },
  signatureImg: { width: 120, height: 60, marginBottom: 5, objectFit: 'contain' },
  signatureLine: { borderTop: '1 solid #475569', width: '100%', textAlign: 'center', paddingTop: 5, fontSize: 8, fontWeight: 'bold' }
});

export default function MaintenanceReportPdf({ data, equipo, group, technicianName, customerName, backendUrl }) {
  const getFullUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('data:') || path.startsWith('blob:')) return path;
    return `${backendUrl}${path}`;
  };

  return (
    <Document title={`Reporte Mantenimiento - ${equipo?.description || 'Equipo'}`}>
      <Page size="A4" style={styles.page}>
        {/* ENCABEZADO */}
        <View style={styles.header}>
          <Image style={styles.logo} src="/img/logo.png" />
          <View style={styles.headerText}>
            <Text style={styles.title}>REPORTE DE MANTENIMIENTO</Text>
            <Text style={styles.subtitle}>Fecha: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</Text>
          </View>
        </View>

        {/* INFO EQUIPO */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información del Equipo</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}><Text><Text style={styles.label}>Cliente:</Text> {equipo?.customerName}</Text></View>
            <View style={styles.infoItem}><Text><Text style={styles.label}>Equipo:</Text> {equipo?.nombre}</Text></View>
            <View style={styles.infoItem}><Text><Text style={styles.label}>Sistema Motriz:</Text> {equipo?.elevatorTypeName || 'N/A'}</Text></View>
            <View style={styles.infoItem}><Text><Text style={styles.label}>Paradas:</Text> {equipo?.stopNumber || 0}</Text></View>
            <View style={styles.infoItem}><Text><Text style={styles.label}>Capacidad:</Text> {equipo?.capacity || 0} Kg</Text></View>
            <View style={styles.infoItem}><Text><Text style={styles.label}>Técnico:</Text> {technicianName}</Text></View>
          </View>
        </View>

        {/* RESPUESTAS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resultados de Inspección</Text>
          <View style={styles.questionsContainer}>
            {group?.questions?.map((q, idx) => {
              const ans = data.answers?.[q.id];
              const selectedOptions = q.options?.filter(o => ans?.optionIds?.includes(o.id.toString())) || [];
              const selectedOpts = selectedOptions.map(o => o.text).join(', ');
              const requiresJustification = selectedOptions.some(o => o.requires_justification === 1 || o.requires_justification === true);
              
              return (
                <View key={q.id} style={styles.questionCard}>
                  <Text style={styles.questionText}>{idx + 1}. {q.text}</Text>
                  
                  {selectedOpts && <Text style={styles.answerText}>R: {selectedOpts}</Text>}
                  {ans?.text && (
                    requiresJustification ? (
                      <Text style={styles.answerText}>Justificación: {ans.text}</Text>
                    ) : (
                      <Text style={styles.answerText}>Obs: {ans.text}</Text>
                    )
                  )}
                  
                  {ans?.photos?.length > 0 && (
                    <View style={styles.photoGrid}>
                      {ans.photos.map((p, pIdx) => {
                        const url = getFullUrl(p.preview);
                        return url ? <Image key={pIdx} style={styles.photo} src={url} /> : null;
                      })}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* FIRMAS */}
        <View style={styles.signatureSection} wrap={false}>
          <View style={styles.signatureBox}>
            <View style={{ height: 80, justifyContent: 'flex-end', alignItems: 'center', width: '100%' }}>
              {data.technicianSignature && <Image style={styles.signatureImg} src={getFullUrl(data.technicianSignature)} />}
            </View>
            <Text style={styles.signatureLine}>Firma del Técnico</Text>
            <Text style={{ fontSize: 7, color: '#64748b', marginTop: 2 }}>{technicianName}</Text>
          </View>
          <View style={styles.signatureBox}>
            <View style={{ height: 80, justifyContent: 'flex-end', alignItems: 'center', width: '100%' }}>
              {data.customerSignature && <Image style={styles.signatureImg} src={getFullUrl(data.customerSignature)} />}
            </View>
            <Text style={styles.signatureLine}>Firma del Cliente</Text>
            {customerName ? (
              <Text style={{ fontSize: 7, color: '#64748b', marginTop: 2 }}>{customerName}</Text>
            ) : null}
          </View>
        </View>
      </Page>
    </Document>
  );
}
