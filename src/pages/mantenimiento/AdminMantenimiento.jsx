import axios from 'axios';
import { IconButton } from '@mui/material';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { pdf } from '@react-pdf/renderer';
import BaseGrid from '../../components/grid/base.grid.tsx';
import MaintenanceReportPdf from './MaintenanceReportPdf';

const company = sessionStorage.getItem('company');

const mapData = (raw) =>
  raw.map((r) => {
    const d = new Date(r.date);
    const fecha = `${d.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' })}  ${d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}`;
    return {
      // Keep full object for actions
      _raw: r,
      id: r.id,
      fecha,
      cliente: r.projectData?.customerData?.nombre || '—',
      equipo: `${r.projectData?.elevatorTypeData?.elevatorType || ''} #${r.projectData?.id || ''}`,
      tecnico: r.technicianData?.name || '—',
      estado: r.status || 'Finalizado',
    };
  });

const fetchImageAsBase64 = async (url) => {
  if (!url) return null;
  if (url.startsWith('data:') || url.startsWith('blob:')) return url;
  try {
    const response = await axios.get(url, { responseType: 'blob' });
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(response.data);
    });
  } catch (error) {
    console.error('Error fetching image for PDF:', url, error);
    return null;
  }
};

const handleDownloadPDF = async (report) => {
  try {
    // Compute at call time — axios is guaranteed to be configured by now
    const base = axios.defaults.baseURL || '';
    const getFullUrl = (path) => {
      if (!path) return null;
      if (path.startsWith('data:') || path.startsWith('blob:')) return path;
      const cleanPath = path.startsWith('/') ? path.substring(1) : path;
      return `${base.endsWith('/') ? base : base + '/'}${cleanPath}`;
    };

    const resReport = await axios.get(`/getMaintenanceReport/${report.id}`);
    const fullReport = resReport.data.data;

    const resGroup = await axios.get(
      `/getOneQuestionGroup/${report.projectData.elevatorTypeData.question_group_id}`
    );
    const group = resGroup.data.data;

    const technicianSignatureBase64 = await fetchImageAsBase64(getFullUrl(fullReport.technician_signature));
    const customerSignatureBase64 = await fetchImageAsBase64(getFullUrl(fullReport.customer_signature));

    const answersMap = {};
    for (const ans of (fullReport.answers || [])) {
      const photosBase64 = [];
      for (const p of (ans.photos || [])) {
        const b64 = await fetchImageAsBase64(getFullUrl(p));
        if (b64) photosBase64.push({ preview: b64 });
      }
      answersMap[ans.question_id] = {
        question_id: ans.question_id,
        optionIds: ans.selected_options || [],
        text: ans.answer_text,
        photos: photosBase64,
      };
    }

    const blob = await pdf(
      <MaintenanceReportPdf
        data={{
          ...fullReport,
          answers: answersMap,
          technicianSignature: technicianSignatureBase64,
          customerSignature: customerSignatureBase64,
        }}
        equipo={{
          id: report.projectData.id,
          customerName: report.projectData.customerData?.nombre,
          elevatorTypeName: report.projectData.elevatorTypeData?.elevatorType,
          description: report.projectData.description,
          stopNumber: report.projectData.stopNumber,
          capacity: report.projectData.capacity,
          typeDriveSystemName: report.projectData.driveSystemData?.typeDriveSystem,
        }}
        group={group}
        technicianName={report.technicianData?.name}
        customerName={fullReport.customer_name || ''}
        backendUrl={base}
      />
    ).toBlob();

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Reporte_${report.projectData.elevatorTypeData?.elevatorType}_${report.projectData.id}_${new Date(report.date).toLocaleDateString()}.pdf`;
    link.click();
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('No se pudo generar el PDF');
  }
};

export default function AdminMantenimiento() {
  return (
    <BaseGrid
      endpoint={`/getAllMaintenanceReports/${company}`}
      title="Historial de Mantenimientos"
      fields={[]}
      hideCreate
      hideEdit
      hideDelete
      excludeKeys={['_raw', 'id']}
      mapData={mapData}

      renderExtraActions={(item) => (
        <IconButton
          size="small"
          onClick={() => handleDownloadPDF(item._raw)}
          sx={{
            color: '#3b82f6',
            '&:hover': { bgcolor: 'rgba(59, 130, 246, 0.08)' },
          }}
          title="Descargar Reporte PDF"
        >
          <ArrowDownTrayIcon className="h-5 w-5" />
        </IconButton>
      )}
    />
  );
}
