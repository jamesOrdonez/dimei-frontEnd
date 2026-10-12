import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Link } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 24,
    fontSize: 7.5,
    fontFamily: 'Helvetica',
    color: '#000000',
    backgroundColor: '#ffffff',
  },

  // --- HEADER SUPERIOR (IMAGEN 1) ---
  topHeaderTable: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#000000',
    borderStyle: 'solid',
    marginBottom: 6,
    minHeight: 52,
  },
  headerLogoCol: {
    width: '18%',
    borderRightWidth: 1,
    borderColor: '#000000',
    borderStyle: 'solid',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 3,
  },
  headerLogo: {
    maxHeight: 46,
    maxWidth: '92%',
    objectFit: 'contain',
  },
  headerCenterCol: {
    width: '62%',
    borderRightWidth: 1,
    borderColor: '#000000',
    borderStyle: 'solid',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  companyName: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#1e3a8a',
    textAlign: 'center',
    marginBottom: 2,
  },
  companyContact: {
    fontSize: 6.8,
    fontFamily: 'Helvetica-Bold',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 2,
  },
  companyWebsite: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: '#1e3a8a',
    textAlign: 'center',
    textDecoration: 'underline',
  },
  headerRightCol: {
    width: '20%',
    flexDirection: 'column',
  },
  metaItemRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#000000',
    borderStyle: 'solid',
    paddingHorizontal: 2,
    paddingVertical: 2,
  },
  metaRowText: {
    fontSize: 6.8,
    textAlign: 'center',
    fontFamily: 'Helvetica',
  },

  // --- TABLA REPORTE DE MANTENIMIENTO METADATA ---
  metaTable: {
    borderWidth: 1,
    borderColor: '#000000',
    borderStyle: 'solid',
    marginBottom: 6,
  },
  metaTitleBar: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderColor: '#000000',
    borderStyle: 'solid',
    paddingVertical: 2.5,
    alignItems: 'center',
  },
  metaTitleText: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  metaRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#000000',
    borderStyle: 'solid',
    minHeight: 15,
    alignItems: 'center',
  },
  metaCell: {
    paddingHorizontal: 4,
    paddingVertical: 2,
    fontSize: 7,
  },
  bold: {
    fontFamily: 'Helvetica-Bold',
  },

  // --- PREGUNTAS EN 2 COLUMNAS (B, R, M, NA) ---
  twoColWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  colHalf: {
    width: '49.4%',
  },
  groupBlock: {
    borderWidth: 1,
    borderColor: '#000000',
    borderStyle: 'solid',
    marginBottom: 6,
  },
  groupHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#94a3b8',
    borderBottomWidth: 1,
    borderColor: '#000000',
    borderStyle: 'solid',
    paddingVertical: 2,
    alignItems: 'center',
  },
  groupTitleText: {
    width: '72%',
    paddingLeft: 4,
    fontFamily: 'Helvetica-Bold',
    fontSize: 7.5,
    color: '#000000',
    textAlign: 'center',
  },
  colOptionHead: {
    width: '7%',
    textAlign: 'center',
    fontFamily: 'Helvetica-Bold',
    fontSize: 7,
    borderLeftWidth: 1,
    borderColor: '#000000',
    borderStyle: 'solid',
  },
  questionRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderColor: '#000000',
    borderStyle: 'solid',
    minHeight: 14,
    alignItems: 'stretch',
  },
  qTextCol: {
    width: '72%',
    paddingHorizontal: 4,
    paddingVertical: 2,
    justifyContent: 'center',
  },
  qTitle: {
    fontSize: 6.8,
    fontFamily: 'Helvetica',
    color: '#000000',
  },
  qObsText: {
    fontSize: 6,
    fontFamily: 'Helvetica-Oblique',
    color: '#334155',
    marginTop: 1.5,
  },
  qPhotosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 2,
  },
  qThumbLink: {
    marginRight: 3,
    marginBottom: 2,
    textDecoration: 'none',
  },
  qThumb: {
    width: 28,
    height: 28,
    borderWidth: 0.5,
    borderColor: '#94a3b8',
    borderStyle: 'solid',
    objectFit: 'cover',
  },
  qCheckCol: {
    width: '7%',
    borderLeftWidth: 1,
    borderColor: '#000000',
    borderStyle: 'solid',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkText: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#000000',
  },

  // --- RESUMEN DE LA INSPECCIÓN ---
  summaryBox: {
    borderWidth: 1,
    borderColor: '#000000',
    borderStyle: 'solid',
    marginBottom: 6,
  },
  summaryHeaderBar: {
    backgroundColor: '#1e3a8a', // Azul corporativo
    paddingVertical: 3,
    alignItems: 'center',
  },
  summaryHeaderTitle: {
    color: '#ffffff',
    fontFamily: 'Helvetica-Bold',
    fontSize: 8.5,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  summaryRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#000000',
    borderStyle: 'solid',
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  summaryLabel: {
    width: '75%',
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
  },
  summaryVal: {
    width: '25%',
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
  },

  // --- REPUESTOS / TRABAJOS RECOMENDADOS ---
  recomBox: {
    borderWidth: 1,
    borderColor: '#000000',
    borderStyle: 'solid',
    marginBottom: 6,
  },
  recomHeaderBar: {
    backgroundColor: '#1e3a8a', // Azul corporativo
    paddingVertical: 3,
    alignItems: 'center',
  },
  recomHeaderTitle: {
    color: '#ffffff',
    fontFamily: 'Helvetica-Bold',
    fontSize: 8.5,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  recomRowHeader: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderBottomWidth: 1,
    borderColor: '#000000',
    borderStyle: 'solid',
    paddingVertical: 2,
  },
  recomRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderColor: '#000000',
    borderStyle: 'solid',
    minHeight: 14,
    alignItems: 'center',
  },
  recomColNum: {
    width: '6%',
    textAlign: 'center',
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    borderRightWidth: 0.5,
    borderColor: '#000000',
    borderStyle: 'solid',
    paddingVertical: 1,
  },
  recomColDesc: {
    width: '44%',
    fontSize: 7,
    paddingHorizontal: 4,
    borderRightWidth: 0.5,
    borderColor: '#000000',
    borderStyle: 'solid',
    paddingVertical: 1,
  },
  recomColQty: {
    width: '10%',
    textAlign: 'center',
    fontSize: 7,
    borderRightWidth: 0.5,
    borderColor: '#000000',
    borderStyle: 'solid',
    paddingVertical: 1,
  },
  recomColPrio: {
    width: '15%',
    textAlign: 'center',
    fontSize: 7,
    borderRightWidth: 0.5,
    borderColor: '#000000',
    borderStyle: 'solid',
    paddingVertical: 1,
  },
  recomColObs: {
    width: '25%',
    fontSize: 7,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },

  // --- OBSERVACIONES Y FIRMAS ---
  obsSection: {
    borderWidth: 1,
    borderColor: '#000000',
    borderStyle: 'solid',
    marginBottom: 6,
  },
  obsHeaderBar: {
    backgroundColor: '#1e3a8a', // Azul corporativo
    borderBottomWidth: 1,
    borderColor: '#000000',
    borderStyle: 'solid',
    paddingVertical: 2.5,
    alignItems: 'center',
  },
  obsHeaderTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
    color: '#ffffff',
    textAlign: 'center',
  },
  obsBody: {
    padding: 6,
    minHeight: 40,
  },
  obsBodyText: {
    fontSize: 7,
    fontFamily: 'Helvetica',
    color: '#000000',
  },
  legendBar: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#000000',
    borderStyle: 'solid',
    paddingVertical: 2,
    paddingHorizontal: 4,
    backgroundColor: '#ffffff',
  },
  legendText: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
  },
  signaturesTable: {
    flexDirection: 'row',
  },
  signatureCol: {
    width: '50%',
    borderRightWidth: 1,
    borderColor: '#000000',
    borderStyle: 'solid',
  },
  sigHeaderCell: {
    borderBottomWidth: 1,
    borderColor: '#000000',
    borderStyle: 'solid',
    paddingVertical: 2,
    textAlign: 'center',
    fontFamily: 'Helvetica-Bold',
    fontSize: 7.5,
    backgroundColor: '#f8fafc',
  },
  sigImgBox: {
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 3,
    borderBottomWidth: 1,
    borderColor: '#000000',
    borderStyle: 'solid',
  },
  sigImg: {
    maxHeight: 42,
    maxWidth: 140,
    objectFit: 'contain',
  },
  sigMetaCell: {
    borderBottomWidth: 1,
    borderColor: '#000000',
    borderStyle: 'solid',
    paddingVertical: 2,
    paddingHorizontal: 4,
    fontSize: 7,
  },

  // --- FORMATO DE EMERGENCIA (IMAGEN ADJUNTA) ---
  emergencyContainer: {
    borderWidth: 1,
    borderColor: '#000000',
    borderStyle: 'solid',
    marginTop: 4,
    marginBottom: 6,
  },
  emergencyBoxSection: {
    borderBottomWidth: 1,
    borderColor: '#000000',
    borderStyle: 'solid',
    padding: 6,
    minHeight: 125,
  },
  emergencySectionTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8.5,
    color: '#000000',
    marginBottom: 4,
  },
  emergencyContentText: {
    fontFamily: 'Helvetica',
    fontSize: 7.5,
    color: '#000000',
    lineHeight: 1.35,
  },
  emergencyPhotosRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
  },
  emergencyThumbLink: {
    marginRight: 4,
    marginBottom: 4,
    textDecoration: 'none',
  },
  emergencyThumb: {
    width: 44,
    height: 44,
    borderWidth: 0.5,
    borderColor: '#94a3b8',
    borderStyle: 'solid',
    objectFit: 'cover',
  },
  emergencySubsanadaRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#000000',
    borderStyle: 'solid',
    height: 22,
    alignItems: 'stretch',
  },
  emergencySubsanadaLabelCell: {
    width: '40%',
    justifyContent: 'center',
    paddingLeft: 6,
    borderRightWidth: 1,
    borderColor: '#000000',
    borderStyle: 'solid',
  },
  emergencySubsanadaLabelText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8.5,
    color: '#000000',
  },
  emergencySubsanadaOptionCell: {
    width: '30%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 8,
    borderRightWidth: 1,
    borderColor: '#000000',
    borderStyle: 'solid',
  },
  emergencyOptionText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
    color: '#000000',
    marginRight: 6,
  },
  emergencyCheckSquare: {
    width: 12,
    height: 12,
    borderWidth: 1,
    borderColor: '#000000',
    borderStyle: 'solid',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emergencyCheckText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
    color: '#000000',
  },
  emergencySignaturesTable: {},
  emergencySigHeaderRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#000000',
    borderStyle: 'solid',
    backgroundColor: '#f8fafc',
  },
  emergencySigHeaderCol: {
    width: '50%',
    borderColor: '#000000',
    borderStyle: 'solid',
    paddingVertical: 2.5,
    alignItems: 'center',
  },
  emergencySigHeaderText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
    color: '#000000',
  },
  emergencySigImgRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#000000',
    borderStyle: 'solid',
    height: 56,
  },
  emergencySigImgBox: {
    width: '50%',
    borderColor: '#000000',
    borderStyle: 'solid',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 3,
  },
  emergencySigImg: {
    maxHeight: 48,
    maxWidth: 160,
    objectFit: 'contain',
  },
  emergencySigMetaRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#000000',
    borderStyle: 'solid',
  },
  emergencySigMetaCell: {
    width: '50%',
    borderColor: '#000000',
    borderStyle: 'solid',
    paddingVertical: 2.5,
    paddingHorizontal: 6,
    fontSize: 7.5,
  },
});

