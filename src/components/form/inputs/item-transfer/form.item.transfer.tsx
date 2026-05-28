import React, { useState, useEffect, useCallback, useMemo, useRef, memo } from 'react';
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
  Button,
  Chip,
  Divider,
} from '@mui/material';
import axios from 'axios';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface ProjectItem {
  id?: any;
  item_id?: any;
  fk_item?: any;
  quantity: number | string;
  variable?: string;
  value1?: number | string;
  value2?: number | string;
  [key: string]: any;
}

interface FormItemTransferProps {
  name: string;
  value: ProjectItem[];
  onChange: (e: { target: { name: string; value: ProjectItem[] } }) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Left-panel row
// Configures: ¿Es variable?, Cantidad (si no variable), Valor1/Valor2 (si variable)
// ─────────────────────────────────────────────────────────────────────────────

interface LeftRowProps {
  item: any;
  groupName: string;
  isSelected: boolean;
  variable: string;
  quantity: number | string;
  value1: number | string;
  value2: number | string;
  onToggle: (item: any) => void;
  onFieldChange: (id: any, field: string, val: any) => void;
}

const LeftItemRow = memo(
  ({ item, groupName, isSelected, variable, quantity, value1, value2, onToggle, onFieldChange }: LeftRowProps) => {
    const isVariable = variable === '1';
    return (
      <React.Fragment>
        <ListItem
          component="div"
          onClick={() => onToggle(item)}
          sx={{
            cursor: 'pointer',
            bgcolor: isSelected ? 'primary.50' : 'transparent',
            '&:hover': { bgcolor: isSelected ? 'primary.100' : 'action.hover' },
            transition: 'background-color 0.15s',
            alignItems: 'flex-start',
            flexDirection: 'column',
            py: 1,
          }}
        >
          {/* Name row */}
          <Box display="flex" alignItems="center" width="100%">
            <ListItemIcon sx={{ minWidth: 36 }}>
              <Checkbox edge="start" checked={isSelected} tabIndex={-1} disableRipple size="small" />
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography variant="body2" fontWeight={isSelected ? 600 : 400}>
                  {item.description || item.name || item.item_name || `Item #${item.id}`}
                </Typography>
              }
              secondary={
                <Chip label={groupName} size="small" variant="outlined" sx={{ mt: 0.25, height: 18, fontSize: 10 }} />
              }
            />
          </Box>

          {/* Config section — only when selected */}
          {isSelected && (
            <Box
              width="100%"
              pl="36px"
              pt={1}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Row 1: ¿Es variable? — full width */}
              <FormControl fullWidth size="small" sx={{ mb: 1 }}>
                <InputLabel>¿Es variable?</InputLabel>
                <Select
                  value={variable}
                  label="¿Es variable?"
                  onChange={(e) => onFieldChange(item.id, 'variable', e.target.value)}
                >
                  <MenuItem value="0">No</MenuItem>
                  <MenuItem value="1">Sí</MenuItem>
                </Select>
              </FormControl>

              {/* Row 2: Cantidad (full width) OR Valor1+Valor2 (50/50) */}
              {!isVariable ? (
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Cantidad"
                  value={quantity}
                  onChange={(e) =>
                    onFieldChange(item.id, 'quantity', e.target.value === '' ? '' : parseFloat(e.target.value))
                  }
                  onBlur={(e) => {
                    const v = parseFloat(e.target.value);
                    if (!v || v <= 0) onFieldChange(item.id, 'quantity', 1);
                  }}
                  inputProps={{ min: 0, step: '0.01' }}
                />
              ) : (
                <Box display="flex" gap={1}>
                  <TextField
                    size="small"
                    type="number"
                    label="Valor 1"
                    sx={{ flex: 1 }}
                    value={value1}
                    onChange={(e) => onFieldChange(item.id, 'value1', e.target.value)}
                    inputProps={{ step: '0.01' }}
                  />
                  <TextField
                    size="small"
                    type="number"
                    label="Valor 2"
                    sx={{ flex: 1 }}
                    value={value2}
                    onChange={(e) => onFieldChange(item.id, 'value2', e.target.value)}
                    inputProps={{ step: '0.01' }}
                  />
                </Box>
              )}
            </Box>
          )}
        </ListItem>
        <Divider component="li" />
      </React.Fragment>
    );
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// Right-panel row
// Shows configured data. No ¿Es variable? selector.
// Variable → Valor1/Valor2 (editable). No variable → Cantidad (editable).
// ─────────────────────────────────────────────────────────────────────────────

interface RightRowProps {
  item: ProjectItem;
  displayName: string;
  isSelectedRight: boolean;
  onToggle: (item: any) => void;
}

const RightItemRow = memo(
  ({ item, displayName, isSelectedRight, onToggle }: RightRowProps) => {
    const isVariable = item.variable === '1';

    return (
      <React.Fragment>
        <ListItem
          component="div"
          alignItems="flex-start"
          onClick={() => onToggle(item)}
          sx={{
            cursor: 'pointer',
            bgcolor: isSelectedRight ? 'error.50' : 'transparent',
            '&:hover': { bgcolor: isSelectedRight ? 'error.100' : 'action.hover' },
            transition: 'background-color 0.15s',
            flexDirection: 'column',
            py: 1.5,
            px: 2,
          }}
        >
          {/* Row 1: checkbox + name + badge */}
          <Box display="flex" alignItems="center" width="100%" mb={1}>
            <Checkbox
              edge="start"
              checked={isSelectedRight}
              tabIndex={-1}
              disableRipple
              size="small"
              sx={{ p: 0, mr: 1 }}
            />
            <Typography variant="body2" fontWeight={600} sx={{ flex: 1 }}>
              {displayName}
            </Typography>
            {isVariable && (
              <Chip
                label="Variable"
                size="small"
                color="warning"
                variant="outlined"
                sx={{ height: 20, fontSize: 10, ml: 1 }}
              />
            )}
          </Box>

          {/* Row 2: read-only values */}
          <Box width="100%" onClick={(e) => e.stopPropagation()}>
            {isVariable ? (
              /* Valor 1 y Valor 2 — each 50% */
              <Box display="flex" gap={1}>
                <TextField
                  size="small"
                  type="number"
                  label="Valor 1"
                  sx={{ flex: 1 }}
                  value={item.value1 ?? ''}
                  InputProps={{ readOnly: true }}
                  inputProps={{ step: '0.01', tabIndex: -1 }}
                />
                <TextField
                  size="small"
                  type="number"
                  label="Valor 2"
                  sx={{ flex: 1 }}
                  value={item.value2 ?? ''}
                  InputProps={{ readOnly: true }}
                  inputProps={{ step: '0.01', tabIndex: -1 }}
                />
              </Box>
            ) : (
              /* Cantidad — full width */
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Cantidad"
                value={item.quantity ?? 1}
                InputProps={{ readOnly: true }}
                inputProps={{ min: 0, step: '0.01', tabIndex: -1 }}
              />
            )}
          </Box>
        </ListItem>
        <Divider component="li" />
      </React.Fragment>
    );
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// Main component

// ─────────────────────────────────────────────────────────────────────────────

function FormItemTransfer({ name, value, onChange }: FormItemTransferProps) {
  const company = useRef(sessionStorage.getItem('company')).current;
  const onChangeRef = useRef(onChange);
  const nameRef = useRef(name);
  useEffect(() => { onChangeRef.current = onChange; });
  useEffect(() => { nameRef.current = name; });

  const [items, setItems] = useState<any[]>([]);
  const [itemGroups, setItemGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [filterGroup, setFilterGroup] = useState('');
  const [filterName, setFilterName] = useState('');

  const [leftSelected, setLeftSelected] = useState<any[]>([]);
  const [rightSelected, setRightSelected] = useState<any[]>([]);

  const valueRef = useRef<ProjectItem[]>(Array.isArray(value) ? value : []);
  const [localItems, setLocalItems] = useState<ProjectItem[]>(
    Array.isArray(value) ? value : []
  );

  const prevValueRef = useRef(value);
  useEffect(() => {
    if (prevValueRef.current !== value) {
      prevValueRef.current = value;
      const next = Array.isArray(value) ? value : [];
      setLocalItems(next);
      valueRef.current = next;
    }
  }, [value]);

  // ─── Fetch ─────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [itemsRes, groupsRes] = await Promise.all([
        axios.get(`/getItem/${company}`),
        axios.get(`/getItemGroup/${company}`),
      ]);
      const extractData = (res: any) =>
        Array.isArray(res.data) ? res.data : res.data?.data || [];
      setItems(extractData(itemsRes));
      setItemGroups(extractData(groupsRes));
    } catch (err) {
      console.error('Error fetching items transfer list:', err);
    } finally {
      setLoading(false);
    }
  }, [company]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ─── Left-panel handlers ────────────────────────────────────────────────

