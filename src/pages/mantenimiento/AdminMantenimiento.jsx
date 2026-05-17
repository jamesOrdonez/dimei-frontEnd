import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Stack, 
  TextField, 
  InputAdornment,
  CircularProgress,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { 
  MagnifyingGlassIcon, 
  ArrowDownTrayIcon,
  CalendarDaysIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import { pdf } from '@react-pdf/renderer';
import MaintenanceReportPdf from './MaintenanceReportPdf';

export default function AdminMantenimiento() {
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [search, setSearch] = useState('');
  
  const company = sessionStorage.getItem('company');
  const backendUrl = axios.defaults.baseURL?.replace('/api/v1/', '') ?? '';

  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [company]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/getAllMaintenanceReports/${company}`);
      setReports(res.data.data || []);
    } catch (error) {
      console.error("Error fetching all maintenance reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async (report) => {
    try {
      // Get the full report with answers
      const resReport = await axios.get(`/getMaintenanceReport/${report.id}`);
      const fullReport = resReport.data.data;
      
      // Get the question group for question texts
      const resGroup = await axios.get(`/getOneQuestionGroup/${report.projectData.elevatorTypeData.question_group_id}`);
      const group = resGroup.data.data;
      
      // Re-map answers for PDF
      const answersMap = {};
      (fullReport.answers || []).forEach(ans => {
        answersMap[ans.question_id] = {
          question_id: ans.question_id,
          optionIds: ans.selected_options || [],
          text: ans.answer_text,
          photos: (ans.photos || []).map(p => ({ preview: p }))
        };
      });

      const blob = await pdf(
        <MaintenanceReportPdf 
          data={{ ...fullReport, answers: answersMap, technicianSignature: fullReport.technician_signature, customerSignature: fullReport.customer_signature }} 
          equipo={{
            id: report.projectData.id,
            customerName: report.projectData.customerData?.nombre,
            elevatorTypeName: report.projectData.elevatorTypeData?.elevatorType,
            description: report.projectData.description,
            stopNumber: report.projectData.stopNumber,
            capacity: report.projectData.capacity,
            typeDriveSystemName: report.projectData.driveSystemData?.typeDriveSystem
          }} 
          group={group}
          technicianName={report.technicianData?.name}
          customerName={fullReport.customer_name || ''}
          backendUrl={backendUrl}
        />
      ).toBlob();
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Reporte_${report.projectData.elevatorTypeData?.elevatorType}_${report.projectData.id}_${new Date(report.date).toLocaleDateString()}.pdf`;
      link.click();
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("No se pudo generar el PDF");
    }
  };

  const filteredReports = reports.filter(r => 
    (r.projectData?.customerData?.nombre?.toLowerCase() || '').includes(search.toLowerCase()) ||
    (r.technicianData?.name?.toLowerCase() || '').includes(search.toLowerCase()) ||
    (r.projectData?.elevatorTypeData?.elevatorType?.toLowerCase() || '').includes(search.toLowerCase())
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight="800" sx={{ color: '#1e293b' }}>
            Historial de Mantenimientos
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Consulta y descarga los reportes realizados por los técnicos.
          </Typography>
        </Box>
      </Box>

      <Card sx={{ borderRadius: 4, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ p: 2, borderBottom: '1px solid #f1f5f9' }}>
            <TextField
              fullWidth
              placeholder="Buscar por cliente, técnico o equipo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                  </InputAdornment>
                ),
                sx: { borderRadius: 3, bgcolor: '#f8fafc' }
              }}
            />
          </Box>

          {loading ? (
            <Box display="flex" justifyContent="center" py={10}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: '#f8fafc' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: '700', color: '#64748b' }}>Fecha</TableCell>
                    <TableCell sx={{ fontWeight: '700', color: '#64748b' }}>Cliente</TableCell>
                    <TableCell sx={{ fontWeight: '700', color: '#64748b' }}>Equipo</TableCell>
                    <TableCell sx={{ fontWeight: '700', color: '#64748b' }}>Técnico</TableCell>
                    <TableCell align="right" sx={{ fontWeight: '700', color: '#64748b' }}>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredReports.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                          No se encontraron mantenimientos.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredReports.map((report) => (
                      <TableRow key={report.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                        <TableCell>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <CalendarDaysIcon className="h-4 w-4 text-gray-400" />
                            <Typography variant="body2" fontWeight="600">
                              {new Date(report.date).toLocaleDateString()}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="700" color="primary">
                            {report.projectData?.customerData?.nombre}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {report.projectData?.elevatorTypeData?.elevatorType} #{report.projectData?.id}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <UserCircleIcon className="h-4 w-4 text-gray-400" />
                            <Typography variant="body2">
                              {report.technicianData?.name}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell align="right">
                          <IconButton 
                            onClick={() => handleDownloadPDF(report)}
                            sx={{ color: '#3b82f6', '&:hover': { bgcolor: 'rgba(59, 130, 246, 0.08)' } }}
                            title="Descargar Reporte PDF"
                          >
                            <ArrowDownTrayIcon className="h-5 w-5" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
