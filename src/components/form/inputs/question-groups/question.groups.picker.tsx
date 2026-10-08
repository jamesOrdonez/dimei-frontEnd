import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import {
  Grid,
  Paper,
  Box,
  Typography,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
  Button,
  IconButton,
  Chip,
  Divider,
  CircularProgress,
  InputAdornment,
  Tooltip,
} from '@mui/material';
import {
  MagnifyingGlassIcon,
  Bars3Icon,
  ChevronUpIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface QuestionGroupsPickerProps {
  name: string;
  label?: string;
  value: any;
  onChange: (e: { target: { name: string; value: number[]; type: string } }) => void;
  /** ID del Sistema Motriz (elevatorType) seleccionado en el formulario del equipo */
  highlightTypeId?: number | string | null;
  required?: boolean;
}

interface QuestionGroup {
  id: number;
  name: string;
  elevator_type_id: number | null;
  systemType?: {
    id: number;
    elevatorType: string;
  };
  questions?: any[];
}

// ─── Fila Ordenable en el Panel Derecho (Drag & Drop) ─────────────────────────
interface SortableAssignedItemProps {
  group: QuestionGroup;
  index: number;
  total: number;
  isSelected: boolean;
  onToggle: (id: number) => void;
  onDoubleClick: (id: number) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
}

function SortableAssignedItem({
  group,
  index,
  total,
  isSelected,
  onToggle,
  onDoubleClick,
  onMoveUp,
  onMoveDown,
}: SortableAssignedItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: group.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.45 : 1,
    zIndex: isDragging ? 100 : 'auto',
    position: 'relative',
  };

  const typeName = group.systemType?.elevatorType || 'Sistema Motriz';
  const qCount = group.questions?.length || 0;

  return (
    <div ref={setNodeRef} style={style}>
      <ListItem
        component="div"
        onClick={() => onToggle(group.id)}
        onDoubleClick={() => onDoubleClick(group.id)}
        sx={{
          cursor: 'pointer',
          bgcolor: isSelected ? '#eff6ff' : '#ffffff',
          '&:hover': { bgcolor: isSelected ? '#dbeafe' : '#f8fafc' },
          transition: 'background-color 0.15s',
          py: 0.75,
          px: 1.5,
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
        }}
      >
        {/* Manilla para arrastrar (Drag Handle) */}
        <Tooltip title="Arrastra para reordenar la ubicación">
          <Box
            {...attributes}
            {...listeners}
            onClick={(e) => e.stopPropagation()}
            sx={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'grab',
              p: 0.5,
              color: '#94a3b8',
              borderRadius: 1,
              '&:hover': { color: '#2563eb', bgcolor: '#f1f5f9' },
              '&:active': { cursor: 'grabbing' },
            }}
          >
            <Bars3Icon style={{ width: 18, height: 18 }} />
          </Box>
        </Tooltip>

        {/* Checkbox para desasignar con ‹ */}
        <ListItemIcon sx={{ minWidth: 32 }}>
          <Checkbox
            edge="start"
            checked={isSelected}
            tabIndex={-1}
            disableRipple
            size="small"
            sx={{ p: 0.5 }}
          />
        </ListItemIcon>

        {/* Posición numérica */}
        <Box
          sx={{
            minWidth: 22,
            height: 22,
            borderRadius: '50%',
            bgcolor: '#f1f5f9',
            color: '#475569',
            fontSize: '0.7rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mr: 0.5,
          }}
        >
          {index + 1}
        </Box>

        {/* Texto del grupo */}
        <ListItemText
          sx={{ my: 0 }}
          primary={
            <Typography variant="body2" fontWeight={isSelected ? 600 : 500} color="#1e293b" noWrap>
              {group.name}
            </Typography>
          }
          secondary={
            <Box sx={{ display: 'flex', gap: 0.75, alignItems: 'center', mt: 0.25 }}>
              <Chip
                label={typeName}
                size="small"
                variant="outlined"
                sx={{
                  height: 18,
                  fontSize: '0.65rem',
                  color: '#64748b',
                  borderColor: '#cbd5e1',
                }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                {qCount} {qCount === 1 ? 'pregunta' : 'preguntas'}
              </Typography>
            </Box>
          }
        />

        {/* Botones rápidos de subir/bajar posición */}
        <Box
          sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 0.25 }}
          onClick={(e) => e.stopPropagation()}
        >
          <Tooltip title="Subir posición">
            <span>
              <IconButton
                size="small"
                disabled={index === 0}
                onClick={() => onMoveUp(index)}
                sx={{ p: 0.4, color: '#64748b', '&:hover': { color: '#2563eb' } }}
              >
                <ChevronUpIcon style={{ width: 15, height: 15 }} />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Bajar posición">
            <span>
              <IconButton
                size="small"
                disabled={index === total - 1}
                onClick={() => onMoveDown(index)}
                sx={{ p: 0.4, color: '#64748b', '&:hover': { color: '#2563eb' } }}
              >
                <ChevronDownIcon style={{ width: 15, height: 15 }} />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </ListItem>
      <Divider component="li" />
    </div>
  );
}