  const handleToggleLeft = useCallback((item: any) => {
    setLeftSelected((prev) => {
      const idx = prev.findIndex((i) => String(i.id) === String(item.id));
      if (idx === -1) {
        return [...prev, { ...item, item_id: item.id, quantity: 1, variable: '0', value1: '', value2: '' }];
      }
      return prev.filter((_, i) => i !== idx);
    });
  }, []);

  /** Update any field on a left-panel pending item */
  const handleLeftFieldChange = useCallback((itemId: any, field: string, val: any) => {
    setLeftSelected((prev) =>
      prev.map((item) =>
        String(item.id) === String(itemId) ? { ...item, [field]: val } : item
      )
    );
  }, []);

  // ─── Right-panel handlers ───────────────────────────────────────────────

  const handleRightToggle = useCallback((item: any) => {
    setRightSelected((prev) => {
      const idx = prev.findIndex((s) => s.id === item.id);
      if (idx === -1) return [...prev, item];
      return prev.filter((_, i) => i !== idx);
    });
  }, []);

  const handleRightFieldChangeLocal = useCallback((itemId: any, field: string, val: any) => {
    setLocalItems((prev) => {
      const next = prev.map((pi) => {
        const id = pi.item_id ?? pi.fk_item ?? pi.id;
        return String(id) === String(itemId) ? { ...pi, [field]: val } : pi;
      });
      valueRef.current = next;
      return next;
    });
  }, []);

