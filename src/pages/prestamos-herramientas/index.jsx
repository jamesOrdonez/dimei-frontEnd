import { useState } from 'react';
import axios from 'axios';
import {
  Box, Chip, IconButton, Tooltip, Dialog, DialogTitle, DialogContent,
  DialogActions, Button, TextField, Typography, Paper, CircularProgress,
} from '@mui/material';
import {
  ClockIcon, ArrowPathIcon, DocumentTextIcon
} from '@heroicons/react/24/outline';
import BaseGrid from '../../components/grid/base.grid.tsx';
import { decrypt } from '../../utils/crypto.js';
import { pdf } from '@react-pdf/renderer';
import { usePermissions, PERMISOS } from '../../context/PermissionsContext.jsx';
import ToolLoanPDF from '../herramientas/ToolLoanPDF.jsx';
import ToolReturnTransfer from './ToolReturnTransfer.jsx';

const STATUS_COLORS = {
  'Prestado': 'primary',
  'Devuelto': 'success',
  'Devuelto Dañado': 'warning',
  'Perdido': 'error',
};



export default function PrestamosHerramientas() {
  const { hasPermission } = usePermissions();

  const company = sessionStorage.getItem('company');
  const [refreshKey, setRefreshKey] = useState(0);

  // Return modal
  const [statusModal, setStatusModal] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [returnItems, setReturnItems] = useState([]);  // right-panel selection
  const [statusObs, setStatusObs] = useState('');
  const [savingStatus, setSavingStatus] = useState(false);

  // History modal
  const [historyModal, setHistoryModal] = useState(false);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const openStatusChange = (loan) => {
    setSelectedLoan(loan);

    // Agrupar devoluciones por herramienta y estado
    const groupedReturns = {};
    
    (loan.statusHistory || [])
      .filter(h => h.tool_id != null && h.qty != null)
      .forEach(h => {
        const key = `${h.tool_id}_${h.status}`;
        if (!groupedReturns[key]) {
          groupedReturns[key] = {
            tool_id: h.tool_id,
            status: h.status,
            qty: 0,
          };
        }
        groupedReturns[key].qty += h.qty;
      });

    // Soporte legacy: si hay ítems con devoluciones parciales pero sin historial (antes de la migración)
    (loan.loanItems || []).forEach(li => {
      if (li.returned_quantity > 0) {
        const hasHistory = Object.values(groupedReturns).some(g => g.tool_id === li.tool_id);
        if (!hasHistory) {
          // Asumimos 'Devuelto' genérico
          groupedReturns[`${li.tool_id}_Legacy`] = {
            tool_id: li.tool_id,
            status: li.status === 'Prestado' ? 'Devuelto' : li.status,
            qty: li.returned_quantity,
          };
        }
      }
    });

    const historyRows = Object.keys(groupedReturns).map((key) => {
      const g = groupedReturns[key];
      const loanItem = (loan.loanItems || []).find(li => li.tool_id === g.tool_id);
      return {
        loanItemId: loanItem?.id || g.tool_id,
        historyId: `grouped_${key}`, // clave única
        tool_id: g.tool_id,
        description: loanItem?.tool?.description || `Herramienta #${g.tool_id}`,
        group: loanItem?.tool?.ToolGroup?.name || '-',
        loanedQty: loanItem?.quantity || '-',
        returnQty: g.qty,
        remainingQty: loanItem ? loanItem.quantity - (loanItem.returned_quantity || 0) : 0,
        status: g.status,
        alreadyReturned: true,
      };
    });

    setReturnItems(historyRows);
    setStatusObs('');
    setStatusModal(true);
  };

  const openHistory = async (loan) => {
    setSelectedLoan(loan);
    setHistoryModal(true);
    setLoadingHistory(true);
    try {
      const res = await axios.get(`/toolLoanHistory/${loan.id}`);
      const historyData = res.data.data || [];
      const sortedHistory = historyData.sort((a, b) => new Date(b.date) - new Date(a.date));
      setHistory(sortedHistory);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleReturnSave = async () => {
    // Solo enviar los ítems nuevos, no los que ya estaban devueltos
    const newItems = returnItems.filter(i => !i.alreadyReturned);
    if (newItems.length === 0) return;
    setSavingStatus(true);
    try {
      await axios.put(`/changeToolLoanStatus/${selectedLoan.id}`, {
        observations: statusObs,
        fkUser: decrypt(sessionStorage.getItem('userId')),
        returnedItems: newItems.map(i => ({
          loanItemId: i.loanItemId,
          returnQty: i.returnQty,
          status: i.status,
        })),
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
    // loan.date puede ser string ISO o ya formateado; parseamos con seguridad
    const parsedDate = loan.date ? new Date(loan.date) : null;
    const formattedDate = parsedDate && !isNaN(parsedDate)
      ? parsedDate.toLocaleDateString('es-CO', { year: 'numeric', month: '2-digit', day: '2-digit' })
      : loan.Fecha || 'Sin fecha';

    const loanPDF = {
      loanId: loan.id,
      date: formattedDate,
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
    date: loan.date,  // preservar fecha raw para el PDF
    Fecha: loan.date ? new Date(loan.date).toLocaleDateString('es-CO') : 'Sin fecha',
    'Prestado a': loan.BorrowerUser?.name || 'S/N',
    'Registrado por': loan.CreatedBy?.name || 'S/N',
    Observaciones: loan.observations || '-',
    'N° Herramientas': (loan.loanItems || []).length,
    status: loan.status,
    loanItems: loan.loanItems,
    statusHistory: loan.statusHistory,
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
        excludeKeys={['status', 'loanItems', 'statusHistory', 'BorrowerUser', 'CreatedBy', 'toolLoan']}
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
            {hasPermission(PERMISOS.DEVOLVER_HERRAMIENTAS) && (
              <Tooltip title="Devolución">
                <IconButton size="small" color="primary" onClick={() => openStatusChange(item)}>
                  <ArrowPathIcon className="h-5 w-5" />
                </IconButton>
              </Tooltip>
            )}
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

      {/* RETURN TOOLS MODAL */}
      <Dialog open={statusModal} onClose={() => setStatusModal(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          Registrar Devolución — Préstamo #{selectedLoan?.id}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Prestado a: <strong>{selectedLoan?.['Prestado a']}</strong>
          </Typography>

          <ToolReturnTransfer
            loanItems={selectedLoan?.loanItems || []}
            selected={returnItems}
            onChange={setReturnItems}
          />

          {/* Observaciones y guardar solo si quedan herramientas pendientes */}
          {returnItems.some(i => !i.alreadyReturned) && (
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Observaciones"
              value={statusObs}
              onChange={(e) => setStatusObs(e.target.value)}
              sx={{ mt: 2 }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusModal(false)} color="inherit">Cerrar</Button>
          {returnItems.some(i => !i.alreadyReturned) && (
            <Button
              onClick={handleReturnSave}
              variant="contained"
              disabled={savingStatus || returnItems.filter(i => !i.alreadyReturned).length === 0}
              startIcon={savingStatus && <CircularProgress size={16} color="inherit" />}
            >
              Guardar Devolución
            </Button>
          )}
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
