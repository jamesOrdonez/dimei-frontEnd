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
  Divider
} from '@mui/material';
import { 
  MagnifyingGlassIcon, 
  MapPinIcon, 
  ChevronDownIcon,
  WrenchScrewdriverIcon,
  CheckBadgeIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import { pdf } from '@react-pdf/renderer';
import MaintenanceReportPdf from './MaintenanceReportPdf';

export default function ClientesMantenimiento() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const backendUrl = 'http://localhost:8080';

  const handleDownloadLastPDF = async (equipo) => {
    if (!equipo.lastMaintenance?.id) return;
    try {
      const res = await axios.get(`/getMaintenanceReport/${equipo.lastMaintenance.id}`);
      const report = res.data.data;
      
      const resGroup = await axios.get(`/getOneQuestionGroup/${equipo.questionGroupId}`);
      const group = resGroup.data.data;
      
      const techName = equipo.lastMaintenance.technician;
      
      const answersMap = {};
      (report.answers || []).forEach(ans => {
        answersMap[ans.question_id] = {
          question_id: ans.question_id,
          optionIds: ans.selected_options || [],
          text: ans.answer_text,
          photos: (ans.photos || []).map(p => ({ preview: p }))
        };
      });

      const blob = await pdf(
        <MaintenanceReportPdf 
          data={{ ...report, answers: answersMap, technicianSignature: report.technician_signature, customerSignature: report.customer_signature }} 
          equipo={equipo} 
          group={group}
          technicianName={techName}
          backendUrl={backendUrl}
        />
      ).toBlob();
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Reporte_${equipo.elevatorTypeName}_${equipo.id}_${new Date(report.date).toLocaleDateString()}.pdf`;
      link.click();
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
                                        onClick={(e) => { e.stopPropagation(); handleDownloadLastPDF(equipo); }}
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
                                    onClick={() => navigate(`/mantenimiento/formulario/${equipo.id}`)}
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
    </Box>
  );
}