  const flushToParent = useCallback(() => {
    onChangeRef.current({ target: { name: nameRef.current, value: valueRef.current } });
  }, []);

  const handleRightQuantityBlur = useCallback(
    (itemId: any, quantity: any) => {
      if (quantity === '' || isNaN(Number(quantity)) || Number(quantity) <= 0) {
        handleRightFieldChangeLocal(itemId, 'quantity', 1);
      }
      flushToParent();
    },
    [handleRightFieldChangeLocal, flushToParent]
  );

  // ─── Move items ─────────────────────────────────────────────────────────

  const moveRight = useCallback(() => {
    const next = [...valueRef.current, ...leftSelected];
    valueRef.current = next;
    setLocalItems(next);
    onChangeRef.current({ target: { name: nameRef.current, value: next } });
    setLeftSelected([]);
  }, [leftSelected]);

  const moveLeft = useCallback(() => {
    const next = valueRef.current.filter(
      (p) => !rightSelected.some((rs) => String(rs.id) === String(p.id))
    );
    valueRef.current = next;
    setLocalItems(next);
    onChangeRef.current({ target: { name: nameRef.current, value: next } });
    setRightSelected([]);
  }, [rightSelected]);

  // ─── Memoised derived data ──────────────────────────────────────────────

  const availableItems = useMemo(
    () =>
      items
        .filter((p) =>
          !localItems.some((pp) => {
            const pId = String(p.id);
            return (
              String(pp.fk_item) === pId ||
              String(pp.item_id) === pId ||
              String(pp.id) === pId ||
              String(pp.item?.id) === pId ||
              (pp.description === p.description && String(pp.id) === pId)
            );
          })
        )
        .filter((p) =>
          filterGroup ? String(p.group_item || p.fk_group_item) === String(filterGroup) : true
        )
        .filter((p) =>
          filterName
            ? (p.description || p.name || '').toLowerCase().includes(filterName.toLowerCase())
            : true
        ),
    [items, localItems, filterGroup, filterName]
  );

  const groupMap = useMemo<Record<string, string>>(() => {
    const m: Record<string, string> = {};
    itemGroups.forEach((g) => { m[String(g.id)] = g.name || g.description; });
    return m;
  }, [itemGroups]);

  const itemMap = useMemo<Record<string, any>>(() => {
    const m: Record<string, any> = {};
    items.forEach((i) => { m[String(i.id)] = i; });
    return m;
  }, [items]);

  // Map for O(1) left-selected lookup (includes field values)
  const leftSelectedMap = useMemo<Record<string, any>>(() => {
    const m: Record<string, any> = {};
    leftSelected.forEach((s) => { m[String(s.id)] = s; });
    return m;
  }, [leftSelected]);

