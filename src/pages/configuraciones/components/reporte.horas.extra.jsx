import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Box, Typography, Button, Paper, Stack, Grid, TextField,
  CircularProgress, Divider, Alert, Chip, MenuItem, Select,
  FormControl, InputLabel, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Tooltip,
  ToggleButton, ToggleButtonGroup, FormControlLabel, Switch,
  Menu, ListItemIcon, ListItemText,
} from '@mui/material';
import { Icon } from '@iconify/react';
import Swal from 'sweetalert2';
import { pdf } from '@react-pdf/renderer';
import { exportStyledExcel } from '../../../utils/exportExcel';
import ReporteHorasExtraPDF from './ReporteHorasExtraPDF';

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

const CELL_HEADER = {
  fontWeight: 700,
  fontSize: '0.75rem',
  color: '#475569',
  bgcolor: '#f8fafc',
  whiteSpace: 'nowrap',
  py: 1.5,
  px: 2,
};

const OT_CHIP_STYLES = {
  diurna: { bgcolor: '#fef9c3', color: '#854d0e', label: 'Diurna' },
  nocturna: { bgcolor: '#dbeafe', color: '#1e40af', label: 'Nocturna' },
  diurnaDF: { bgcolor: '#fce7f3', color: '#9d174d', label: 'Diurna D/F' },
  nocturnaDF: { bgcolor: '#ede9fe', color: '#6d28d9', label: 'Nocturna D/F' },
};

function OvertimeCell({ value, type }) {
  if (!value) return <Typography variant="body2" color="text.disabled" align="center">—</Typography>;
  const style = OT_CHIP_STYLES[type];
  return (
    <Chip
      label={`${value}h`}
      size="small"
      sx={{ bgcolor: style.bgcolor, color: style.color, fontWeight: 700, fontSize: '0.75rem' }}
    />
  );
}

// ─── Totales de resumen ───────────────────────────────────────────────────────

