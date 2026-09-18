import { Box, Typography } from '@mui/material';
import { MapPinIcon } from '@heroicons/react/24/outline';
import ReporteUbicacion from '../horas-extra/components/ReporteUbicacion';

export default function ReporteUbicacionPage() {
  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: '#f8fafc', minHeight: '100vh', width: '100%' }}>
      {/* Header */}
      <Box mb={3} display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <Box sx={{ bgcolor: '#ecfdf5', p: 1.2, borderRadius: '12px', display: 'flex', color: '#059669' }}>
            <MapPinIcon className="w-7 h-7" />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight={800} color="#1e293b">
              Reporte de <Box component="span" sx={{ color: '#059669' }}>Ubicación y Fotos</Box>
            </Typography>
            <Typography variant="body2" color="#64748b">
              Auditoría fotográfica y geolocalización de todas las marcaciones del personal (jornada ordinaria y horas extra)
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Componente principal de auditoría */}
      <ReporteUbicacion />
    </Box>
  );
}
