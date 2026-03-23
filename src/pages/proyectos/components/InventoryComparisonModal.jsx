import React, { useState, useEffect, useMemo } from 'react';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  TextField,
  MenuItem,
  Select,
  ToggleButton,
  ToggleButtonGroup,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  InputAdornment,
  IconButton
} from '@mui/material';
import { 
  MagnifyingGlassIcon,
  ListBulletIcon,
  Squares2X2Icon,
  CalendarDaysIcon,
  SunIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import { Loader } from '../../../components/loaders';

export default function InventoryComparisonModal({ open, onClose }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  
  // Filters and Modes
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'cards'

  const company = sessionStorage.getItem('company');

  useEffect(() => {
    if (open) {
      setLoading(true);
      // Fetch inventory comparison
      axios.get(`/getInventoryComparison/${company}`)
        .then(res => {
          const result = res.data.data || [];
          setData(result);
        })
        .catch(err => {
          console.error("Error fetching inventory comparison", err);
        })
        .finally(() => {
          setLoading(false);
        });
        
      // Fetch categories
      axios.get(`/getItemGroup/${company}`)
        .then(res => {
          setCategories(res.data.data || res.data || []);
        })
        .catch(err => console.error("Error fetching categories", err));
    }
  }, [open, company]);

  const handleViewChange = (event, newMode) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };

  // Filter Logic
  const filteredData = useMemo(() => {
    return data.filter(item => {
      // Name filter
      if (searchText && !item.item_name.toLowerCase().includes(searchText.toLowerCase())) {
        return false;
      }
      
      // Category filter
      if (selectedCategory !== 'all' && String(item.category) !== String(selectedCategory)) {
        return false;
      }
      
      // Status filter
      const total = item.total_inventory;
      const available = item.available_inventory;
      const ratio = total > 0 ? available / total : 0;
      
      if (selectedStatus === 'good') {
        if (ratio < 0.3) return false;
      } else if (selectedStatus === 'low') {
        if (ratio >= 0.3 || available <= 0) return false;
      } else if (selectedStatus === 'none') {
        if (available > 0) return false;
      }
      
      return true;
    });
  }, [data, searchText, selectedCategory, selectedStatus]);

  // Aggregates for summary cards
  const summary = useMemo(() => {
    return data.reduce((acc, item) => {
      acc.totalItems += 1;
      acc.committed += Math.max(0, item.separated_inventory);
      acc.available += Math.max(0, item.available_inventory);
      return acc;
    }, { totalItems: 0, committed: 0, available: 0 });
  }, [data]);

  // View components
  const renderListView = () => (
    <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
      <Table size="small">
        <TableHead sx={{ bgcolor: '#f8fafc' }}>
          <TableRow>
            <TableCell sx={{ color: '#64748b', fontWeight: 600, fontSize: '0.75rem' }}>ÍTEM</TableCell>
            <TableCell align="center" sx={{ color: '#64748b', fontWeight: 600, fontSize: '0.75rem' }}>TOTAL INV.</TableCell>
            <TableCell align="center" sx={{ color: '#64748b', fontWeight: 600, fontSize: '0.75rem' }}>COMPROMETIDO</TableCell>
            <TableCell align="center" sx={{ color: '#64748b', fontWeight: 600, fontSize: '0.75rem', width: '25%' }}>DISPONIBLE LIBRE</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredData.length > 0 ? filteredData.map((row) => {
            const total = Math.max(0, row.total_inventory);
            const comp = Math.max(0, row.separated_inventory);
            const lib = Math.max(0, row.available_inventory);
            const ratio = total > 0 ? (lib / total) * 100 : 0;
            const isNone = lib <= 0;
            const isLow = !isNone && ratio < 30;
            
            // Map category name
            const catObj = categories.find(c => String(c.id) === String(row.category));
            const catName = catObj ? catObj.description || catObj.name : 'SIN CATEGORÍA';

            return (
              <TableRow key={row.id}>
                <TableCell>
                  <Typography variant="body2" fontWeight={600} color="#1e293b">{row.item_name}</Typography>
                  <Typography variant="caption" color="#94a3b8" sx={{ textTransform: 'uppercase' }}>{catName}</Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="body2" fontWeight={700} color="primary.main">{total}</Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="body2" color={comp > 0 ? "#64748b" : "#cbd5e1"}>
                    {comp > 0 ? comp : '—'}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Box display="flex" alignItems="center" justifyContent="flex-end" gap={2}>
                    <Chip 
                      size="small" 
                      label={`● ${lib}`} 
                      sx={{ 
                        bgcolor: isNone ? '#ffe4e6' : isLow ? '#fef3c7' : '#dcfce7',
                        color: isNone ? '#e11d48' : isLow ? '#d97706' : '#16a34a',
                        fontWeight: 700,
                        px: 1,
                        '.MuiChip-label': { px: 1 }
                      }} 
                    />
                    <Box sx={{ width: '60px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                       <Typography variant="caption" color="#64748b">{Math.round(ratio)}%</Typography>
                       <LinearProgress 
                         variant="determinate" 
                         value={Math.min(100, Math.max(0, ratio))} 
                         sx={{ 
                           width: '100%', 
                           height: 4, 
                           borderRadius: 2,
                           bgcolor: '#e2e8f0',
                           '& .MuiLinearProgress-bar': {
                             bgcolor: isNone ? '#e11d48' : isLow ? '#f59e0b' : '#10b981'
                           }
                         }} 
                       />
                    </Box>
                  </Box>
                </TableCell>
              </TableRow>
            );
          }) : (
            <TableRow>
              <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                <Typography color="text.secondary">No se encontraron ítems</Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderCardsView = () => (
    <Grid container spacing={2}>
      {filteredData.length > 0 ? filteredData.map((row) => {
        const total = Math.max(0, row.total_inventory);
        const comp = Math.max(0, row.separated_inventory);
        const lib = Math.max(0, row.available_inventory);
        const ratio = total > 0 ? (lib / total) * 100 : 0;
        const compRatio = total > 0 ? (comp / total) * 100 : 0;
        
        const isNone = lib <= 0;
        const isLow = !isNone && ratio < 30;

        const catObj = categories.find(c => String(c.id) === String(row.category));
        const catName = catObj ? catObj.description || catObj.name : 'SIN CATEGORÍA';

        return (
          <Grid item xs={12} sm={6} key={row.id}>
            <Card variant="outlined" sx={{ borderRadius: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                  <Box flex={1} mr={2}>
                    <Typography variant="body1" fontWeight={700} color="#1e293b" sx={{ lineHeight: 1.2 }}>
                      {row.item_name}
                    </Typography>
                    <Typography variant="caption" color="#94a3b8" sx={{ textTransform: 'uppercase' }}>
                      {catName}
                    </Typography>
                  </Box>
                  <Chip 
                    size="small" 
                    label={`● ${lib}`} 
                    sx={{ 
                      bgcolor: isNone ? '#ffe4e6' : isLow ? '#fef3c7' : '#dcfce7',
                      color: isNone ? '#e11d48' : isLow ? '#d97706' : '#16a34a',
                      fontWeight: 700
                    }} 
                  />
                </Box>

                <Grid container spacing={1} mb={2} mt={1}>
                  <Grid item xs={4}>
                    <Box bgcolor="#f1f5f9" borderRadius={2} p={1} textAlign="center">
                      <Typography variant="h6" fontWeight={700} color="primary.main">{total}</Typography>
                      <Typography variant="caption" color="#64748b" fontWeight={600} fontSize="0.65rem">TOTAL</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box bgcolor="#f8fafc" borderRadius={2} p={1} textAlign="center">
                      <Typography variant="h6" fontWeight={700} color="#f59e0b">{comp}</Typography>
                      <Typography variant="caption" color="#64748b" fontWeight={600} fontSize="0.65rem">COMP.</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box bgcolor="#f0fdf4" borderRadius={2} p={1} textAlign="center">
                      <Typography variant="h6" fontWeight={700} color="#10b981">{lib}</Typography>
                      <Typography variant="caption" color="#64748b" fontWeight={600} fontSize="0.65rem">LIBRE</Typography>
                    </Box>
                  </Grid>
                </Grid>

                <Box display="flex" justifyContent="space-between" mb={0.5}>
                  <Typography variant="caption" color="#64748b" fontWeight={500}>Comprometido</Typography>
                  <Typography variant="caption" color="#64748b" fontWeight={500}>Disponible</Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={Math.min(100, Math.max(0, compRatio))} 
                  sx={{ 
                    height: 6, 
                    borderRadius: 3,
                    bgcolor: isNone ? '#e11d48' : isLow ? '#f59e0b' : '#10b981',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: '#f59e0b',
                    }
                  }} 
                />
              </CardContent>
            </Card>
          </Grid>
        );
      }) : (
        <Grid item xs={12}>
          <Typography color="text.secondary" textAlign="center" py={4}>No se encontraron ítems</Typography>
        </Grid>
      )}
    </Grid>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth PaperProps={{ sx: { borderRadius: 3, bgcolor: '#f8fafc' } }}>
      <DialogTitle sx={{ display: 'none' }}>Comparativa de Inventario</DialogTitle>
      <DialogContent sx={{ p: 0 }}>
        {loading ? (
          <Box py={8} display="flex" justifyContent="center">
            <Loader />
          </Box>
        ) : (
          <Box sx={{ p: { xs: 2, md: 4 } }}>
            {/* Header Section */}
            <Box mb={4}>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="h4" fontWeight={800} color="#1e293b" mb={0.5}>
                    Comparativa de <Box component="span" color="primary.main">Inventario</Box>
                  </Typography>
                  <Typography variant="body2" color="#64748b" mb={3}>
                    Stock total · comprometido en proyectos · disponible libre
                  </Typography>
                </Box>
                <IconButton onClick={onClose} size="small" sx={{ bgcolor: '#f1f5f9', '&:hover': { bgcolor: '#e2e8f0' } }}>
                  <XMarkIcon className="w-5 h-5 text-gray-500" />
                </IconButton>
              </Box>

              <Box display="flex" alignItems="center" gap={2} mb={3} flexWrap="wrap">
                <Typography variant="caption" fontWeight={700} color="#94a3b8" letterSpacing={1}>DISPONIBILIDAD:</Typography>
                <Chip size="small" variant="outlined" label="● Buena disponibilidad (≥ 30%)" sx={{ borderColor: '#86efac', color: '#16a34a', bgcolor: '#fff', '& .MuiChip-label': { fontWeight: 500 } }} />
                <Chip size="small" variant="outlined" label="● Stock bajo (< 30%)" sx={{ borderColor: '#fde047', color: '#d97706', bgcolor: '#fff', '& .MuiChip-label': { fontWeight: 500 } }} />
                <Chip size="small" variant="outlined" label="● Sin stock libre" sx={{ borderColor: '#fca5a5', color: '#e11d48', bgcolor: '#fff', '& .MuiChip-label': { fontWeight: 500 } }} />
              </Box>

              {/* Filters */}
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={4}>
                  <TextField 
                    fullWidth 
                    size="small" 
                    placeholder="Buscar ítem..." 
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><MagnifyingGlassIcon className="w-5 h-5 text-gray-400" /></InputAdornment>,
                      sx: { bgcolor: '#fff', borderRadius: 2 }
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <Select 
                    fullWidth 
                    size="small" 
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    sx={{ bgcolor: '#fff', borderRadius: 2 }}
                  >
                    <MenuItem value="all">Todas las categorías</MenuItem>
                    {categories.map((c, i) => (
                      <MenuItem key={i} value={c.id || c.value}>{c.description || c.label || c.name || `Categoría ${c.id}`}</MenuItem>
                    ))}
                  </Select>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Select 
                    fullWidth 
                    size="small" 
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    sx={{ bgcolor: '#fff', borderRadius: 2 }}
                  >
                    <MenuItem value="all">Todos los estados</MenuItem>
                    <MenuItem value="good">Buena disponibilidad</MenuItem>
                    <MenuItem value="low">Stock bajo</MenuItem>
                    <MenuItem value="none">Sin stock libre</MenuItem>
                  </Select>
                </Grid>
                <Grid item xs={12} md={2} display="flex" justifyContent="flex-end">
                  <ToggleButtonGroup
                    value={viewMode}
                    exclusive
                    onChange={handleViewChange}
                    size="small"
                    sx={{ bgcolor: '#fff' }}
                  >
                    <ToggleButton value="list">
                      <ListBulletIcon className="w-5 h-5" />
                    </ToggleButton>
                    <ToggleButton value="cards">
                      <Squares2X2Icon className="w-5 h-5" />
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Grid>
              </Grid>
            </Box>

            {/* Summary Cards */}
            <Grid container spacing={2} mb={4}>
              <Grid item xs={12} md={4}>
                <Card sx={{ borderRadius: 3, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', p: 2 }}>
                  <Box sx={{ bgcolor: '#eff6ff', p: 1.5, borderRadius: 2, mr: 2, display: 'flex' }}>
                    <CalendarDaysIcon className="w-6 h-6 text-blue-600" />
                  </Box>
                  <Box>
                    <Typography variant="caption" fontWeight={600} color="#94a3b8" letterSpacing={1}>ÍTEMS</Typography>
                    <Typography variant="h4" fontWeight={800} color="primary.main" lineHeight={1}>{summary.totalItems}</Typography>
                  </Box>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card sx={{ borderRadius: 3, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', p: 2 }}>
                  <Box sx={{ bgcolor: '#fffbeb', p: 1.5, borderRadius: 2, mr: 2, display: 'flex' }}>
                    <SunIcon className="w-6 h-6 text-amber-500" />
                  </Box>
                  <Box>
                    <Typography variant="caption" fontWeight={600} color="#94a3b8" letterSpacing={1}>COMPROMETIDO</Typography>
                    <Typography variant="h4" fontWeight={800} color="#f59e0b" lineHeight={1}>{summary.committed}</Typography>
                  </Box>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card sx={{ borderRadius: 3, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', p: 2 }}>
                  <Box sx={{ bgcolor: '#f0fdf4', p: 1.5, borderRadius: 2, mr: 2, display: 'flex' }}>
                    <CheckCircleIcon className="w-6 h-6 text-emerald-600" />
                  </Box>
                  <Box>
                    <Typography variant="caption" fontWeight={600} color="#94a3b8" letterSpacing={1}>DISPONIBLE LIBRE</Typography>
                    <Typography variant="h4" fontWeight={800} color="#10b981" lineHeight={1}>{summary.available}</Typography>
                  </Box>
                </Card>
              </Grid>
            </Grid>

            {/* Content Area */}
            <Typography variant="body2" color="#64748b" mb={2}>
              Mostrando <strong>{filteredData.length}</strong> de <strong>{data.length}</strong> ítems
            </Typography>

            {viewMode === 'list' ? renderListView() : renderCardsView()}
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 4, py: 2, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
        <Button onClick={onClose} variant="outlined" color="inherit" sx={{ borderRadius: 2, fontWeight: 600 }}>
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
