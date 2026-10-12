import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Avatar, 
  Stack, 
  TextField, 
  InputAdornment,
  CircularProgress,
  IconButton,
  Button,
  Chip,
  Collapse,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper
} from '@mui/material';
import { 
  MagnifyingGlassIcon, 
  MapPinIcon, 
  ChevronDownIcon,
  WrenchScrewdriverIcon,
  CheckBadgeIcon,
  ArrowDownTrayIcon,
  ShieldCheckIcon,
  BoltIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import { BASE_URL } from '../../App';
import { pdf } from '@react-pdf/renderer';
import MaintenanceReportPdf from './MaintenanceReportPdf';

export default function ClientesMantenimiento() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const backendUrl = BASE_URL.replace('/api/v1/', '');

  const handleDownloadLastPDF = async (equipo, cliente) => {
    if (!equipo.lastMaintenance?.id) return;
    try {
      const base = axios.defaults.baseURL || '';
      const getFullUrl = (path) => {
        if (!path) return '';
        if (path.startsWith('data:') || path.startsWith('blob:')) return path;
        const cleanPath = path.startsWith('/') ? path.substring(1) : path;
        return `${base.endsWith('/') ? base : base + '/'}${cleanPath}`;
      };

      const fetchImageAsBase64 = async (url) => {
        if (!url) return null;
        if (url.startsWith('data:') || url.startsWith('blob:')) return url;
        try {
          const token = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('Token') || '' : '';
          const authUrl = token
            ? (url.includes('?') ? `${url}&token=${encodeURIComponent(token)}` : `${url}?token=${encodeURIComponent(token)}`)
            : url;
          const response = await axios.get(authUrl, { responseType: 'blob' });
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

      const res = await axios.get(`/getMaintenanceReport/${equipo.lastMaintenance.id}`);
      const report = res.data.data;
      
      const resGroup = await axios.get(`/getProjectQuestionGroups/${equipo.id}`);
      const group = resGroup.data.data;
      
      const techName = equipo.lastMaintenance.technician;
      const technicianSignatureBase64 = await fetchImageAsBase64(getFullUrl(report.technician_signature));
      const customerSignatureBase64 = await fetchImageAsBase64(getFullUrl(report.customer_signature));
      
      const answersMap = {};
      for (const ans of (report.answers || [])) {
        const photosBase64 = [];
        for (const p of (ans.photos || [])) {
          const fullUrl = getFullUrl(p);
          const b64 = await fetchImageAsBase64(fullUrl);
          if (b64) photosBase64.push({ preview: b64, originalUrl: fullUrl, path: p });
          else if (fullUrl) photosBase64.push({ preview: fullUrl, originalUrl: fullUrl, path: p });
        }
        answersMap[ans.question_id] = {
          question_id: ans.question_id,
          optionIds: ans.selected_options || [],
          text: ans.answer_text,
          photos: photosBase64,
        };
      }

      const parentClient = cliente || clientes.find(c => c.id === equipo.customerId || c.id === equipo.customerData?.id) || {};
      const principalEmail = parentClient.contacto_principal?.correo 
        || parentClient.principalContact?.correo 
        || parentClient.correo 
        || parentClient.email 
        || equipo.customerData?.contactos?.find(c => c.contactoPrincipal == 1)?.correo
        || equipo.customerData?.contactos?.[0]?.correo
        || equipo.customerData?.correo
        || equipo.customerData?.email
        || '';

      const enrichedEquipo = {
        ...equipo,
        cliente: parentClient,
        customerName: parentClient.nombre || equipo.customerName || equipo.customerData?.nombre,
        customerData: {
          ...(equipo.customerData || {}),
          ...parentClient,
          correo: principalEmail,
          email: principalEmail,
          direccion: parentClient.direccion || equipo.customerData?.direccion || equipo.location || equipo.address,
        },
        customerEmail: principalEmail,
      };

      const equipName = equipo.nombre || equipo.elevatorTypeName || 'Equipo';
      const blob = await pdf(
        <MaintenanceReportPdf 
          data={{ 
            ...report, 
            answers: answersMap, 
            technicianSignature: technicianSignatureBase64, 
            customerSignature: customerSignatureBase64 
          }} 
          equipo={enrichedEquipo} 
          group={group}
          technicianName={techName}
          customerName={report.customer_name || ''}
          customerEmail={principalEmail}
          maintenanceType={report.maintenance_type || 'Preventivo'}
          recommendations={report.recommendations || []}
          backendUrl={backendUrl}
        />
      ).toBlob();
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Reporte_${equipName}_${equipo.id}_${new Date(report.date).toLocaleDateString()}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("No se pudo generar el PDF");
    }
  };
  const [clientes, setClientes] = useState([]);
  const [equiposByClient, setEquiposByClient] = useState({}); // { clientId: [] }
  const [loadingEquipos, setLoadingEquipos] = useState({}); // { clientId: true/false }
  const [search, setSearch] = useState('');
  const [expandedClientId, setExpandedClientId] = useState(null);
  const [selectedEquipoForMaintenance, setSelectedEquipoForMaintenance] = useState(null);
  const [typeDialogOpen, setTypeDialogOpen] = useState(false);

  const handleOpenMaintenanceTypeModal = (equipo) => {
    setSelectedEquipoForMaintenance(equipo);
    setTypeDialogOpen(true);
  };

  const handleSelectMaintenanceType = (tipo) => {
    if (!selectedEquipoForMaintenance) return;
    const targetEquipo = selectedEquipoForMaintenance;
    setTypeDialogOpen(false);
    setSelectedEquipoForMaintenance(null);
    navigate(`/mantenimiento/formulario/${targetEquipo.id}?tipo=${encodeURIComponent(tipo)}`);
  };
  
  const company = sessionStorage.getItem('company');

  useEffect(() => {
    fetchClientes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [company]);

  const fetchClientes = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/getClientes/${company}?tipo=equipo`);
      const allClients = response.data.data || [];
      
      const uniqueClients = Array.from(new Map(allClients.map(item => [item.id, item])).values());
      
      setClientes(uniqueClients.map(c => {
        let principal = c.contacto_principal;
        if (typeof principal === 'string' && principal.trim()) {
          try { principal = JSON.parse(principal); } catch (e) { principal = null; }
        }
        return { ...c, principalContact: principal };
      }));
    } catch (error) {
      console.error("Error fetching clients for maintenance:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = async (cliente) => {
    if (expandedClientId === cliente.id) {
      setExpandedClientId(null);
      return;
    }

    setExpandedClientId(cliente.id);

    // Fetch if not already loaded
    if (!equiposByClient[cliente.id]) {
      try {
        setLoadingEquipos(prev => ({ ...prev, [cliente.id]: true }));
        const res = await axios.get(`/getProjects/${company}?tipo=equipo&customerId=${cliente.id}`);
        setEquiposByClient(prev => ({ ...prev, [cliente.id]: res.data.data || [] }));
      } catch (error) {
        console.error("Error fetching equipment:", error);
      } finally {
        setLoadingEquipos(prev => ({ ...prev, [cliente.id]: false }));
      }
    }
  };

  const filteredClientes = clientes.filter(c => 
    (c.nombre?.toLowerCase() || '').includes(search.toLowerCase()) || 
    (c.nit?.toLowerCase() || '').includes(search.toLowerCase())
  );

  return (
    <Box sx={{ p: 2, pb: 8 }}>
      {/* Header Area */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="800" sx={{ color: '#1e293b', mb: 1 }}>
          Equipos
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Selecciona un cliente para gestionar mantenimientos de equipos.
        </Typography>
      </Box>

      {/* Search Bar */}
      <TextField
        fullWidth
        placeholder="Buscar cliente..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ 
          mb: 3,
          '& .MuiOutlinedInput-root': {
            borderRadius: 3,
            bgcolor: '#fff',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            border: 'none',
            '& fieldset': { border: 'none' }
          }
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </InputAdornment>
          ),
        }}
      />

      {loading ? (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress />
        </Box>
      ) : (
        <Stack spacing={2.5}>
          {filteredClientes.length === 0 ? (
            <Box textAlign="center" py={4}>
              <Typography color="text.secondary">No se encontraron clientes.</Typography>
            </Box>
          ) : (
            filteredClientes.map((cliente) => {
              const isExpanded = expandedClientId === cliente.id;
              const equipments = equiposByClient[cliente.id] || [];
              const isLoading = loadingEquipos[cliente.id];

              return (
                <Card 
                  key={cliente.id} 
                  sx={{ 
                    borderRadius: 4, 
                    border: '1px solid #f1f5f9',
                    boxShadow: isExpanded ? '0 20px 25px -5px rgb(0 0 0 / 0.1)' : '0 4px 6px -1px rgb(0 0 0 / 0.05)',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'visible'
                  }}
                >
                  <CardContent sx={{ p: 0 }}>
                    {/* Client Main Info */}
                    <Box 
                      sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer' }}
                      onClick={() => toggleExpand(cliente)}
                    >
                      <Avatar 
                        sx={{ 
                          width: 52, 
                          height: 52, 
                          bgcolor: isExpanded ? '#1e293b' : '#eff6ff', 
                          color: isExpanded ? '#fff' : '#3b82f6',
                          fontWeight: 'bold',
                          transition: 'all 0.3s'
                        }}
                      >
                        {cliente.nombre.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography variant="subtitle1" fontWeight="700" noWrap sx={{ color: '#0f172a' }}>
                          {cliente.nombre}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          NIT: {cliente.nit || 'N/A'}
                        </Typography>
                      </Box>
                      <IconButton 
                        size="small" 
                        sx={{ 
                          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.3s'
                        }}
                      >
                        <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                      </IconButton>
                    </Box>

                    {/* Quick Contact Info */}
                    {!isExpanded && (
                      <Box sx={{ bgcolor: '#f8fafc', px: 2, py: 1, borderTop: '1px solid #f1f5f9', display: 'flex', gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <MapPinIcon className="h-3.5 w-3.5 text-gray-400" />
                          <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 150 }}>
                            {cliente.direccion || 'Sin dirección'}
                          </Typography>
                        </Box>
                      </Box>
                    )}

                    {/* Expandable Equipment List */}
                    <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                      <Divider />
                      <Box sx={{ p: 2, bgcolor: '#fcfdfe' }}>
                        <Typography variant="overline" fontWeight="700" color="primary" sx={{ mb: 1.5, display: 'block' }}>
                          Equipos Registrados
                        </Typography>
                        
                        {isLoading ? (
                          <Box display="flex" justifyContent="center" py={3}>
                            <CircularProgress size={24} />
                          </Box>
                        ) : (
                          <Stack spacing={1.5}>
                            {equipments.length === 0 ? (
                              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', py: 1 }}>
                                No hay equipos vinculados a este cliente.
                              </Typography>
                            ) : (
                              equipments
                                .filter(e => (e.elevatorTypeName?.toLowerCase() || '').includes(search.toLowerCase()))
                                .map((equipo) => (
                                <Box 
                                  key={equipo.id}
                                  sx={{ 
                                    p: 1.5, 
                                    borderRadius: 3, 
                                    bgcolor: '#fff', 
                                    border: '1px solid #f1f5f9',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 1
                                  }}
                                >
                                  <Box display="flex" justifyContent="space-between" alignItems="center">
                                    <Box>
                                      <Typography variant="body2" fontWeight="700">
                                        {equipo.nombre || `${equipo.elevatorTypeName} #${equipo.id}`}
                                      </Typography>
                                      {equipo.nombre && (
                                        <Typography variant="caption" color="text.secondary">
                                          {equipo.elevatorTypeName} #{equipo.id}
                                        </Typography>
                                      )}
                                    </Box>
                                    <Chip 
                                      label={equipo.state} 
                                      size="small" 
                                      variant="outlined"
                                      color={equipo.state === 'activo' ? 'success' : 'default'}
                                      sx={{ height: 18, fontSize: '0.6rem', fontWeight: '800', textTransform: 'uppercase' }} 
                                    />
                                  </Box>

                                  <Box sx={{ mt: -0.5, mb: 0.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="caption" sx={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                      {equipo.lastMaintenance ? (
                                        <>
                                          <CheckBadgeIcon className="h-3 w-3 text-green-500" />
                                          Último: {new Date(equipo.lastMaintenance.date).toLocaleDateString()} por {equipo.lastMaintenance.technician}
                                        </>
                                      ) : (
                                        <>
                                          <WrenchScrewdriverIcon className="h-3 w-3 text-amber-500" />
                                          Sin mantenimientos registrados
                                        </>
                                      )}
                                    </Typography>

                                    {equipo.lastMaintenance && (
                                      <IconButton 
                                        size="small" 
                                        onClick={(e) => { e.stopPropagation(); handleDownloadLastPDF(equipo, cliente); }}
                                        sx={{ 
                                          p: 0.8, 
                                          color: '#3b82f6',
                                          bgcolor: 'rgba(59, 130, 246, 0.08)',
                                          '&:hover': { bgcolor: 'rgba(59, 130, 246, 0.15)' },
                                          borderRadius: 2
                                        }}
                                        title="Descargar Reporte PDF"
                                      >
                                        <ArrowDownTrayIcon className="h-4 w-4" />
                                      </IconButton>
                                    )}
                                  </Box>
                                  
                                  <Stack direction="row" spacing={2}>
                                    <Box>
                                      <Typography variant="caption" color="text.disabled" display="block">PARADAS</Typography>
                                      <Typography variant="caption" fontWeight="500">{equipo.stopNumber || '0'}</Typography>
                                    </Box>
                                    <Box>
                                      <Typography variant="caption" color="text.disabled" display="block">CAPACIDAD</Typography>
                                      <Typography variant="caption" fontWeight="500">{equipo.capacity || '0'} Kg</Typography>
                                    </Box>
                                  </Stack>

                                  <Button
                                    fullWidth
                                    variant="contained"
                                    size="small"
                                    onClick={() => handleOpenMaintenanceTypeModal(equipo)}
                                    startIcon={<CheckBadgeIcon className="h-4 w-4" />}
                                    sx={{ 
                                      mt: 0.5,
                                      borderRadius: 2, 
                                      textTransform: 'none', 
                                      fontWeight: '600',
                                      bgcolor: '#3b82f6',
                                      '&:hover': { bgcolor: '#2563eb' }
                                    }}
                                  >
                                    Iniciar Mantenimiento
                                  </Button>
                                </Box>
                              ))
                            )}
                          </Stack>
                        )}
                      </Box>
                    </Collapse>
                  </CardContent>
                </Card>
              );
            })
          )}
        </Stack>
      )}

      {/* Dialog para seleccionar Tipo de Mantenimiento */}
      <Dialog 
        open={typeDialogOpen} 
        onClose={() => setTypeDialogOpen(false)} 
        maxWidth="xs" 
        fullWidth
        PaperProps={{ sx: { borderRadius: 4, p: 1 } }}
      >
        <DialogTitle sx={{ pb: 1, textAlign: 'center' }}>
          <Typography variant="h6" fontWeight="800">
            Tipo de Mantenimiento
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {selectedEquipoForMaintenance?.nombre || `${selectedEquipoForMaintenance?.elevatorTypeName} #${selectedEquipoForMaintenance?.id || ''}`}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
            Selecciona el tipo de servicio a ejecutar:
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {/* Opción 1: Preventivo */}
            <Paper
              elevation={0}
              onClick={() => handleSelectMaintenanceType('Preventivo')}
              sx={{
                p: 2,
                borderRadius: 3,
                border: '2px solid #e2e8f0',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                '&:hover': {
                  borderColor: '#10b981',
                  bgcolor: '#f0fdf4',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)'
                }
              }}
            >
              <Box 
                sx={{ 
                  width: 44, 
                  height: 44, 
                  borderRadius: 2.5, 
                  bgcolor: '#dcfce7', 
                  color: '#16a34a', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <ShieldCheckIcon className="h-6 w-6" />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" fontWeight="700" sx={{ color: '#0f172a' }}>
                  Preventivo
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Inspección y rutina periódica programada
                </Typography>
              </Box>
            </Paper>

            {/* Opción 2: Correctivo */}
            <Paper
              elevation={0}
              onClick={() => handleSelectMaintenanceType('Correctivo')}
              sx={{
                p: 2,
                borderRadius: 3,
                border: '2px solid #e2e8f0',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                '&:hover': {
                  borderColor: '#f59e0b',
                  bgcolor: '#fffbeb',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(245, 158, 11, 0.15)'
                }
              }}
            >
              <Box 
                sx={{ 
                  width: 44, 
                  height: 44, 
                  borderRadius: 2.5, 
                  bgcolor: '#fef3c7', 
                  color: '#d97706', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <WrenchScrewdriverIcon className="h-6 w-6" />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" fontWeight="700" sx={{ color: '#0f172a' }}>
                  Correctivo
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Reparación, ajuste o reemplazo por fallas
                </Typography>
              </Box>
            </Paper>

            {/* Opción 3: Emergencia */}
            <Paper
              elevation={0}
              onClick={() => handleSelectMaintenanceType('Emergencia')}
              sx={{
                p: 2,
                borderRadius: 3,
                border: '2px solid #e2e8f0',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                '&:hover': {
                  borderColor: '#ef4444',
                  bgcolor: '#fef2f2',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.15)'
                }
              }}
            >
              <Box 
                sx={{ 
                  width: 44, 
                  height: 44, 
                  borderRadius: 2.5, 
                  bgcolor: '#fee2e2', 
                  color: '#dc2626', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <BoltIcon className="h-6 w-6" />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" fontWeight="700" sx={{ color: '#0f172a' }}>
                  Emergencia
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Atención inmediata por parada imprevista o urgencia
                </Typography>
              </Box>
            </Paper>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button fullWidth onClick={() => setTypeDialogOpen(false)} sx={{ textTransform: 'none', color: '#64748b', fontWeight: '700' }}>
            Cancelar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