export default function MaintenanceReportPdf({
  data,
  equipo,
  group,
  technicianName,
  customerName,
  customerEmail,
  maintenanceType,
  recommendations,
  backendUrl,
}) {
  const getFullUrl = (path) => {
    if (!path) return null;
    if (typeof path === 'object' && path) path = path.preview || path.url || path.path;
    if (typeof path !== 'string') return null;
    if (path.startsWith('data:') || path.startsWith('blob:')) return path;
    const base = backendUrl ? (backendUrl.endsWith('/') ? backendUrl : backendUrl + '/') : '';
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    const token = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('Token') || '' : '';
    return token ? `${base}${cleanPath}?token=${encodeURIComponent(token)}` : `${base}${cleanPath}`;
  };

  const getPhotoLinkUrl = (path) => {
    if (!path) return null;
    let raw = path;
    if (typeof path === 'object' && path) {
      raw = path.originalUrl || path.url || path.path;
      if (!raw && path.preview && !path.preview.startsWith('data:')) {
        raw = path.preview;
      }
    }
    if (typeof raw !== 'string') return null;
    if (raw.includes('/api/v1/uploads/')) {
      raw = raw.replace('/api/v1/uploads/', '/uploads/');
    }
    if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
    if (raw.startsWith('/uploads') || raw.startsWith('uploads')) {
      const serverRoot = (backendUrl || '').replace(/\/api\/v1\/?$/, '');
      const clean = raw.startsWith('/') ? raw : `/${raw}`;
      return `${serverRoot}${clean}`;
    }
    return getFullUrl(raw);
  };

  // Grupos y preguntas
  const groupsList = group?.groups && group.groups.length > 0
    ? group.groups
    : (Array.isArray(group)
        ? group
        : [{ id: 1, name: 'Inspección General', questions: group?.questions || [] }]);

  const allQuestions = groupsList.flatMap((g) => g.questions || []);

  // Determinar respuesta (B / R / M / NA)
  // Cuando una respuesta no tenga respuesta de bueno, regular o malo, se marca como no aplica (NA)
  const getQuestionStatus = (q, ans) => {
    if (!ans) return 'NA';
    const rawOpts = ans.optionIds || ans.selected_options || [];
    for (const item of rawOpts) {
      if (typeof item === 'string') {
        const lower = item.toLowerCase().trim();
        if (lower === 'bueno' || lower === 'b' || lower === 'bien' || lower === 'correcto') return 'B';
        if (lower === 'regular' || lower === 'r') return 'R';
        if (lower === 'malo' || lower === 'm' || lower === 'fallo' || lower === 'defecto') return 'M';
      }
    }
    const optIds = rawOpts.map(String);
    const selectedOpts = (q.options || []).filter((o) => optIds.includes(String(o.id)));
    if (selectedOpts.length > 0) {
      const optText = selectedOpts.map((o) => (o.text || '').toLowerCase().trim()).join(' ');
      if (optText.includes('buen') || optText === 'b' || optText.includes('correct') || optText.includes('bien')) return 'B';
      if (optText.includes('regul') || optText === 'r') return 'R';
      if (optText.includes('mal') || optText === 'm' || optText.includes('fall') || optText.includes('defect')) return 'M';
      return 'NA';
    }
    const directVal = (ans.answer_text || ans.text || ans.value || ans.answer || '').toString().toLowerCase().trim();
    if (directVal === 'bueno' || directVal === 'b' || directVal === 'bien' || directVal === 'correcto') return 'B';
    if (directVal === 'regular' || directVal === 'r') return 'R';
    if (directVal === 'malo' || directVal === 'm' || directVal === 'fallo' || directVal === 'defecto') return 'M';
    return 'NA';
  };

  // Cálculo de estadísticas para Imagen 4 (Resumen de la inspección)
  const totalActivities = allQuestions.length;
  let countBueno = 0;
  let countRegular = 0;
  let countMalo = 0;
  let countNA = 0;
  let countPendientes = 0;

  allQuestions.forEach((q) => {
    const ans = data?.answers?.[q.id] || data?.answers?.[String(q.id)];
    const st = getQuestionStatus(q, ans);
    if (st === 'B') {
      countBueno++;
    } else if (st === 'R') {
      countRegular++;
    } else if (st === 'M') {
      countMalo++;
    } else {
      countNA++;
    }
  });

  const aplicables = countBueno + countRegular + countMalo;
  const porcentajeCumplimiento = aplicables > 0
    ? ((countBueno / aplicables) * 100).toFixed(1).replace('.', ',') + '%'
    : '100,0%';

  // División equilibrada de grupos en 2 columnas (Imagen 1)
  let leftGroups = [];
  let rightGroups = [];
  if (groupsList.length === 1 && (groupsList[0].questions || []).length > 2) {
    const qList = groupsList[0].questions;
    const mid = Math.ceil(qList.length / 2);
    leftGroups = [{ ...groupsList[0], questions: qList.slice(0, mid) }];
    rightGroups = [{ ...groupsList[0], id: `${groupsList[0].id}_col2`, questions: qList.slice(mid) }];
  } else {
    let leftCount = 0;
    let rightCount = 0;
    groupsList.forEach((grp) => {
      const qCount = Math.max((grp.questions || []).length, 1);
      if (leftCount <= rightCount) {
        leftGroups.push(grp);
        leftCount += qCount + 1;
      } else {
        rightGroups.push(grp);
        rightCount += qCount + 1;
      }
    });
  }

  // Estimación precisa de altura de cada pregunta para igualar los recuadros expandiendo las filas existentes
  const getQuestionBaseHeight = (q) => {
    let h = 15; // Altura mínima base de fila de pregunta
    const ans = data?.answers?.[q.id] || data?.answers?.[String(q.id)];
    if (ans?.text && ans.text.trim()) {
      h += 11; // Espacio para texto de observación
    }
    if (ans?.photos && ans.photos.length > 0) {
      h += 32; // Espacio para miniaturas de fotos
    }
    return h;
  };

  const getGroupTotalHeight = (grp) => {
    const questions = grp.questions || [];
    const qHeight = questions.reduce((sum, q) => sum + getQuestionBaseHeight(q), 0);
    return 15 + qHeight; // 15pt para encabezado del grupo
  };

  const leftColTotalHeight = leftGroups.reduce((sum, g) => sum + getGroupTotalHeight(g), 0);
  const rightColTotalHeight = rightGroups.reduce((sum, g) => sum + getGroupTotalHeight(g), 0);

  const leftQuestionsCount = leftGroups.reduce((sum, g) => sum + (g.questions || []).length, 0);
  const rightQuestionsCount = rightGroups.reduce((sum, g) => sum + (g.questions || []).length, 0);

  const leftDeficit = Math.max(0, rightColTotalHeight - leftColTotalHeight);
  const rightDeficit = Math.max(0, leftColTotalHeight - rightColTotalHeight);

  // Expansión proporcional por pregunta para absorber la diferencia sin agregar cuadros vacíos
  const leftExtraPerQ = leftQuestionsCount > 0 ? leftDeficit / leftQuestionsCount : 0;
  const rightExtraPerQ = rightQuestionsCount > 0 ? rightDeficit / rightQuestionsCount : 0;

  // Lista de repuestos recomendados: solo mostrar si existen
  const allRawRecom = recommendations || data?.recommendations || [];
  const validRecom = Array.isArray(allRawRecom)
    ? allRawRecom.filter((rec) => {
        if (!rec) return false;
        const desc = (rec.description || '').trim();
        const obs = (rec.observation || '').trim();
        const prio = (rec.priority || '').trim();
        const qty = String(rec.quantity || '').trim();
        return desc !== '' || obs !== '' || prio !== '' || qty !== '';
      })
    : [];
  const hasRecommendations = validRecom.length > 0;

  // Datos de encabezado y firmas
  const clientName =
    equipo?.customerName ||
    equipo?.customerData?.nombre ||
    equipo?.cliente?.nombre ||
    customerName ||
    'S/N';

  const clientAddress =
    equipo?.customerData?.direccion ||
    equipo?.cliente?.direccion ||
    equipo?.location ||
    equipo?.address ||
    'S/N';

  const clientEmail =
    customerEmail ||
    equipo?.customerEmail ||
    equipo?.customerData?.contacto_principal?.correo ||
    equipo?.customerData?.principalContact?.correo ||
    equipo?.customerData?.contactos?.find((c) => c.contactoPrincipal == 1 || c.contactoPrincipal === true)?.correo ||
    equipo?.customerData?.contactos?.[0]?.correo ||
    equipo?.customerData?.correo ||
    equipo?.customerData?.email ||
    equipo?.cliente?.contacto_principal?.correo ||
    equipo?.cliente?.principalContact?.correo ||
    equipo?.email ||
    'S/N';

  const reportDate = new Date(data?.date || Date.now()).toLocaleDateString();
  const equipmentType = equipo?.elevatorTypeName || equipo?.nombre || 'S/N';
  const equipmentCapacity = equipo?.capacity ? `${equipo.capacity} Kg` : 'S/N';

  const obsText = data?.general_observations || data?.generalObservations || data?.observations || '';
  const techSigUrl = getFullUrl(data?.technicianSignature || data?.technician_signature);
  const custSigUrl = getFullUrl(data?.customerSignature || data?.customer_signature);
  const techNameDisplay = technicianName || data?.technicianData?.name || '';
  const custNameDisplay = customerName || data?.customer_name || '';

  // Determinar si es reporte de Emergencia
  const isEmergency =
    (maintenanceType || data?.maintenance_type || data?.maintenanceType || '')
      .toLowerCase()
      .trim() === 'emergencia';

  // Extracción de datos para formato de emergencia
  const getEmergencyDetails = () => {
    let novedadText = '';
    let novedadPhotos = [];
    let procedText = '';
    let procedPhotos = [];
    let subsanada = 'SI';

    const answersObj = data?.answers || {};
    const answersList = Array.isArray(answersObj)
      ? answersObj
      : Object.values(answersObj);

    for (const ans of answersList) {
      if (!ans) continue;
      const qId = Number(ans.question_id || ans.id);
      const text = (ans.text || ans.answer_text || '').trim();
      const photos = ans.photos || [];
      const opts = (ans.optionIds || ans.selected_options || []).map(String);

      if (qId === 9001 || (ans.question_name && ans.question_name.toLowerCase().includes('novedad'))) {
        if (!novedadText) novedadText = text;
        if (photos.length > 0 && novedadPhotos.length === 0) novedadPhotos = photos;
      } else if (qId === 9002 || (ans.question_name && ans.question_name.toLowerCase().includes('procedimiento'))) {
        if (!procedText) procedText = text;
        if (photos.length > 0 && procedPhotos.length === 0) procedPhotos = photos;
      } else if (qId === 9003 || (ans.question_name && ans.question_name.toLowerCase().includes('subsanada'))) {
        if (opts.some((o) => o.toUpperCase() === 'NO') || text.toUpperCase() === 'NO') {
          subsanada = 'NO';
        } else if (opts.some((o) => o.toUpperCase() === 'SI') || text.toUpperCase() === 'SI') {
          subsanada = 'SI';
        }
      }
    }

    if (!novedadText && answersObj[9001]?.text) novedadText = answersObj[9001].text;
    if (!novedadPhotos.length && answersObj[9001]?.photos) novedadPhotos = answersObj[9001].photos;

    if (!procedText && answersObj[9002]?.text) procedText = answersObj[9002].text;
    if (!procedPhotos.length && answersObj[9002]?.photos) procedPhotos = answersObj[9002].photos;

    if (answersObj[9003]) {
      const opt = answersObj[9003].optionIds?.[0] || answersObj[9003].selected_options?.[0] || answersObj[9003].text;
      if (opt && String(opt).toUpperCase() === 'NO') subsanada = 'NO';
      else if (opt && String(opt).toUpperCase() === 'SI') subsanada = 'SI';
    }

    if (!novedadText && (data?.general_observations || data?.generalObservations)) {
      novedadText = data?.general_observations || data?.generalObservations;
    }

    return { novedadText, novedadPhotos, procedText, procedPhotos, subsanada };
  };

  const emergDetails = isEmergency ? getEmergencyDetails() : null;

  // Renderizador de un grupo de preguntas
  const renderGroupBlock = (grp, extraPerQ = 0) => {
    const questions = grp.questions || [];

    return (
      <View
        key={grp.id || grp.name}
        style={styles.groupBlock}
        wrap={false}
      >
        {/* Encabezado del grupo con B, R, M, NA */}
        <View style={styles.groupHeaderRow}>
          <Text style={styles.groupTitleText}>{grp.name}</Text>
          <Text style={styles.colOptionHead}>B</Text>
          <Text style={styles.colOptionHead}>R</Text>
          <Text style={styles.colOptionHead}>M</Text>
          <Text style={styles.colOptionHead}>NA</Text>
        </View>

        {/* Filas de preguntas ampliadas para igualar el recuadro sin agregar cuadros vacíos */}
        {questions.map((q, qIdx) => {
          const ans = data?.answers?.[q.id] || data?.answers?.[String(q.id)];
          const status = getQuestionStatus(q, ans);
          const isLastQ = qIdx === questions.length - 1;
          const photos = ans?.photos || [];
          const rowMinHeight = getQuestionBaseHeight(q) + extraPerQ;

          return (
            <View
              key={q.id}
              style={[
                styles.questionRow,
                { minHeight: rowMinHeight },
                isLastQ ? { borderBottomWidth: 0 } : {},
              ]}
            >
              {/* Columna Texto y multimedia debajo */}
              <View style={styles.qTextCol}>
                <Text style={styles.qTitle}>{q.text}</Text>

                {/* Observación debajo de la pregunta */}
                {ans?.text ? (
                  <Text style={styles.qObsText}>Obs: {ans.text}</Text>
                ) : null}

                {/* Fotos debajo de la pregunta como enlaces abribles */}
                {photos.length > 0 ? (
                  <View style={styles.qPhotosContainer}>
                    {photos.map((p, pIdx) => {
                      const imgUrl = getFullUrl(p);
                      const linkUrl = getPhotoLinkUrl(p) || imgUrl;
                      if (!imgUrl) return null;
                      return linkUrl ? (
                        <Link key={pIdx} src={linkUrl} style={styles.qThumbLink}>
                          <Image style={styles.qThumb} src={imgUrl} />
                        </Link>
                      ) : (
                        <Image key={pIdx} style={styles.qThumb} src={imgUrl} />
                      );
                    })}
                  </View>
                ) : null}
              </View>

              {/* Check Bueno */}
              <View style={styles.qCheckCol}>
                <Text style={styles.checkText}>{status === 'B' ? 'X' : ''}</Text>
              </View>

              {/* Check Regular */}
              <View style={styles.qCheckCol}>
                <Text style={styles.checkText}>{status === 'R' ? 'X' : ''}</Text>
              </View>

              {/* Check Malo */}
              <View style={styles.qCheckCol}>
                <Text style={styles.checkText}>{status === 'M' ? 'X' : ''}</Text>
              </View>

              {/* Check No aplica */}
              <View style={styles.qCheckCol}>
                <Text style={styles.checkText}>{status === 'NA' ? 'X' : ''}</Text>
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <Document title={`Reporte Mantenimiento ${maintenanceType ? `(${maintenanceType})` : ''} - ${equipmentType}`}>
      <Page size="LETTER" style={styles.page}>
        {/* ================= 1. ENCABEZADO SUPERIOR (IMAGEN 1 & 2) ================= */}
        <View style={styles.topHeaderTable}>
          {/* Logo */}
          <View style={styles.headerLogoCol}>
            <Image style={styles.headerLogo} src="/img/logo_reporte.png" />
          </View>

          {/* Nombre de la empresa, contacto y link debajo (Imagen 1) */}
          <View style={styles.headerCenterCol}>
            <Text style={styles.companyName}>EQUIPOS DIMEI SAS NIT 901.230.958-5</Text>
            <Text style={styles.companyContact}>
              Contacto servicio al cliente: mantenimiento@equiposdimei.com Tel: 3046164709
            </Text>
            <Link style={styles.companyWebsite} src="https://www.equiposdimei.com">
              www.equiposdimei.com
            </Link>
          </View>

          {/* Código, Versión, Fecha centrado (Imagen 2) */}
          <View style={styles.headerRightCol}>
            <View style={styles.metaItemRow}>
              <Text style={styles.metaRowText}>
                <Text style={styles.bold}>Código: </Text>ED-290422a
              </Text>
            </View>
            <View style={styles.metaItemRow}>
              <Text style={styles.metaRowText}>
                <Text style={styles.bold}>Versión: </Text>003
              </Text>
            </View>
            <View style={[styles.metaItemRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.metaRowText}>
                <Text style={styles.bold}>Fecha: </Text>29/04/2022
              </Text>
            </View>
          </View>
        </View>

        {/* ================= 2. METADATOS DEL REPORTE ================= */}
        <View style={styles.metaTable}>
          {/* Barra de Título */}
          <View style={styles.metaTitleBar}>
            <Text style={styles.metaTitleText}>
              {isEmergency
                ? 'REPORTE DE ATENCIÓN DE EMERGENCIAS'
                : `REPORTE DE MANTENIMIENTO${maintenanceType ? ` - ${maintenanceType.toUpperCase()}` : ''}`}
            </Text>
          </View>

          {/* Fila 1: Cliente & Correo principal del cliente */}
          <View style={styles.metaRow}>
            <View style={[styles.metaCell, { width: '50%', borderRightWidth: 1, borderColor: '#000000', borderStyle: 'solid' }]}>
              <Text><Text style={styles.bold}>Cliente: </Text>{clientName}</Text>
            </View>
            <View style={[styles.metaCell, { width: '50%' }]}>
              <Text><Text style={styles.bold}>Correo: </Text>{clientEmail}</Text>
            </View>
          </View>

          {/* Fila 2: Dirección & Fecha */}
          <View style={styles.metaRow}>
            <View style={[styles.metaCell, { width: '50%', borderRightWidth: 1, borderColor: '#000000', borderStyle: 'solid' }]}>
              <Text><Text style={styles.bold}>Dirección: </Text>{clientAddress}</Text>
            </View>
            <View style={[styles.metaCell, { width: '50%' }]}>
              <Text><Text style={styles.bold}>Fecha: </Text>{reportDate}</Text>
            </View>
          </View>

          {/* Fila 3: Tipo de equipo & Capacidad */}
          <View style={[styles.metaRow, { borderBottomWidth: 0 }]}>
            <View style={[styles.metaCell, { width: '50%', borderRightWidth: 1, borderColor: '#000000', borderStyle: 'solid' }]}>
              <Text><Text style={styles.bold}>Tipo de equipo: </Text>{equipmentType}</Text>
            </View>
            <View style={[styles.metaCell, { width: '50%' }]}>
              <Text><Text style={styles.bold}>Capacidad: </Text>{equipmentCapacity}</Text>
            </View>
          </View>
        </View>

        {isEmergency ? (
          /* ================= FORMATO DE EMERGENCIA (IMAGEN ADJUNTA) ================= */
          <View style={styles.emergencyContainer} wrap={false}>
            {/* 1. Descripción de novedad: */}
            <View style={styles.emergencyBoxSection}>
              <Text style={styles.emergencySectionTitle}>Descripción de novedad:</Text>
              {emergDetails?.novedadText ? (
                <Text style={styles.emergencyContentText}>{emergDetails.novedadText}</Text>
              ) : null}

              {/* Fotos de Novedad */}
              {emergDetails?.novedadPhotos?.length > 0 ? (
                <View style={styles.emergencyPhotosRow}>
                  {emergDetails.novedadPhotos.map((p, pIdx) => {
                    const imgUrl = getFullUrl(p);
                    const linkUrl = getPhotoLinkUrl(p) || imgUrl;
                    if (!imgUrl) return null;
                    return linkUrl ? (
                      <Link key={pIdx} src={linkUrl} style={styles.emergencyThumbLink}>
                        <Image style={styles.emergencyThumb} src={imgUrl} />
                      </Link>
                    ) : (
                      <Image key={pIdx} style={styles.emergencyThumb} src={imgUrl} />
                    );
                  })}
                </View>
              ) : null}
            </View>

            {/* 2. Procedimiento realizado: */}
            <View style={styles.emergencyBoxSection}>
              <Text style={styles.emergencySectionTitle}>Procedimiento realizado:</Text>
              {emergDetails?.procedText ? (
                <Text style={styles.emergencyContentText}>{emergDetails.procedText}</Text>
              ) : null}

              {/* Fotos de Procedimiento */}
              {emergDetails?.procedPhotos?.length > 0 ? (
                <View style={styles.emergencyPhotosRow}>
                  {emergDetails.procedPhotos.map((p, pIdx) => {
                    const imgUrl = getFullUrl(p);
                    const linkUrl = getPhotoLinkUrl(p) || imgUrl;
                    if (!imgUrl) return null;
                    return linkUrl ? (
                      <Link key={pIdx} src={linkUrl} style={styles.emergencyThumbLink}>
                        <Image style={styles.emergencyThumb} src={imgUrl} />
                      </Link>
                    ) : (
                      <Image key={pIdx} style={styles.emergencyThumb} src={imgUrl} />
                    );
                  })}
                </View>
              ) : null}
            </View>

            {/* 3. La falla fue Subsanada | SI | NO */}
            <View style={styles.emergencySubsanadaRow}>
              <View style={styles.emergencySubsanadaLabelCell}>
                <Text style={styles.emergencySubsanadaLabelText}>La falla fue Subsanada</Text>
              </View>

              {/* Columna SI */}
              <View style={styles.emergencySubsanadaOptionCell}>
                <Text style={styles.emergencyOptionText}>SI</Text>
                <View style={styles.emergencyCheckSquare}>
                  <Text style={styles.emergencyCheckText}>
                    {emergDetails?.subsanada === 'SI' ? 'X' : ''}
                  </Text>
                </View>
              </View>

              {/* Columna NO */}
              <View style={[styles.emergencySubsanadaOptionCell, { borderRightWidth: 0 }]}>
                <Text style={styles.emergencyOptionText}>NO</Text>
                <View style={styles.emergencyCheckSquare}>
                  <Text style={styles.emergencyCheckText}>
                    {emergDetails?.subsanada === 'NO' ? 'X' : ''}
                  </Text>
                </View>
              </View>
            </View>

            {/* Repuestos / Trabajos Recomendados (Opcional - solo se muestra si existen) */}
            {hasRecommendations ? (
              <View style={[styles.recomBox, { marginTop: 4, marginBottom: 4 }]} wrap={false}>
                <View style={styles.recomHeaderBar}>
                  <Text style={styles.recomHeaderTitle}>REPUESTOS / TRABAJOS RECOMENDADOS</Text>
                </View>
                <View style={styles.recomRowHeader}>
                  <Text style={styles.recomColNum}>Nº</Text>
                  <Text style={styles.recomColDesc}>Descripción del repuesto o trabajo</Text>
                  <Text style={styles.recomColQty}>Cant.</Text>
                  <Text style={styles.recomColPrio}>Prioridad</Text>
                  <Text style={styles.recomColObs}>Observación</Text>
                </View>
                {validRecom.map((rec, rIdx) => {
                  const isLast = rIdx === validRecom.length - 1;
                  return (
                    <View key={rIdx} style={[styles.recomRow, isLast ? { borderBottomWidth: 0 } : {}]}>
                      <Text style={styles.recomColNum}>{rIdx + 1}</Text>
                      <Text style={styles.recomColDesc}>{rec.description || ''}</Text>
                      <Text style={styles.recomColQty}>{rec.quantity || ''}</Text>
                      <Text style={styles.recomColPrio}>{rec.priority || ''}</Text>
                      <Text style={styles.recomColObs}>{rec.observation || ''}</Text>
                    </View>
                  );
                })}
              </View>
            ) : null}

            {/* 4. Tabla de Firmas (Entrega / Recibe) */}
            <View style={styles.emergencySignaturesTable}>
              {/* Encabezado Entrega / Recibe */}
              <View style={styles.emergencySigHeaderRow}>
                <View style={[styles.emergencySigHeaderCol, { borderRightWidth: 1 }]}>
                  <Text style={styles.emergencySigHeaderText}>Entrega</Text>
                </View>
                <View style={styles.emergencySigHeaderCol}>
                  <Text style={styles.emergencySigHeaderText}>Recibe</Text>
                </View>
              </View>

              {/* Espacio para imagen de firmas */}
              <View style={styles.emergencySigImgRow}>
                <View style={[styles.emergencySigImgBox, { borderRightWidth: 1 }]}>
                  {techSigUrl ? <Image style={styles.emergencySigImg} src={techSigUrl} /> : null}
                </View>
                <View style={styles.emergencySigImgBox}>
                  {custSigUrl ? <Image style={styles.emergencySigImg} src={custSigUrl} /> : null}
                </View>
              </View>

              {/* Fila Nombre: / Empresa: */}
              <View style={styles.emergencySigMetaRow}>
                <View style={[styles.emergencySigMetaCell, { borderRightWidth: 1 }]}>
                  <Text><Text style={styles.bold}>Nombre: </Text>{techNameDisplay}</Text>
                </View>
                <View style={styles.emergencySigMetaCell}>
                  <Text><Text style={styles.bold}>Empresa: </Text>{clientName}</Text>
                </View>
              </View>

              {/* Fila Cargo: / Cargo: */}
              <View style={[styles.emergencySigMetaRow, { borderBottomWidth: 0 }]}>
                <View style={[styles.emergencySigMetaCell, { borderRightWidth: 1 }]}>
                  <Text><Text style={styles.bold}>Cargo: </Text>Técnico de Mantenimiento</Text>
                </View>
                <View style={styles.emergencySigMetaCell}>
                  <Text><Text style={styles.bold}>Cargo: </Text>Cliente / Encargado</Text>
                </View>
              </View>
            </View>
          </View>
        ) : (
          /* ================= FORMATO ESTÁNDAR (PREVENTIVO / CORRECTIVO) ================= */
          <>
            {/* ================= 3. PREGUNTAS EN 2 COLUMNAS (B, R, M, NA) ================= */}
            <View style={styles.twoColWrapper}>
              {/* Columna Izquierda */}
              <View style={styles.colHalf}>
                {leftGroups.map((grp) => renderGroupBlock(grp, leftExtraPerQ))}
              </View>

              {/* Columna Derecha */}
              <View style={styles.colHalf}>
                {rightGroups.map((grp) => renderGroupBlock(grp, rightExtraPerQ))}
              </View>
            </View>

            {/* ================= 4. RESUMEN DE LA INSPECCIÓN ================= */}
            <View style={styles.summaryBox} wrap={false}>
              <View style={styles.summaryHeaderBar}>
                <Text style={styles.summaryHeaderTitle}>RESUMEN DE LA INSPECCIÓN</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total de actividades</Text>
                <Text style={styles.summaryVal}>{totalActivities}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Actividades en BUENO</Text>
                <Text style={styles.summaryVal}>{countBueno}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Actividades en REGULAR</Text>
                <Text style={styles.summaryVal}>{countRegular}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Actividades en MALO</Text>
                <Text style={styles.summaryVal}>{countMalo}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>No aplica (N/A)</Text>
                <Text style={styles.summaryVal}>{countNA}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Pendientes por revisar</Text>
                <Text style={styles.summaryVal}>{countPendientes}</Text>
              </View>
              <View style={[styles.summaryRow, { borderBottomWidth: 0 }]}>
                <Text style={styles.summaryLabel}>% de cumplimiento (BIEN / aplicables)</Text>
                <Text style={styles.summaryVal}>{porcentajeCumplimiento}</Text>
              </View>
            </View>

            {/* ================= 5. REPUESTOS / TRABAJOS RECOMENDADOS ================= */}
            {hasRecommendations ? (
              <View style={styles.recomBox} wrap={false}>
                <View style={styles.recomHeaderBar}>
                  <Text style={styles.recomHeaderTitle}>REPUESTOS / TRABAJOS RECOMENDADOS</Text>
                </View>
                <View style={styles.recomRowHeader}>
                  <Text style={styles.recomColNum}>Nº</Text>
                  <Text style={styles.recomColDesc}>Descripción del repuesto o trabajo</Text>
                  <Text style={styles.recomColQty}>Cant.</Text>
                  <Text style={styles.recomColPrio}>Prioridad</Text>
                  <Text style={styles.recomColObs}>Observación</Text>
                </View>
                {validRecom.map((rec, rIdx) => {
                  const isLast = rIdx === validRecom.length - 1;
                  return (
                    <View key={rIdx} style={[styles.recomRow, isLast ? { borderBottomWidth: 0 } : {}]}>
                      <Text style={styles.recomColNum}>{rIdx + 1}</Text>
                      <Text style={styles.recomColDesc}>{rec.description || ''}</Text>
                      <Text style={styles.recomColQty}>{rec.quantity || ''}</Text>
                      <Text style={styles.recomColPrio}>{rec.priority || ''}</Text>
                      <Text style={styles.recomColObs}>{rec.observation || ''}</Text>
                    </View>
                  );
                })}
              </View>
            ) : null}

            {/* ================= 6. OBSERVACIONES, LEYENDA Y FIRMAS ================= */}
            <View style={styles.obsSection} wrap={false}>
              {/* Header Observaciones */}
              <View style={styles.obsHeaderBar}>
                <Text style={styles.obsHeaderTitle}>Observaciones</Text>
              </View>
              {/* Cuerpo de Observaciones */}
              <View style={styles.obsBody}>
                <Text style={styles.obsBodyText}>{obsText || 'Sin observaciones adicionales registradas.'}</Text>
              </View>

              {/* Leyenda B: Bueno R: Regular M: Malo NA: No aplica */}
              <View style={styles.legendBar}>
                <Text style={styles.legendText}>B: Bueno  R: Regular  M: Malo  NA: No aplica</Text>
              </View>

              {/* Tabla de Firmas (Entrega / Recibe) */}
              <View style={styles.signaturesTable}>
                {/* Columna Entrega (Técnico) */}
                <View style={styles.signatureCol}>
                  <Text style={styles.sigHeaderCell}>Entrega</Text>
                  <View style={styles.sigImgBox}>
                    {techSigUrl ? <Image style={styles.sigImg} src={techSigUrl} /> : null}
                  </View>
                  <View style={styles.sigMetaCell}>
                    <Text><Text style={styles.bold}>Nombre: </Text>{techNameDisplay}</Text>
                  </View>
                  <View style={[styles.sigMetaCell, { borderBottomWidth: 0 }]}>
                    <Text><Text style={styles.bold}>Cargo: </Text>Técnico de Mantenimiento</Text>
                  </View>
                </View>

                {/* Columna Recibe (Cliente) */}
                <View style={[styles.signatureCol, { borderRightWidth: 0 }]}>
                  <Text style={styles.sigHeaderCell}>Recibe</Text>
                  <View style={styles.sigImgBox}>
                    {custSigUrl ? <Image style={styles.sigImg} src={custSigUrl} /> : null}
                  </View>
                  <View style={styles.sigMetaCell}>
                    <Text><Text style={styles.bold}>Nombre: </Text>{custNameDisplay}</Text>
                  </View>
                  <View style={[styles.sigMetaCell, { borderBottomWidth: 0 }]}>
                    <Text><Text style={styles.bold}>Cargo: </Text>Cliente / Encargado</Text>
                  </View>
                </View>
              </View>
            </View>
          </>
        )}
      </Page>
    </Document>
  );
}
