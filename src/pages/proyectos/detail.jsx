import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import { Card, CardContent, Typography, Grid, Divider, Box, Button } from '@mui/material';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { Loader } from '../../components/loaders';
import ProductTransfer from './components/product.transfer.jsx';
import ItemTransfer from './components/item.transfer.jsx';

export default function DetalleProyecto() {
  const { id: projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [showItems, setShowItems] = useState(false);
  const company = sessionStorage.getItem('company');

  useEffect(() => {
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

  if (!project) return <Loader />;

  return (
    <div className="mx-auto max-w-screen-xl px-4 lg:px-12 mt-6">
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
        <Typography variant="h5" fontWeight="bold">
          Proyecto #{projectId}
        </Typography>
      </Box>

      <Card sx={{ mb: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" fontWeight="bold" color="primary.main" mb={2}>
            Información del Proyecto
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          <Grid container spacing={4}>
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="caption" color="text.secondary" display="block">Cliente</Typography>
              <Typography variant="body1" fontWeight="500">{project?.customer || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="caption" color="text.secondary" display="block">Tipo de Ascensor</Typography>
              <Typography variant="body1" fontWeight="500">{project?.elevatorType || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="caption" color="text.secondary" display="block">Sistema Motriz</Typography>
              <Typography variant="body1" fontWeight="500">{project.typeDriveSystem || 'N/A'}</Typography>
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
          </Grid>
        </CardContent>
      </Card>

      <Card sx={{ mb: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" fontWeight="bold" color="primary.main" mb={2}>
            Asignar Productos
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          {/* TRANSFER LIST FOR PRODUCTS */}
          <ProductTransfer projectId={projectId} company={company} project={project} />
        </CardContent>
      </Card>

      {!showItems ? (
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
            
            {/* TRANSFER LIST FOR ITEMS */}
            <ItemTransfer projectId={projectId} company={company} project={project} />
          </CardContent>
        </Card>
      )}

    </div>
  );
}
