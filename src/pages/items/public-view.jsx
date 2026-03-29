import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Grid, 
  Divider, 
  CircularProgress,
  Stack,
  Chip
} from '@mui/material';
import { 
  MapPinIcon, 
  TagIcon, 
  CurrencyDollarIcon, 
  ArchiveBoxIcon,
  IdentificationIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import { Helmet } from 'react-helmet-async';
import Footer from '../../components/ui/Footer';

export default function PublicItemView() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const response = await axios.get(`${axios.defaults.baseURL}/public/item/${id}`);
        setItem(response.data.data);
      } catch (err) {
        console.error('Error fetching public item:', err);
        setError('No se pudo encontrar la información del producto.');
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: '#f8fafc' }}>
        <Stack spacing={2} alignItems="center">
          <CircularProgress sx={{ color: '#3b82f6' }} />
          <Typography variant="body1" sx={{ color: '#64748b', fontWeight: 500 }}>Cargando detalles...</Typography>
        </Stack>
      </Box>
    );
  }

  if (error || !item) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: '#f8fafc' }}>
        <Paper elevation={0} sx={{ p: 4, textAlign: 'center', borderRadius: 4, border: '1px solid #e2e8f0', maxWidth: 400 }}>
          <Typography variant="h5" color="error" gutterBottom sx={{ fontWeight: 700 }}>¡Ups!</Typography>
          <Typography variant="body1" color="text.secondary">{error || 'El producto no existe.'}</Typography>
        </Paper>
      </Box>
    );
  }

  const locations = [item.position1, item.position2, item.position3].filter(Boolean);

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: '#f8fafc', 
      py: 6,
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
    }}>
      <Helmet>
        <title>{item.description || 'Detalle del Producto'} | DIMEI</title>
      </Helmet>

      <Container maxWidth="md">
        <Paper elevation={0} sx={{ 
          borderRadius: 6, 
          overflow: 'hidden', 
          border: '1px solid #e2e8f0',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
        }}>
          <Grid container>
            {/* Image Section */}
            <Grid item xs={12} md={5}>
              <Box sx={{ 
                height: { xs: 300, md: '100%' }, 
                width: '100%',
                bgcolor: '#f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: 2
              }}>
                {item.img ? (
                  <Box 
                    component="img"
                    src={`${axios.defaults.baseURL}/getItem/image/${item.id}`}
                    alt={item.description}
                    sx={{ 
                      maxHeight: '100%', 
                      maxWidth: '100%', 
                      objectFit: 'contain',
                      borderRadius: 4
                    }}
                  />
                ) : (
                  <Stack alignItems="center" spacing={1}>
                    <Box sx={{ 
                      p: 3, 
                      borderRadius: '50%', 
                      bgcolor: 'rgba(59, 130, 246, 0.05)',
                      display: 'flex'
                    }}>
                      <PhotoIcon className="h-16 w-16 text-blue-200" />
                    </Box>
                    <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>
                      Sin Imagen Disponibe
                    </Typography>
                  </Stack>
                )}
              </Box>
            </Grid>

            {/* Content Section */}
            <Grid item xs={12} md={7}>
              <Box sx={{ p: { xs: 4, md: 6 }, bgcolor: '#ffffff', height: '100%' }}>
                <Stack spacing={3}>
                  <Box>
                    <Chip 
                      label={item.ItemGroup?.name || 'General'} 
                      size="small" 
                      sx={{ 
                        mb: 1.5, 
                        bgcolor: 'rgba(59, 130, 246, 0.1)', 
                        color: '#3b82f6', 
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: 1
                      }} 
                    />
                    <Typography 
                      variant="h4" 
                      component="h1" 
                      sx={{ 
                        fontWeight: 800, 
                        color: '#0f172a',
                        lineHeight: 1.2
                      }}
                    >
                      {item.description}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: '#64748b', 
                        mt: 1, 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1,
                        fontSize: '0.875rem'
                      }}
                    >
                      <IdentificationIcon className="h-4 w-4" /> 
                      <Box component="span" sx={{ fontWeight: 600 }}>ID: {item.id}</Box>
                    </Typography>
                  </Box>

                  <Divider />

                  <Stack spacing={2}>
                    <DetailRow 
                      icon={<CurrencyDollarIcon className="h-5 w-5 text-blue-500" />} 
                      label="Precio" 
                      value={`$ ${Number(item.price).toLocaleString('es-CO')}`} 
                    />
                    <DetailRow 
                      icon={<ArchiveBoxIcon className="h-5 w-5 text-blue-500" />} 
                      label="Unidad de Medida" 
                      value={item.UnitOfMeasure?.unitOfMeasure || 'N/A'} 
                    />
                    
                    {locations.length > 0 && (
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="subtitle2" sx={{ color: '#64748b', fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <MapPinIcon className="h-5 w-5 text-blue-500" /> Ubicaciones
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                          {locations.map((loc, idx) => (
                            <Chip 
                              key={idx} 
                              label={loc} 
                              variant="outlined" 
                              sx={{ borderColor: '#e2e8f0', color: '#334155', fontWeight: 500 }} 
                            />
                          ))}
                        </Stack>
                      </Box>
                    )}
                  </Stack>

                  <Box sx={{ pt: 2 }}>
                    <Paper 
                      elevation={0} 
                      sx={{ 
                        p: 2, 
                        bgcolor: 'rgb(240, 247, 255)', 
                        borderRadius: 3,
                        border: '1px solid rgba(59, 130, 246, 0.1)'
                      }}
                    >
                      <Typography variant="caption" sx={{ color: '#3b82f6', fontWeight: 800, textTransform: 'uppercase' }}>
                        Estado del Producto
                      </Typography>
                      <Typography variant="h6" sx={{ color: '#1e40af', fontWeight: 700 }}>
                        Disponible
                      </Typography>
                    </Paper>
                  </Box>
                </Stack>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        <Footer />
      </Container>
    </Box>
  );
}

function DetailRow({ icon, label, value }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Box sx={{ 
        p: 1, 
        borderRadius: 2, 
        bgcolor: 'rgba(59, 130, 246, 0.05)',
        display: 'flex'
      }}>
        {icon}
      </Box>
      <Box>
        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>
          {label}
        </Typography>
        <Typography variant="body1" sx={{ color: '#1e293b', fontWeight: 700 }}>
          {value}
        </Typography>
      </Box>
    </Box>
  );
}
