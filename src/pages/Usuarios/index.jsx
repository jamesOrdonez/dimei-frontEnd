import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  IconButton,
  InputAdornment,
  Typography,
  Box,
  CircularProgress,
} from '@mui/material';
import { Icon } from '@iconify/react';
import axios from 'axios';
import Swal from 'sweetalert2';
import BaseGrid from '../../components/grid/base.grid.tsx';
import { usePermissions } from '../../context/PermissionsContext';

// SweetAlert2 con z-index superior al Dialog de MUI (~1300)
const SwalModal = Swal.mixin({
  didOpen: () => {
    const container = Swal.getContainer();
    if (container) container.style.zIndex = '9999';
  },
});

// ── Modal cambio de contraseña ────────────────────────────────────────────────
function ChangePasswordModal({ open, user, onClose }) {
  const [newPassword, setNewPassword]         = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew]                 = useState(false);
  const [showConfirm, setShowConfirm]         = useState(false);
  const [loading, setLoading]                 = useState(false);

  const handleClose = () => {
    setNewPassword('');
    setConfirmPassword('');
    setShowNew(false);
    setShowConfirm(false);
    onClose();
  };

  const handleSubmit = async () => {
    if (!newPassword || !confirmPassword) {
      SwalModal.fire({ icon: 'warning', title: 'Campos requeridos', text: 'Completa ambos campos.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      SwalModal.fire({ icon: 'error', title: 'No coinciden', text: 'Las contraseñas no coinciden.' });
      return;
    }
    if (newPassword.length < 6) {
      SwalModal.fire({ icon: 'warning', title: 'Contraseña muy corta', text: 'Mínimo 6 caracteres.' });
      return;
    }

    setLoading(true);
    try {
      await axios.put('/changePassword', { id: user.id, password: newPassword });
      SwalModal.fire({ icon: 'success', title: 'Contraseña actualizada', timer: 2000, showConfirmButton: false });
      handleClose();
    } catch (err) {
      SwalModal.fire({ icon: 'error', title: 'Error', text: err.response?.data?.message || 'No se pudo cambiar la contraseña.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
        <Box
          sx={{
            bgcolor: 'success.main',
            borderRadius: 1.5,
            width: 36,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon icon="lucide:key-round" width={20} color="#fff" />
        </Box>
        <Box>
          <Typography variant="subtitle1" fontWeight={700} lineHeight={1.2}>
            Cambiar contraseña
          </Typography>
          {user && (
            <Typography variant="caption" color="text.secondary">
              Usuario: <strong>{user.name || user.user}</strong>
            </Typography>
          )}
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: '12px !important', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="Nueva contraseña"
          type={showNew ? 'text' : 'password'}
          fullWidth
          size="small"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setShowNew((p) => !p)}>
                  <Icon icon={showNew ? 'lucide:eye-off' : 'lucide:eye'} width={18} />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <TextField
          label="Confirmar contraseña"
          type={showConfirm ? 'text' : 'password'}
          fullWidth
          size="small"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setShowConfirm((p) => !p)}>
                  <Icon icon={showConfirm ? 'lucide:eye-off' : 'lucide:eye'} width={18} />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
        <Button variant="outlined" color="inherit" onClick={handleClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          color="success"
          onClick={handleSubmit}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <Icon icon="lucide:save" width={16} />}
        >
          {loading ? 'Guardando...' : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function Usuarios() {
  const { isAdmin } = usePermissions();
  const [pwModal, setPwModal] = useState({ open: false, user: null });

  const fields = [
    {
      name: 'name',
      label: 'Nombre completo',
      input: 'text',
      grid: { xs: 12, md: 12 },
      required: true,
    },
    {
      name: 'user',
      label: 'Usuario',
      input: 'text',
      grid: { xs: 12, md: 12 },
      required: true,
    },
    {
      name: 'password',
      label: 'Contraseña',
      input: 'password',
      grid: { xs: 12, md: 6 },
      required: true,
      hasToHide: ({ mode }) => mode === 'update',
    },
    {
      name: 'rol',
      label: 'Rol',
      input: 'select',
      endpoint: `/getRoles/${sessionStorage.getItem('company')}`,
      optionLabel: 'name',
      optionValue: 'id',
      grid: { xs: 12, md: 6 },
      required: true,
      dynamicProps: ({ values, mode }) => mode === 'update' ? { grid: { xs: 12, md: 12 } } : {},
    },
  ];

  const mapData = (users) => {
    return (Array.isArray(users) ? users : []).map(u => ({
      ...u,
      Rol: u.Rol?.name || 'S/N',
      rol: u.rol // Keep ID for form
    }));
  };

  // Botón de llave verde — solo visible para administradores
  const renderExtraActions = isAdmin
    ? (item) => (
        <IconButton
          title="Cambiar contraseña"
          onClick={() => setPwModal({ open: true, user: item })}
          sx={{
            bgcolor: 'success.main',
            color: '#fff',
            border: '1.5px solid',
            borderColor: 'success.dark',
            borderRadius: 1.5,
            '&:hover': { bgcolor: 'success.dark' },
          }}
        >
          <Icon icon="lucide:key-round" width={20} />
        </IconButton>
      )
    : undefined;

  return (
    <>
      <BaseGrid
        title="Usuario"
        endpoint={`/getUser/${sessionStorage.getItem('company')}`}
        saveEndpoint="/saveUser"
        updateEndpoint="/updateUser"
        deleteEndpoint="/deleteUser"
        fetchOneEndpoint="/getOneUser"
        fields={fields}
        mapData={mapData}
        excludeKeys={['company', 'state', 'created_at', 'updated_at', 'password', 'rol']}
        renderExtraActions={renderExtraActions}
      />

      <ChangePasswordModal
        open={pwModal.open}
        user={pwModal.user}
        onClose={() => setPwModal({ open: false, user: null })}
      />
    </>
  );
}