// ─── Componente Principal ─────────────────────────────────────────────────────
export default function QuestionGroupsPicker({
  name,
  value,
  onChange,
  highlightTypeId,
}: QuestionGroupsPickerProps) {
  const [allGroups, setAllGroups] = useState<QuestionGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSearch, setFilterSearch] = useState<string>('');

  // Selección en panel izquierdo y derecho (para botones › y ‹)
  const [leftSelected, setLeftSelected] = useState<number[]>([]);
  const [rightSelected, setRightSelected] = useState<number[]>([]);

  // IDs asignados preservando el orden exacto configurado
  const assignedIds = useMemo<number[]>(() => {
    if (!Array.isArray(value)) return [];
    return value.map(Number).filter((n) => !Number.isNaN(n) && n > 0);
  }, [value]);

  const assignedSet = useMemo(() => new Set(assignedIds), [assignedIds]);

  // Cargar grupos de preguntas
  useEffect(() => {
    const company = sessionStorage.getItem('company');
    axios
      .get(`/getQuestionGroups/${company}`)
      .then((res) => {
        setAllGroups(res.data.data || []);
      })
      .catch((err) => console.error('Error cargando grupos de preguntas:', err))
      .finally(() => setLoading(false));
  }, []);

  // Limpiar selección izquierda si cambia el sistema motriz
  useEffect(() => {
    setLeftSelected([]);
  }, [highlightTypeId]);

  // Mapa de grupos por ID
  const groupMap = useMemo<Record<number, QuestionGroup>>(() => {
    const map: Record<number, QuestionGroup> = {};
    allGroups.forEach((g) => {
      map[g.id] = g;
    });
    return map;
  }, [allGroups]);

  // Grupos disponibles (panel izquierdo): filtrados por Sistema Motriz y búsqueda
  const availableGroups = useMemo(() => {
    if (!highlightTypeId) return [];
    return allGroups
      .filter((g) => !assignedSet.has(g.id))
      .filter((g) => String(g.elevator_type_id) === String(highlightTypeId))
      .filter((g) => {
        if (!filterSearch.trim()) return true;
        return g.name.toLowerCase().includes(filterSearch.toLowerCase());
      });
  }, [allGroups, assignedSet, highlightTypeId, filterSearch]);

  // Grupos asignados (panel derecho): ordenados según la secuencia de assignedIds
  const assignedGroups = useMemo(() => {
    return assignedIds
      .map((id) => groupMap[id])
      .filter(Boolean);
  }, [assignedIds, groupMap]);

  // Sensor para Drag and Drop
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
  );

  // Manejar el fin del arrastre para reordenar
  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = assignedIds.indexOf(Number(active.id));
    const newIndex = assignedIds.indexOf(Number(over.id));
    if (oldIndex !== -1 && newIndex !== -1) {
      const next = arrayMove(assignedIds, oldIndex, newIndex);
      onChange({ target: { name, value: next, type: 'questionGroups' } });
    }
  };

  // Mover una posición arriba
  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    const next = arrayMove(assignedIds, index, index - 1);
    onChange({ target: { name, value: next, type: 'questionGroups' } });
  };

  // Mover una posición abajo
  const handleMoveDown = (index: number) => {
    if (index >= assignedIds.length - 1) return;
    const next = arrayMove(assignedIds, index, index + 1);
    onChange({ target: { name, value: next, type: 'questionGroups' } });
  };

  // Toggle de selección en panel izquierdo
  const toggleLeft = (id: number) => {
    setLeftSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Toggle de selección en panel derecho
  const toggleRight = (id: number) => {
    setRightSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Pasar seleccionados de la izquierda al final de la derecha
  const moveRight = useCallback(() => {
    if (leftSelected.length === 0) return;
    const next = Array.from(new Set([...assignedIds, ...leftSelected]));
    onChange({ target: { name, value: next, type: 'questionGroups' } });
    setLeftSelected([]);
  }, [assignedIds, leftSelected, name, onChange]);

  // Quitar seleccionados de la derecha
  const moveLeft = useCallback(() => {
    if (rightSelected.length === 0) return;
    const next = assignedIds.filter((id) => !rightSelected.includes(id));
    onChange({ target: { name, value: next, type: 'questionGroups' } });
    setRightSelected([]);
  }, [assignedIds, rightSelected, name, onChange]);

  // Doble clic: mover inmediatamente un elemento
  const handleDoubleClickLeft = (id: number) => {
    const next = Array.from(new Set([...assignedIds, id]));
    onChange({ target: { name, value: next, type: 'questionGroups' } });
    setLeftSelected((prev) => prev.filter((x) => x !== id));
  };

  const handleDoubleClickRight = (id: number) => {
    const next = assignedIds.filter((x) => x !== id);
    onChange({ target: { name, value: next, type: 'questionGroups' } });
    setRightSelected((prev) => prev.filter((x) => x !== id));
  };

  if (loading) {
    return (
      <Box sx={{ p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
        <CircularProgress size={24} />
        <Typography variant="body2" color="text.secondary">
          Cargando grupos de preguntas...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Grid container spacing={2} alignItems="stretch">
        {/* ── PANEL IZQUIERDO: Grupos Disponibles según Sistema Motriz ── */}
        <Grid item xs={12} md={5}>
          <Paper
            variant="outlined"
            sx={{
              borderRadius: 3,
              borderColor: '#e2e8f0',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              bgcolor: '#ffffff',
            }}
          >
            {/* Encabezado + Buscador */}
            <Box sx={{ p: 2, pb: 1.5, borderBottom: '1px solid #f1f5f9' }}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5, color: '#0f172a' }}>
                Grupos Disponibles
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="Buscar grupo..."
                value={filterSearch}
                onChange={(e) => setFilterSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MagnifyingGlassIcon style={{ width: 18, height: 18, color: '#94a3b8' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            {/* Lista de grupos disponibles */}
            <List disablePadding sx={{ flex: 1, overflowY: 'auto', maxHeight: 360, minHeight: 250 }}>
              {!highlightTypeId ? (
                <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
                  <Typography variant="body2" fontWeight={600} color="#64748b" sx={{ mb: 0.5 }}>
                    Sin Sistema Motriz seleccionado
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Selecciona un Sistema Motriz arriba para ver sus grupos de preguntas disponibles.
                  </Typography>
                </Box>
              ) : availableGroups.length > 0 ? (
                availableGroups.map((group) => {
                  const isSelected = leftSelected.includes(group.id);
                  const typeName = group.systemType?.elevatorType || 'Sistema Motriz';
                  const qCount = group.questions?.length || 0;

                  return (
                    <React.Fragment key={group.id}>
                      <ListItem
                        component="div"
                        onClick={() => toggleLeft(group.id)}
                        onDoubleClick={() => handleDoubleClickLeft(group.id)}
                        sx={{
                          cursor: 'pointer',
                          bgcolor: isSelected ? '#eff6ff' : 'transparent',
                          '&:hover': { bgcolor: isSelected ? '#dbeafe' : '#f8fafc' },
                          transition: 'background-color 0.15s',
                          py: 1,
                          px: 2,
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <Checkbox
                            edge="start"
                            checked={isSelected}
                            tabIndex={-1}
                            disableRipple
                            size="small"
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography variant="body2" fontWeight={isSelected ? 600 : 500} color="#1e293b">
                              {group.name}
                            </Typography>
                          }
                          secondary={
                            <Box sx={{ display: 'flex', gap: 0.75, alignItems: 'center', mt: 0.5 }}>
                              <Chip
                                label={typeName}
                                size="small"
                                variant="outlined"
                                sx={{
                                  height: 20,
                                  fontSize: '0.65rem',
                                  color: '#64748b',
                                  borderColor: '#cbd5e1',
                                }}
                              />
                              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                                {qCount} {qCount === 1 ? 'pregunta' : 'preguntas'}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                      <Divider component="li" />
                    </React.Fragment>
                  );
                })
              ) : (
                <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
                  <Typography variant="body2" fontWeight={600} color="#64748b" sx={{ mb: 0.5 }}>
                    No hay grupos disponibles
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {filterSearch.trim()
                      ? 'No hay grupos que coincidan con la búsqueda.'
                      : 'Todos los grupos de este Sistema Motriz ya fueron asignados, o aún no se han creado grupos para este tipo.'}
                  </Typography>
                </Box>
              )}
            </List>
          </Paper>
        </Grid>

        {/* ── BOTONES CENTRALES DE TRANSFERENCIA ──────────────────────── */}
        <Grid
          item
          xs={12}
          md={2}
          sx={{
            display: 'flex',
            flexDirection: { xs: 'row', md: 'column' },
            justifyContent: 'center',
            alignItems: 'center',
            gap: 1.5,
            py: { xs: 1, md: 0 },
          }}
        >
          <Button
            variant="contained"
            color="primary"
            onClick={moveRight}
            disabled={leftSelected.length === 0}
            aria-label="Pasar a la derecha"
            sx={{
              minWidth: 44,
              width: 44,
              height: 44,
              borderRadius: '50%',
              p: 0,
              fontSize: 20,
              fontWeight: 'bold',
              bgcolor: leftSelected.length > 0 ? '#2563eb' : '#e2e8f0',
              color: leftSelected.length > 0 ? '#ffffff' : '#94a3b8',
              boxShadow: leftSelected.length > 0 ? '0 4px 12px rgba(37,99,235,0.25)' : 'none',
              '&:hover': {
                bgcolor: leftSelected.length > 0 ? '#1d4ed8' : '#e2e8f0',
              },
            }}
          >
            ›
          </Button>

          <Button
            variant="outlined"
            color="primary"
            onClick={moveLeft}
            disabled={rightSelected.length === 0}
            aria-label="Quitar de la derecha"
            sx={{
              minWidth: 44,
              width: 44,
              height: 44,
              borderRadius: '50%',
              p: 0,
              fontSize: 20,
              fontWeight: 'bold',
              borderColor: rightSelected.length > 0 ? '#2563eb' : '#e2e8f0',
              color: rightSelected.length > 0 ? '#2563eb' : '#94a3b8',
              bgcolor: rightSelected.length > 0 ? '#ffffff' : '#f8fafc',
              '&:hover': {
                borderColor: rightSelected.length > 0 ? '#1d4ed8' : '#e2e8f0',
                bgcolor: rightSelected.length > 0 ? '#eff6ff' : '#f8fafc',
              },
            }}
          >
            ‹
          </Button>
        </Grid>

        {/* ── PANEL DERECHO: Grupos del Equipo (Reordenables / Drag & Drop) ─ */}
        <Grid item xs={12} md={5}>
          <Paper
            variant="outlined"
            sx={{
              borderRadius: 3,
              borderColor: '#e2e8f0',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              bgcolor: '#ffffff',
            }}
          >
            {/* Encabezado con badge y tooltip de ordenación */}
            <Box
              sx={{
                p: 2,
                pb: 1.5,
                borderBottom: '1px solid #f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box>
                <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#0f172a', lineHeight: 1.2 }}>
                  Grupos del Equipo
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Arrastra o usa las flechas para ordenar
                </Typography>
              </Box>
              <Chip
                label={`${assignedGroups.length} elementos`}
                size="small"
                sx={{
                  fontWeight: 700,
                  bgcolor: '#2563eb',
                  color: '#ffffff',
                  borderRadius: '16px',
                  px: 0.5,
                }}
              />
            </Box>

            {/* Lista ordenable con Drag & Drop */}
            <Box sx={{ flex: 1, overflowY: 'auto', maxHeight: 360, minHeight: 250 }}>
              {assignedGroups.length > 0 ? (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={assignedGroups.map((g) => g.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <List disablePadding>
                      {assignedGroups.map((group, index) => (
                        <SortableAssignedItem
                          key={group.id}
                          group={group}
                          index={index}
                          total={assignedGroups.length}
                          isSelected={rightSelected.includes(group.id)}
                          onToggle={toggleRight}
                          onDoubleClick={handleDoubleClickRight}
                          onMoveUp={handleMoveUp}
                          onMoveDown={handleMoveDown}
                        />
                      ))}
                    </List>
                  </SortableContext>
                </DndContext>
              ) : (
                <Box
                  sx={{
                    p: 4,
                    height: '100%',
                    minHeight: 230,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    color: 'text.secondary',
                  }}
                >
                  <Typography variant="body2" fontWeight={500} sx={{ mb: 0.5, color: '#475569' }}>
                    No hay grupos asignados a este equipo
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                    Selecciona grupos de la lista izquierda y presiona ›
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
