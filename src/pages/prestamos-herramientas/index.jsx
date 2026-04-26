import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Box, Chip, IconButton, Tooltip, Dialog, DialogTitle, DialogContent,
  DialogActions, Button, TextField, Select, MenuItem, FormControl,
  InputLabel, Typography, Paper, Divider, CircularProgress
} from '@mui/material';
import {
  ClockIcon, ArrowPathIcon, EyeIcon, DocumentTextIcon
} from '@heroicons/react/24/outline';
import BaseGrid from '../../components/grid/base.grid.tsx';
import { decrypt } from '../../utils/crypto.js';
import { pdf } from '@react-pdf/renderer';
import ToolLoanPDF from '../herramientas/ToolLoanPDF.jsx';

const STATUS_COLORS = {
  'Prestado': 'primary',
  'Devuelto': 'success',
  'Devuelto Dañado': 'warning',
  'Perdido': 'error',
};

const STATUS_OPTIONS = ['Prestado', 'Devuelto', 'Devuelto Dañado', 'Perdido'];

export default function PrestamosHerramientas() {
  const company = sessionStorage.getItem('company');
  const [refreshKey, setRefreshKey] = useState(0);
  const [gridData, setGridData] = useState([]);

  // Status change modal
  const [statusModal, setStatusModal] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [statusObs, setStatusObs] = useState('');
  const [savingStatus, setSavingStatus] = useState(false);

  // History modal
  const [historyModal, setHistoryModal] = useState(false);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const openStatusChange = (loan) => {
    setSelectedLoan(loan);
    setNewStatus(loan.status);
    setStatusObs('');
    setStatusModal(true);
  };

  const openHistory = async (loan) => {
    setSelectedLoan(loan);
    setHistoryModal(true);
    setLoadingHistory(true);
    try {
      const res = await axios.get(`/toolLoanHistory/${loan.id}`);
      setHistory(res.data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleStatusSave = async () => {
    if (!newStatus) return;
    setSavingStatus(true);
    try {
      await axios.put(`/changeToolLoanStatus/${selectedLoan.id}`, {
        status: newStatus,
        observations: statusObs,
        fkUser: decrypt(sessionStorage.getItem('userId')),
      });
      setStatusModal(false);
      setRefreshKey(k => k + 1);
    } catch (e) {
      console.error(e);
    } finally {
      setSavingStatus(false);
    }
  };

  const downloadPDF = async (loan) => {
    const loanPDF = {
      loanId: loan.id,
      date: new Date(loan.date).toLocaleDateString(),
      borrowerName: loan.BorrowerUser?.name || loan.borrowerName || 'S/N',
      createdByName: loan.CreatedBy?.name || loan.createdBy || 'S/N',
      observations: loan.observations,
      tools: (loan.loanItems || []).map(item => ({
        id: item.tool_id,
        description: item.tool?.description || `Herramienta #${item.tool_id}`,
        group: item.tool?.ToolGroup?.name || '-',
        quantity: item.quantity,
      })),
    };
    const blob = await pdf(<ToolLoanPDF loan={loanPDF} />).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `prestamo_${loanPDF.loanId}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const mapLoansData = (loans) => loans.map(loan => ({
    id: loan.id,
    Fecha: new Date(loan.date).toLocaleDateString(),
    'Prestado a': loan.BorrowerUser?.name || 'S/N',
    'Registrado por': loan.CreatedBy?.name || 'S/N',
    Observaciones: loan.observations || '-',
    'N° Herramientas': (loan.loanItems || []).length,
    status: loan.status,
    loanItems: loan.loanItems,
    BorrowerUser: loan.BorrowerUser,
    CreatedBy: loan.CreatedBy,
  }));

  return (
    <>
      <BaseGrid
        key={refreshKey}
        title="Préstamos de Herramientas"
        endpoint={`/getToolLoan/${company}`}
        fields={[]}
        mapData={mapLoansData}
        onDataChange={setGridData}
        excludeKeys={['status', 'loanItems', 'BorrowerUser', 'CreatedBy', 'toolLoan']}
        hideCreate={true}
        hideEdit={true}
        hideDelete={true}
        extraHeaders={[
          { label: 'Estado' },
        ]}
        renderExtraCell={({ item, headerLabel }) => {
          if (headerLabel === 'Estado') {
            return (
              <Chip
                label={item.status}
                color={STATUS_COLORS[item.status] || 'default'}
                size="small"
                sx={{ fontWeight: 'bold' }}
              />
            );
          }
          return null;
        }}
        renderExtraActions={(item) => (
          <Box display="flex" gap={1}>
            <Tooltip title="Cambiar Estado">
              <IconButton size="small" color="primary" onClick={() => openStatusChange(item)}>
                <ArrowPathIcon className="h-5 w-5" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Ver Historial">
              <IconButton size="small" color="secondary" onClick={() => openHistory(item)}>
                <ClockIcon className="h-5 w-5" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Descargar PDF">
              <IconButton size="small" onClick={() => downloadPDF(item)}>
                <DocumentTextIcon className="h-5 w-5 text-blue-600" />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      />

      {/* CHANGE STATUS MODAL */}
      <Dialog open={statusModal} onClose={() => setStatusModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          Cambiar Estado — Préstamo #{selectedLoan?.id}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Prestado a: <strong>{selectedLoan?.['Prestado a']}</strong>
          </Typography>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Nuevo Estado</InputLabel>
            <Select value={newStatus} label="Nuevo Estado" onChange={(e) => setNewStatus(e.target.value)}>
              {STATUS_OPTIONS.map(s => (
                <MenuItem key={s} value={s}>
                  <Chip label={s} color={STATUS_COLORS[s] || 'default'} size="small" sx={{ mr: 1 }} />
                  {s}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Observaciones del cambio"
            value={statusObs}
            onChange={(e) => setStatusObs(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusModal(false)} color="inherit">Cancelar</Button>
          <Button
            onClick={handleStatusSave}
            variant="contained"
            disabled={savingStatus || !newStatus}
            startIcon={savingStatus && <CircularProgress size={16} color="inherit" />}
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* HISTORY MODAL */}
      <Dialog open={historyModal} onClose={() => setHistoryModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          Historial — Préstamo #{selectedLoan?.id}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Prestado a: <strong>{selectedLoan?.borrowerName}</strong>
          </Typography>
          {loadingHistory ? (
            <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>
          ) : history.length === 0 ? (
            <Typography color="text.secondary" textAlign="center" py={3}>Sin historial disponible</Typography>
          ) : (
            <Box>
              {history.map((entry, idx) => (
                <Paper key={entry.id} elevation={0} sx={{ p: 2, mb: 1.5, border: '1px solid #e5e7eb', borderRadius: 2, borderLeft: `4px solid` , borderLeftColor: STATUS_COLORS[entry.status] === 'primary' ? '#3b82f6' : STATUS_COLORS[entry.status] === 'success' ? '#22c55e' : STATUS_COLORS[entry.status] === 'warning' ? '#f59e0b' : '#ef4444' }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                    <Chip label={entry.status} color={STATUS_COLORS[entry.status] || 'default'} size="small" sx={{ fontWeight: 'bold' }} />
                    <Typography variant="caption" color="text.secondary">
                      {new Date(entry.date).toLocaleString()}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Por: <strong>{entry.ChangedBy?.name || 'S/N'}</strong>
                  </Typography>
                  {entry.observations && (
                    <Typography variant="body2" mt={0.5} sx={{ fontStyle: 'italic' }}>
                      "{entry.observations}"
                    </Typography>
                  )}
                </Paper>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHistoryModal(false)} variant="contained">Cerrar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