function ResumenTotales({ rows }) {
  const totales = rows.reduce((acc, r) => ({
    diurna: acc.diurna + (r.diurna || 0),
    nocturna: acc.nocturna + (r.nocturna || 0),
    diurnaDF: acc.diurnaDF + (r.diurnaDF || 0),
    nocturnaDF: acc.nocturnaDF + (r.nocturnaDF || 0),
    total: acc.total + (r.totalExtra || 0),
  }), { diurna: 0, nocturna: 0, diurnaDF: 0, nocturnaDF: 0, total: 0 });

  return (
    <Stack direction="row" spacing={2} flexWrap="wrap" gap={1} mb={2}>
      {[
        { label: 'H.E. Diurnas', value: `${totales.diurna}h`, ...OT_CHIP_STYLES.diurna },
        { label: 'H.E. Nocturnas', value: `${totales.nocturna}h`, ...OT_CHIP_STYLES.nocturna },
        { label: 'H.E. Diurnas D/F', value: `${totales.diurnaDF}h`, ...OT_CHIP_STYLES.diurnaDF },
        { label: 'H.E. Nocturnas D/F', value: `${totales.nocturnaDF}h`, ...OT_CHIP_STYLES.nocturnaDF },
      ].map((item) => (
        <Paper
          key={item.label}
          elevation={0}
          sx={{ px: 2.5, py: 1.5, border: '1px solid #e2e8f0', borderRadius: 2, textAlign: 'center', minWidth: 120 }}
        >
          <Typography variant="h5" fontWeight={800} sx={{ color: item.color }}>{item.value}</Typography>
          <Typography variant="caption" color="text.secondary">{item.label}</Typography>
        </Paper>
      ))}
      <Paper
        elevation={0}
        sx={{
          px: 2.5, py: 1.5,
          border: '1px solid #c7d2fe',
          borderRadius: 2, textAlign: 'center', minWidth: 120,
          bgcolor: '#eef2ff',
        }}
      >
        <Typography variant="h5" fontWeight={800} sx={{ color: '#3730a3' }}>{totales.total}h</Typography>
        <Typography variant="caption" color="text.secondary">Total H.E.</Typography>
      </Paper>
    </Stack>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function ReporteHorasExtra() {
  const company = sessionStorage.getItem('company');

  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'rol' | 'user'
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedRol, setSelectedRol] = useState('');
  const [onlyOvertime, setOnlyOvertime] = useState(false);
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
  });
  const [endDate, setEndDate] = useState(() => new Date().toLocaleDateString('en-CA'));
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [exportAnchorEl, setExportAnchorEl] = useState(null);
  const openExportMenu = Boolean(exportAnchorEl);

  const handleOpenExportMenu = (event) => {
    setExportAnchorEl(event.currentTarget);
  };
  const handleCloseExportMenu = () => {
    setExportAnchorEl(null);
  };
  const handleSelectExport = (format) => {
    handleCloseExportMenu();
    if (format === 'excel') {
      handleExportExcel();
    } else if (format === 'pdf') {
      handleExportPDF();
    }
  };

  // Cargar usuarios y roles al montar
  useEffect(() => {
    const fetch = async () => {
      try {
        const [usersRes, rolesRes] = await Promise.all([
          axios.get(`/getUser/${company}`),
          axios.get(`/getRoles/${company}`),
        ]);
        const filteredRoles = (rolesRes.data.data || []).filter(r => r.name !== 'Administrador');
        setUsers(usersRes.data.data || []);
        setRoles(filteredRoles);
      } catch (err) {
        console.error('Error cargando datos:', err);
      }
    };
    if (company) fetch();
  }, [company]);

  const handleSearch = useCallback(async () => {
    if (!startDate || !endDate) {
      Swal.fire('Fechas requeridas', 'Por favor seleccione un rango de fechas.', 'warning');
      return;
    }

    setLoading(true);
    setSearched(true);
    try {
      const params = { company, startDate, endDate };
      if (filterMode === 'user' && selectedUser) params.userId = selectedUser;
      if (filterMode === 'rol' && selectedRol) params.rolId = selectedRol;
      if (onlyOvertime) params.onlyOvertime = 'true';

      const res = await axios.get('/overtimeReport', { params });
      setRows(res.data.data || []);
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || 'No se pudo generar el reporte.', 'error');
    } finally {
      setLoading(false);
    }
  }, [company, startDate, endDate, filterMode, selectedUser, selectedRol, onlyOvertime]);

  // Búsqueda inicial automática
  useEffect(() => {
    if (company) {
      handleSearch();
    }
  }, [company, handleSearch]);

  const handleExportPDF = async () => {
    if (rows.length === 0) return;
    try {
      const blob = await pdf(
        <ReporteHorasExtraPDF
          rows={rows}
          startDate={startDate}
          endDate={endDate}
          companyName={sessionStorage.getItem('companyName') || 'DIMEI'}
        />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `reporte_horas_extra_${startDate}_al_${endDate}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error generando PDF de Horas Extra:', err);
      Swal.fire('Error', 'No se pudo generar el documento PDF.', 'error');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    if (rows.length === 0) return;
    const exportData = rows.map((row) => ({
      Empleado: row.userName,
      Rol: row.rolName,
      Fecha: formatDate(row.date),
      'Tipo de Día': row.isHoliday ? (row.holidayName || 'Festivo') : row.esDominical ? 'Domingo' : row.esSabado ? 'Sábado' : 'Ordinario',
      Entrada: formatTime(row.entryTime),
      Almuerzo: row.lunchStart && row.lunchEnd ? `${formatTime(row.lunchStart)} - ${formatTime(row.lunchEnd)}` : '—',
      Salida: row.isPendingExit ? 'En curso' : formatTime(row.exitTime),
      'T. Laborado': row.minutosNeto > 0 ? `${Math.floor(row.minutosNeto / 60)}h ${row.minutosNeto % 60}m` : '—',
      'H.E. Diurna': row.diurna || 0,
      'H.E. Nocturna': row.nocturna || 0,
      'H.E. Diurna D/F': row.diurnaDF || 0,
      'H.E. Nocturna D/F': row.nocturnaDF || 0,
      'Total H.E.': row.totalExtra || 0,
      Justificación: row.overtimeJustification || '—',
    }));

    const headers = [
      'Empleado',
      'Rol',
      'Fecha',
      'Tipo de Día',
      'Entrada',
      'Almuerzo',
      'Salida',
      'T. Laborado',
      'H.E. Diurna',
      'H.E. Nocturna',
      'H.E. Diurna D/F',
      'H.E. Nocturna D/F',
      'Total H.E.',
      'Justificación',
    ];

    exportStyledExcel({
      filename: `reporte_horas_extra_${startDate}_al_${endDate}.xlsx`,
      sheetName: 'Horas Extra',
      headers,
      data: exportData,
      isOvertimeRow: (r) => Number(r['Total H.E.'] || 0) > 0,
      isOvertimeCell: (colName, val) =>
        ['H.E. Diurna', 'H.E. Nocturna', 'H.E. Diurna D/F', 'H.E. Nocturna D/F', 'Total H.E.'].includes(colName) && Number(val) > 0,
    });
  };

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: '100%',
        overflowX: 'hidden',
        '@media print': {
          '& header, & nav, & aside, & .MuiDrawer-root, & .no-print': {
            display: 'none !important',
          },
        },
      }}
    >
      {/* Header */}
      <Box mb={3}>
        <Typography variant="h6" fontWeight={700} color="text.primary">
          Reporte de Horas Extra
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={0.5}>
          Consulta y exporta los registros de marcación y horas extra por empleado, rol o todo el personal.
        </Typography>
      </Box>

      {/* Filtros */}
      <Paper elevation={0} className="no-print" sx={{ p: 3, border: '1px solid #e2e8f0', borderRadius: 3, mb: 3 }}>
        <Typography variant="subtitle2" fontWeight={700} mb={2} color="text.secondary" textTransform="uppercase" letterSpacing={0.5}>
          Filtros
        </Typography>

        <Grid container spacing={2} alignItems="center">
          {/* Modo de filtro */}
          <Grid item xs={12} md={4}>
            <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>Filtrar por</Typography>
            <ToggleButtonGroup
              value={filterMode}
              exclusive
              onChange={(_, val) => { if (val) { setFilterMode(val); setSelectedUser(''); setSelectedRol(''); } }}
              size="small"
              fullWidth
            >
              <ToggleButton value="all" sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.8rem' }}>
                Todo el personal
              </ToggleButton>
              <ToggleButton value="rol" sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.8rem' }}>
                Por rol
              </ToggleButton>
              <ToggleButton value="user" sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.8rem' }}>
                Por usuario
              </ToggleButton>
            </ToggleButtonGroup>
          </Grid>

          {/* Selector condicional */}
          <Grid item xs={12} md={3}>
            {filterMode === 'rol' && (
              <FormControl fullWidth size="small">
                <InputLabel>Rol</InputLabel>
                <Select
                  value={selectedRol}
                  label="Rol"
                  onChange={(e) => setSelectedRol(e.target.value)}
                >
                  {roles.map((r) => (
                    <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            {filterMode === 'user' && (
              <FormControl fullWidth size="small">
                <InputLabel>Usuario</InputLabel>
                <Select
                  value={selectedUser}
                  label="Usuario"
                  onChange={(e) => setSelectedUser(e.target.value)}
                >
                  {users.map((u) => (
                    <MenuItem key={u.id} value={u.id}>{u.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Grid>

          {/* Rango de fechas */}
          <Grid item xs={6} md={2}>
            <TextField
              fullWidth
              size="small"
              label="Desde"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={6} md={2}>
            <TextField
              fullWidth
              size="small"
              label="Hasta"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          {/* Botón buscar */}
          <Grid item xs={12} md={1}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleSearch}
              disabled={loading}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, height: 40 }}
            >
              {loading ? <CircularProgress size={18} color="inherit" /> : <Icon icon="lucide:search" width={18} />}
            </Button>
          </Grid>

          {/* Toggle solo con horas extra */}
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={onlyOvertime}
                  onChange={(e) => setOnlyOvertime(e.target.checked)}
                  size="small"
                  color="primary"
                />
              }
              label={
                <Typography variant="body2" color="text.secondary">
                  Mostrar únicamente registros con horas extra generadas
                </Typography>
              }
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Resultados */}
      {searched && (
        <>
          {loading ? (
            <Box display="flex" justifyContent="center" py={6}>
              <CircularProgress />
            </Box>
          ) : rows.length === 0 ? (
            <Paper
              elevation={0}
              sx={{
                border: '1.5px dashed #e2e8f0', borderRadius: 3, p: 5,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, color: 'text.disabled',
              }}
            >
              <Icon icon="lucide:clock-off" width={40} />
              <Typography variant="body1" textAlign="center">
                No se encontraron registros en el rango seleccionado.
              </Typography>
              <Typography variant="caption" color="text.disabled" textAlign="center">
                Verifica las fechas del filtro o asegúrate de que el personal haya registrado marcaciones.
              </Typography>
            </Paper>
          ) : (
            <>
              {/* Totales */}
              <ResumenTotales rows={rows} />

              {/* Botón único de exportación con selección de formato (PDF o Excel) */}
              <Box display="flex" justifyContent="flex-end" mb={2} className="no-print">
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Icon icon="lucide:download" />}
                  endIcon={<Icon icon="lucide:chevron-down" />}
                  onClick={handleOpenExportMenu}
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    px: 2,
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
                      secondary={<Typography variant="caption" color="text.secondary">Descargar archivo .xlsx</Typography>}
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
              </Box>

              {/* Tabla con scroll horizontal responsivo */}
              <TableContainer
                component={Paper}
                elevation={0}
                sx={{
                  border: '1px solid #e2e8f0',
                  borderRadius: 3,
                  width: '100%',
                  maxWidth: '100%',
                  overflowX: 'auto',
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
                  '&::-webkit-scrollbar': {
                    height: '8px',
                  },
                  '&::-webkit-scrollbar-track': {
                    bgcolor: '#f1f5f9',
                    borderRadius: '4px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    bgcolor: '#94a3b8',
                    borderRadius: '4px',
                    '&:hover': {
                      bgcolor: '#64748b',
                    },
                  },
                }}
              >
                <Table size="small" sx={{ minWidth: 1200 }}>
                  <TableHead>
                    <TableRow>
                      {[
                        'Empleado', 'Rol', 'Fecha', 'Tipo de Día', 'Entrada', 'Almuerzo', 'Salida', 'T. Laborado',
                        'H.E. Diurna', 'H.E. Nocturna', 'H.E. Diurna D/F', 'H.E. Nocturna D/F', 'Total H.E.', 'Justificación',
                      ].map((h) => (
                        <TableCell key={h} sx={CELL_HEADER}>{h}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map((row, idx) => (
                      <TableRow
                        key={row.id || idx}
                        sx={{
                          '&:hover': { bgcolor: '#f8fafc' },
                          bgcolor: row.isHoliday || row.esDominical ? '#fffbeb' : 'white',
                        }}
                      >
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>{row.userName}</Typography>
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap">
                            <Chip
                              label={row.rolName}
                              size="small"
                              sx={{ fontSize: '0.7rem', height: 20 }}
                            />
                            {!row.hasSchedule && (
                              <Tooltip title="Este rol aún no tiene horario asignado en la pestaña 'Horarios por Rol'">
                                <Chip
                                  label="Sin horario"
                                  size="small"
                                  sx={{
                                    fontSize: '0.65rem', height: 18,
                                    bgcolor: '#fef3c7', color: '#92400e', fontWeight: 700,
                                  }}
                                />
                              </Tooltip>
                            )}
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{formatDate(row.date)}</Typography>
                        </TableCell>
                        <TableCell>
                          {row.isHoliday ? (
                            <Tooltip title={row.holidayName || 'Festivo oficial de Colombia'}>
                              <Chip
                                icon={<Icon icon="lucide:sparkles" width={12} />}
                                label={row.holidayName ? `Festivo: ${row.holidayName}` : 'Festivo'}
                                size="small"
                                sx={{
                                  bgcolor: '#fef3c7', color: '#92400e', fontWeight: 700,
                                  fontSize: '0.65rem', height: 20, maxWidth: 180,
                                }}
                              />
                            </Tooltip>
                          ) : row.esDominical ? (
                            <Chip
                              icon={<Icon icon="lucide:sun" width={12} />}
                              label="Domingo"
                              size="small"
                              sx={{
                                bgcolor: '#ede9fe', color: '#6d28d9', fontWeight: 700,
                                fontSize: '0.65rem', height: 20,
                              }}
                            />
                          ) : row.esSabado ? (
                            <Tooltip title={row.saturdayExitTime ? `Horario sábado: salida ${row.saturdayExitTime.substring(0, 5)} (sin almuerzo)` : 'Horario de sábado'}>
                              <Chip
                                icon={<Icon icon="lucide:calendar" width={12} />}
                                label="Sábado"
                                size="small"
                                sx={{
                                  bgcolor: '#e0f2fe', color: '#0369a1', fontWeight: 700,
                                  fontSize: '0.65rem', height: 20,
                                }}
                              />
                            </Tooltip>
                          ) : (
                            <Typography variant="caption" color="text.secondary">Ordinario</Typography>
                          )}
                        </TableCell>
                        <TableCell sx={{ fontVariantNumeric: 'tabular-nums', fontSize: '0.8rem' }}>
                          {formatTime(row.entryTime)}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.75rem' }}>
                          {row.lunchStart && row.lunchEnd ? (
                            <Chip
                              label={formatTime(row.lunchStart) + ' - ' + formatTime(row.lunchEnd)}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: '0.65rem', height: 18, borderColor: '#cbd5e1' }}
                            />
                          ) : (
                            <Typography variant="caption" color="text.disabled">—</Typography>
                          )}
                        </TableCell>
                        <TableCell sx={{ fontVariantNumeric: 'tabular-nums', fontSize: '0.8rem' }}>
                          {row.isPendingExit ? (
                            <Chip
                              label="En curso"
                              size="small"
                              sx={{
                                fontSize: '0.7rem', height: 20,
                                bgcolor: '#eff6ff', color: '#1d4ed8', fontWeight: 700,
                              }}
                            />
                          ) : (
                            formatTime(row.exitTime)
                          )}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
                          {row.minutosNeto > 0 ? `${Math.floor(row.minutosNeto / 60)}h ${row.minutosNeto % 60}m` : '—'}
                        </TableCell>
                        <TableCell align="center"><OvertimeCell value={row.diurna} type="diurna" /></TableCell>
                        <TableCell align="center"><OvertimeCell value={row.nocturna} type="nocturna" /></TableCell>
                        <TableCell align="center"><OvertimeCell value={row.diurnaDF} type="diurnaDF" /></TableCell>
                        <TableCell align="center"><OvertimeCell value={row.nocturnaDF} type="nocturnaDF" /></TableCell>
                        <TableCell align="center">
                          {row.totalExtra > 0 ? (
                            <Chip
                              label={`${row.totalExtra}h`}
                              size="small"
                              sx={{ bgcolor: '#eef2ff', color: '#3730a3', fontWeight: 800, fontSize: '0.8rem' }}
                            />
                          ) : (
                            <Typography variant="caption" color="text.disabled">—</Typography>
                          )}
                        </TableCell>
                        <TableCell align="center">
                          {row.overtimeJustification ? (
                            <Tooltip title={row.overtimeJustification} arrow placement="top">
                              <Chip
                                icon={<Icon icon="lucide:message-square-text" width={14} />}
                                label={row.overtimeJustification.length > 20 ? `${row.overtimeJustification.substring(0, 20)}...` : row.overtimeJustification}
                                size="small"
                                sx={{
                                  bgcolor: '#f1f5f9',
                                  color: '#1e293b',
                                  fontWeight: 600,
                                  fontSize: '0.75rem',
                                  maxWidth: 180,
                                  cursor: 'pointer',
                                  border: '1px solid #e2e8f0',
                                }}
                              />
                            </Tooltip>
                          ) : (
                            <Typography variant="caption" color="text.disabled">—</Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </>
      )}
    </Box>
  );
}
