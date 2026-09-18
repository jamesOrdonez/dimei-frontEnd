import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Box, Typography, Button, Paper, Stack, Grid, TextField,
  CircularProgress, Chip, MenuItem, Select, FormControl,
  InputLabel, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Tooltip, Switch, FormControlLabel,
  Menu, ListItemIcon, ListItemText, Divider,
} from '@mui/material';
import { Icon } from '@iconify/react';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import { pdf } from '@react-pdf/renderer';
import { exportStyledExcel } from '../../../utils/exportExcel';
import ReporteRetardosPDF from './ReporteRetardosPDF';

// ─── Utilidades ──────────────────────────────────────────────────────────────

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('es-CO', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  });
}

function formatTime(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
}

function formatMinutes(mins) {
  if (!mins || mins <= 0) return '0 min';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m} min`;
}

const CELL_HEADER = {
  fontWeight: 700,
  fontSize: '0.75rem',
  color: '#475569',
  bgcolor: '#f8fafc',
  whiteSpace: 'nowrap',
  py: 1.5,
  px: 2,
};

export default function ReporteRetardos() {
  const company = sessionStorage.getItem('company');

  // Rango de fechas por defecto: últimos 30 días
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  });

  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  });

  const [selectedUser, setSelectedUser] = useState('all');
  const [selectedRol, setSelectedRol] = useState('all');
  const [onlyTardiness, setOnlyTardiness] = useState(true);

  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);

  const [exportAnchorEl, setExportAnchorEl] = useState(null);
  const openExportMenu = Boolean(exportAnchorEl);

  const handleOpenExportMenu = (event) => {
    setExportAnchorEl(event.currentTarget);
  };
  const handleCloseExportMenu = () => {
    setExportAnchorEl(null);
  };
  const handleExportPDF = async () => {
    if (displayRows.length === 0) return;
    try {
      const blob = await pdf(
        <ReporteRetardosPDF
          rows={displayRows}
          startDate={startDate}
          endDate={endDate}
          companyName={sessionStorage.getItem('companyName') || 'DIMEI'}
        />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `reporte_retardos_${startDate}_al_${endDate}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error generando PDF de Retardos:', err);
      Swal.fire('Error', 'No se pudo generar el documento PDF.', 'error');
    }
  };

  const handleSelectExport = (format) => {
    handleCloseExportMenu();
    if (format === 'excel') {
      handleExportExcel();
    } else if (format === 'pdf') {
      handleExportPDF();
    }
  };

  // Cargar catálogo de usuarios y roles
  useEffect(() => {
    if (!company) return;
    axios.get(`/getUser/${company}`)
      .then((res) => setUsers(res.data.data || res.data || []))
      .catch((err) => console.warn('Error cargando usuarios:', err));

    axios.get(`/getRoles/${company}`)
      .then((res) => {
        const filtered = (res.data.data || res.data || []).filter(r => r.name !== 'Administrador');
        setRoles(filtered);
      })
      .catch((err) => console.warn('Error cargando roles:', err));
  }, [company]);

  // Consultar registros de asistencia y retardos
  const fetchReport = useCallback(async () => {
    if (!company || !startDate || !endDate) return;
    setLoading(true);
    try {
      const params = {
        company,
        startDate,
        endDate,
      };
      if (selectedUser !== 'all') params.userId = selectedUser;
      if (selectedRol !== 'all') params.rolId = selectedRol;
      if (onlyTardiness) params.onlyTardiness = 'true';

      const res = await axios.get('/overtimeReport', { params });
      setRows(res.data.data || []);
    } catch (err) {
      console.error('Error cargando reporte de retardos:', err);
      Swal.fire('Error', err.response?.data?.message || 'No se pudo cargar el reporte de retardos.', 'error');
    } finally {
      setLoading(false);
    }
  }, [company, startDate, endDate, selectedUser, selectedRol, onlyTardiness]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  // KPIs de resumen: Solo se contabilizan retardos a partir de 10 minutos
  const retardosValidos = rows.filter((r) => (r.minutosRetardo || 0) >= 10);
  const totalMinutosRetardo = retardosValidos.reduce((acc, r) => acc + (r.minutosRetardo || 0), 0);
  const totalCasosRetardo = retardosValidos.length;
  const promedioRetardo = totalCasosRetardo > 0 ? Math.round(totalMinutosRetardo / totalCasosRetardo) : 0;

  // Filas a mostrar según switch
  const displayRows = rows.filter((r) => !onlyTardiness || (r.minutosRetardo || 0) >= 10);

  // Exportar a Excel
  const handleExportExcel = () => {
    if (displayRows.length === 0) return;
    const exportData = displayRows.map((r) => {
      const delay = r.minutosRetardo || 0;
      const isLate = delay >= 10;
      return {
        Empleado: r.userName,
        Rol: r.rolName,
        Fecha: r.date,
        'Horario Oficial Entrada': r.scheduledEntryTime ? r.scheduledEntryTime.substring(0, 5) : 'Sin horario',
        'Entrada Real Marcada': r.entryTime ? formatTime(r.entryTime) : 'Sin marcar',
        'Minutos de Retardo': isLate ? delay : 0,
        'Tiempo Retardo': isLate ? `+${delay} min` : 'A tiempo (<10m)',
        Estado: isLate ? 'Con Retardo' : (r.entryTime ? 'Puntual' : 'Sin Entrada'),
      };
    });

    const headers = [
      'Empleado',
      'Rol',
      'Fecha',
      'Horario Oficial Entrada',
      'Entrada Real Marcada',
      'Minutos de Retardo',
      'Tiempo Retardo',
      'Estado',
    ];

    exportStyledExcel({
      filename: `reporte_retardos_${startDate}_al_${endDate}.xlsx`,
      sheetName: 'Reporte Retardos',
      headers,
      data: exportData,
      isOvertimeRow: () => false,
      isOvertimeCell: (colName, val) => colName === 'Estado' && val === 'Puntual',
    });
  };

  return (
    <Box
      sx={{
        width: '100%',
        '@media print': {
          '& header, & nav, & aside, & .MuiDrawer-root, & .no-print': {
            display: 'none !important',
          },
        },
      }}
    >
      {/* ── Encabezado informativo ── */}
      <Box mb={2.5}>
        <Typography variant="h6" fontWeight={700} color="text.primary">
          Reporte de Retardos
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={0.5}>
          Auditoría de impuntualidad y comparación contra el horario oficial de entrada establecido para cada rol.
        </Typography>
      </Box>

      {/* ── KPIs Resumen ── */}
      <Stack direction="row" spacing={2} flexWrap="wrap" gap={1.5} mb={3}>
        <Paper
          elevation={0}
          sx={{
            px: 2.5, py: 1.8,
            border: '1px solid #fecaca',
            borderRadius: 2.5,
            bgcolor: '#fff5f5',
            minWidth: 150,
          }}
        >
          <Typography variant="h5" fontWeight={800} sx={{ color: '#dc2626' }}>
            {formatMinutes(totalMinutosRetardo)}
          </Typography>
          <Typography variant="caption" color="#991b1b" fontWeight={600}>
            Tiempo Total en Retardos
          </Typography>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            px: 2.5, py: 1.8,
            border: '1px solid #fed7aa',
            borderRadius: 2.5,
            bgcolor: '#fffaf5',
            minWidth: 150,
          }}
        >
          <Typography variant="h5" fontWeight={800} sx={{ color: '#c2410c' }}>
            {totalCasosRetardo}
          </Typography>
          <Typography variant="caption" color="#9a3412" fontWeight={600}>
            Llegadas Tarde Registradas
          </Typography>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            px: 2.5, py: 1.8,
            border: '1px solid #e2e8f0',
            borderRadius: 2.5,
            bgcolor: '#ffffff',
            minWidth: 150,
          }}
        >
          <Typography variant="h5" fontWeight={800} sx={{ color: '#475569' }}>
            {promedioRetardo} min
          </Typography>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            Promedio por Llegada Tarde
          </Typography>
        </Paper>
      </Stack>

      {/* ── Barra de Filtros ── */}
      <Paper
        elevation={0}
        className="no-print"
        sx={{
          p: 2.5,
          mb: 3,
          borderRadius: 3,
          border: '1px solid #e2e8f0',
          bgcolor: 'white',
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={2.5}>
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
          <Grid item xs={12} sm={6} md={2.5}>
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
          <Grid item xs={12} sm={6} md={2}>
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
          <Grid item xs={12} sm={6} md={3} display="flex" alignItems="center" justifyContent="flex-end" gap={1}>
            <FormControlLabel
              control={
                <Switch
                  checked={onlyTardiness}
                  onChange={(e) => setOnlyTardiness(e.target.checked)}
                  size="small"
                  color="error"
                />
              }
              label={<Typography variant="caption" fontWeight={600}>Solo retardos (≥ 10 min)</Typography>}
              sx={{ mr: 1 }}
            />
            <Tooltip title="Actualizar">
              <Button
                variant="outlined"
                onClick={fetchReport}
                disabled={loading}
                sx={{ minWidth: 42, px: 1, borderRadius: 2, borderColor: '#cbd5e1' }}
              >
                <Icon icon="lucide:refresh-cw" width={18} />
              </Button>
            </Tooltip>
            <Button
              variant="contained"
              color="primary"
              onClick={handleOpenExportMenu}
              disabled={displayRows.length === 0}
              startIcon={<Icon icon="lucide:download" />}
              endIcon={<Icon icon="lucide:chevron-down" />}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.85rem',
                boxShadow: '0 2px 6px 0 rgba(37, 99, 235, 0.25)',
              }}
            >
              Exportar
            </Button>
            <Menu
              anchorEl={exportAnchorEl}
              open={openExportMenu}
              onClose={handleCloseExportMenu}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              PaperProps={{
                sx: {
                  mt: 1,
                  borderRadius: 2.5,
                  minWidth: 220,
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                  border: '1px solid #e2e8f0',
                  p: 0.5,
                },
              }}
            >
              <MenuItem
                onClick={() => handleSelectExport('excel')}
                sx={{ py: 1.2, px: 2, borderRadius: 1.5, '&:hover': { bgcolor: '#f0fdf4' } }}
              >
                <ListItemIcon sx={{ color: '#16a34a', minWidth: 34 }}>
                  <Icon icon="lucide:file-spreadsheet" width={22} />
                </ListItemIcon>
                <ListItemText
                  primary={<Typography variant="body2" fontWeight={700} color="#15803d">Excel (.xlsx)</Typography>}
                  secondary={<Typography variant="caption" color="text.secondary">Descargar reporte detallado</Typography>}
                />
              </MenuItem>
              <Divider sx={{ my: 0.5 }} />
              <MenuItem
                onClick={() => handleSelectExport('pdf')}
                sx={{ py: 1.2, px: 2, borderRadius: 1.5, '&:hover': { bgcolor: '#fef2f2' } }}
              >
                <ListItemIcon sx={{ color: '#dc2626', minWidth: 34 }}>
                  <Icon icon="lucide:file-text" width={22} />
                </ListItemIcon>
                <ListItemText
                  primary={<Typography variant="body2" fontWeight={700} color="#b91c1c">PDF (.pdf)</Typography>}
                  secondary={<Typography variant="caption" color="text.secondary">Documento PDF oficial armado</Typography>}
                />
              </MenuItem>
            </Menu>
          </Grid>
        </Grid>
      </Paper>

      {/* ── Tabla de Retardos ── */}
      {loading ? (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress />
        </Box>
      ) : displayRows.length === 0 ? (
        <Paper elevation={0} sx={{ p: 6, textAlign: 'center', borderRadius: 3, border: '1px solid #e2e8f0' }}>
          <Icon icon="lucide:check-circle" width={48} style={{ color: '#10b981', marginBottom: 12 }} />
          <Typography variant="h6" color="text.secondary" fontWeight={600}>
            No se encontraron retardos (≥ 10 minutos) en el período seleccionado
          </Typography>
          <Typography variant="body2" color="text.disabled">
            Todos los empleados marcaron entrada puntual o con menos de 10 minutos de retraso.
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                {['Empleado', 'Rol', 'Fecha', 'Horario Entrada', 'Entrada Real', 'Retardo', 'Estado'].map((h) => (
                  <TableCell key={h} sx={CELL_HEADER}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {displayRows.map((row) => {
                const hasSchedule = Boolean(row.hasSchedule && row.scheduledEntryTime);
                const delay = row.minutosRetardo || 0;
                const isLate = delay >= 10;

                // Severidad del retardo (a partir de 10 minutos)
                let chipColor = '#059669';
                let chipBg = '#ecfdf5';
                let statusLabel = 'Puntual';

                if (delay > 30) {
                  chipColor = '#dc2626';
                  chipBg = '#fee2e2';
                  statusLabel = 'Retardo Severo';
                } else if (delay >= 20) {
                  chipColor = '#ea580c';
                  chipBg = '#ffedd5';
                  statusLabel = 'Retardo Moderado';
                } else if (delay >= 10) {
                  chipColor = '#d97706';
                  chipBg = '#fef3c7';
                  statusLabel = 'Retardo Leve';
                } else if (row.entryTime) {
                  statusLabel = 'Puntual (<10m)';
                }

                return (
                  <TableRow key={row.id} hover>
                    {/* Empleado */}
                    <TableCell>
                      <Typography variant="body2" fontWeight={700} color="#1e293b">
                        {row.userName}
                      </Typography>
                    </TableCell>

                    {/* Rol */}
                    <TableCell>
                      <Chip
                        label={row.rolName}
                        size="small"
                        sx={{ fontSize: '0.72rem', height: 22, bgcolor: '#f1f5f9', color: '#475569' }}
                      />
                    </TableCell>

                    {/* Fecha */}
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {formatDate(row.date)}
                      </Typography>
                    </TableCell>

                    {/* Horario Entrada Oficial */}
                    <TableCell>
                      {hasSchedule ? (
                        <Typography variant="body2" sx={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
                          {row.scheduledEntryTime.substring(0, 5)}
                        </Typography>
                      ) : (
                        <Chip
                          label="Sin horario"
                          size="small"
                          sx={{ fontSize: '0.68rem', height: 18, bgcolor: '#fef3c7', color: '#92400e' }}
                        />
                      )}
                    </TableCell>

                    {/* Entrada Real Marcada */}
                    <TableCell sx={{ fontVariantNumeric: 'tabular-nums', fontSize: '0.85rem' }}>
                      {row.entryTime ? formatTime(row.entryTime) : <Typography variant="caption" color="text.disabled">—</Typography>}
                    </TableCell>

                    {/* Minutos de Retardo */}
                    <TableCell>
                      {isLate ? (
                        <Tooltip title={`Llegó ${delay} minutos después de las ${row.scheduledEntryTime?.substring(0, 5)}`}>
                          <Chip
                            icon={<Icon icon="lucide:clock-alert" width={13} color={chipColor} />}
                            label={`+${delay} min`}
                            size="small"
                            sx={{
                              bgcolor: chipBg,
                              color: chipColor,
                              fontWeight: 700,
                              fontSize: '0.75rem',
                              height: 24,
                            }}
                          />
                        </Tooltip>
                      ) : row.entryTime && hasSchedule ? (
                        <Chip
                          icon={<Icon icon="lucide:check" width={13} color="#059669" />}
                          label="0 min"
                          size="small"
                          sx={{
                            bgcolor: '#ecfdf5',
                            color: '#059669',
                            fontWeight: 600,
                            fontSize: '0.72rem',
                            height: 22,
                          }}
                        />
                      ) : (
                        <Typography variant="caption" color="text.disabled">—</Typography>
                      )}
                    </TableCell>

                    {/* Estado / Severidad */}
                    <TableCell>
                      <Chip
                        label={statusLabel}
                        size="small"
                        sx={{
                          bgcolor: chipBg,
                          color: chipColor,
                          fontWeight: 700,
                          fontSize: '0.72rem',
                          height: 22,
                        }}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
