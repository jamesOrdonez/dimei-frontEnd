import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Box, Typography, Button, Paper, Stack, Grid, TextField,
  CircularProgress, Chip, MenuItem, Select, FormControl,
  InputLabel, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, Tooltip, Dialog,
  DialogTitle, DialogContent, DialogActions, Avatar,
} from '@mui/material';
import { Icon } from '@iconify/react';
import * as XLSX from 'xlsx';
import { exportStyledExcel } from '../../../utils/exportExcel';

// ─── Utilidades ──────────────────────────────────────────────────────────────

function getFullImageUrl(url) {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  const base = (axios.defaults.baseURL || '').replace(/\/api\/v1\/?$/, '');
  return `${base}${url}`;
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('es-CO', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  });
}

function formatTime(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

const MARKING_CONFIG = {
  entry: { label: 'Entrada', color: '#10b981', bgcolor: '#ecfdf5', icon: 'lucide:log-in' },
  lunch_start: { label: 'Salida Almuerzo', color: '#f59e0b', bgcolor: '#fffbeb', icon: 'lucide:coffee' },
  lunch_end: { label: 'Regreso Almuerzo', color: '#3b82f6', bgcolor: '#eff6ff', icon: 'lucide:utensils' },
  exit: { label: 'Salida', color: '#ef4444', bgcolor: '#fef2f2', icon: 'lucide:log-out' },
};

// ─── Utilidad para fecha local YYYY-MM-DD ──────────────────────────────────
function formatLocalDate(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function ReporteUbicacion() {
  const company = sessionStorage.getItem('company');

  // Rango de fechas por defecto: últimos 30 días para no recortar registros recientes
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return formatLocalDate(d);
  });
  const [endDate, setEndDate] = useState(() => formatLocalDate(new Date()));

  const [selectedUser, setSelectedUser] = useState('all');
  const [selectedRol, setSelectedRol] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedJornada, setSelectedJornada] = useState('all');

  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);

  // Estado para zoom de foto
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  // Cargar catálogos de usuarios y roles
  useEffect(() => {
    if (!company) return;
    axios.get(`/getUser/${company}`)
      .then((res) => setUsers(res.data.data || res.data || []))
      .catch((err) => console.warn('Error cargando usuarios:', err));

    axios.get(`/getRoles/${company}`)
      .then((res) => setRoles(res.data.data || res.data || []))
      .catch((err) => console.warn('Error cargando roles:', err));
  }, [company]);

  // Cargar registros de ubicación
  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const params = {};
      if (company) params.company = company;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (selectedUser !== 'all') params.userId = selectedUser;
      if (selectedRol !== 'all') params.rolId = selectedRol;
      if (selectedType !== 'all') params.markingType = selectedType;

      const res = await axios.get('/locationReport', { params });
      setLogs(res.data.data || []);
    } catch (err) {
      console.error('Error cargando reporte de ubicación:', err);
      setFetchError(err.response?.data?.message || 'Ocurrió un error al consultar las marcaciones de ubicación.');
    } finally {
      setLoading(false);
    }
  }, [company, startDate, endDate, selectedUser, selectedRol, selectedType]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Filtrado de logs (incluyendo filtro local por jornada ordinaria vs horas extra)
  const filteredLogs = logs.filter((l) => {
    if (selectedJornada === 'extra') return l.hasOvertime;
    if (selectedJornada === 'regular') return !l.hasOvertime;
    return true;
  });

  // Exportar a Excel
  const handleExportExcel = () => {
    if (filteredLogs.length === 0) return;
    const rows = filteredLogs.map((l) => ({
      ID: l.id,
      Empleado: l.userName,
      Rol: l.rolName,
      'Tipo de Marcación': MARKING_CONFIG[l.markingType]?.label || l.markingType,
      Jornada: l.hasOvertime ? 'Horas Extra' : 'Jornada Ordinaria',
      Fecha: formatDate(l.timestamp),
      Hora: formatTime(l.timestamp),
      Latitud: l.latitude || 'Sin GPS',
      Longitud: l.longitude || 'Sin GPS',
      'Precisión (m)': l.accuracy ? Math.round(l.accuracy) : '',
      'Link Google Maps': l.latitude && l.longitude ? `https://www.google.com/maps?q=${l.latitude},${l.longitude}` : 'N/A',
      'URL Foto': l.photoUrl ? getFullImageUrl(l.photoUrl) : 'Sin foto',
      Justificación: l.justification || 'N/A',
    }));

    const headers = [
      'ID',
      'Empleado',
      'Rol',
      'Tipo de Marcación',
      'Jornada',
      'Fecha',
      'Hora',
      'Latitud',
      'Longitud',
      'Precisión (m)',
      'Link Google Maps',
      'URL Foto',
      'Justificación',
    ];

    exportStyledExcel({
      filename: `reporte_ubicacion_marcaciones_${startDate}_al_${endDate}.xlsx`,
      sheetName: 'Auditoría Marcaciones',
      headers,
      data: rows,
      isOvertimeRow: (row) => row.Jornada === 'Horas Extra',
      isOvertimeCell: (colName, val) => colName === 'Jornada' && val === 'Horas Extra',
    });
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* ── Banner Informativo ── */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 2.5,
          borderRadius: 2.5,
          bgcolor: '#f0fdf4',
          border: '1px solid #bbf7d0',
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
        }}
      >
        <Box sx={{ p: 1, bgcolor: '#dcfce7', borderRadius: 2, color: '#16a34a', display: 'flex' }}>
          <Icon icon="lucide:shield-check" width={22} />
        </Box>
        <Box>
          <Typography variant="body2" fontWeight={700} color="#166534">
            Auditoría Integral de Marcaciones (Fotos y Ubicación GPS)
          </Typography>
          <Typography variant="caption" color="#15803d">
            Este reporte registra y muestra la fotografía en vivo y la ubicación geográfica de todas las marcaciones del personal (Entrada, Almuerzo y Salida), tanto en jornada ordinaria como cuando se generan horas extra.
          </Typography>
        </Box>
      </Paper>

      {/* ── Barra de Filtros ── */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          mb: 3,
          borderRadius: 3,
          border: '1px solid #e2e8f0',
          bgcolor: 'white',
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="Desde"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="Hasta"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Empleado</InputLabel>
              <Select
                value={selectedUser}
                label="Empleado"
                onChange={(e) => setSelectedUser(e.target.value)}
              >
                <MenuItem value="all">Todos los empleados</MenuItem>
                {users.map((u) => (
                  <MenuItem key={u.id} value={u.id}>{u.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={1.5}>
            <FormControl fullWidth size="small">
              <InputLabel>Rol</InputLabel>
              <Select
                value={selectedRol}
                label="Rol"
                onChange={(e) => setSelectedRol(e.target.value)}
              >
                <MenuItem value="all">Todos los roles</MenuItem>
                {roles.map((r) => (
                  <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={1.5}>
            <FormControl fullWidth size="small">
              <InputLabel>Marcación</InputLabel>
              <Select
                value={selectedType}
                label="Marcación"
                onChange={(e) => setSelectedType(e.target.value)}
              >
                <MenuItem value="all">Todas</MenuItem>
                <MenuItem value="entry">Entrada</MenuItem>
                <MenuItem value="lunch_start">Salida Almuerzo</MenuItem>
                <MenuItem value="lunch_end">Regreso Almuerzo</MenuItem>
                <MenuItem value="exit">Salida</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={1.5}>
            <FormControl fullWidth size="small">
              <InputLabel>Jornada</InputLabel>
              <Select
                value={selectedJornada}
                label="Jornada"
                onChange={(e) => setSelectedJornada(e.target.value)}
              >
                <MenuItem value="all">Todas</MenuItem>
                <MenuItem value="regular">Ordinaria</MenuItem>
                <MenuItem value="extra">Horas Extra</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={1.5} display="flex" justifyContent="flex-end" gap={1}>
            <Tooltip title="Actualizar">
              <Button
                variant="outlined"
                onClick={fetchLogs}
                disabled={loading}
                sx={{ minWidth: 42, px: 1, borderRadius: 2, borderColor: '#cbd5e1' }}
              >
                <Icon icon="lucide:refresh-cw" width={18} />
              </Button>
            </Tooltip>
            <Button
              variant="contained"
              color="success"
              onClick={handleExportExcel}
              disabled={filteredLogs.length === 0}
              startIcon={<Icon icon="lucide:file-spreadsheet" />}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, fontSize: '0.85rem' }}
            >
              Excel
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* ── Error Banner si hubo fallo ── */}
      {fetchError && (
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 3,
            borderRadius: 2.5,
            bgcolor: '#fef2f2',
            border: '1px solid #fecaca',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box display="flex" alignItems="center" gap={1.5}>
            <Icon icon="lucide:alert-circle" width={22} color="#ef4444" />
            <Typography variant="body2" color="#b91c1c" fontWeight={600}>
              {fetchError}
            </Typography>
          </Box>
          <Button size="small" variant="outlined" color="error" onClick={fetchLogs}>
            Reintentar
          </Button>
        </Paper>
      )}

      {/* ── Contador de registros encontrados ── */}
      {!loading && !fetchError && (
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5} px={0.5}>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            Total marcaciones encontradas: <Box component="span" color="primary.main" fontWeight={700}>{filteredLogs.length}</Box>
          </Typography>
        </Box>
      )}

      {/* ── Tabla de Marcaciones con Foto y GPS ── */}
      {loading ? (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress />
        </Box>
      ) : filteredLogs.length === 0 ? (
        <Paper elevation={0} sx={{ p: 6, textAlign: 'center', borderRadius: 3, border: '1px solid #e2e8f0' }}>
          <Icon icon="lucide:map-pin-off" width={48} style={{ color: '#94a3b8', marginBottom: 12 }} />
          <Typography variant="h6" color="text.secondary" fontWeight={600}>
            No se encontraron registros de marcación
          </Typography>
          <Typography variant="body2" color="text.disabled">
            Ajusta los filtros de fecha, empleados o jornada para consultar las fotos y ubicaciones capturadas.
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3 }}>
          <Table size="small">
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#475569', py: 1.5 }}>EMPLEADO</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#475569', py: 1.5 }}>FECHA Y HORA</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#475569', py: 1.5 }}>MARCACIÓN</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#475569', py: 1.5 }}>JORNADA</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#475569', py: 1.5 }}>FOTO</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#475569', py: 1.5 }}>UBICACIÓN GPS</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#475569', py: 1.5 }}>MAPA</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredLogs.map((row) => {
                const config = MARKING_CONFIG[row.markingType] || {
                  label: row.markingType,
                  color: '#64748b',
                  bgcolor: '#f1f5f9',
                  icon: 'lucide:clock',
                };
                const hasLocation = Boolean(row.latitude && row.longitude);
                const fullPhotoUrl = getFullImageUrl(row.photoUrl);

                return (
                  <TableRow key={row.id} hover>
                    {/* Empleado */}
                    <TableCell>
                      <Typography variant="body2" fontWeight={700} color="#1e293b">
                        {row.userName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {row.rolName}
                      </Typography>
                    </TableCell>

                    {/* Fecha y Hora */}
                    <TableCell>
                      <Typography variant="body2" fontWeight={600} color="#1e293b">
                        {formatDate(row.timestamp)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                        {formatTime(row.timestamp)}
                      </Typography>
                    </TableCell>

                    {/* Tipo de Marcación */}
                    <TableCell>
                      <Chip
                        icon={<Icon icon={config.icon} width={14} color={config.color} />}
                        label={config.label}
                        size="small"
                        sx={{
                          bgcolor: config.bgcolor,
                          color: config.color,
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          height: 24,
                        }}
                      />
                    </TableCell>

                    {/* Jornada (Ordinaria vs Horas Extra) */}
                    <TableCell>
                      {row.hasOvertime ? (
                        <Box>
                          <Chip
                            icon={<Icon icon="lucide:clock-alert" width={13} color="#b45309" />}
                            label="Horas Extra"
                            size="small"
                            sx={{
                              bgcolor: '#fef3c7',
                              color: '#b45309',
                              fontWeight: 700,
                              fontSize: '0.72rem',
                              height: 22,
                            }}
                          />
                          {row.justification && (
                            <Tooltip title={`Justificación: ${row.justification}`} arrow placement="top">
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                  display: 'block',
                                  mt: 0.5,
                                  fontStyle: 'italic',
                                  maxWidth: 160,
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}
                              >
                                "{row.justification}"
                              </Typography>
                            </Tooltip>
                          )}
                        </Box>
                      ) : (
                        <Chip
                          icon={<Icon icon="lucide:check-circle" width={13} color="#059669" />}
                          label="Ordinaria"
                          size="small"
                          sx={{
                            bgcolor: '#ecfdf5',
                            color: '#059669',
                            fontWeight: 600,
                            fontSize: '0.72rem',
                            height: 22,
                          }}
                        />
                      )}
                    </TableCell>

                    {/* Foto */}
                    <TableCell align="center">
                      {fullPhotoUrl ? (
                        <Tooltip title="Clic para ampliar foto">
                          <Avatar
                            src={fullPhotoUrl}
                            variant="rounded"
                            onClick={() => setSelectedPhoto(row)}
                            sx={{
                              width: 44,
                              height: 44,
                              mx: 'auto',
                              cursor: 'pointer',
                              border: '2px solid #e2e8f0',
                              transition: 'transform 0.15s',
                              '&:hover': { transform: 'scale(1.1)', borderColor: '#3b82f6' },
                            }}
                          />
                        </Tooltip>
                      ) : (
                        <Typography variant="caption" color="text.disabled">—</Typography>
                      )}
                    </TableCell>

                    {/* Coordenadas */}
                    <TableCell>
                      {hasLocation ? (
                        <Box>
                          <Typography variant="body2" fontWeight={600} sx={{ fontVariantNumeric: 'tabular-nums', fontSize: '0.8rem' }}>
                            {Number(row.latitude).toFixed(5)}, {Number(row.longitude).toFixed(5)}
                          </Typography>
                          {row.accuracy && (
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                              Margen de error: ±{Math.round(row.accuracy)} m
                            </Typography>
                          )}
                        </Box>
                      ) : (
                        <Typography variant="caption" color="text.disabled">Sin coordenadas</Typography>
                      )}
                    </TableCell>

                    {/* Botón Mapa */}
                    <TableCell align="center">
                      {hasLocation ? (
                        <Button
                          variant="outlined"
                          size="small"
                          href={`https://www.google.com/maps?q=${row.latitude},${row.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          startIcon={<Icon icon="lucide:map-pin" />}
                          sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            py: 0.5,
                            px: 1.5,
                            color: '#2563eb',
                            borderColor: '#bfdbfe',
                            bgcolor: '#eff6ff',
                            '&:hover': { bgcolor: '#dbeafe', borderColor: '#3b82f6' },
                          }}
                        >
                          Ver en Maps
                        </Button>
                      ) : (
                        <Typography variant="caption" color="text.disabled">—</Typography>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* ── Modal de Visualización de Foto en Alta Resolución ── */}
      <Dialog
        open={Boolean(selectedPhoto)}
        onClose={() => setSelectedPhoto(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}
      >
        {selectedPhoto && (
          <>
            <DialogTitle sx={{ py: 2, px: 3, borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="subtitle1" fontWeight={800}>
                  Foto de {MARKING_CONFIG[selectedPhoto.markingType]?.label || selectedPhoto.markingType}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {selectedPhoto.userName} · {formatDate(selectedPhoto.timestamp)} {formatTime(selectedPhoto.timestamp)}
                </Typography>
              </Box>
              <IconButton size="small" onClick={() => setSelectedPhoto(null)}>
                <Icon icon="lucide:x" width={18} />
              </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 2, textAlign: 'center', bgcolor: '#0f172a' }}>
              <Box
                component="img"
                src={getFullImageUrl(selectedPhoto.photoUrl)}
                alt="Foto marcación"
                sx={{
                  maxHeight: 480,
                  width: 'auto',
                  maxWidth: '100%',
                  borderRadius: 2,
                  mx: 'auto',
                  objectFit: 'contain',
                }}
              />
            </DialogContent>

            <DialogActions sx={{ p: 2, px: 3, borderTop: '1px solid #e2e8f0', justifyContent: 'space-between' }}>
              {selectedPhoto.latitude && selectedPhoto.longitude ? (
                <Button
                  variant="outlined"
                  size="small"
                  href={`https://www.google.com/maps?q=${selectedPhoto.latitude},${selectedPhoto.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  startIcon={<Icon icon="lucide:external-link" />}
                  sx={{ borderRadius: 2, textTransform: 'none' }}
                >
                  Abrir en Google Maps
                </Button>
              ) : (
                <Box />
              )}
              <Button onClick={() => setSelectedPhoto(null)} sx={{ textTransform: 'none', fontWeight: 600 }}>
                Cerrar
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}
