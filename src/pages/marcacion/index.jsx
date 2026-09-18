import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Box, Typography, Button, Paper, Grid, Stack, Chip,
  CircularProgress, Divider, Tooltip, Alert,
} from '@mui/material';
import { Icon } from '@iconify/react';
import Swal from 'sweetalert2';
import CameraLocationModal from './components/CameraLocationModal';

// ─── Utilidades ──────────────────────────────────────────────────────────────

function formatTime(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleTimeString('es-CO', {
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function duracionMinutos(desde, hasta) {
  if (!desde || !hasta) return null;
  const diff = (new Date(hasta) - new Date(desde)) / 60000;
  if (diff <= 0) return null;
  const h = Math.floor(diff / 60);
  const m = Math.round(diff % 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

// ─── Tarjeta de marcación ────────────────────────────────────────────────────

const STEPS = [
  {
    key: 'entry',
    field: 'entry_time',
    label: 'Entrada',
    sublabel: 'Llegada a labores',
    icon: 'lucide:log-in',
    color: '#10b981',
    bgColor: '#ecfdf5',
    borderColor: '#a7f3d0',
  },
  {
    key: 'lunch_start',
    field: 'lunch_start',
    label: 'Salida Almuerzo',
    sublabel: 'Inicio de almuerzo',
    icon: 'lucide:coffee',
    color: '#f59e0b',
    bgColor: '#fffbeb',
    borderColor: '#fde68a',
  },
  {
    key: 'lunch_end',
    field: 'lunch_end',
    label: 'Regreso Almuerzo',
    sublabel: 'Fin de almuerzo',
    icon: 'lucide:utensils',
    color: '#3b82f6',
    bgColor: '#eff6ff',
    borderColor: '#bfdbfe',
  },
  {
    key: 'exit',
    field: 'exit_time',
    label: 'Salida',
    sublabel: 'Fin de labores',
    icon: 'lucide:log-out',
    color: '#ef4444',
    bgColor: '#fef2f2',
    borderColor: '#fecaca',
  },
];

function StepCard({ step, record, onMark, isNext, loading }) {
  const markedTime = record ? (record[step.field] || record[step.key]) : null;
  const isDone = Boolean(markedTime);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        border: '1.5px solid',
        borderColor: isDone ? step.borderColor : isNext ? step.borderColor : '#e2e8f0',
        borderRadius: 3,
        bgcolor: isDone ? step.bgColor : isNext ? `${step.bgColor}80` : '#fafafa',
        transition: 'all 0.2s ease',
        opacity: !isDone && !isNext ? 0.55 : 1,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {isDone && (
        <Box
          sx={{
            position: 'absolute', top: 8, right: 8,
            width: 24, height: 24, borderRadius: '50%',
            bgcolor: step.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Icon icon="lucide:check" width={14} color="white" />
        </Box>
      )}

      <Stack direction="row" alignItems="center" spacing={1.5} mb={1.5}>
        <Box
          sx={{
            width: 40, height: 40, borderRadius: 2,
            bgcolor: isDone ? step.color : isNext ? step.color : '#94a3b8',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            transition: 'background-color 0.2s',
          }}
        >
          <Icon icon={step.icon} width={20} color="white" />
        </Box>
        <Box>
          <Typography variant="body2" fontWeight={700} color={isDone ? step.color : 'text.primary'}>
            {step.label}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {step.sublabel}
          </Typography>
        </Box>
      </Stack>

      {isDone ? (
        <Typography variant="h6" fontWeight={800} sx={{ color: step.color, fontVariantNumeric: 'tabular-nums' }}>
          {formatTime(markedTime)}
        </Typography>
      ) : isNext ? (
        <Button
          variant="contained"
          fullWidth
          onClick={() => onMark(step.key)}
          disabled={loading}
          size="small"
          sx={{
            bgcolor: step.color,
            '&:hover': { bgcolor: step.color, filter: 'brightness(0.9)' },
            borderRadius: 2,
            fontWeight: 700,
            textTransform: 'none',
          }}
        >
          {loading ? <CircularProgress size={16} color="inherit" /> : `Marcar ${step.label}`}
        </Button>
      ) : (
        <Typography variant="body2" color="text.disabled" fontStyle="italic">
          Pendiente
        </Typography>
      )}
    </Paper>
  );
}

// ─── Historial de registros ──────────────────────────────────────────────────

function HistorialRow({ record }) {
  const laborado = duracionMinutos(record.entry_time, record.exit_time);
  const almuerzo = duracionMinutos(record.lunch_start, record.lunch_end);

  return (
    <Box
      sx={{
        px: 2, py: 1.5,
        border: '1px solid #f1f5f9',
        borderRadius: 2,
        bgcolor: 'white',
        '&:hover': { bgcolor: '#f8fafc' },
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
        <Box>
          <Typography variant="body2" fontWeight={600} color="text.primary">
            {new Date(record.record_date + 'T00:00:00').toLocaleDateString('es-CO', {
              weekday: 'short', day: 'numeric', month: 'short',
            })}
          </Typography>
          {record.is_holiday ? (
            <Chip label="Festivo" size="small" sx={{ fontSize: '0.65rem', height: 18, bgcolor: '#fef3c7', color: '#92400e' }} />
          ) : new Date(record.record_date + 'T00:00:00').getDay() === 0 ? (
            <Chip label="Domingo" size="small" sx={{ fontSize: '0.65rem', height: 18, bgcolor: '#ede9fe', color: '#6d28d9' }} />
          ) : null}
        </Box>

        <Stack direction="row" spacing={2} flexWrap="wrap">
          {[
            { label: 'Entrada', value: formatTime(record.entry_time), icon: 'lucide:log-in', color: '#10b981' },
            { label: 'Al. Inicio', value: formatTime(record.lunch_start), icon: 'lucide:coffee', color: '#f59e0b' },
            { label: 'Al. Fin', value: formatTime(record.lunch_end), icon: 'lucide:utensils', color: '#3b82f6' },
            { label: 'Salida', value: formatTime(record.exit_time), icon: 'lucide:log-out', color: '#ef4444' },
          ].map((item) => (
            <Box key={item.label} textAlign="center" minWidth={60}>
              <Typography variant="caption" color="text.disabled" display="block">
                {item.label}
              </Typography>
              <Typography variant="caption" fontWeight={600} sx={{ color: item.color }}>
                {item.value}
              </Typography>
            </Box>
          ))}

          {laborado && (
            <Box textAlign="center" minWidth={60}>
              <Typography variant="caption" color="text.disabled" display="block">Total</Typography>
              <Chip label={laborado} size="small" sx={{ fontSize: '0.7rem', height: 20, bgcolor: '#eff6ff', color: '#1d4ed8', fontWeight: 700 }} />
            </Box>
          )}
        </Stack>
      </Stack>
    </Box>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function Marcacion() {
  const [record, setRecord] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Reloj en tiempo real
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchRecord = useCallback(async () => {
    setLoading(true);
    // Peticiones independientes: si una falla, la otra sigue
    try {
      const todayRes = await axios.get('/myRecord');
      setRecord(todayRes.data.data || null);
    } catch (err) {
      console.error('Error cargando registro de hoy:', err?.response?.data || err.message);
    }
    try {
      const historyRes = await axios.get('/myRecordHistory?limit=7');
      setHistory(historyRes.data.data || []);
    } catch (err) {
      console.error('Error cargando historial:', err?.response?.data || err.message);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchRecord();
  }, [fetchRecord]);

  // Determina cuál es el siguiente paso a marcar
  const getNextStep = () => {
    if (!record || !record.entry_time) return 'entry';
    if (!record.lunch_start) return 'lunch_start';
    if (!record.lunch_end) return 'lunch_end';
    if (!record.exit_time) return 'exit';
    return null; // Día completo
  };

  const nextStep = getNextStep();
  const isComplete = nextStep === null;

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedStepKey, setSelectedStepKey] = useState(null);

  const handleOpenModal = (type) => {
    setSelectedStepKey(type);
    setModalOpen(true);
  };

  const handleConfirmMark = async ({ photo, latitude, longitude, accuracy, justification }) => {
    setMarking(true);
    try {
      const res = await axios.post('/markTime', {
        type: selectedStepKey,
        photo,
        latitude,
        longitude,
        accuracy,
        justification,
      }, {
        headers: { 'Content-Type': 'application/json' },
      });
      // Actualizar estado inmediatamente desde la respuesta del POST
      if (res.data?.data) {
        setRecord(res.data.data);
      }
      setModalOpen(false);
      // Refrescar en segundo plano para sincronizar historial
      fetchRecord();
      Swal.fire({
        title: '¡Marcación registrada!',
        text: `Se registró tu ${STEPS.find(s => s.key === selectedStepKey)?.label.toLowerCase()} correctamente con foto y ubicación.`,
        icon: 'success',
        timer: 2500,
        showConfirmButton: false,
        toast: true,
        position: 'top-end',
      });
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || 'No se pudo registrar la marcación.', 'error');
    } finally {
      setMarking(false);
    }
  };

  const laboradoHoy = record ? duracionMinutos(record.entry_time, record.exit_time) : null;

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', px: { xs: 2, md: 0 } }}>
      {/* ── Encabezado con reloj ── */}
      <Paper
        elevation={0}
        sx={{
          p: 3, mb: 3,
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          borderRadius: 4,
          color: 'white',
        }}
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} gap={2}>
          <Box>
            <Typography variant="body2" sx={{ opacity: 0.6, textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.7rem' }}>
              Control de Asistencia
            </Typography>
            <Typography variant="h4" fontWeight={800} sx={{ fontVariantNumeric: 'tabular-nums', mt: 0.5 }}>
              {currentTime.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.7, mt: 0.5, textTransform: 'capitalize' }}>
              {currentTime.toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </Typography>
          </Box>

          <Box textAlign={{ xs: 'left', sm: 'right' }}>
            {isComplete ? (
              <Chip
                icon={<Icon icon="lucide:check-circle" width={16} />}
                label="Día completado"
                sx={{ bgcolor: '#10b981', color: 'white', fontWeight: 700, px: 1 }}
              />
            ) : (
              <Box>
                <Typography variant="caption" sx={{ opacity: 0.6, display: 'block' }}>Próxima marcación</Typography>
                <Chip
                  icon={<Icon icon={STEPS.find(s => s.key === nextStep)?.icon || 'lucide:clock'} width={14} />}
                  label={STEPS.find(s => s.key === nextStep)?.label}
                  sx={{
                    bgcolor: STEPS.find(s => s.key === nextStep)?.color,
                    color: 'white', fontWeight: 700,
                  }}
                />
              </Box>
            )}
            {laboradoHoy && (
              <Typography variant="caption" sx={{ opacity: 0.7, display: 'block', mt: 0.5 }}>
                Tiempo laborado: {laboradoHoy}
              </Typography>
            )}
          </Box>
        </Stack>
      </Paper>

      {/* ── Tarjetas de marcación ── */}
      {loading ? (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {isComplete && (
            <Alert
              severity="success"
              icon={<Icon icon="lucide:party-popper" width={20} />}
              sx={{ mb: 2, borderRadius: 2 }}
            >
              <Typography fontWeight={700}>¡Jornada completada!</Typography>
              Has registrado todos los tiempos del día. Buen trabajo.
            </Alert>
          )}

          <Grid container spacing={2} mb={3}>
            {STEPS.map((step, idx) => {
              const stepOrder = ['entry', 'lunch_start', 'lunch_end', 'exit'];
              const isNext = nextStep === step.key;
              return (
                <Grid item xs={12} sm={6} key={step.key}>
                  <StepCard
                    step={step}
                    record={record}
                    onMark={handleOpenModal}
                    isNext={isNext}
                    loading={marking}
                  />
                </Grid>
              );
            })}
          </Grid>

          <Divider sx={{ mb: 3 }} />

          {/* ── Historial ── */}
          <Box>
            <Stack direction="row" alignItems="center" spacing={1} mb={2}>
              <Icon icon="lucide:history" width={18} style={{ color: '#64748b' }} />
              <Typography variant="subtitle2" fontWeight={700} color="text.secondary" textTransform="uppercase" letterSpacing={0.5}>
                Historial reciente
              </Typography>
            </Stack>

            {history.length === 0 ? (
              <Typography variant="body2" color="text.disabled" textAlign="center" py={3}>
                No hay registros anteriores.
              </Typography>
            ) : (
              <Stack spacing={1}>
                {history.map((rec) => (
                  <HistorialRow key={rec.id} record={rec} />
                ))}
              </Stack>
            )}
          </Box>
        </>
      )}

      {/* ── Modal de Captura de Foto y GPS ── */}
      <CameraLocationModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleConfirmMark}
        stepInfo={STEPS.find((s) => s.key === selectedStepKey)}
        loading={marking}
      />
    </Box>
  );
}
