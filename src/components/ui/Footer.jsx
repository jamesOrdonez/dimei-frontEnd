import { Box, Typography } from '@mui/material';

const Footer = () => (
  <Box sx={{ 
    mt: 'auto', 
    py: 4, 
    textAlign: 'center',
    width: '100%'
  }}>
    <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 500 }}>
      &copy; {new Date().getFullYear()} ColWorksDev - Sistema de Gestión de Inventario. Todos los derechos reservados.
    </Typography>
  </Box>
);

export default Footer;