  const rightSelectedSet = useMemo<Set<string>>(
    () => new Set(rightSelected.map((s) => String(s.id))),
    [rightSelected]
  );

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">Cargando items...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Grid container spacing={2} alignItems="stretch">
        {/* ── LEFT LIST ─────────────────────────────────────────────────── */}
        <Grid item xs={12} md={5}>
          <Paper
            elevation={0}
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                px: 2,
                py: 1.5,
                bgcolor: 'grey.50',
                borderBottom: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                Items Disponibles
              </Typography>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Grupo</InputLabel>
                    <Select
                      value={filterGroup}
                      label="Grupo"
                      onChange={(e) => setFilterGroup(e.target.value)}
                    >
                      <MenuItem value=""><em>Todos</em></MenuItem>
                      {itemGroups.map((g) => (
                        <MenuItem key={g.id} value={g.id}>{g.name || g.description}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Buscar"
                    value={filterName}
                    onChange={(e) => setFilterName(e.target.value)}
                  />
                </Grid>
              </Grid>
            </Box>

            <List disablePadding sx={{ flex: 1, overflowY: 'auto', maxHeight: 380 }}>
              {availableItems.map((item) => {
                const sel = leftSelectedMap[String(item.id)];
                return (
                  <LeftItemRow
                    key={item.id}
                    item={item}
                    groupName={groupMap[String(item.group_item || item.fk_group_item)] || 'N/A'}
                    isSelected={!!sel}
                    variable={sel?.variable ?? '0'}
                    quantity={sel?.quantity ?? 1}
                    value1={sel?.value1 ?? ''}
                    value2={sel?.value2 ?? ''}
                    onToggle={handleToggleLeft}
                    onFieldChange={handleLeftFieldChange}
                  />
                );
              })}
              {availableItems.length === 0 && (
                <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
                  <Typography variant="body2">No se encontraron items disponibles</Typography>
                </Box>
              )}
            </List>
          </Paper>
        </Grid>

        {/* ── MIDDLE BUTTONS ───────────────────────────────────────────── */}
        <Grid
          item
          xs={12}
          md={2}
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          gap={1.5}
        >
          <Button
            variant="contained"
            color="primary"
            onClick={moveRight}
            disabled={leftSelected.length === 0}
            sx={{ minWidth: 44, width: 44, height: 44, borderRadius: '50%', p: 0, fontSize: 18 }}
          >
            ›
          </Button>
          <Button
            variant="outlined"
            color="primary"
            onClick={moveLeft}
            disabled={rightSelected.length === 0}
            sx={{ minWidth: 44, width: 44, height: 44, borderRadius: '50%', p: 0, fontSize: 18 }}
          >
            ‹
          </Button>
        </Grid>

        {/* ── RIGHT LIST ────────────────────────────────────────────────── */}
        <Grid item xs={12} md={5}>
          <Paper
            elevation={0}
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                px: 2,
                py: 1.5,
                bgcolor: 'primary.50',
                borderBottom: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Typography variant="subtitle2" fontWeight={700}>
                Items del Producto
              </Typography>
              <Chip
                label={`${localItems.length} elementos`}
                size="small"
                color="primary"
                variant="filled"
                sx={{ fontWeight: 600 }}
              />
            </Box>

            <List disablePadding sx={{ flex: 1, overflowY: 'auto', maxHeight: 420 }}>
              {localItems.map((item) => {
                const itemId = item.item_id ?? item.fk_item ?? item.id;
                const fullItem = itemMap[String(itemId)] || item;
                const displayName =
                  fullItem.description || fullItem.name || fullItem.item_name || `Item #${fullItem.id}`;

                return (
                  <RightItemRow
                    key={String(itemId)}
                    item={item}
                    displayName={displayName}
                    isSelectedRight={rightSelectedSet.has(String(item.id))}
                    onToggle={handleRightToggle}
                  />
                );
              })}
              {localItems.length === 0 && (
                <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
                  <Typography variant="body2">No hay items asignados a este producto</Typography>
                  <Typography variant="caption">Selecciona items de la lista izquierda</Typography>
                </Box>
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

/**
 * Only re-render when the value array reference actually changes.
 * Prevents re-renders when the parent (BaseForm) re-renders due to
 * other field changes (e.g. typing in description).
 */
export default memo(FormItemTransfer, (prev, next) => prev.value === next.value);
