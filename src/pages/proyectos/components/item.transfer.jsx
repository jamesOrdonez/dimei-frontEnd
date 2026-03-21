import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Box,
  Typography,
  Select,
  MenuItem,
  TextField,
  InputLabel,
  FormControl,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
  Button
} from '@mui/material';
import axios from 'axios';
import { Loader } from '../../../components/loaders';

export default function ItemTransfer({ projectId, company, project }) {
  const [items, setItems] = useState([]);
  
  // If the project object already has the array, use it. Otherwise, assume empty array initially.
  const [projectItems, setProjectItems] = useState(
    Array.isArray(project?.items) ? project.items : []
  );
  
  const [itemGroups, setItemGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterGroup, setFilterGroup] = useState('');
  const [filterName, setFilterName] = useState('');

  // Selection
  const [leftSelected, setLeftSelected] = useState([]);
  const [rightSelected, setRightSelected] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [itemsRes, groupsRes] = await Promise.all([
        axios.get(`/getItem/${company}`),
        axios.get(`/getItemGroup/${company}`)
      ]);

      const extractData = (res) => Array.isArray(res.data) ? res.data : (res.data?.data || []);

      setItems(extractData(itemsRes));
      setItemGroups(extractData(groupsRes));
    } catch (err) {
      console.error('Error fetching data for items transfer list:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleToggle = (item, side) => {
    const selectedList = side === 'left' ? leftSelected : rightSelected;
    const setSelectedList = side === 'left' ? setLeftSelected : setRightSelected;
    
    const currentIndex = selectedList.findIndex(i => String(i.id) === String(item.id));
    const newSelected = [...selectedList];

    if (currentIndex === -1) {
      // For left side, initialize quantity to 1 and ensure project-side structure
      newSelected.push(side === 'left' ? { ...item, item_id: item.id, quantity: 1 } : item);
    } else {
      newSelected.splice(currentIndex, 1);
    }

    setSelectedList(newSelected);
  };

  const handleQuantityChange = (itemId, val) => {
    setLeftSelected(prev => prev.map(item => 
      String(item.id) === String(itemId) ? { ...item, quantity: parseFloat(val) || 0 } : item
    ));
  };

  const moveRight = async () => {
    // Optimistic UI update
    const newProjectItems = [...projectItems, ...leftSelected];
    setProjectItems(newProjectItems);
    const moving = [...leftSelected];
    setLeftSelected([]);

    // Actual API Call to save instantly
    try {
      const payload = {
        projectId,
        company,
        items: moving.map(p => ({ id: p.id, quantity: p.quantity }))
      };
      await axios.post('/saveItemProyect', payload);
      // Silent Refetch
      fetchData(true);
    } catch (err) {
      console.error('Failed to add items:', err);
    }
  };

  const moveLeft = async () => {
    // This removes items from the right box
    const moving = [...rightSelected];
    setProjectItems(projectItems.filter(p => !moving.some(rs => String(rs.id) === String(p.id))));
    setRightSelected([]);

    // Actual API Call to delete instantly for each item or batch
    try {
      await Promise.all(moving.map(item => 
        axios.delete(`/deleteItemProyect/${item.id || item.project_item_id}`)
      ));
      // Silent Refetch
      fetchData(true);
    } catch (err) {
      console.error('Failed to remove items:', err);
    }
  };

  // Compute filtered left list: 
  const availableItems = items
    .filter(p => !projectItems.some(pp => {
      const pId = String(p.id);
      return String(pp.fk_item) === pId || String(pp.item_id) === pId || String(pp.item?.id) === pId || (pp.description === p.description && String(pp.id) === pId);
    }))
    .filter(p => (filterGroup ? String(p.group_item || p.fk_group_item) === String(filterGroup) : true))
    .filter(p => (filterName ? (p.description || p.name || '').toLowerCase().includes(filterName.toLowerCase()) : true));

  if (loading) return <Loader />;

  return (
    <Box>
      <Grid container spacing={2} alignItems="stretch">
        {/* LEFT LIST */}
        <Grid item xs={12} md={5}>
          <Paper elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box p={2} borderBottom="1px solid #e0e0e0" bgcolor="#f9fafb" sx={{ borderTopLeftRadius: 8, borderTopRightRadius: 8 }}>
              <Typography variant="subtitle1" fontWeight="600">Items Disponibles</Typography>
              <Grid container spacing={1} mt={1}>
                <Grid item xs={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Grupo</InputLabel>
                    <Select
                      value={filterGroup}
                      label="Grupo"
                      onChange={(e) => setFilterGroup(e.target.value)}
                    >
                      <MenuItem value=""><em>Todos</em></MenuItem>
                      {itemGroups.map(g => (
                        <MenuItem key={g.id} value={g.id}>{g.name || g.description}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Nombre"
                    value={filterName}
                    onChange={(e) => setFilterName(e.target.value)}
                  />
                </Grid>
              </Grid>
            </Box>
            <List sx={{ height: 300, overflow: 'auto', p: 0 }}>
              {availableItems.map((item) => (
                <ListItem
                  key={item.id}
                  button
                  onClick={() => handleToggle(item, 'left')}
                  sx={{ borderBottom: '1px solid #f0f0f0' }}
                >
                  <ListItemIcon>
                    <Checkbox
                      edge="start"
                      checked={leftSelected.some(s => String(s.id) === String(item.id))}
                      tabIndex={-1}
                      disableRipple
                    />
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.description || item.name} 
                    secondary={`Grupo: ${itemGroups.find(g => String(g.id) === String(item.group_item || item.fk_group_item))?.name || 'N/A'}`}
                  />
                  {leftSelected.some(s => String(s.id) === String(item.id)) && (
                    <Box onClick={(e) => e.stopPropagation()}>
                      <TextField
                        size="small"
                        type="number"
                        label="Cant."
                        style={{ width: 80 }}
                        value={leftSelected.find(s => String(s.id) === String(item.id))?.quantity || 1}
                        onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                        inputProps={{ min: 0, step: "0.01" }}
                        sx={{ ml: 1 }}
                      />
                    </Box>
                  )}
                </ListItem>
              ))}
              {availableItems.length === 0 && (
                <Box p={3} textAlign="center" color="text.secondary">No se encontraron items disponibles</Box>
              )}
            </List>
          </Paper>
        </Grid>

        {/* MIDDLE BUTTONS */}
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
            disabled={rightSelected.length === 0}
            sx={{ minWidth: 50, borderRadius: 2 }}
          >
            &lt;
          </Button>
        </Grid>

        {/* RIGHT LIST */}
        <Grid item xs={12} md={5}>
          <Paper elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box p={2} borderBottom="1px solid #e0e0e0" bgcolor="#f9fafb" sx={{ borderTopLeftRadius: 8, borderTopRightRadius: 8 }}>
              <Typography variant="subtitle1" fontWeight="600">Items del Proyecto</Typography>
              <Typography variant="body2" color="text.secondary">{projectItems.length} elementos añadidos</Typography>
            </Box>
            <List sx={{ height: 350, overflow: 'auto', p: 0 }}>
              {projectItems.map((item) => (
                <ListItem
                  key={item.id}
                  button
                  onClick={() => handleToggle(item, 'right')}
                  sx={{ borderBottom: '1px solid #f0f0f0' }}
                >
                  <ListItemIcon>
                    <Checkbox
                      edge="start"
                      checked={rightSelected.some(s => s.id === item.id)}
                      tabIndex={-1}
                      disableRipple
                    />
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.description || item.name || item.item_name} 
                    secondary={`ID: ${item.item_id || item.id} - Cantidad: ${item.quantity || 0}`}
                  />
                </ListItem>
              ))}
              {projectItems.length === 0 && (
                <Box p={3} textAlign="center" color="text.secondary">No hay items en este proyecto</Box>
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
