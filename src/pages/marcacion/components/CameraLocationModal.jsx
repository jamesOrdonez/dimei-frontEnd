import { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Typography, Button, Stack, Alert, CircularProgress,
  IconButton, Chip, Tooltip, TextField,
} from '@mui/material';
import { Icon } from '@iconify/react';

CameraLocationModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  stepInfo: PropTypes.shape({
    key: PropTypes.string,
    label: PropTypes.string,
    color: PropTypes.string,
    icon: PropTypes.string,
  }),
  loading: PropTypes.bool,
};

export default function CameraLocationModal({ open, onClose, onConfirm, stepInfo, loading }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [stream, setStream] = useState(null);
  const [cameraFacing, setCameraFacing] = useState('user'); // 'user' (frontal) o 'environment' (trasera)
  const [cameraError, setCameraError] = useState(null);
  const [photoData, setPhotoData] = useState(null);
  const [justification, setJustification] = useState('');

  // Estado de geolocalización
  const [geoState, setGeoState] = useState({
    loading: true,
    latitude: null,
    longitude: null,
    accuracy: null,
    error: null,
  });

  // ── 1. Iniciar/detener la cámara ─────────────────────────────────────────────
  const startCamera = useCallback(async (facing = 'user') => {
    setCameraError(null);
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Tu navegador o dispositivo no soporta acceso directo a cámara.');
      }
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });
      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
    } catch (err) {
      console.warn('Error accediendo a cámara:', err);
      setCameraError('Se requiere permiso de cámara para tomar la fotografía en vivo. Habilita los permisos de cámara en tu navegador para continuar.');
    }
  }, [stream]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  }, [stream]);

  // ── 2. Obtener geolocalización ───────────────────────────────────────────────
  const fetchLocation = useCallback(() => {
    setGeoState({ loading: true, latitude: null, longitude: null, accuracy: null, error: null });

    if (!navigator.geolocation) {
      setGeoState({
        loading: false,
        latitude: null,
        longitude: null,
        accuracy: null,
        error: 'Geolocalización no soportada en este navegador.',
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoState({
          loading: false,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          error: null,
        });
      },
      (err) => {
        let errMsg = 'No se pudo obtener la ubicación GPS.';
        if (err.code === err.PERMISSION_DENIED) {
          errMsg = 'Permiso de ubicación denegado. Habilita los permisos de GPS en tu navegador.';
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          errMsg = 'Ubicación no disponible en este momento.';
        } else if (err.code === err.TIMEOUT) {
          errMsg = 'Tiempo de espera agotado al consultar GPS.';
        }
        setGeoState({
          loading: false,
          latitude: null,
          longitude: null,
          accuracy: null,
          error: errMsg,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0,
      }
    );
  }, []);

  // Ciclo de vida cuando se abre / cierra el modal
  useEffect(() => {
    if (open) {
      setPhotoData(null);
      setJustification('');
      startCamera(cameraFacing);
      fetchLocation();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Conectar el video al stream una vez que el elemento <video> esté disponible
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  // ── 3. Acciones de captura ───────────────────────────────────────────────────
  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const base64 = canvas.toDataURL('image/jpeg', 0.82);
    setPhotoData(base64);
    stopCamera();
  };

  const handleRetake = () => {
    setPhotoData(null);
    startCamera(cameraFacing);
  };

  const handleToggleFacing = () => {
    const nextFacing = cameraFacing === 'user' ? 'environment' : 'user';
    setCameraFacing(nextFacing);
    startCamera(nextFacing);
  };

  const handleConfirm = () => {
    if (!photoData) return;
    onConfirm({
      photo: photoData,
      latitude: geoState.latitude,
      longitude: geoState.longitude,
      accuracy: geoState.accuracy,
      justification: justification.trim(),
    });
  };

  const isLocationReady = !geoState.loading && geoState.latitude !== null;

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: 'hidden',
          p: 0,
        },
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: stepInfo?.color ? `${stepInfo.color}15` : '#f1f5f9',
          borderBottom: '1px solid #e2e8f0',
          py: 2, px: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <Box
            sx={{
              width: 32, height: 32, borderRadius: 2,
              bgcolor: stepInfo?.color || '#2563eb',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Icon icon={stepInfo?.icon || 'lucide:camera'} width={18} color="white" />
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight={800}>
              Confirmar {stepInfo?.label || 'Marcación'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Foto en vivo y ubicación requeridas
            </Typography>
          </Box>
        </Stack>
        <IconButton size="small" onClick={onClose} disabled={loading}>
          <Icon icon="lucide:x" width={18} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 2.5, pb: 1 }}>
        {/* ── Contenedor Cámara / Foto ── */}
        <Box
          sx={{
            width: '100%',
            height: 270,
            bgcolor: '#0f172a',
            borderRadius: 3,
            overflow: 'hidden',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid #e2e8f0',
            mb: 2,
          }}
        >
          {photoData ? (
            <img
              src={photoData}
              alt="Foto capturada"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : cameraError ? (
            <Box p={2.5} textAlign="center" color="white">
              <Icon icon="lucide:camera-off" width={40} style={{ color: '#ef4444', marginBottom: 8 }} />
              <Typography variant="caption" display="block" sx={{ mb: 2, opacity: 0.9, lineHeight: 1.4 }}>
                {cameraError}
              </Typography>
              <Button
                variant="outlined"
                color="inherit"
                size="small"
                startIcon={<Icon icon="lucide:refresh-cw" />}
                onClick={() => startCamera(cameraFacing)}
                sx={{ borderRadius: 2, textTransform: 'none' }}
              >
                Reintentar abrir cámara
              </Button>
            </Box>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transform: cameraFacing === 'user' ? 'scaleX(-1)' : 'none',
                }}
              />
              {/* Botón flotante para cambiar de cámara */}
              <Tooltip title="Cambiar cámara">
                <IconButton
                  onClick={handleToggleFacing}
                  sx={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    bgcolor: 'rgba(0,0,0,0.55)',
                    color: 'white',
                    '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' },
                  }}
                  size="small"
                >
                  <Icon icon="lucide:switch-camera" width={18} />
                </IconButton>
              </Tooltip>
            </>
          )}

          {/* Canvas oculto para procesar el snapshot */}
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </Box>

        {/* ── Controles de captura de foto ── */}
        <Box mb={2} textAlign="center">
          {!photoData ? (
            <Button
              variant="contained"
              onClick={handleCapture}
              disabled={Boolean(cameraError)}
              startIcon={<Icon icon="lucide:camera" />}
              sx={{
                bgcolor: stepInfo?.color || '#2563eb',
                '&:hover': { bgcolor: stepInfo?.color || '#1d4ed8', filter: 'brightness(0.92)' },
                borderRadius: 3,
                px: 4,
                py: 1,
                fontWeight: 700,
                textTransform: 'none',
              }}
            >
              Tomar Foto
            </Button>
          ) : (
            <Button
              variant="outlined"
              size="small"
              onClick={handleRetake}
              startIcon={<Icon icon="lucide:rotate-ccw" />}
              sx={{ borderRadius: 2, textTransform: 'none', borderColor: '#cbd5e1', color: '#475569' }}
            >
              Volver a tomar foto
            </Button>
          )}
        </Box>

        {/* ── Estado del GPS / Geolocalización ── */}
        <Box
          sx={{
            p: 1.5,
            borderRadius: 2,
            bgcolor: geoState.error ? '#fef2f2' : isLocationReady ? '#f0fdf4' : '#f8fafc',
            border: '1px solid',
            borderColor: geoState.error ? '#fecaca' : isLocationReady ? '#bbf7d0' : '#e2e8f0',
          }}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={1}>
              <Icon
                icon={geoState.error ? 'lucide:map-pin-off' : 'lucide:map-pin'}
                width={18}
                color={geoState.error ? '#ef4444' : isLocationReady ? '#16a34a' : '#64748b'}
              />
              <Box>
                <Typography
                  variant="caption"
                  fontWeight={700}
                  color={geoState.error ? '#b91c1c' : isLocationReady ? '#15803d' : '#475569'}
                  display="block"
                >
                  {geoState.loading
                    ? 'Detectando ubicación GPS...'
                    : isLocationReady
                    ? 'Ubicación GPS registrada'
                    : 'GPS no disponible'}
                </Typography>
                {isLocationReady && (
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                    Lat: {geoState.latitude.toFixed(5)}, Lng: {geoState.longitude.toFixed(5)}
                    {geoState.accuracy ? ` (±${Math.round(geoState.accuracy)}m)` : ''}
                  </Typography>
                )}
                {geoState.error && (
                  <Typography variant="caption" color="error.main" sx={{ fontSize: '0.7rem', display: 'block' }}>
                    {geoState.error}
                  </Typography>
                )}
              </Box>
            </Stack>

            {geoState.loading ? (
              <CircularProgress size={16} />
            ) : (
              <Tooltip title="Actualizar ubicación GPS">
                <IconButton size="small" onClick={fetchLocation}>
                  <Icon icon="lucide:refresh-cw" width={14} />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        </Box>

        {/* Si es Salida: Campo de Justificación de Horas Extra */}
        {stepInfo?.key === 'exit' && (
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Justificación de horas extra (Si aplica)"
              placeholder="Si finalizaste por fuera de tu jornada laboral habitual, explica el motivo aquí..."
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              size="small"
              helperText="Obligatorio si se generaron horas extra al finalizar labores."
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        )}

        {!photoData && (
          <Alert severity="warning" sx={{ mt: 2, py: 0.5, borderRadius: 2, fontSize: '0.75rem' }}>
            Debes tomar tu foto en vivo con la cámara para confirmar la marcación.
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2.5, pt: 1.5, borderTop: '1px solid #f1f5f9' }}>
        <Button onClick={onClose} disabled={loading} sx={{ textTransform: 'none', color: '#64748b' }}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleConfirm}
          disabled={!photoData || loading}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <Icon icon="lucide:check-circle" />}
          sx={{
            bgcolor: stepInfo?.color || '#2563eb',
            '&:hover': { bgcolor: stepInfo?.color || '#1d4ed8', filter: 'brightness(0.9)' },
            borderRadius: 2,
            px: 3,
            fontWeight: 700,
            textTransform: 'none',
          }}
        >
          {loading ? 'Guardando...' : `Confirmar ${stepInfo?.label || 'Marcación'}`}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
