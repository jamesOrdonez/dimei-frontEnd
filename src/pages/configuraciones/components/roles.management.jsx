import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormGroup,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Alert,
  Divider,
  Stack,
  IconButton,
  Tooltip,
  Paper,
} from '@mui/material';
import { Icon } from '@iconify/react';
import Swal from 'sweetalert2';

const ALLOWED_PERMISSIONS = [
  'Acceso a ingresar material',
  'Hacer remisiones de proyectos',
  'Crear ítems',
  'Crear productos',
  'Crear proyectos',
  'Consultar listas de compras',
  'Anexar actas de entrega',
  'Pedir material adicional',
];

const BASE_ROLES = ['Almacenista', 'Diseñador', 'Administrador'];

const ROL_COLORS = {
  Almacenista: { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
  Diseñador: { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' },
  Administrador: { bg: '#fdf4ff', color: '#7e22ce', border: '#e9d5ff' },
};

const getChipStyle = (name) => {
  const palette = ROL_COLORS[name] || { bg: '#f3f4f6', color: '#374151', border: '#e5e7eb' };
  return {
    backgroundColor: palette.bg,
    color: palette.color,
    border: `1px solid ${palette.border}`,
    fontWeight: 700,
  };
};

export default function RolesManagement() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRol, setSelectedRol] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [permissLoading, setPermissLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [openNewRol, setOpenNewRol] = useState(false);
  const [newRolName, setNewRolName] = useState('');
  const [creatingRol, setCreatingRol] = useState(false);

  const company = sessionStorage.getItem('company');

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/getRoles/${company}`);
      setRoles(res.data.data || []);
    } catch (err) {
      console.error('Error cargando roles:', err);
    } finally {
      setLoading(false);
    }
  }, [company]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const handleSelectRol = async (rol) => {
    setSelectedRol(rol);
    setPermissLoading(true);
    try {
      const res = await axios.get(`/getPermissions/${rol.id}`);
      setSelectedPermissions((res.data.data || []).map(p => p.permiss));
    } catch (err) {
      console.error('Error cargando permisos:', err);
      setSelectedPermissions([]);
    } finally {
      setPermissLoading(false);
    }
  };

  const handleTogglePermission = (permiso) => {
    setSelectedPermissions(prev =>
      prev.includes(permiso) ? prev.filter(p => p !== permiso) : [...prev, permiso]
    );
  };

  const handleSavePermissions = async () => {
    if (!selectedRol) return;
    setSaving(true);
    try {
      await axios.post('/syncPermissions', {
        rolId: selectedRol.id,
        company,
        permissions: selectedPermissions,
      });
      Swal.fire({
        title: '¡Guardado!',
        text: `Permisos del rol "${selectedRol.name}" actualizados.`,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || 'No se pudieron guardar los permisos.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateRol = async () => {
    if (!newRolName.trim()) return;
    setCreatingRol(true);
    try {
      await axios.post('/saveRol', { name: newRolName.trim(), company });
      await fetchRoles();
      setOpenNewRol(false);
      setNewRolName('');
      Swal.fire({
        title: '¡Rol creado!',
        text: `El rol "${newRolName.trim()}" fue creado exitosamente.`,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || 'No se pudo crear el rol.', 'error');
    } finally {
      setCreatingRol(false);
    }
  };

  const handleDeleteRol = async (rol) => {
    if (BASE_ROLES.includes(rol.name)) {
      Swal.fire('No permitido', 'Los roles base del sistema no pueden eliminarse.', 'warning');
      return;
    }
    const result = await Swal.fire({
      title: `¿Eliminar rol "${rol.name}"?`,
      text: 'Esta acción eliminará el rol y todos sus permisos.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Sí, eliminar',
    });
    if (!result.isConfirmed) return;
    try {
      await axios.delete(`/deleteRol/${rol.id}`);
      if (selectedRol?.id === rol.id) {
        setSelectedRol(null);
        setSelectedPermissions([]);
      }
      await fetchRoles();
      Swal.fire({ title: 'Eliminado', icon: 'success', timer: 1500, showConfirmButton: false });
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || 'No se pudo eliminar el rol.', 'error');
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h6" fontWeight="bold" color="text.primary">
            Gestión de Roles y Permisos
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Configura qué puede hacer cada rol en el sistema
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Icon icon="lucide:plus" />}
          onClick={() => setOpenNewRol(true)}
          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 'bold' }}
        >
          Nuevo Rol
        </Button>
      </Box>

      <Box display="flex" gap={3} flexDirection={{ xs: 'column', md: 'row' }}>
        {/* Panel Izquierdo — Lista de Roles */}
        <Paper
          elevation={0}
          sx={{
            width: { xs: '100%', md: 280 },
            flexShrink: 0,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 3,
            overflow: 'hidden',
          }}
        >
          <Box sx={{ p: 2, bgcolor: '#f8fafc', borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography variant="subtitle2" fontWeight="bold" color="text.secondary" textTransform="uppercase" fontSize="0.7rem" letterSpacing={1}>
              Roles del Sistema
            </Typography>
          </Box>

          {loading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress size={32} />
            </Box>
          ) : (
            <Stack divider={<Divider />}>
              {roles.map(rol => (
                <Box
                  key={rol.id}
                  onClick={() => handleSelectRol(rol)}
                  sx={{
                    px: 2,
                    py: 1.5,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    bgcolor: selectedRol?.id === rol.id ? 'primary.50' : 'transparent',
                    borderLeft: selectedRol?.id === rol.id ? '3px solid' : '3px solid transparent',
                    borderLeftColor: selectedRol?.id === rol.id ? 'primary.main' : 'transparent',
                    transition: 'all 0.15s',
                    '&:hover': { bgcolor: '#f1f5f9' },
                  }}
                >
                  <Box display="flex" alignItems="center" gap={1.5}>
                    <Chip
                      label={rol.name.charAt(0)}
                      size="small"
                      sx={{ ...getChipStyle(rol.name), width: 32, height: 32, borderRadius: '50%', fontSize: '0.85rem' }}
                    />
                    <Box>
                      <Typography variant="body2" fontWeight={selectedRol?.id === rol.id ? 700 : 500}>
                        {rol.name}
                      </Typography>
                      {BASE_ROLES.includes(rol.name) && (
                        <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.65rem' }}>
                          Rol base
                        </Typography>
                      )}
                    </Box>
                  </Box>
                  {!BASE_ROLES.includes(rol.name) && (
                    <Tooltip title="Eliminar rol" placement="right">
                      <IconButton
                        size="small"
                        onClick={(e) => { e.stopPropagation(); handleDeleteRol(rol); }}
                        sx={{ color: 'error.light', '&:hover': { color: 'error.main' } }}
                      >
                        <Icon icon="lucide:trash-2" width={14} />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              ))}
            </Stack>
          )}
        </Paper>

        {/* Panel Derecho — Permisos del Rol Seleccionado */}
        <Box flexGrow={1}>
          {!selectedRol ? (
            <Paper
              elevation={0}
              sx={{
                border: '1.5px dashed',
                borderColor: 'divider',
                borderRadius: 3,
                p: 6,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                color: 'text.disabled',
                minHeight: 300,
              }}
            >
              <Icon icon="lucide:shield" width={48} />
              <Typography variant="body1" textAlign="center">
                Selecciona un rol para ver y configurar sus permisos
              </Typography>
            </Paper>
          ) : (
            <Paper
              elevation={0}
              sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}
            >
              {/* Header del panel de permisos */}
              <Box
                sx={{
                  px: 3, py: 2,
                  bgcolor: '#f8fafc',
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                <Chip label={selectedRol.name} sx={getChipStyle(selectedRol.name)} />
                <Typography variant="subtitle2" color="text.secondary">
                  Configurar permisos
                </Typography>
                {selectedRol.name === 'Administrador' && (
                  <Alert severity="info" sx={{ py: 0, px: 1, ml: 'auto', borderRadius: 2, fontSize: '0.75rem' }}>
                    El Administrador tiene acceso completo al sistema
                  </Alert>
                )}
              </Box>

              {permissLoading ? (
                <Box display="flex" justifyContent="center" p={4}>
                  <CircularProgress size={32} />
                </Box>
              ) : (
                <Box p={3}>
                  {selectedRol.name === 'Administrador' ? (
                    <Alert severity="success" sx={{ borderRadius: 2 }}>
                      <Typography variant="body2">
                        El rol <strong>Administrador</strong> tiene acceso libre a todas las funcionalidades del sistema. Sus permisos no son configurables.
                      </Typography>
                    </Alert>
                  ) : (
                    <>
                      <Typography variant="body2" color="text.secondary" mb={2}>
                        Marca los permisos que tendrá el rol <strong>{selectedRol.name}</strong>:
                      </Typography>
                      <FormGroup>
                        {ALLOWED_PERMISSIONS.map(permiso => (
                          <FormControlLabel
                            key={permiso}
                            control={
                              <Checkbox
                                checked={selectedPermissions.includes(permiso)}
                                onChange={() => handleTogglePermission(permiso)}
                                sx={{
                                  '&.Mui-checked': { color: 'primary.main' },
                                }}
                              />
                            }
                            label={
                              <Box display="flex" alignItems="center" gap={1}>
                                <Icon icon="lucide:shield-check" width={16} style={{ color: selectedPermissions.includes(permiso) ? '#2563eb' : '#9ca3af' }} />
                                <Typography variant="body2">{permiso}</Typography>
                              </Box>
                            }
                            sx={{
                              mb: 1,
                              px: 1.5,
                              py: 0.75,
                              borderRadius: 2,
                              border: '1px solid',
                              borderColor: selectedPermissions.includes(permiso) ? 'primary.light' : 'divider',
                              bgcolor: selectedPermissions.includes(permiso) ? '#eff6ff' : 'transparent',
                              transition: 'all 0.15s',
                              '&:hover': { bgcolor: '#f8fafc' },
                              mx: 0,
                            }}
                          />
                        ))}
                      </FormGroup>

                      <Divider sx={{ my: 3 }} />

                      <Box display="flex" justifyContent="flex-end" gap={2}>
                        <Button
                          variant="outlined"
                          onClick={() => { setSelectedRol(null); setSelectedPermissions([]); }}
                          sx={{ borderRadius: 2, textTransform: 'none' }}
                        >
                          Cancelar
                        </Button>
                        <Button
                          variant="contained"
                          onClick={handleSavePermissions}
                          disabled={saving}
                          startIcon={saving ? <CircularProgress size={16} /> : <Icon icon="lucide:save" />}
                          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 'bold' }}
                        >
                          {saving ? 'Guardando...' : 'Guardar Permisos'}
                        </Button>
                      </Box>
                    </>
                  )}
                </Box>
              )}
            </Paper>
          )}
        </Box>
      </Box>

      {/* Dialog — Nuevo Rol */}
      <Dialog open={openNewRol} onClose={() => setOpenNewRol(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Crear Nuevo Rol</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Ingresa el nombre del nuevo rol. Luego podrás asignarle permisos.
          </Typography>
          <TextField
            autoFocus
            fullWidth
            label="Nombre del rol"
            value={newRolName}
            onChange={(e) => setNewRolName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateRol()}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenNewRol(false)} sx={{ borderRadius: 2, textTransform: 'none' }}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateRol}
            disabled={!newRolName.trim() || creatingRol}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 'bold' }}
          >
            {creatingRol ? 'Creando...' : 'Crear Rol'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
