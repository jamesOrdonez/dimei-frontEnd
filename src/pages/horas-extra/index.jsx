import { useState } from 'react';
import { Box, Typography, Tabs, Tab, Paper } from '@mui/material';
import { ClockIcon, CalendarDaysIcon, Cog6ToothIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import ReporteHorasExtra from '../configuraciones/components/reporte.horas.extra';
import HorariosConfig from '../configuraciones/components/horarios';
import ReporteRetardos from './components/ReporteRetardos';

export default function HorasExtra() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: '#f8fafc', minHeight: '100vh', width: '100%' }}>
      {/* Header */}
      <Box mb={3} display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <Box sx={{ bgcolor: '#eff6ff', p: 1.2, borderRadius: '12px', display: 'flex', color: '#2563eb' }}>
            <ClockIcon className="w-7 h-7" />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight={800} color="#1e293b">
              Gestión de <Box component="span" color="primary.main">Horas Extra y Retardos</Box>
            </Typography>
            <Typography variant="body2" color="#64748b">
              Monitoreo de asistencia, horas trabajadas, retardos y configuración de horarios
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Tabs */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          bgcolor: '#ffffff',
          overflow: 'hidden',
          p: 0.5,
          mb: 3,
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(_, newVal) => setActiveTab(newVal)}
          textColor="primary"
          indicatorColor="primary"
          sx={{
            px: 1,
            '& .MuiTabs-indicator': {
              height: 3,
              borderRadius: '3px 3px 0 0',
            },
          }}
        >
          <Tab
            label={
              <Box display="flex" alignItems="center" gap={1}>
                <CalendarDaysIcon className="w-4 h-4" />
                <span>Reporte de Horas Extra</span>
              </Box>
            }
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.9rem',
              py: 1.5,
            }}
          />
          <Tab
            label={
              <Box display="flex" alignItems="center" gap={1}>
                <ExclamationTriangleIcon className="w-4 h-4" />
                <span>Reporte de Retardos</span>
              </Box>
            }
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.9rem',
              py: 1.5,
            }}
          />
          <Tab
            label={
              <Box display="flex" alignItems="center" gap={1}>
                <Cog6ToothIcon className="w-4 h-4" />
                <span>Horarios por Rol</span>
              </Box>
            }
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.9rem',
              py: 1.5,
            }}
          />
        </Tabs>
      </Paper>

      {/* Contenido de la pestaña */}
      <Box>
        {activeTab === 0 && <ReporteHorasExtra />}
        {activeTab === 1 && <ReporteRetardos />}
        {activeTab === 2 && <HorariosConfig />}
      </Box>
    </Box>
  );
}
