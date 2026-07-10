import { useState, useEffect, Fragment, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import { Card, CardContent, Typography, Grid, Divider, Box, Button, Alert, AlertTitle, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { ArrowLeftIcon, CloudArrowUpIcon, DocumentCheckIcon, EyeIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { Loader } from '../../components/loaders';
import ProductTransfer from './components/product.transfer.jsx';
import ItemTransfer from './components/item.transfer.jsx';
import { PDFDownloadLink } from '@react-pdf/renderer';
import ProjectReportPdf from './components/ProjectReportPdf.jsx';
import Swal from 'sweetalert2';
import RemisionModal from './components/RemisionModal.jsx';
import DeliveryActPdf from './components/DeliveryActPdf.jsx';
import { decrypt } from '../../utils/crypto.js';
import { useMemo } from 'react';
import { pdf } from '@react-pdf/renderer';
import { usePermissions, PERMISOS } from '../../context/PermissionsContext.jsx';


export default function DetalleProyecto() {
  const { id: projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [showItems, setShowItems] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [openRemision, setOpenRemision] = useState(false);
  const [closingProject, setClosingProject] = useState(false);
  const [uploadingSignedAct, setUploadingSignedAct] = useState(false);
  const company = sessionStorage.getItem('company');
  const user = decrypt(sessionStorage.getItem('name')) || ' ';
  const { hasPermission } = usePermissions();


  const fetchProject = useCallback(() => {
    axios.get(`/getOneProject/${projectId}`)
      .then(res => {
        const raw = res.data.data ?? res.data;
        const p = Array.isArray(raw) ? raw.find(i => String(i.id) === String(projectId)) || raw[0] : raw;
        setProject(p);
        
        // Auto-expand optional items panel if project already has items
        if (p?.items?.length > 0) {
          setShowItems(true);
        }
      })
      .catch(err => console.error('Error cargando proyecto:', err));
  }, [projectId]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  const handleStartProject = () => {
    Swal.fire({
      title: '¿Iniciar Proyecto?',
      text: "Esto cambiará el estado del proyecto a 'Iniciado'.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, iniciar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        setUpdatingStatus(true);
        axios.patch(`/updateProjectStatus/${projectId}`, { state: 'Iniciado' })
          .then(() => {
            Swal.fire({
              title: '¡Iniciado!',
              text: 'El proyecto ha sido iniciado correctamente.',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false
            });
            fetchProject();
          })
          .catch(err => {
            console.error(err);
            Swal.fire('Error', 'No se pudo actualizar el estado.', 'error');
          })
          .finally(() => setUpdatingStatus(false));
      }
    });
  };

  const isFullyRemitted = useMemo(() => {
    if (!project) return false;
    const projectProducts = project.products || [];
    const projectItems = project.items || [];
    
    if (projectProducts.length === 0 && projectItems.length === 0) return false;

    // Check products: quantity matched and no 'Pendiente' status
    const allProducts = projectProducts.every(p => {
      const quantityMatched = Number(p.remitted_quantity) >= Number(p.quantity);
      const nonePending = (p.remitted_details || []).every(d => d.status !== 'Pendiente');
      return quantityMatched && nonePending;
    });

    // Check items: quantity matched and no 'Pendiente' status
    const allItems = projectItems.every(i => {
      const quantityMatched = Number(i.remitted_quantity) >= Number(i.quantity);
      const nonePending = (i.remitted_details || []).every(d => d.status !== 'Pendiente');
      return quantityMatched && nonePending;
    });
    
    return allProducts && allItems;
  }, [project]);

  const handleCloseProject = async () => {
    const result = await Swal.fire({
      title: '¿Cerrar Proyecto?',
      text: "Esto cambiará el estado a 'Finalizado' y generará el Acta de Entrega.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, cerrar proyecto',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      setClosingProject(true);
      try {
        // 1. Generate and Download PDF
        const blob = await pdf(<DeliveryActPdf project={project} user={user} />).toBlob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `acta_entrega_proyecto_${projectId}.pdf`;
        link.click();
        URL.revokeObjectURL(url);

        // 2. Update status in backend
        await axios.patch(`/updateProjectStatus/${projectId}`, { state: 'Finalizado' });
        
        await Swal.fire({
          title: '¡Proyecto Cerrado!',
          text: 'El proyecto ha sido finalizado y el acta de entrega generada.',
          icon: 'success',
          timer: 3000,
          showConfirmButton: false
        });
        
        fetchProject();
      } catch (err) {
        console.error('Error al cerrar proyecto:', err);
        Swal.fire('Error', 'No se pudo cerrar el proyecto correctamente.', 'error');
      } finally {
        setClosingProject(false);
      }
    }
  };
  
  const handleUploadSignedAct = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      Swal.fire('Error', 'Solo se permiten archivos PDF.', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('signed_act', file);

    setUploadingSignedAct(true);
    axios.post(`/uploadSignedAct/${projectId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
      .then(() => {
        Swal.fire({
          title: '¡Cargado!',
          text: 'El acta firmada se ha cargado correctamente.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
        fetchProject();
      })
      .catch(err => {
        console.error(err);
        Swal.fire('Error', 'No se pudo cargar el archivo.', 'error');
      })
      .finally(() => setUploadingSignedAct(false));
  };

  const handleViewSignedAct = () => {
    window.open(`${axios.defaults.baseURL}/getSignedAct/${projectId}`, '_blank');
  };

  if (!project) return <Loader />;

  return (
    <div className="px-4 lg:px-8 mt-6">
      <Helmet>
        <title>Detalle del proyecto {projectId}</title>
      </Helmet>

      <Box display="flex" alignItems="center" mb={4} gap={2}>
        <Button 
          variant="outlined" 
          color="inherit" 
          onClick={() => navigate('/proyectos')}
          startIcon={<ArrowLeftIcon className="w-4 h-4" />}
          sx={{ borderRadius: 2 }}
        >
          Volver
        </Button>
        <Typography variant="h5" fontWeight="bold" sx={{ flexGrow: 1 }}>
          Proyecto #{projectId}
        </Typography>

        {project && (
          <Box display="flex" gap={1}>
            {project.state === 'Creado' && hasPermission(PERMISOS.CREAR_PROYECTOS) && (
              <Button
                variant="contained"
                color="success"
                onClick={handleStartProject}
                disabled={updatingStatus}
                sx={{ borderRadius: 2, color: '#fff' }}
              >
                {updatingStatus ? 'Iniciando...' : 'Iniciar Proyecto'}
              </Button>
            )}

            {project.state === 'Iniciado' && (
              !isFullyRemitted ? (
                <Button
                  variant="contained"
                  color="info"
                  onClick={() => setOpenRemision(true)}
                  disabled={!hasPermission(PERMISOS.HACER_REMISIONES)}
                  sx={{ borderRadius: 2 }}
                >
                  Remisionar
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="warning"
                  onClick={handleCloseProject}
                  disabled={closingProject || !hasPermission(PERMISOS.CREAR_PROYECTOS)}
                  sx={{ borderRadius: 2, color: '#fff' }}
                >
                  {closingProject ? 'Cerrando...' : 'Cerrar Proyecto'}
                </Button>
              )
            )}

            {project.state === 'Finalizado' && (
               <PDFDownloadLink
                  document={<DeliveryActPdf project={project} user={user} />}
                  fileName={`acta_entrega_proyecto_${projectId}.pdf`}
                  style={{ textDecoration: 'none' }}
               >
                  {({ loading }) => (
                     <Button
                        variant="contained"
                        color="success"
                        disabled={loading}
                        sx={{ borderRadius: 2 }}
                     >
                        {loading ? 'Generando Acta...' : 'Descargar Acta de Entrega'}
                     </Button>
                  )}
               </PDFDownloadLink>
            )}

             <PDFDownloadLink
                document={<ProjectReportPdf project={project} />}
                fileName={`presupuesto_proyecto_${projectId}.pdf`}
                style={{ textDecoration: 'none' }}
             >
                {({ loading }) => (
                   <Button
                      variant="contained"
                      color="primary"
                      disabled={loading}
                      sx={{ borderRadius: 2 }}
                   >
                      {loading ? 'Generando PDF...' : 'Descargar Presupuesto PDF'}
                   </Button>
                )}
             </PDFDownloadLink>
          </Box>
        )}
      </Box>

      <Card sx={{ mb: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" fontWeight="bold" color="primary.main" mb={2}>
            Información del Proyecto
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          <Grid container spacing={4}>
            {project?.nombre && (
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="caption" color="text.secondary" display="block">Nombre del Equipo</Typography>
                <Typography variant="body1" fontWeight="500">{project.nombre}</Typography>
              </Grid>
            )}
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="caption" color="text.secondary" display="block">Cliente</Typography>
              <Typography variant="body1" fontWeight="500">{project?.customerName || project?.customer || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="caption" color="text.secondary" display="block">Sistema Motriz</Typography>
              <Typography variant="body1" fontWeight="500">{project?.elevatorTypeName || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="caption" color="text.secondary" display="block">Tipo de Ascensor</Typography>
              <Typography variant="body1" fontWeight="500">{project.typeDriveSystemName || 'N/A'}</Typography>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="caption" color="text.secondary" display="block">Número de Paradas</Typography>
              <Typography variant="body1" fontWeight="500">{project.stopNumber || 0}</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="caption" color="text.secondary" display="block">Recorrido (m)</Typography>
              <Typography variant="body1" fontWeight="500">{project.travel || 0} m</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="caption" color="text.secondary" display="block">Capacidad (kg)</Typography>
              <Typography variant="body1" fontWeight="500">{project.capacity || 0} kg</Typography>
            </Grid>

            {project.state === 'Finalizado' && (
              <Grid item xs={12}>
                <Divider sx={{ my: 1, borderStyle: 'dashed' }} />
                <Box mt={2}>
                  <Typography variant="subtitle2" fontWeight="bold" mb={1}>
                    Acta de Entrega Final Firmada
                  </Typography>
                  
                  {!project.signed_act ? (
                    <Alert severity="warning" variant="outlined" sx={{ borderRadius: 2 }}>
                      <AlertTitle>Pendiente por cargar</AlertTitle>
                      Aún no se ha cargado el acta de entrega final firmada por el cliente.
                      {hasPermission(PERMISOS.ANEXAR_ACTAS) && (
                        <Box mt={2}>
                          <Button
                            variant="contained"
                            color="warning"
                            component="label"
                            startIcon={<CloudArrowUpIcon className="w-5 h-5" />}
                            disabled={uploadingSignedAct}
                            sx={{ borderRadius: 2, color: '#fff' }}
                          >
                            {uploadingSignedAct ? 'Subiendo...' : 'Cargar Acta Firmada'}
                            <input
                              type="file"
                              hidden
                              accept="application/pdf"
                              onChange={handleUploadSignedAct}
                            />
                          </Button>
                        </Box>
                      )}
                    </Alert>
                  ) : (
                    <Box display="flex" alignItems="center" gap={2}>
                      <Alert severity="success" icon={<DocumentCheckIcon className="w-5 h-5" />} sx={{ borderRadius: 2, flexGrow: 1 }}>
                        El acta de entrega firmada ya ha sido cargada.
                      </Alert>
                      <Box display="flex" gap={1}>
                        <Button
                          variant="outlined"
                          color="primary"
                          onClick={handleViewSignedAct}
                          startIcon={<EyeIcon className="w-5 h-5" />}
                          sx={{ borderRadius: 2 }}
                        >
                          Ver
                        </Button>
                        {hasPermission(PERMISOS.ANEXAR_ACTAS) && (
                          <Button
                            variant="outlined"
                            color="inherit"
                            component="label"
                            sx={{ borderRadius: 2 }}
                          >
                            Actualizar
                            <input
                              type="file"
                              hidden
                              accept="application/pdf"
                              onChange={handleUploadSignedAct}
                            />
                          </Button>
                        )}
                      </Box>
                    </Box>
                  )}
                </Box>
              </Grid>
            )}

          </Grid>
        </CardContent>
      </Card>

      <Card sx={{ mb: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" fontWeight="bold" color="primary.main" mb={2}>
            {(project.state === 'Finalizado' || !hasPermission(PERMISOS.CREAR_PROYECTOS)) ? 'Lista de Productos del Proyecto' : 'Asignar Productos'}
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          {project.state === 'Finalizado' || !hasPermission(PERMISOS.CREAR_PROYECTOS) ? (
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
              <Table size="small">
                <TableHead sx={{ backgroundColor: 'rgba(0,0,0,0.02)' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Producto</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Cantidad</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {project.products && project.products.length > 0 ? (
                    project.products.map((p) => (
                      <Fragment key={p.id}>
                        <TableRow sx={{ backgroundColor: 'rgba(0,0,0,0.01)' }}>
                          <TableCell sx={{ fontWeight: '600' }}>{p.product_name}</TableCell>
                          <TableCell align="center" sx={{ fontWeight: '600' }}>{p.quantity}</TableCell>
                        </TableRow>
                        {p.items && p.items.length > 0 && (
                          p.items.map((item, idx) => (
                             <TableRow key={`${p.id}-item-${idx}`}>
                                <TableCell sx={{ pl: 4, py: 0.5 }}>
                                   <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                                      <span style={{ marginRight: '8px', opacity: 0.5 }}>•</span>
                                      {item.item_name}
                                   </Typography>
                                </TableCell>
                                <TableCell align="center" sx={{ py: 0.5 }}>
                                   <Typography variant="caption" color="text.secondary">
                                      {item.quantity} por unidad
                                   </Typography>
                                </TableCell>
                             </TableRow>
                          ))
                        )}
                      </Fragment>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={2} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                        No hay productos asignados a este proyecto.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <ProductTransfer projectId={projectId} company={company} project={project} onSuccess={fetchProject} />
          )}
        </CardContent>
      </Card>

      {project.state === 'Finalizado' || !hasPermission(PERMISOS.PEDIR_MATERIAL) ? (
        project.items && project.items.length > 0 && (
          <Card sx={{ mb: 6, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" fontWeight="bold" color="secondary.main" mb={2}>
                Lista de Items Adicionales
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                <Table size="small">
                  <TableHead sx={{ backgroundColor: 'rgba(0,0,0,0.02)' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Item</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold' }}>Cantidad</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {project.items.map((i) => (
                      <TableRow key={i.id}>
                        <TableCell>{i.item_name}</TableCell>
                        <TableCell align="center">{i.quantity}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        )
      ) : (
        hasPermission(PERMISOS.PEDIR_MATERIAL) && (
          !showItems ? (
            <Box textAlign="center" mb={6}>
              <Button 
                fullWidth
                variant="outlined" 
                color="primary" 
                onClick={() => setShowItems(true)}
                sx={{ borderRadius: 2, py: 1.5, borderStyle: 'dashed', borderWidth: 2 }}
              >
                + Habilitar asignación de Items adicionales
              </Button>
            </Box>
          ) : (
            <Card sx={{ mb: 6, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
              <CardContent sx={{ p: 4 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6" fontWeight="bold" color="secondary.main">
                    Asignar Items Adicionales
                  </Typography>
                  <Button size="small" color="error" onClick={() => setShowItems(false)}>
                    Ocultar
                  </Button>
                </Box>
                <Divider sx={{ mb: 3 }} />
                
                <ItemTransfer projectId={projectId} company={company} project={project} onSuccess={fetchProject} />
              </CardContent>
            </Card>
          )
        )
      )}


      {project && (
        <RemisionModal 
          open={openRemision} 
          onClose={() => setOpenRemision(false)} 
          project={project} 
          projectId={projectId}
          company={company}
          showItemsTab={showItems}
          onSuccess={fetchProject}
        />
      )}

    </div>
  );
}
