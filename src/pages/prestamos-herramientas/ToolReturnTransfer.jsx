import React, { useState } from 'react';
import {
  Grid,
  Paper,
  Box,
  Typography,
  Select,
  MenuItem,
  TextField,
  FormControl,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
  Chip,
  Button,
} from '@mui/material';

const STATUS_COLORS = {
  'Devuelto': 'success',
  'Devuelto Dañado': 'warning',
  'Perdido': 'error',
  'Parcial': 'info',
};

const RETURN_STATUS_OPTIONS = ['Devuelto', 'Devuelto Dañado', 'Perdido'];

/**
 * ToolReturnTransfer
 *
 * Panel dual idéntico al ItemTransfer de proyectos pero orientado
 * a la devolución de herramientas de un préstamo.
 *
 * Props:
 *   loanItems  – array de ToolLoanItem (con tool.description, tool.ToolGroup)
 *   selected   – array de filas ya seleccionadas para devolver
 *   onChange   – callback(newSelected) cuando cambia la selección
 */
export default function ToolReturnTransfer({ loanItems = [], selected = [], onChange }) {
  // Filas pendientes (izquierda): las que NO están en selected aún
  // Usamos loanItemId como clave única
  const [leftSelected, setLeftSelected] = useState([]);   // items marcados en panel izq.
  const [rightSelected, setRightSelected] = useState([]);  // items marcados en panel der.

  // ── helpers ──────────────────────────────────────────────────────────────────
  const getPendingReturnQty = (loanItemId) => {
    return selected
      .filter(r => !r.alreadyReturned && r.loanItemId === loanItemId)
      .reduce((sum, r) => sum + Number(r.returnQty || 0), 0);
  };

  // Panel izquierdo: ítems con cantidad pendiente, descontando lo que ya se movió al panel derecho
  const available = loanItems.filter(li => {
    const returningQty = getPendingReturnQty(li.id);
    return (li.quantity - (li.returned_quantity || 0) - returningQty) > 0;
  });

  const buildRow = (li) => {
    const returningQty = getPendingReturnQty(li.id);
    const remainingQty = li.quantity - (li.returned_quantity || 0) - returningQty;
    return {
      tempId: Math.random().toString(36).substring(2, 9),
      loanItemId: li.id,
      tool_id: li.tool_id,
      description: li.tool?.description || `Herramienta #${li.tool_id}`,
      group: li.tool?.ToolGroup?.name || '-',
      loanedQty: li.quantity,
      returnedQty: li.returned_quantity || 0,  // ya devuelto
      remainingQty,                              // máximo a devolver ahora
      returnQty: remainingQty,                   // default = todo lo que falta
      status: 'Devuelto',
    };
  };

  // ── toggle selección ──────────────────────────────────────────────────────────
  const toggleLeft = (li) => {
    setLeftSelected(prev => {
      const exists = prev.some(i => i.loanItemId === li.id);
      return exists
        ? prev.filter(i => i.loanItemId !== li.id)
        : [...prev, buildRow(li)];
    });
  };

  const toggleRight = (row) => {
    setRightSelected(prev => {
      const exists = prev.some(i => i.tempId === row.tempId);
      return exists
        ? prev.filter(i => i.tempId !== row.tempId)
        : [...prev, row];
    });
  };

  // ── cantidad y estado en panel izquierdo (antes de mover) ─────────────────────
  const updateLeft = (loanItemId, patch) => {
    setLeftSelected(prev =>
      prev.map(r => r.loanItemId === loanItemId ? { ...r, ...patch } : r)
    );
  };

  // ── cantidad y estado en panel derecho ────────────────────────────────────────
  const updateRight = (tempId, patch) => {
    onChange(selected.map(r => r.tempId === tempId ? { ...r, ...patch } : r));
  };

  // ── mover derecha (añadir a selección) ───────────────────────────────────────
  const moveRight = () => {
    onChange([...selected, ...leftSelected]);
    setLeftSelected([]);
  };

  // ── mover izquierda (quitar de selección) — solo los NO ya devueltos ────────
  const moveLeft = () => {
    const removingIds = new Set(rightSelected.map(r => r.tempId));
    onChange(selected.filter(r => r.alreadyReturned || !removingIds.has(r.tempId)));
    setRightSelected([]);
  };

  // ── ¿todo ya devuelto? ───────────────────────────────────────────────────────
  const allFullyReturned = available.length === 0 && selected.length > 0 && selected.every(r => r.alreadyReturned);

  // ── render ───────────────────────────────────────────────────────────────────

  /* Vista simplificada cuando ya no queda nada por devolver */
  if (allFullyReturned) {
    const bgMap = {
      'Devuelto':        'rgba(34,197,94,0.08)',
      'Devuelto Dañado': 'rgba(245,158,11,0.08)',
      'Perdido':         'rgba(239,68,68,0.08)',
    };
    return (
      <Paper elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
        <Box p={2} borderBottom="1px solid #e0e0e0" bgcolor="#f9fafb" sx={{ borderTopLeftRadius: 8, borderTopRightRadius: 8 }}>
          <Typography variant="subtitle1" fontWeight="600">Herramientas Devueltas</Typography>
          <Typography variant="body2" color="text.secondary">
            Todas las herramientas de este préstamo ya fueron procesadas
          </Typography>
        </Box>
        <List sx={{ p: 0 }}>
          {selected.map(row => (
            <ListItem
              key={row.loanItemId}
              alignItems="flex-start"
              sx={{
                borderBottom: '1px solid #f0f0f0',
                bgcolor: bgMap[row.status] || 'transparent',
                flexDirection: 'column',
                gap: 0.3,
              }}
            >
              <Box display="flex" alignItems="center" width="100%" gap={1}>
                <Chip
                  label={row.status}
                  color={STATUS_COLORS[row.status] || 'default'}
                  size="small"
                  sx={{ fontWeight: 'bold', flexShrink: 0 }}
                />
                <Typography variant="body2" fontWeight="500">{row.description}</Typography>
              </Box>
              <Typography variant="caption" color="text.secondary" pl={0.5}>
                {row.group} — Devuelto: {row.returnQty} / {row.loanedQty}
              </Typography>
            </ListItem>
          ))}
        </List>
      </Paper>
    );
  }

  return (
    <Box>
      <Grid container spacing={2} alignItems="stretch">

        {/* PANEL IZQUIERDO — herramientas prestadas disponibles */}
        <Grid item xs={12} md={5}>
          <Paper elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box p={2} borderBottom="1px solid #e0e0e0" bgcolor="#f9fafb" sx={{ borderTopLeftRadius: 8, borderTopRightRadius: 8 }}>
              <Typography variant="subtitle1" fontWeight="600">Herramientas Prestadas</Typography>
              <Typography variant="body2" color="text.secondary">{available.length} pendientes de devolver</Typography>
            </Box>
            <List sx={{ height: 300, overflow: 'auto', p: 0 }}>
              {available.map((li) => {
                const row = leftSelected.find(r => r.loanItemId === li.id);
                const isChecked = !!row;
                return (
                  <ListItem
                    key={li.id}
                    button
                    onClick={() => toggleLeft(li)}
                    alignItems="flex-start"
                    sx={{ borderBottom: '1px solid #f0f0f0', flexDirection: 'column', gap: 0.5 }}
                  >
                    {/* Fila superior: checkbox + nombre */}
                    <Box display="flex" alignItems="center" width="100%">
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <Checkbox edge="start" checked={isChecked} tabIndex={-1} disableRipple />
                      </ListItemIcon>
                      <ListItemText
                        primary={li.tool?.description || `Herramienta #${li.tool_id}`}
                        secondary={
                          (li.returned_quantity || 0) > 0
                            ? `Grupo: ${li.tool?.ToolGroup?.name || 'N/A'} — Prestado: ${li.quantity} · Ya devuelto: ${li.returned_quantity} · Pendiente: ${li.quantity - li.returned_quantity}`
                            : `Grupo: ${li.tool?.ToolGroup?.name || 'N/A'} — Prestado: ${li.quantity}`
                        }
                      />
                    </Box>
                    {/* Fila inferior: controles (solo si está marcado) */}
                    {isChecked && (
                      <Box
                        display="flex"
                        flexDirection="row"
                        gap={1}
                        pl={4.5}
                        width="100%"
                        onClick={e => e.stopPropagation()}
                      >
                        <TextField
                          size="small"
                          type="number"
                          label="Cant."
                          value={row.returnQty}
                          onChange={e => {
                            const val = e.target.value;
                            if (val === '') {
                              updateLeft(li.id, { returnQty: '' });
                            } else {
                              updateLeft(li.id, { returnQty: Math.min(Number(val), row.remainingQty) });
                            }
                          }}
                          inputProps={{ min: 1, max: row.remainingQty, style: { textAlign: 'center' } }}
                          sx={{ width: 80 }}
                        />
                        <FormControl size="small" sx={{ flex: 1 }}>
                          <Select
                            value={row.status}
                            onChange={e => updateLeft(li.id, { status: e.target.value })}
                          >
                            {RETURN_STATUS_OPTIONS.map(s => (
                              <MenuItem key={s} value={s}>
                                <Chip label={s} color={STATUS_COLORS[s] || 'default'} size="small" sx={{ mr: 0.5 }} />
                                {s}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Box>
                    )}
                  </ListItem>
                );
              })}
              {available.length === 0 && (
                <Box p={3} textAlign="center" color="text.secondary">
                  Todas las herramientas ya fueron procesadas
                </Box>
              )}
            </List>
          </Paper>
        </Grid>

        {/* BOTONES CENTRALES */}
        <Grid item xs={12} md={2} display="flex" flexDirection="column" justifyContent="center" alignItems="center" gap={2}>
          <Button
            variant="contained"
            color="primary"
            onClick={moveRight}
            disabled={leftSelected.length === 0}
            sx={{ minWidth: 50, borderRadius: 2 }}
          >
            &gt;
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={moveLeft}
            disabled={rightSelected.filter(r => !r.alreadyReturned).length === 0}
            sx={{ minWidth: 50, borderRadius: 2 }}
          >
            &lt;
          </Button>
        </Grid>

        {/* PANEL DERECHO — herramientas a devolver */}
        <Grid item xs={12} md={5}>
          <Paper elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box p={2} borderBottom="1px solid #e0e0e0" bgcolor="#f9fafb" sx={{ borderTopLeftRadius: 8, borderTopRightRadius: 8 }}>
              <Typography variant="subtitle1" fontWeight="600">Historial de devoluciones</Typography>
              <Typography variant="body2" color="text.secondary">
                {selected.filter(r => r.alreadyReturned).length} registros devueltos
                {selected.filter(r => !r.alreadyReturned).length > 0 &&
                  ` · ${selected.filter(r => !r.alreadyReturned).length} nueva(s)`}
              </Typography>
            </Box>
            <List sx={{ height: 350, overflow: 'auto', p: 0 }}>
              {selected.map((row) => {
                /* ── Fila YA devuelta: solo visual, sin controles ── */
                if (row.alreadyReturned) {
                  const bgMap = {
                    'Devuelto':        'rgba(34,197,94,0.08)',
                    'Devuelto Dañado':  'rgba(245,158,11,0.08)',
                    'Perdido':         'rgba(239,68,68,0.08)',
                  };
                  return (
                    <ListItem
                      key={row.historyId ?? `${row.loanItemId}-${row.status}-${row.returnQty}`}
                      alignItems="flex-start"
                      sx={{
                        borderBottom: '1px solid #f0f0f0',
                        bgcolor: bgMap[row.status] || 'transparent',
                        flexDirection: 'column',
                        gap: 0.3,
                        opacity: 0.9,
                        cursor: 'default',
                      }}
                    >
                      <Box display="flex" alignItems="center" width="100%" gap={1}>
                        <Chip
                          label={row.status}
                          color={STATUS_COLORS[row.status] || 'default'}
                          size="small"
                          sx={{ fontWeight: 'bold', flexShrink: 0 }}
                        />
                        <Typography variant="body2" fontWeight="500">{row.description}</Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary" pl={0.5}>
                        {row.group} — Cantidad: {row.returnQty}
                      </Typography>
                    </ListItem>
                  );
                }

                /* ── Fila NUEVA: editable con checkbox para quitar ── */
                return (
                  <ListItem
                    key={row.tempId}
                    button
                    onClick={() => toggleRight(row)}
                    alignItems="flex-start"
                    sx={{ borderBottom: '1px solid #f0f0f0', flexDirection: 'column', gap: 0.5 }}
                  >
                    <Box display="flex" alignItems="center" width="100%">
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <Checkbox edge="start" checked={rightSelected.some(r => r.tempId === row.tempId)} tabIndex={-1} disableRipple />
                      </ListItemIcon>
                      <ListItemText
                        primary={row.description}
                        secondary={`Grupo: ${row.group} — Prestado: ${row.loanedQty}`}
                      />
                    </Box>
                    <Box
                      display="flex"
                      flexDirection="row"
                      gap={1}
                      pl={4.5}
                      width="100%"
                      onClick={e => e.stopPropagation()}
                    >
                      <TextField
                        size="small"
                        type="number"
                        label="Cant."
                        value={row.returnQty}
                        onChange={e => {
                          const val = e.target.value;
                          if (val === '') {
                            updateRight(row.tempId, { returnQty: '' });
                          } else {
                            updateRight(row.tempId, { returnQty: Math.min(Number(val), row.remainingQty) });
                          }
                        }}
                        inputProps={{ min: 1, max: row.remainingQty, style: { textAlign: 'center' } }}
                        sx={{ width: 80 }}
                      />
                      <FormControl size="small" sx={{ flex: 1 }}>
                        <Select
                          value={row.status}
                          onChange={e => updateRight(row.tempId, { status: e.target.value })}
                        >
                          {RETURN_STATUS_OPTIONS.map(s => (
                            <MenuItem key={s} value={s}>
                              <Chip label={s} color={STATUS_COLORS[s] || 'default'} size="small" sx={{ mr: 0.5 }} />
                              {s}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>
                  </ListItem>
                );
              })}

              {selected.length === 0 && (
                <Box p={3} textAlign="center" color="text.secondary">
                  Selecciona herramientas del panel izquierdo
                </Box>
              )}
            </List>
          </Paper>
        </Grid>

      </Grid>
    </Box>
  );
}
