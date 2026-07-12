import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Box,
  Chip
} from '@mui/material';
import { XMarkIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

export default function InventoryLogModal({ open, onClose, targetId, targetType, targetName }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const endpoint = targetType === 'item' ? `/inventoryLog/item/${targetId}` : `/inventoryLog/product/${targetId}`;
      const response = await axios.get(endpoint);
      setLogs(response.data.data || []);
    } catch (error) {
      console.error('Error fetching inventory logs:', error);
    } finally {
      setLoading(false);
    }
  }, [targetId, targetType]);

  useEffect(() => {
    if (open && targetId && targetType) {
      fetchLogs();
    }
  }, [open, targetId, targetType, fetchLogs]);

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" fontWeight="bold">
          Historial de Movimientos - {targetName}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <XMarkIcon className="w-5 h-5" />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 0 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" p={5}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper} elevation={0}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell><b>Fecha</b></TableCell>
                  <TableCell><b>Usuario</b></TableCell>
                  <TableCell><b>Tipo</b></TableCell>
                  <TableCell><b>Cantidad</b></TableCell>
                  <TableCell><b>Acción / Destino</b></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                      <Typography variant="body2" color="text.secondary">
                        No hay movimientos registrados para este {targetType === 'item' ? 'ítem' : 'producto'}.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow key={log.id} hover>
                      <TableCell>{formatDate(log.date)}</TableCell>
                      <TableCell>{log.ChangedBy?.name || 'S/N'}</TableCell>
                      <TableCell>
                        <Chip 
                          label={log.action_type} 
                          size="small" 
                          color={log.action_type === 'ENTRADA' ? 'success' : 'error'} 
                          variant="outlined" 
                        />
                      </TableCell>
                      <TableCell>
                        <Typography 
                          variant="body2" 
                          fontWeight="bold" 
                          color={log.action_type === 'ENTRADA' ? 'success.main' : 'error.main'}
                        >
                          {log.action_type === 'ENTRADA' ? '+' : '-'}{log.quantity}
                        </Typography>
                      </TableCell>
                      <TableCell>{log.destination_detail || log.action_source}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
    </Dialog>
  );
}
