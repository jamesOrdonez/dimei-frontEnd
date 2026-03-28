import React, { useState, useMemo } from 'react';
import { decrypt } from '../../../utils/crypto.js';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Paper,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
  TextField,
  Tabs,
  Tab,
  IconButton,
  Divider,
} from '@mui/material';
import { ChevronRightIcon, ChevronLeftIcon, XMarkIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import Swal from 'sweetalert2';
import RemisionPDF from '../../productos/remisionPDF.jsx';
import { pdf } from '@react-pdf/renderer';

export default function RemisionModal({ open, onClose, project, projectId, company, showItemsTab, onSuccess }) {
  const [tabIndex, setTabIndex] = useState(0);
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  // States for products
  const [selectedProducts, setSelectedProducts] = useState([]); // Right side
  const [leftProductSelected, setLeftProductSelected] = useState([]); // Toggle selection left
  const [rightProductSelected, setRightProductSelected] = useState([]); // Toggle selection right

  // States for items
  const [selectedItems, setSelectedItems] = useState([]); // Right side
  const [leftItemSelected, setLeftItemSelected] = useState([]); // Toggle selection left
  const [rightItemSelected, setRightItemSelected] = useState([]); // Toggle selection right

  // Pre-populate with already remitted items from the project
  React.useEffect(() => {
    if (project) {
      const initialProducts = (project.products || [])
        .filter(p => p.remitted_quantity > 0)
        .map(p => ({ ...p, remisionQty: p.remitted_quantity, stored: true }));
      
      const initialItems = (project.items || [])
        .filter(i => i.remitted_quantity > 0)
        .map(i => ({ ...i, remisionQty: i.remitted_quantity, stored: true }));

      setSelectedProducts(initialProducts);
      setSelectedItems(initialItems);
    }
  }, [project]);

  // Filters
  const [filterText, setFilterText] = useState('');

  const handleTabChange = (event, newValue) => setTabIndex(newValue);

  // Available Products (those in project but not yet moved to right side)
  const availableProducts = useMemo(() => {
    return (project?.products || []).filter(
      (p) => !selectedProducts.some((sp) => sp.product_id === p.product_id)
    ).filter(p => (p.quantity - p.remitted_quantity) > 0) // Solo mostrar si queda cantidad disponible
     .filter(p => p.product_name.toLowerCase().includes(filterText.toLowerCase()));
  }, [project, selectedProducts, filterText]);

  // Available Items
  const availableItems = useMemo(() => {
    return (project?.items || []).filter(
      (i) => !selectedItems.some((si) => si.item_id === i.item_id)
    ).filter(i => (i.quantity - i.remitted_quantity) > 0) // Solo mostrar si queda cantidad disponible
     .filter(i => i.item_name.toLowerCase().includes(filterText.toLowerCase()));
  }, [project, selectedItems, filterText]);

  const handleToggle = (item, side, type) => {
    if (type === 'product') {
      const selected = side === 'left' ? leftProductSelected : rightProductSelected;
      const setSelected = side === 'left' ? setLeftProductSelected : setRightProductSelected;
      const index = selected.indexOf(item);
      const newSelected = [...selected];
      if (index === -1) newSelected.push(item);
      else newSelected.splice(index, 1);
      setSelected(newSelected);
    } else {
      const selected = side === 'left' ? leftItemSelected : rightItemSelected;
      const setSelected = side === 'left' ? setLeftItemSelected : setRightItemSelected;
      const index = selected.indexOf(item);
      const newSelected = [...selected];
      if (index === -1) newSelected.push(item);
      else newSelected.splice(index, 1);
      setSelected(newSelected);
    }
  };

  const moveRight = () => {
    if (tabIndex === 0) {
      setSelectedProducts([...selectedProducts, ...leftProductSelected.map(p => ({ ...p, remisionQty: p.quantity }))]);
      setLeftProductSelected([]);
    } else {
      setSelectedItems([...selectedItems, ...leftItemSelected.map(i => ({ ...i, remisionQty: i.quantity }))]);
      setLeftItemSelected([]);
    }
  };

  const moveLeft = () => {
    if (tabIndex === 0) {
      // No permitir mover a la izquierda los que ya están guardados
      const toMove = rightProductSelected.filter(p => !p.stored);
      setSelectedProducts(selectedProducts.filter(p => !toMove.includes(p)));
      setRightProductSelected([]);
    } else {
      const toMove = rightItemSelected.filter(i => !i.stored);
      setSelectedItems(selectedItems.filter(i => !toMove.includes(i)));
      setRightItemSelected([]);
    }
  };

  const handleRemisionQtyChange = (id, val, type) => {
    const setter = type === 'product' ? setSelectedProducts : setSelectedItems;
    const idField = type === 'product' ? 'product_id' : 'item_id';
    setter(prev => prev.map(item => 
      (item[idField] === id && !item.stored) ? { ...item, remisionQty: val } : item
    ));
  };
 
  const makeAndDownloadPDF = async (remisionId) => {
    try {
      const remisionData = {
        remisionId,
        fecha: new Date().toLocaleDateString(),
        description: description,
        projectId: projectId,
        products: selectedProducts.filter(p => !p.stored).map(p => ({
          name: p.product_name,
          cantidad: p.remisionQty,
          components: (p.items || []).map(comp => ({
            name: comp.item_name,
            totalQuantity: (Number(comp.quantity) * Number(p.remisionQty))
          }))
        })),
        items: selectedItems.filter(i => !i.stored).map(i => ({
          description: i.item_name,
          cantidad: i.remisionQty
        })),
        elaboradoPor: decrypt(sessionStorage.getItem('user')) || ' ', 
        aprobadoPor: ' ',
      };

      const blob = await pdf(<RemisionPDF remision={remisionData} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `remision_${remisionId}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generando PDF:", error);
      Swal.fire('Error', 'No se pudo generar el PDF de la remisión.', 'error');
    }
  };

  const handleSave = async () => {
    if (selectedProducts.length === 0 && selectedItems.length === 0) {
      Swal.fire('Atención', 'Selecciona al menos un producto o ítem para remisionar.', 'warning');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        description,
        company,
        fkUser: decrypt(sessionStorage.getItem('userId')),
        fk_proyect: projectId,
        net_products: selectedProducts.map(p => ({ id: p.product_id, quantity: p.remisionQty })),
        net_items: selectedItems.map(i => ({ id: i.item_id, quantity: i.remisionQty }))
      };

      const response = await axios.post('/saveRemision', payload);
      
      Swal.fire('Éxito', 'Remisión creada correctamente.', 'success');
      
      // Generar y descargar PDF
      if (response.data && response.data.remisionId) {
        await makeAndDownloadPDF(response.data.remisionId);
      }
      
      // Marcar ítems actuales como guardados
      setSelectedProducts(prev => prev.map(p => ({ ...p, stored: true })));
      setSelectedItems(prev => prev.map(i => ({ ...i, stored: true })));
      
      onSuccess?.();
      // No cerramos el modal para que se vea el bloqueo
      // onClose(); 
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'No se pudo crear la remisión.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const renderTransferList = (titleLeft, titleRight, available, selected, leftSel, rightSel, type) => (
    <Grid container spacing={2} alignItems="stretch">
      <Grid item xs={12} md={5.5}>
        <Paper variant="outlined" sx={{ height: 400, display: 'flex', flexDirection: 'column', borderRadius: 2 }}>
          <Box p={2} bgcolor="#f8fafc" borderBottom="1px solid #e2e8f0">
            <Typography variant="subtitle2" fontWeight={700}>{titleLeft}</Typography>
          </Box>
          <List dense sx={{ flex: 1, overflow: 'auto' }}>
            {available.map((item) => {
              const id = type === 'product' ? item.product_id : item.item_id;
              const name = type === 'product' ? item.product_name : item.item_name;
              return (
                <ListItem key={id} button onClick={() => handleToggle(item, 'left', type)}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <Checkbox checked={leftSel.includes(item)} size="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={name} 
                    secondary={`Cant. Proyecto: ${item.quantity}`} 
                    primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                  />
                </ListItem>
              );
            })}
          </List>
        </Paper>
      </Grid>

      <Grid item xs={12} md={1} display="flex" flexDirection="column" justifyContent="center" gap={1}>
        <Button size="small" variant="outlined" onClick={moveRight} disabled={(tabIndex === 0 ? leftProductSelected : leftItemSelected).length === 0}>
           <ChevronRightIcon className="w-4 h-4" />
        </Button>
        <Button size="small" variant="outlined" onClick={moveLeft} disabled={(tabIndex === 0 ? rightProductSelected : rightItemSelected).length === 0}>
           <ChevronLeftIcon className="w-4 h-4" />
        </Button>
      </Grid>

      <Grid item xs={12} md={5.5}>
        <Paper variant="outlined" sx={{ height: 400, display: 'flex', flexDirection: 'column', borderRadius: 2 }}>
          <Box p={2} bgcolor="#f8fafc" borderBottom="1px solid #e2e8f0">
            <Typography variant="subtitle2" fontWeight={700}>{titleRight}</Typography>
          </Box>
          <List dense sx={{ flex: 1, overflow: 'auto' }}>
            {selected.map((item) => {
              const id = type === 'product' ? item.product_id : item.item_id;
              const name = type === 'product' ? item.product_name : item.item_name;
              return (
                <ListItem key={id} dense sx={{ borderBottom: '1px solid #f1f5f9', opacity: item.stored ? 0.7 : 1 }}>
                  <ListItemIcon sx={{ minWidth: 40 }} onClick={() => !item.stored && handleToggle(item, 'right', type)}>
                    <Checkbox 
                      checked={rightSel.includes(item)} 
                      size="small" 
                      disabled={item.stored}
                    />
                  </ListItemIcon>
                  <ListItemText 
                    primary={name} 
                    secondary={item.stored ? "Almacenado" : ""}
                    primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                  />
                  <TextField 
                    size="small"
                    type="number"
                    value={item.remisionQty}
                    disabled={item.stored}
                    onChange={(e) => handleRemisionQtyChange(id, e.target.value, type)}
                    sx={{ width: 70, ml: 1, '& .MuiInputBase-input': { fontSize: '0.75rem', p: 0.5 } }}
                  />
                </ListItem>
              );
            })}
          </List>
        </Paper>
      </Grid>
    </Grid>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" fontWeight={800}>Nueva Remisión - Proyecto #{projectId}</Typography>
        <IconButton onClick={onClose} size="small"><XMarkIcon className="w-5 h-5" /></IconButton>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ p: 3, bgcolor: '#f8fafc' }}>
        <Box mb={3}>
           <TextField 
             fullWidth 
             label="Descripción de la remisión" 
             size="small" 
             value={description}
             onChange={(e) => setDescription(e.target.value)}
             sx={{ bgcolor: '#fff', borderRadius: 1 }}
           />
        </Box>

        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Tabs value={tabIndex} onChange={handleTabChange} sx={{ minHeight: 40 }}>
            <Tab label="Productos" sx={{ fontWeight: 700 }} />
            <Tab label="Ítems Adicionales" disabled={!showItemsTab} sx={{ fontWeight: 700 }} />
          </Tabs>
          <TextField 
            size="small" 
            placeholder="Filtrar..." 
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            sx={{ width: 200, bgcolor: '#fff' }}
          />
        </Box>

        {tabIndex === 0 ? (
          renderTransferList(
            "Productos en Proyecto", 
            "Seleccionados para Remisión", 
            availableProducts, 
            selectedProducts, 
            leftProductSelected, 
            rightProductSelected, 
            'product'
          )
        ) : (
          renderTransferList(
            "Ítems en Proyecto", 
            "Seleccionados para Remisión", 
            availableItems, 
            selectedItems, 
            leftItemSelected, 
            rightItemSelected, 
            'item'
          )
        )}
      </DialogContent>
      <Divider />
      <DialogActions sx={{ p: 2, bgcolor: '#f1f5f9' }}>
        <Button onClick={onClose} color="inherit" sx={{ fontWeight: 600 }}>Cancelar</Button>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleSave} 
          disabled={saving}
          sx={{ borderRadius: 2, px: 4, fontWeight: 700 }}
        >
          {saving ? 'Guardando...' : 'Guardar Remisión'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
