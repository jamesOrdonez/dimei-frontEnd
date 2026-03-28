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
  
  // New state for quantities on the left side
  const [leftQuantities, setLeftQuantities] = useState({}); // { id: value }

  // Reset form when opening
  React.useEffect(() => {
    if (open && project) {
      setDescription('');
      setTabIndex(0);
      setFilterText('');
      setLeftProductSelected([]);
      setRightProductSelected([]);
      setLeftItemSelected([]);
      setRightItemSelected([]);
      setLeftQuantities({});
      
      const generateRowId = (id) => `${id}_${Date.now()}_${Math.random()}`;

      // Pre-populate with already remitted items from the project
      const initialProducts = (project.products || [])
        .filter(p => p.remitted_quantity > 0)
        .map(p => ({ ...p, remisionQty: p.remitted_quantity, stored: true, rowId: `stored_${p.product_id}` }));
      
      const initialItems = (project.items || [])
        .filter(i => i.remitted_quantity > 0)
        .map(i => ({ ...i, remisionQty: i.remitted_quantity, stored: true, rowId: `stored_${i.item_id}` }));

      setSelectedProducts(initialProducts);
      setSelectedItems(initialItems);
    }
  }, [open, project]);

  // Filters
  const [filterText, setFilterText] = useState('');

  const handleTabChange = (event, newValue) => setTabIndex(newValue);

  // Available Products (those in project but not yet moved to right side)
  const availableProducts = useMemo(() => {
    return (project?.products || []).filter(p => {
      // Sum all quantities on the right for this product
      const rightQty = selectedProducts
        .filter(sp => sp.product_id === p.product_id)
        .reduce((sum, item) => sum + Number(item.remisionQty || 0), 0);
        
      const remitted = Number(p.remitted_quantity || 0);
      const total = Number(p.quantity || 0);
      return (total - remitted - rightQty) > 0;
    }).filter(p => p.product_name.toLowerCase().includes(filterText.toLowerCase()));
  }, [project, selectedProducts, filterText]);

  // Available Items
  const availableItems = useMemo(() => {
    return (project?.items || []).filter(i => {
      const rightQty = selectedItems
        .filter(si => si.item_id === i.item_id)
        .reduce((sum, item) => sum + Number(item.remisionQty || 0), 0);

      const remitted = Number(i.remitted_quantity || 0);
      const total = Number(i.quantity || 0);
      return (total - remitted - rightQty) > 0;
    }).filter(i => i.item_name.toLowerCase().includes(filterText.toLowerCase()));
  }, [project, selectedItems, filterText]);

  const handleToggle = (item, side, type) => {
    const idField = type === 'product' ? 'product_id' : 'item_id';
    const id = item[idField];

    if (type === 'product') {
      const selected = side === 'left' ? leftProductSelected : rightProductSelected;
      const setSelected = side === 'left' ? setLeftProductSelected : setRightProductSelected;
      
      // Left side still uses product_id since it represents "available"
      // Right side uses rowId since it represents individual instances
      const index = side === 'left' 
        ? selected.findIndex(i => i.product_id === id)
        : selected.findIndex(i => i.rowId === item.rowId);

      const newSelected = [...selected];
      if (index === -1) {
        newSelected.push(item);
        if (side === 'left' && !leftQuantities[id]) {
           setLeftQuantities(prev => ({ ...prev, [id]: 1 }));
        }
      }
      else newSelected.splice(index, 1);
      setSelected(newSelected);
    } else {
      const selected = side === 'left' ? leftItemSelected : rightItemSelected;
      const setSelected = side === 'left' ? setLeftItemSelected : setRightItemSelected;
      
      const index = side === 'left'
        ? selected.findIndex(i => i.item_id === id)
        : selected.findIndex(i => i.rowId === item.rowId);

      const newSelected = [...selected];
      if (index === -1) {
        newSelected.push(item);
        if (side === 'left' && !leftQuantities[id]) {
           setLeftQuantities(prev => ({ ...prev, [id]: 1 }));
        }
      }
      else newSelected.splice(index, 1);
      setSelected(newSelected);
    }
  };

  const moveRight = () => {
    const generateRowId = (id) => `${id}_${Date.now()}_${Math.random()}`;

    if (tabIndex === 0) {
      const newSelected = [...selectedProducts];
      leftProductSelected.forEach(p => {
        const qtyToMove = Number(leftQuantities[p.product_id] || 1);
        const existingIdx = newSelected.findIndex(sp => sp.product_id === p.product_id && !sp.stored);
        
        if (existingIdx > -1) {
          newSelected[existingIdx] = { 
            ...newSelected[existingIdx], 
            remisionQty: Number(newSelected[existingIdx].remisionQty) + qtyToMove 
          };
        } else {
          newSelected.push({ ...p, remisionQty: qtyToMove, rowId: generateRowId(p.product_id) });
        }
      });
      setSelectedProducts(newSelected);
      setLeftProductSelected([]);
    } else {
      const newSelected = [...selectedItems];
      leftItemSelected.forEach(i => {
        const qtyToMove = Number(leftQuantities[i.item_id] || 1);
        const existingIdx = newSelected.findIndex(si => si.item_id === i.item_id && !si.stored);
        
        if (existingIdx > -1) {
          newSelected[existingIdx] = { 
            ...newSelected[existingIdx], 
            remisionQty: Number(newSelected[existingIdx].remisionQty) + qtyToMove 
          };
        } else {
          newSelected.push({ ...i, remisionQty: qtyToMove, rowId: generateRowId(i.item_id) });
        }
      });
      setSelectedItems(newSelected);
      setLeftItemSelected([]);
    }
  };

  const moveLeft = () => {
    if (tabIndex === 0) {
      // Filtering out only the rows selected in the right list which AREN'T stored
      const toRemoveIds = rightProductSelected.filter(p => !p.stored).map(p => p.rowId);
      setSelectedProducts(selectedProducts.filter(p => !toRemoveIds.includes(p.rowId)));
      setRightProductSelected([]);
    } else {
      const toRemoveIds = rightItemSelected.filter(i => !i.stored).map(i => i.rowId);
      setSelectedItems(selectedItems.filter(i => !toRemoveIds.includes(i.rowId)));
      setRightItemSelected([]);
    }
  };

  // handleRemisionQtyChange removed because right-side editing is disabled
 
  const makeAndDownloadPDF = async (remisionId) => {
    try {
      const remisionData = {
        remisionId,
        fecha: new Date().toLocaleDateString(),
        description: description,
        projectId: projectId,
        products: selectedProducts.filter(p => !p.stored).reduce((acc, p) => {
          // Aggregate by product_id
          const existing = acc.find(x => x.product_id === p.product_id);
          if (existing) {
             existing.cantidad = Number(existing.cantidad) + Number(p.remisionQty);
          } else {
             acc.push({
               product_id: p.product_id,
               name: p.product_name,
               cantidad: p.remisionQty,
               components: (p.items || []).map(comp => ({
                 name: comp.item_name,
                 quantity: comp.quantity, // reference quantity
               }))
             });
          }
          return acc;
        }, []).map(p => ({
          ...p,
          components: p.components.map(comp => ({
            name: comp.name,
            totalQuantity: (Number(comp.quantity) * Number(p.cantidad))
          }))
        })),
        items: selectedItems.filter(i => !i.stored).reduce((acc, i) => {
          // Aggregate by item_id
          const existing = acc.find(x => x.item_id === i.item_id);
          if (existing) {
             existing.cantidad = Number(existing.cantidad) + Number(i.remisionQty);
          } else {
             acc.push({
               item_id: i.item_id,
               description: i.item_name,
               cantidad: i.remisionQty
             });
          }
          return acc;
        }, []),
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
      // Aggregate quantities by ID before saving
      const aggregate = (list, idField) => list.filter(x => !x.stored).reduce((acc, x) => {
        const id = x[idField];
        if (!acc[id]) acc[id] = 0;
        acc[id] += Number(x.remisionQty);
        return acc;
      }, {});

      const aggregatedProducts = aggregate(selectedProducts, 'product_id');
      const aggregatedItems = aggregate(selectedItems, 'item_id');

      const payload = {
        description,
        company,
        fkUser: decrypt(sessionStorage.getItem('userId')),
        fk_proyect: projectId,
        net_products: Object.entries(aggregatedProducts).map(([id, qty]) => ({ id: Number(id), quantity: qty })),
        net_items: Object.entries(aggregatedItems).map(([id, qty]) => ({ id: Number(id), quantity: qty }))
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
              
              const currentOnRightSum = selected.filter(s => (type === 'product' ? s.product_id : s.item_id) === id)
                .reduce((sum, s) => sum + Number(s.remisionQty || 0), 0);
              
              const maxAvailable = Number(item.quantity) - Number(item.remitted_quantity || 0) - currentOnRightSum;

              return (
                <ListItem key={id} dense sx={{ borderBottom: '1px solid #f1f5f9' }}>
                  <ListItemIcon sx={{ minWidth: 40 }} onClick={() => handleToggle(item, 'left', type)}>
                    <Checkbox checked={leftSel.some(i => (type === 'product' ? i.product_id : i.item_id) === id)} size="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={name} 
                    secondary={`Queda: ${maxAvailable}`} 
                    primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                  />
                  <TextField 
                    size="small"
                    type="number"
                    value={leftQuantities[id] || ''}
                    placeholder="Cant."
                    onChange={(e) => {
                      const val = Math.max(1, Math.min(maxAvailable, Number(e.target.value)));
                      setLeftQuantities(prev => ({ ...prev, [id]: val }));
                    }}
                    sx={{ 
                      width: 65, 
                      ml: 1, 
                      '& .MuiInputBase-root': {
                        backgroundColor: '#fff',
                        fontSize: '0.75rem'
                      },
                      '& .MuiInputBase-input': { 
                        p: '6px 8px',
                        textAlign: 'center'
                      } 
                    }}
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
              const name = type === 'product' ? item.product_name : item.item_name;
              return (
                <ListItem key={item.rowId} dense sx={{ borderBottom: '1px solid #f1f5f9', opacity: item.stored ? 0.7 : 1 }}>
                  <ListItemIcon sx={{ minWidth: 40 }} onClick={() => !item.stored && handleToggle(item, 'right', type)}>
                    <Checkbox 
                      checked={rightSel.some(i => i.rowId === item.rowId)} 
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
                    disabled={true}
                    sx={{ 
                      width: 65, 
                      ml: 1, 
                      '& .MuiInputBase-root': {
                        backgroundColor: '#f1f5f9',
                        fontSize: '0.75rem'
                      },
                      '& .MuiInputBase-input': { 
                        p: '6px 8px',
                        textAlign: 'center',
                        color: '#475569'
                      } 
                    }}
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
