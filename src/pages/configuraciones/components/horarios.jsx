import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Box, Typography, Button, Paper, Stack, Grid,
  TextField, CircularProgress, Alert, Chip,
} from '@mui/material';
import { Icon } from '@iconify/react';
import Swal from 'sweetalert2';

// ─── Utilidades ──────────────────────────────────────────────────────────────

function calcDuracion(inicio, fin) {
  if (!inicio || !fin) return null;
  const [ih, im] = inicio.split(':').map(Number);
  const [fh, fm] = fin.split(':').map(Number);
  const totalMin = (fh * 60 + fm) - (ih * 60 + im);
  if (totalMin <= 0) return null;
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

// ─── Panel de un rol ─────────────────────────────────────────────────────────

function RolSchedulePanel({ rol, company }) {
  const [form, setForm] = useState({
    entry_time: '',
    exit_time: '',
    saturday_entry_time: '',
    saturday_exit_time: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasSchedule, setHasSchedule] = useState(false);

  const fetchSchedule = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/scheduleByRol/${rol.id}/${company}`);
      if (res.data.data) {
        const s = res.data.data;
        setForm({
          entry_time: s.entry_time?.substring(0, 5) || '',
          exit_time: s.exit_time?.substring(0, 5) || '',
          saturday_entry_time: s.saturday_entry_time?.substring(0, 5) || '',
          saturday_exit_time: s.saturday_exit_time?.substring(0, 5) || '',
        });
        setHasSchedule(true);
      } else {
        setHasSchedule(false);
      }
    } catch (err) {
      console.error('Error cargando horario:', err);
      setHasSchedule(false);
    } finally {
      setLoading(false);
    }
  }, [rol.id, company]);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  const handleSave = async () => {
    const { entry_time, exit_time, saturday_entry_time, saturday_exit_time } = form;
    if (!entry_time || !exit_time) {
      Swal.fire('Campos incompletos', 'Hora de entrada y salida de lunes a viernes son obligatorias.', 'warning');
      return;
    }
    setSaving(true);
    try {
      await axios.post('/saveSchedule', {
        rolId: rol.id,
        company,
        entry_time,
        exit_time,
        saturday_entry_time: saturday_entry_time || entry_time,
        saturday_exit_time: saturday_exit_time || null,
      });
      setHasSchedule(true);
      Swal.fire({
        title: '¡Horario guardado!',
        text: `Horario del rol "${rol.name}" actualizado.`,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || 'No se pudo guardar el horario.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const duracionLV = calcDuracion(form.entry_time, form.exit_time);
  const duracionSab = calcDuracion(form.saturday_entry_time || form.entry_time, form.saturday_exit_time);

  return (
    <Paper
      elevation={0}
      sx={{
        border: '1px solid',
        borderColor: hasSchedule ? '#bfdbfe' : '#e2e8f0',
        borderRadius: 3,
        overflow: 'hidden',
        mb: 2,
      }}
    >
      {/* Header del rol */}
      <Box
        sx={{
          px: 3, py: 2,
          bgcolor: hasSchedule ? '#eff6ff' : '#f8fafc',
          borderBottom: '1px solid',
          borderColor: hasSchedule ? '#bfdbfe' : '#e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1.5,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              width: 36, height: 36, borderRadius: '50%',
              bgcolor: hasSchedule ? '#3b82f6' : '#94a3b8',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Typography variant="body2" fontWeight={800} color="white">
              {rol.name.charAt(0).toUpperCase()}
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" fontWeight={700}>{rol.name}</Typography>
            {hasSchedule ? (
              <Chip
                size="small"
                label="Horario configurado"
                icon={<Icon icon="lucide:check" width={12} />}
                sx={{ fontSize: '0.65rem', height: 18, bgcolor: '#dcfce7', color: '#15803d' }}
              />
            ) : (
              <Chip
                size="small"
                label="Sin horario"
                sx={{ fontSize: '0.65rem', height: 18, bgcolor: '#fef3c7', color: '#92400e' }}
              />
            )}
          </Box>
        </Stack>

        <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
          {duracionLV && (
            <Chip label={`L-V: ${duracionLV}`} size="small" sx={{ bgcolor: '#eff6ff', color: '#1d4ed8', fontWeight: 600 }} />
          )}
          {duracionSab && (
            <Chip label={`Sáb: ${duracionSab}`} size="small" sx={{ bgcolor: '#f0fdf4', color: '#15803d', fontWeight: 600 }} />
          )}
        </Stack>
      </Box>

      {/* Formulario */}
      {loading ? (
        <Box display="flex" justifyContent="center" py={3}>
          <CircularProgress size={28} />
        </Box>
      ) : (
        <Box p={3}>
          <Alert severity="info" icon={<Icon icon="lucide:info" width={20} />} sx={{ mb: 2.5, borderRadius: 2 }}>
            El almuerzo se descuenta automáticamente según marcaciones. Los sábados <strong>no tienen hora de almuerzo</strong> y solo se muestran en el reporte si el trabajador asistió y marcó tiempo.
          </Alert>

          {/* Sección Lunes a Viernes */}
          <Typography variant="caption" fontWeight={700} color="#475569" sx={{ textTransform: 'uppercase', letterSpacing: 0.8, mb: 1.5, display: 'block' }}>
            📅 Horario Lunes a Viernes
          </Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Hora de entrada (L-V)"
                type="time"
                value={form.entry_time}
                onChange={(e) => setForm(f => ({ ...f, entry_time: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                size="small"
                helperText="Hora en que inicia la jornada habitual"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Hora de salida (L-V)"
                type="time"
                value={form.exit_time}
                onChange={(e) => setForm(f => ({ ...f, exit_time: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                size="small"
                helperText="A partir de esta hora computan horas extra entre semana"
              />
            </Grid>
          </Grid>

          {/* Sección Sábados */}
          <Typography variant="caption" fontWeight={700} color="#475569" sx={{ textTransform: 'uppercase', letterSpacing: 0.8, mb: 1.5, display: 'block' }}>
            ⚡ Horario Sábados (Cuando se labora)
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Hora de entrada (Sábado)"
                type="time"
                value={form.saturday_entry_time || form.entry_time}
                onChange={(e) => setForm(f => ({ ...f, saturday_entry_time: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                size="small"
                helperText="Opcional. Por defecto toma la misma de entre semana"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Hora de salida (Sábado)"
                type="time"
                value={form.saturday_exit_time}
                onChange={(e) => setForm(f => ({ ...f, saturday_exit_time: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                size="small"
                helperText="Hora de salida habitual del sábado (ej: 12:00 o 13:00, sin almuerzo)"
              />
            </Grid>
          </Grid>

          <Box mt={2} display="flex" justifyContent="flex-end">
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={saving}
              startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <Icon icon="lucide:save" />}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
            >
              {saving ? 'Guardando...' : 'Guardar Horario'}
            </Button>
          </Box>
        </Box>
      )}
    </Paper>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function HorariosConfig() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  const company = sessionStorage.getItem('company');

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await axios.get(`/getRoles/${company}`);
        const allRoles = res.data.data || [];
        // Excluir el rol Administrador de la configuración de horarios
        setRoles(allRoles.filter(r => r.name !== 'Administrador'));
      } catch (err) {
        console.error('Error cargando roles:', err);
      } finally {
        setLoading(false);
      }
    };
    if (company) fetchRoles();
  }, [company]);

  return (
    <Box>
      {/* Header */}
      <Box mb={3}>
        <Typography variant="h6" fontWeight={700} color="text.primary">
          Horarios Laborales por Rol
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={0.5}>
          Define la hora de entrada y salida programada para cada rol. El almuerzo se descuenta automáticamente a partir de las marcaciones reales del personal.
        </Typography>
      </Box>

      {/* Lista de roles */}
      {loading ? (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress />
        </Box>
      ) : roles.length === 0 ? (
        <Paper
          elevation={0}
          sx={{ border: '1.5px dashed #e2e8f0', borderRadius: 3, p: 5, textAlign: 'center', color: 'text.disabled' }}
        >
          <Icon icon="lucide:users" width={40} />
          <Typography variant="body1" mt={1}>No hay roles disponibles para configurar.</Typography>
        </Paper>
      ) : (
        roles.map((rol) => (
          <RolSchedulePanel key={rol.id} rol={rol} company={company} />
        ))
      )}
    </Box>
  );
}
