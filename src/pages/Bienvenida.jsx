import { Helmet } from 'react-helmet-async';
import { Box, Typography, Chip, Container } from '@mui/material';
import { usePermissions } from '../context/PermissionsContext';
import { decrypt } from '../utils/crypto';

const ROL_LABEL = {
  Almacenista: { label: 'Almacenista', color: '#1d4ed8', bg: '#dbeafe' },
  'Jefe de Almacen': { label: 'Jefe de Almacén', color: '#0369a1', bg: '#bae6fd' },
  Técnicos: { label: 'Técnico', color: '#b45309', bg: '#fef3c7' },
  Diseñador: { label: 'Diseñador', color: '#15803d', bg: '#dcfce7' },
};

export default function Bienvenida() {
  const { rolName } = usePermissions();

  const rolInfo = ROL_LABEL[rolName] || { label: rolName || 'Usuario', color: '#374151', bg: '#f3f4f6' };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches';
  const userName = decrypt(sessionStorage.getItem('name')) || 'usuario';

  return (
    <>
      <Helmet>
        <title>Inicio | DIMEI</title>
      </Helmet>

      <Container maxWidth="xl">
        {/* ── Hero ── */}
        <Box
          sx={{
            position: 'relative',
            borderRadius: 3,
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #1e3a5f 0%, #1d4ed8 60%, #3b82f6 100%)',
            p: { xs: 3, md: 5 },
            width: '100%',
            boxShadow: '0 16px 48px rgba(29, 78, 216, 0.25)',
          }}
        >
          {/* Decorative circles */}
          <Box sx={{ position: 'absolute', top: -60, right: -60, width: 260, height: 260, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
          <Box sx={{ position: 'absolute', bottom: -100, right: 60, width: 340, height: 340, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
          <Box sx={{ position: 'absolute', top: '30%', left: -80, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />

          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Chip
              label={rolInfo.label}
              size="small"
              sx={{
                backgroundColor: 'rgba(255,255,255,0.15)',
                color: '#fff',
                fontWeight: 700,
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.25)',
                mb: 2,
                fontSize: '0.75rem',
                letterSpacing: 0.5,
              }}
            />
            <Typography
              variant="h3"
              fontWeight={800}
              color="white"
              sx={{ lineHeight: 1.2, mb: 1.5, fontSize: { xs: '1.75rem', md: '2.5rem' } }}
            >
              {greeting},<br />{userName} 👋
            </Typography>
            <Typography
              variant="body1"
              color="rgba(255,255,255,0.8)"
              maxWidth={520}
              sx={{ fontSize: { xs: '0.95rem', md: '1.05rem' }, lineHeight: 1.6 }}
            >
              Bienvenido al sistema <strong style={{ color: '#fff' }}>DIMEI</strong>. Utiliza el menú lateral para navegar entre los módulos.
            </Typography>
          </Box>
        </Box>
      </Container>
    </>
  );
}
