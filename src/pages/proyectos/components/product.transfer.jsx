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

export default function ProductTransfer({ projectId, company, project }) {
  const [products, setProducts] = useState([]);
  // If the project object already has the array, use it. Otherwise, assume empty array initially.
  const [projectProducts, setProjectProducts] = useState(
    Array.isArray(project?.products) ? project.products : (Array.isArray(project?.projectItems) ? project.projectItems : [])
  );
  const [productGroups, setProductGroups] = useState([]);
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
      const [prodsRes, groupsRes] = await Promise.all([
        axios.get(`/getProduct/${company}`),
        axios.get(`/getProductGroup/${company}`)
      ]);

      const extractData = (res) => Array.isArray(res.data) ? res.data : (res.data?.data || []);

      setProducts(extractData(prodsRes));
      setProductGroups(extractData(groupsRes));
    } catch (err) {
      console.error('Error fetching data for transfer list:', err);
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
      newSelected.push(side === 'left' ? { ...item, product_id: item.id, quantity: 1 } : item);
    } else {
      newSelected.splice(currentIndex, 1);
    }

    setSelectedList(newSelected);
  };

  const handleQuantityChange = (itemId, val) => {
    // If the value is empty, keep it as an empty string to allow deletion
    const numericValue = val === '' ? '' : parseFloat(val);
    setLeftSelected(prev => prev.map(item => 
      String(item.id) === String(itemId) ? { ...item, quantity: numericValue } : item
    ));
  };

  const handleQuantityBlur = (itemId, quantity) => {
    if (quantity === '' || isNaN(quantity) || quantity <= 0) {
      setLeftSelected(prev => prev.map(item => 
        String(item.id) === String(itemId) ? { ...item, quantity: 1 } : item
      ));
    }
  };

  const moveRight = async () => {
    // Optimistic UI update
    const newProjectProducts = [...projectProducts, ...leftSelected];
    setProjectProducts(newProjectProducts);
    const moving = [...leftSelected];
    setLeftSelected([]);

    // Actual API Call to save instantly
    try {
      const payload = {
        projectId,
        company,
        // Using standard mapping from old detail.jsx behavior
        products: moving.map(p => ({ id: p.id, quantity: p.quantity }))
      };
      await axios.post('/saveproductProyect', payload);
      // Silent Refetch
      fetchData(true);
    } catch (err) {
      console.error('Failed to add products:', err);
    }
  };

  const moveLeft = async () => {
    // This removes items from the right box
    const moving = [...rightSelected];
    setProjectProducts(projectProducts.filter(p => !moving.some(rs => String(rs.id) === String(p.id))));
    setRightSelected([]);

    // Actual API Call to delete instantly for each item or batch
    try {
      await Promise.all(moving.map(item => 
        axios.delete(`/deleteProductProyect/${item.id || item.project_item_id}`)
      ));
      // Silent Refetch
      fetchData(true);
    } catch (err) {
      console.error('Failed to remove products:', err);
    }
  };

  // Compute filtered left list: 
  // Should not contain products already in the right list!
  const availableProducts = products
    .filter(p => !projectProducts.some(pp => {
      const pId = String(p.id);
      return String(pp.fk_product) === pId || String(pp.product_id) === pId || String(pp.product?.id) === pId || (pp.description === p.description && String(pp.id) === pId);
    }))
    .filter(p => (filterGroup ? String(p.fk_group_product || p.group_product) === String(filterGroup) : true))
    .filter(p => (filterName ? (p.description || p.name || '').toLowerCase().includes(filterName.toLowerCase()) : true));

  if (loading) return <Loader />;

  return (
    <Box>
      <Grid container spacing={2} alignItems="stretch">
        {/* LEFT LIST */}
        <Grid item xs={12} md={5}>
          <Paper elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box p={2} borderBottom="1px solid #e0e0e0" bgcolor="#f9fafb" sx={{ borderTopLeftRadius: 8, borderTopRightRadius: 8 }}>
              <Typography variant="subtitle1" fontWeight="600">Productos Disponibles</Typography>
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
                      {productGroups.map(g => (
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
              {availableProducts.map((item) => (
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
                    secondary={`Grupo: ${productGroups.find(g => String(g.id) === String(item.fk_group_product))?.name || 'N/A'}`}
                  />
                  {leftSelected.some(s => String(s.id) === String(item.id)) && (
                    <Box onClick={(e) => e.stopPropagation()}>
                      <TextField
                        size="small"
                        type="number"
                        label="Cant."
                        style={{ width: 80 }}
                        value={leftSelected.find(s => String(s.id) === String(item.id))?.quantity}
                        onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                        onBlur={(e) => handleQuantityBlur(item.id, e.target.value)}
                        inputProps={{ min: 0, step: "0.01" }}
                        sx={{ ml: 1 }}
                      />
                    </Box>
                  )}
                </ListItem>
              ))}
              {availableProducts.length === 0 && (
                <Box p={3} textAlign="center" color="text.secondary">No se encontraron productos disponibles</Box>
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
              <Typography variant="subtitle1" fontWeight="600">Productos del Proyecto</Typography>
              <Typography variant="body2" color="text.secondary">{projectProducts.length} elementos añadidos</Typography>
            </Box>
            <List sx={{ height: 350, overflow: 'auto', p: 0 }}>
              {projectProducts.map((item) => (
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
                    primary={item.description || item.name || item.product_name} 
                    secondary={`ID: ${item.product_id || item.id} - Cantidad: ${item.quantity || 0}`}
                  />
                </ListItem>
              ))}
              {projectProducts.length === 0 && (
                <Box p={3} textAlign="center" color="text.secondary">No hay productos en este proyecto</Box>
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
