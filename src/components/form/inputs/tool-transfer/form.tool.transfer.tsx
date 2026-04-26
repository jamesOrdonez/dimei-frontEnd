import React, { useState, useEffect, useCallback } from 'react';
import {
  Grid, Paper, Box, Typography, Select, MenuItem, TextField,
  InputLabel, FormControl, List, ListItem, ListItemText,
  ListItemIcon, Checkbox, Button
} from '@mui/material';
import axios from 'axios';

interface FormToolTransferProps {
  name: string;
  value: any[];
  onChange: (e: { target: { name: string; value: any[] } }) => void;
}

export default function FormToolTransfer({ name, value = [], onChange }: FormToolTransferProps) {
  const company = sessionStorage.getItem('company');
  const [tools, setTools] = useState<any[]>([]);
  const [toolGroups, setToolGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [filterGroup, setFilterGroup] = useState('');
  const [filterName, setFilterName] = useState('');
  const [leftSelected, setLeftSelected] = useState<any[]>([]);
  const [rightSelected, setRightSelected] = useState<any[]>([]);

  const selectedTools = Array.isArray(value) ? value : [];

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [toolsRes, groupsRes] = await Promise.all([
        axios.get(`/getTool/${company}`),
        axios.get(`/getToolGroup/${company}`)
      ]);
      const extractData = (res: any) => Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setTools(extractData(toolsRes));
      setToolGroups(extractData(groupsRes));
    } catch (err) {
      console.error('Error fetching tools data:', err);
    } finally {
      setLoading(false);
    }
  }, [company]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleToggle = (item: any, side: 'left' | 'right') => {
    const selectedList = side === 'left' ? leftSelected : rightSelected;
    const setSelectedList = side === 'left' ? setLeftSelected : setRightSelected;
    const currentIndex = selectedList.findIndex((i: any) => String(i.id) === String(item.id));
    const newSelected = [...selectedList];
    if (currentIndex === -1) {
      newSelected.push(side === 'left' ? { ...item, quantity: 1 } : item);
    } else {
      newSelected.splice(currentIndex, 1);
    }
    setSelectedList(newSelected);
  };

  const handleQuantityChange = (itemId: any, val: string) => {
    const numericValue = val === '' ? '' : parseFloat(val);
    setLeftSelected(prev => prev.map((item: any) =>
      String(item.id) === String(itemId) ? { ...item, quantity: numericValue } : item
    ));
  };

  const handleQuantityBlur = (itemId: any, quantity: any) => {
    if (quantity === '' || isNaN(quantity) || quantity <= 0) {
      setLeftSelected(prev => prev.map((item: any) =>
        String(item.id) === String(itemId) ? { ...item, quantity: 1 } : item
      ));
    }
  };

  const moveRight = () => {
    onChange({ target: { name, value: [...selectedTools, ...leftSelected] } });
    setLeftSelected([]);
  };

  const moveLeft = () => {
    const moving = [...rightSelected];
    onChange({ target: { name, value: selectedTools.filter(p => !moving.some(rs => String(rs.id) === String(p.id))) } });
    setRightSelected([]);
  };

  const availableTools = tools
    .filter(t => !selectedTools.some(st => String(st.id) === String(t.id)))
    .filter(t => (filterGroup ? String(t.group_item) === String(filterGroup) : true))
    .filter(t => (filterName ? (t.description || '').toLowerCase().includes(filterName.toLowerCase()) : true));

  if (loading) return <Box p={3} textAlign="center"><Typography>Cargando herramientas...</Typography></Box>;

  return (
    <Box>
      <Grid container spacing={2} alignItems="stretch">
        {/* LEFT LIST */}
        <Grid item xs={12} md={5}>
          <Paper elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box p={2} borderBottom="1px solid #e0e0e0" bgcolor="#f9fafb" sx={{ borderTopLeftRadius: 8, borderTopRightRadius: 8 }}>
              <Typography variant="subtitle1" fontWeight="600">Herramientas Disponibles</Typography>
              <Grid container spacing={1} mt={1}>
                <Grid item xs={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Grupo</InputLabel>
                    <Select value={filterGroup} label="Grupo" onChange={(e) => setFilterGroup(e.target.value)}>
                      <MenuItem value=""><em>Todos</em></MenuItem>
                      {toolGroups.map(g => (
                        <MenuItem key={g.id} value={g.id}>{g.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6}>
                  <TextField fullWidth size="small" label="Nombre" value={filterName} onChange={(e) => setFilterName(e.target.value)} />
                </Grid>
              </Grid>
            </Box>
            <List sx={{ height: 300, overflow: 'auto', p: 0 }}>
              {availableTools.map((tool) => (
                <ListItem key={tool.id} component="div" onClick={() => handleToggle(tool, 'left')} sx={{ borderBottom: '1px solid #f0f0f0', cursor: 'pointer' }}>
                  <ListItemIcon>
                    <Checkbox edge="start" checked={leftSelected.some(s => String(s.id) === String(tool.id))} tabIndex={-1} disableRipple />
                  </ListItemIcon>
                  <ListItemText
                    primary={tool.description || `Herramienta #${tool.id}`}
                    secondary={`Grupo: ${toolGroups.find(g => String(g.id) === String(tool.group_item))?.name || 'N/A'}`}
                  />
                  {leftSelected.some(s => String(s.id) === String(tool.id)) && (
                    <Box onClick={(e) => e.stopPropagation()}>
                      <TextField
                        size="small" type="number" label="Cant." style={{ width: 80 }}
                        value={leftSelected.find(s => String(s.id) === String(tool.id))?.quantity}
                        onChange={(e) => handleQuantityChange(tool.id, e.target.value)}
                        onBlur={(e) => handleQuantityBlur(tool.id, e.target.value)}
                        inputProps={{ min: 0, step: "1" }}
                        sx={{ ml: 1 }}
                      />
                    </Box>
                  )}
                </ListItem>
              ))}
              {availableTools.length === 0 && (
                <Box p={3} textAlign="center" color="text.secondary">No se encontraron herramientas disponibles</Box>
              )}
            </List>
          </Paper>
        </Grid>

        {/* MIDDLE BUTTONS */}
        <Grid item xs={12} md={2} display="flex" flexDirection="column" justifyContent="center" alignItems="center" gap={2}>
          <Button variant="contained" color="primary" onClick={moveRight} disabled={leftSelected.length === 0} sx={{ minWidth: 50, borderRadius: 2 }}>&gt;</Button>
          <Button variant="contained" color="primary" onClick={moveLeft} disabled={rightSelected.length === 0} sx={{ minWidth: 50, borderRadius: 2 }}>&lt;</Button>
        </Grid>

        {/* RIGHT LIST */}
        <Grid item xs={12} md={5}>
          <Paper elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box p={2} borderBottom="1px solid #e0e0e0" bgcolor="#f9fafb" sx={{ borderTopLeftRadius: 8, borderTopRightRadius: 8 }}>
              <Typography variant="subtitle1" fontWeight="600">Herramientas del Préstamo</Typography>
              <Typography variant="body2" color="text.secondary">{selectedTools.length} herramienta(s) añadida(s)</Typography>
            </Box>
            <List sx={{ height: 350, overflow: 'auto', p: 0 }}>
              {selectedTools.map((tool) => {
                const full = tools.find(t => String(t.id) === String(tool.id)) || tool;
                return (
                  <ListItem key={tool.id} component="div" onClick={() => handleToggle(tool, 'right')} sx={{ borderBottom: '1px solid #f0f0f0', cursor: 'pointer' }}>
                    <ListItemIcon>
                      <Checkbox edge="start" checked={rightSelected.some(s => String(s.id) === String(tool.id))} tabIndex={-1} disableRipple />
                    </ListItemIcon>
                    <ListItemText
                      primary={full.description || `Herramienta #${full.id}`}
                      secondary={`Cantidad: ${tool.quantity || 1}`}
                    />
                  </ListItem>
                );
              })}
              {selectedTools.length === 0 && (
                <Box p={3} textAlign="center" color="text.secondary">No hay herramientas en el préstamo</Box>
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
