import { useState, useEffect, useCallback, forwardRef } from 'react';
import axios from 'axios';
import {
  Box, Stack, Typography, Button, IconButton, Chip,
  TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, MenuItem, Checkbox, FormControlLabel,
  Divider, Tooltip, CircularProgress, Paper, Collapse, Tab, Tabs,
} from '@mui/material';
import { PlusIcon, PencilIcon, TrashIcon, ChevronDownIcon, ChevronRightIcon, SquaresPlusIcon, Bars3Icon } from '@heroicons/react/24/outline';
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import {
  SortableContext, useSortable, verticalListSortingStrategy, arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const TYPE_LABELS = { unica: 'Única', multiple: 'Múltiple', abierta: 'Abierta', fotos: 'Fotos' };
const TYPE_COLORS = { unica: 'primary', multiple: 'secondary', abierta: 'success', fotos: 'warning' };
const company = () => sessionStorage.getItem('company');

// ─── LoadingButton ────────────────────────────────────────────────────────────
function LoadingButton({ loading, children, startIcon, ...props }) {
  return (
    <Button
      {...props}
      disabled={props.disabled || loading}
      startIcon={loading ? <CircularProgress size={16} color="inherit" /> : startIcon}
    >
      {children}
    </Button>
  );
}

// ─── LoadingIconButton ────────────────────────────────────────────────────────
const LoadingIconButton = forwardRef(function LoadingIconButton({ loading, children, ...props }, ref) {
  return (
    <IconButton ref={ref} {...props} disabled={props.disabled || loading}>
      {loading ? <CircularProgress size={16} /> : children}
    </IconButton>
  );
});

// ─── OptionRow ────────────────────────────────────────────────────────────────
function OptionRow({ option, onChange, onRemove }) {
  const isChecked = option.requires_photo === true || option.requires_photo === 1;
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <TextField size="small" placeholder="Texto de la opción" value={option.text}
        onChange={(e) => onChange({ ...option, text: e.target.value })} sx={{ flex: 1 }} />
      <FormControlLabel
        control={
          <Checkbox
            size="small"
            checked={isChecked}
            onChange={(e) => onChange({ ...option, requires_photo: e.target.checked })}
          />
        }
        label="Requiere foto"
        sx={{ mx: 0, whiteSpace: 'nowrap', '& .MuiFormControlLabel-label': { fontSize: '0.75rem' } }}
      />
      <IconButton size="small" color="error" onClick={onRemove}><TrashIcon className="h-4 w-4" /></IconButton>
    </Stack>
  );
}

// ─── QuestionDialog ───────────────────────────────────────────────────────────
function QuestionDialog({ open, onClose, onSave, initial, optionTemplates }) {
  const [form, setForm] = useState({ text: '', type: 'unica', min_photos: 1, max_photos: 5, options: [] });
  const [saving, setSaving] = useState(false);
  const [tplOpen, setTplOpen] = useState(false);

  useEffect(() => {
    if (open) {
      const sortById = (opts) => (opts || []).slice().sort((a, b) => (a.id || 0) - (b.id || 0));
      setForm(initial
        ? { ...initial, options: sortById(initial.options) }
        : { text: '', type: 'unica', min_photos: 1, max_photos: 5, options: [] });
      setSaving(false);
    }
  }, [open, initial]);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));
  const addOption = () => set('options', [...form.options, { text: '', requires_photo: false }]);
  const updateOption = (i, val) => set('options', form.options.map((o, idx) => idx === i ? val : o));
  const removeOption = (i) => set('options', form.options.filter((_, idx) => idx !== i));
  const loadTemplate = (tpl) => { set('options', tpl.options.map(o => ({ text: o.text, requires_photo: !!o.requires_photo }))); setTplOpen(false); };

  const isChoice = form.type === 'unica' || form.type === 'multiple';
  const valid = form.text.trim() && (
    (isChoice && form.options.length > 0 && form.options.every(o => o.text.trim())) ||
    form.type === 'abierta' ||
    (form.type === 'fotos' && form.min_photos >= 1 && form.max_photos >= form.min_photos)
  );

  const handleSave = async () => {
    setSaving(true);
    try { await onSave(form); }
    finally { setSaving(false); }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>{initial ? 'Editar pregunta' : 'Nueva pregunta'}</DialogTitle>
      <Divider />
      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          <TextField label="Texto de la pregunta" multiline rows={2} fullWidth value={form.text}
            onChange={(e) => set('text', e.target.value)} />
          <FormControl fullWidth size="small">
            <InputLabel>Tipo de respuesta</InputLabel>
            <Select value={form.type} label="Tipo de respuesta" onChange={(e) => set('type', e.target.value)}>
              <MenuItem value="unica">Única</MenuItem>
              <MenuItem value="multiple">Múltiple</MenuItem>
              <MenuItem value="abierta">Abierta</MenuItem>
              <MenuItem value="fotos">Fotos</MenuItem>
            </Select>
          </FormControl>

          {form.type === 'fotos' && (
            <Stack direction="row" spacing={2}>
              <TextField label="Mínimo de fotos" type="number" size="small" value={form.min_photos}
                onChange={(e) => set('min_photos', Number(e.target.value))} inputProps={{ min: 1 }} sx={{ flex: 1 }} />
              <TextField label="Máximo de fotos" type="number" size="small" value={form.max_photos}
                onChange={(e) => set('max_photos', Number(e.target.value))} inputProps={{ min: 1 }} sx={{ flex: 1 }} />
            </Stack>
          )}

          {isChoice && (
            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                <Typography variant="subtitle2" fontWeight={700}>Opciones de respuesta</Typography>
                <Stack direction="row" spacing={1}>
                  {optionTemplates?.length > 0 && (
                    <Button size="small" variant="outlined" startIcon={<SquaresPlusIcon className="h-4 w-4" />}
                      onClick={() => setTplOpen(true)} sx={{ borderRadius: 2 }}>
                      Cargar plantilla
                    </Button>
                  )}
                  <Button size="small" startIcon={<PlusIcon className="h-4 w-4" />} onClick={addOption}>
                    Agregar opción
                  </Button>
                </Stack>
              </Stack>
              <Stack spacing={1}>
                {form.options.length === 0 && (
                  <Typography variant="caption" color="text.secondary">Agrega al menos una opción.</Typography>
                )}
                {form.options.map((opt, i) => (
                  <OptionRow key={i} option={opt} onChange={(val) => updateOption(i, val)} onRemove={() => removeOption(i)} />
                ))}
              </Stack>

              {/* Template picker */}
              <Dialog open={tplOpen} onClose={() => setTplOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
                <DialogTitle sx={{ fontWeight: 700 }}>Seleccionar plantilla</DialogTitle>
                <Divider />
                <DialogContent>
                  <Stack spacing={1} sx={{ mt: 1 }}>
                    {optionTemplates?.map((tpl) => (
                      <Paper key={tpl.id} variant="outlined" sx={{ p: 1.5, cursor: 'pointer', borderRadius: 2, '&:hover': { bgcolor: '#f0f7ff', borderColor: '#3b82f6' } }}
                        onClick={() => loadTemplate(tpl)}>
                        <Typography fontWeight={600} variant="body2">{tpl.name}</Typography>
                        <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ mt: 0.5 }}>
                          {tpl.options?.map((o, i) => (
                            <Chip key={i} label={Number(o.requires_photo) === 1 ? `${o.text} 📷` : o.text} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
                          ))}
                        </Stack>
                      </Paper>
                    ))}
                  </Stack>
                </DialogContent>
              </Dialog>
            </Box>
          )}

          {form.type === 'abierta' && (
            <TextField label="Campo de texto (vista previa)" multiline rows={2} fullWidth disabled
              placeholder="El usuario escribirá su respuesta aquí..." />
          )}
        </Stack>
      </DialogContent>
      <Divider />
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={saving}>Cancelar</Button>
        <LoadingButton variant="contained" loading={saving} disabled={!valid} onClick={handleSave} sx={{ borderRadius: 2 }}>
          Guardar
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}

// ─── SortableQuestion ────────────────────────────────────────────────────────
function SortableQuestion({ q, onEdit, deletingId, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: q.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };
  return (
    <Paper ref={setNodeRef} style={style} elevation={0} sx={{ p: 2, border: '1px solid #e2e8f0', borderRadius: 2 }}>
      <Stack direction="row" alignItems="flex-start" spacing={1}>
        <Box {...attributes} {...listeners} sx={{ cursor: 'grab', pt: 0.5, color: '#94a3b8', '&:active': { cursor: 'grabbing' } }}>
          <Bars3Icon style={{ width: 16, height: 16 }} />
        </Box>
        <Chip label={TYPE_LABELS[q.type]} color={TYPE_COLORS[q.type]} size="small" sx={{ minWidth: 80, fontWeight: 700 }} />
        <Box sx={{ flex: 1 }}>
          <Typography variant="body2" fontWeight={600}>{q.text}</Typography>
          {q.type === 'fotos' && (<Typography variant="caption" color="text.secondary">Fotos: mín {q.min_photos} – máx {q.max_photos}</Typography>)}
          {(q.type === 'unica' || q.type === 'multiple') && q.options?.length > 0 && (
            <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ mt: 0.5 }}>
              {q.options.map(o => (<Chip key={o.id} label={Number(o.requires_photo) === 1 ? `${o.text} 📷` : o.text} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />))}
            </Stack>
          )}
        </Box>
        <Stack direction="row" spacing={0.5}>
          <IconButton size="small" onClick={() => onEdit(q)}><PencilIcon className="h-4 w-4" /></IconButton>
          <LoadingIconButton size="small" color="error" loading={deletingId === q.id} onClick={() => onDelete(q.id)}>
            <TrashIcon className="h-4 w-4" />
          </LoadingIconButton>
        </Stack>
      </Stack>
    </Paper>
  );
}

// ─── GroupCard ────────────────────────────────────────────────────────────────
function GroupCard({ group, onGroupEdited, onGroupDeleted, optionTemplates, dragHandleProps }) {
  const [expanded, setExpanded] = useState(false);
  const [qDialog, setQDialog] = useState({ open: false, editing: null });
  const [savingQ, setSavingQ] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [deletingGroup, setDeletingGroup] = useState(false);
  const [questions, setQuestions] = useState(group.questions || []);

  const handleSaveQuestion = async (form) => {
    setSavingQ(true);
    try {
      const payload = { ...form, group_id: group.id, options: (form.options || []).map(o => ({ text: o.text, requires_photo: o.requires_photo ? 1 : 0 })) };
      if (qDialog.editing) {
        const res = await axios.put(`/updateQuestion/${qDialog.editing.id}`, payload);
        setQuestions(prev => prev.map(q => q.id === qDialog.editing.id ? res.data.data : q));
      } else {
        const res = await axios.post('/saveQuestion', payload);
        setQuestions(prev => [...prev, res.data.data]);
      }
      setQDialog({ open: false, editing: null });
    } catch (e) { console.error(e); }
    finally { setSavingQ(false); }
  };

  const handleDeleteQuestion = async (id) => {
    if (!window.confirm('¿Eliminar esta pregunta?')) return;
    setDeletingId(id);
    try {
      await axios.delete(`/deleteQuestion/${id}`);
      setQuestions(prev => prev.filter(q => q.id !== id));
    } catch (e) { console.error(e); }
    finally { setDeletingId(null); }
  };

  const handleDeleteGroup = async () => {
    if (!window.confirm('¿Eliminar este grupo y todas sus preguntas?')) return;
    setDeletingGroup(true);
    try { await onGroupDeleted(group.id); }
    finally { setDeletingGroup(false); }
  };

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleQDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = questions.findIndex(q => q.id === active.id);
    const newIdx = questions.findIndex(q => q.id === over.id);
    const reordered = arrayMove(questions, oldIdx, newIdx);
    setQuestions(reordered);
    await axios.post('/reorderQuestions', { order: reordered.map((q, i) => ({ id: q.id, order: i })) });
  };

  return (
    <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
      <Stack direction="row" alignItems="center"
        sx={{ px: 2.5, py: 1.5, '&:hover': { bgcolor: '#f8fafc' } }}>
        <Box {...(dragHandleProps || {})} sx={{ cursor: 'grab', mr: 1, color: '#94a3b8', '&:active': { cursor: 'grabbing' } }}
          onClick={e => e.stopPropagation()}>
          <Bars3Icon style={{ width: 18, height: 18 }} />
        </Box>
        <Box sx={{ cursor: 'pointer', flex: 1, display: 'flex', alignItems: 'center' }} onClick={() => setExpanded(v => !v)}>
          <IconButton size="small" sx={{ mr: 1 }}>{expanded ? <ChevronDownIcon className="h-4 w-4" /> : <ChevronRightIcon className="h-4 w-4" />}</IconButton>
          <Typography fontWeight={700} sx={{ flex: 1 }}>{group.name}</Typography>
        </Box>
        <Chip label={`${questions.length} pregunta${questions.length !== 1 ? 's' : ''}`} size="small" sx={{ mr: 1 }} />
        <Tooltip title="Editar grupo">
          <IconButton size="small" onClick={e => { e.stopPropagation(); onGroupEdited(group); }}>
            <PencilIcon className="h-4 w-4" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Eliminar grupo">
          <LoadingIconButton size="small" color="error" loading={deletingGroup} onClick={e => { e.stopPropagation(); handleDeleteGroup(); }}>
            <TrashIcon className="h-4 w-4" />
          </LoadingIconButton>
        </Tooltip>
      </Stack>

      <Collapse in={expanded}>
        <Divider />
        <Box sx={{ px: 3, py: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
            <Typography variant="subtitle2" color="text.secondary">Preguntas del grupo</Typography>
            <LoadingButton size="small" variant="outlined" loading={savingQ}
              startIcon={<PlusIcon className="h-4 w-4" />}
              onClick={() => setQDialog({ open: true, editing: null })} sx={{ borderRadius: 2 }}>
              Agregar pregunta
            </LoadingButton>
          </Stack>

          {questions.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
              Este grupo no tiene preguntas aún.
            </Typography>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleQDragEnd}>
              <SortableContext items={questions.map(q => q.id)} strategy={verticalListSortingStrategy}>
                <Stack spacing={1.5}>
                  {questions.map(q => (
                    <SortableQuestion key={q.id} q={q}
                      onEdit={q => setQDialog({ open: true, editing: q })}
                      deletingId={deletingId}
                      onDelete={handleDeleteQuestion} />
                  ))}
                </Stack>
              </SortableContext>
            </DndContext>
          )}
        </Box>
      </Collapse>

      <QuestionDialog open={qDialog.open} onClose={() => setQDialog({ open: false, editing: null })}
        onSave={handleSaveQuestion} initial={qDialog.editing} optionTemplates={optionTemplates} />
    </Paper>
  );
}

// ─── OptionTemplateManager ────────────────────────────────────────────────────
function OptionTemplateManager({ templates, onTemplatesChange }) {
  const [dialog, setDialog] = useState({ open: false, editing: null });
  const [name, setName] = useState('');
  const [options, setOptions] = useState([]);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const openNew = () => { setName(''); setOptions([]); setDialog({ open: true, editing: null }); };
  const openEdit = (tpl) => {
    setName(tpl.name);
    const sorted = (tpl.options || []).slice().sort((a, b) => (a.id || 0) - (b.id || 0));
    setOptions(sorted.map(o => ({ ...o })));
    setDialog({ open: true, editing: tpl });
  };
  const addOpt = () => setOptions(prev => [...prev, { text: '', requires_photo: false }]);
  const updateOpt = (i, val) => setOptions(prev => prev.map((o, idx) => idx === i ? val : o));
  const removeOpt = (i) => setOptions(prev => prev.filter((_, idx) => idx !== i));

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { name, company: company(), options };
      if (dialog.editing) {
        const res = await axios.put(`/updateOptionTemplateGroup/${dialog.editing.id}`, payload);
        onTemplatesChange(prev => prev.map(t => t.id === dialog.editing.id ? res.data.data : t));
      } else {
        const res = await axios.post('/saveOptionTemplateGroup', payload);
        onTemplatesChange(prev => [res.data.data, ...prev]);
      }
      setDialog({ open: false, editing: null });
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar esta plantilla?')) return;
    setDeletingId(id);
    try {
      await axios.delete(`/deleteOptionTemplateGroup/${id}`);
      onTemplatesChange(prev => prev.filter(t => t.id !== id));
    } catch (e) { console.error(e); }
    finally { setDeletingId(null); }
  };

  const valid = name.trim() && options.length > 0 && options.every(o => o.text.trim());

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h6" fontWeight={700}>Plantillas de opciones</Typography>
          <Typography variant="body2" color="text.secondary">
            Crea grupos reutilizables (ej. "Condición": Bueno / Regular / Malo).
          </Typography>
        </Box>
        <LoadingButton variant="contained" loading={false} startIcon={<PlusIcon className="h-5 w-5" />}
          onClick={openNew} sx={{ borderRadius: 2, px: 3 }}>
          Nueva plantilla
        </LoadingButton>
      </Stack>

      {templates.length === 0 ? (
        <Paper elevation={0} sx={{ p: 5, textAlign: 'center', border: '2px dashed #e2e8f0', borderRadius: 4 }}>
          <Typography color="text.secondary" sx={{ mb: 2 }}>Sin plantillas. Crea una para reutilizar en preguntas.</Typography>
          <Button variant="outlined" startIcon={<PlusIcon className="h-4 w-4" />} onClick={openNew}>Crear plantilla</Button>
        </Paper>
      ) : (
        <Stack spacing={1.5}>
          {templates.map(tpl => (
            <Paper key={tpl.id} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Stack direction="row" alignItems="center">
                <Box sx={{ flex: 1 }}>
                  <Typography fontWeight={700} variant="body1">{tpl.name}</Typography>
                  <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ mt: 0.5 }}>
                    {tpl.options?.map((o, i) => (
                      <Chip key={i} label={o.requires_photo ? `${o.text} 📷` : o.text}
                        size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
                    ))}
                  </Stack>
                </Box>
                <Stack direction="row" spacing={0.5}>
                  <IconButton size="small" onClick={() => openEdit(tpl)}><PencilIcon className="h-4 w-4" /></IconButton>
                  <LoadingIconButton size="small" color="error" loading={deletingId === tpl.id} onClick={() => handleDelete(tpl.id)}>
                    <TrashIcon className="h-4 w-4" />
                  </LoadingIconButton>
                </Stack>
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}

      <Dialog open={dialog.open} onClose={() => setDialog({ open: false, editing: null })} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>{dialog.editing ? 'Editar plantilla' : 'Nueva plantilla de opciones'}</DialogTitle>
        <Divider />
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Nombre de la plantilla (ej. Condición)" fullWidth value={name} onChange={e => setName(e.target.value)} />
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle2" fontWeight={700}>Opciones</Typography>
              <Button size="small" startIcon={<PlusIcon className="h-4 w-4" />} onClick={addOpt}>Agregar</Button>
            </Stack>
            {options.length === 0 && <Typography variant="caption" color="text.secondary">Agrega al menos una opción.</Typography>}
            {options.map((opt, i) => (
              <OptionRow key={i} option={opt} onChange={val => updateOpt(i, val)} onRemove={() => removeOpt(i)} />
            ))}
          </Stack>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setDialog({ open: false, editing: null })} disabled={saving}>Cancelar</Button>
          <LoadingButton variant="contained" loading={saving} disabled={!valid} onClick={handleSave} sx={{ borderRadius: 2 }}>
            Guardar
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// ─── GroupsDndList ────────────────────────────────────────────────────────────
function SortableGroupCard({ group, onGroupEdited, onGroupDeleted, optionTemplates }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: group.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  return (
    <div ref={setNodeRef} style={style}>
      <GroupCard group={group} onGroupEdited={onGroupEdited} onGroupDeleted={onGroupDeleted}
        optionTemplates={optionTemplates}
        dragHandleProps={{ ...attributes, ...listeners }} />
    </div>
  );
}

function GroupsDndList({ groups, setGroups, onGroupEdited, onGroupDeleted, optionTemplates }) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = groups.findIndex(g => g.id === active.id);
    const newIdx = groups.findIndex(g => g.id === over.id);
    const reordered = arrayMove(groups, oldIdx, newIdx);
    setGroups(reordered);
    await axios.post('/reorderQuestionGroups', { order: reordered.map((g, i) => ({ id: g.id, sort_order: i })) });
  };
  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={groups.map(g => g.id)} strategy={verticalListSortingStrategy}>
        <Stack spacing={2}>
          {groups.map(g => (
            <SortableGroupCard key={g.id} group={g} onGroupEdited={onGroupEdited}
              onGroupDeleted={onGroupDeleted} optionTemplates={optionTemplates} />
          ))}
        </Stack>
      </SortableContext>
    </DndContext>
  );
}

// ─── GroupNameDialog ──────────────────────────────────────────────────────────
function GroupDialog({ open, onClose, onSave, initial }) {
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (open) { setName(initial?.name || ''); setSaving(false); } }, [open, initial]);

  const handleSave = async () => {
    setSaving(true);
    try { await onSave(name); }
    finally { setSaving(false); }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ fontWeight: 700 }}>{initial ? 'Editar grupo' : 'Nuevo grupo de preguntas'}</DialogTitle>
      <Divider />
      <DialogContent>
        <TextField label="Nombre del grupo" fullWidth autoFocus value={name}
          onChange={e => setName(e.target.value)} sx={{ mt: 1 }} />
      </DialogContent>
      <Divider />
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={saving}>Cancelar</Button>
        <LoadingButton variant="contained" loading={saving} disabled={!name.trim()} onClick={handleSave} sx={{ borderRadius: 2 }}>
          Guardar
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Preguntas() {
  const [tab, setTab] = useState(0);
  const [groups, setGroups] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingGroup, setSavingGroup] = useState(false);
  const [gDialog, setGDialog] = useState({ open: false, editing: null });

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [gRes, tRes] = await Promise.all([
        axios.get(`/getQuestionGroups/${company()}`),
        axios.get(`/getOptionTemplateGroups/${company()}`),
      ]);
      setGroups(gRes.data.data || []);
      setTemplates(tRes.data.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleSaveGroup = async (name) => {
    setSavingGroup(true);
    try {
      if (gDialog.editing) {
        const res = await axios.put(`/updateQuestionGroup/${gDialog.editing.id}`, { name });
        setGroups(prev => prev.map(g => g.id === gDialog.editing.id ? { ...g, name: res.data.data.name } : g));
      } else {
        const res = await axios.post('/saveQuestionGroup', { name, company: company() });
        setGroups(prev => [{ ...res.data.data, questions: [] }, ...prev]);
      }
      setGDialog({ open: false, editing: null });
    } catch (e) { console.error(e); }
    finally { setSavingGroup(false); }
  };

  const handleDeleteGroup = async (id) => {
    await axios.delete(`/deleteQuestionGroup/${id}`);
    setGroups(prev => prev.filter(g => g.id !== id));
  };

  return (
    <Box>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3, borderBottom: '1px solid #e2e8f0' }}>
        <Tab label="Grupos de preguntas" />
        <Tab label="Plantillas de opciones" />
      </Tabs>

      {loading ? (
        <Stack alignItems="center" sx={{ py: 8 }}>
          <CircularProgress />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>Cargando...</Typography>
        </Stack>
      ) : tab === 0 ? (
        <Box>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Box>
              <Typography variant="h6" fontWeight={700}>Grupos de Preguntas</Typography>
              <Typography variant="body2" color="text.secondary">Organiza las preguntas en grupos temáticos.</Typography>
            </Box>
            <LoadingButton variant="contained" loading={savingGroup} startIcon={<PlusIcon className="h-5 w-5" />}
              onClick={() => setGDialog({ open: true, editing: null })} sx={{ borderRadius: 2, px: 3 }}>
              Nuevo grupo
            </LoadingButton>
          </Stack>

          {groups.length === 0 ? (
            <Paper elevation={0} sx={{ p: 6, textAlign: 'center', border: '2px dashed #e2e8f0', borderRadius: 4 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>Sin grupos aún</Typography>
              <Button variant="outlined" startIcon={<PlusIcon className="h-4 w-4" />}
                onClick={() => setGDialog({ open: true, editing: null })}>
                Crear primer grupo
              </Button>
            </Paper>
          ) : (
            <GroupsDndList groups={groups} setGroups={setGroups}
              onGroupEdited={grp => setGDialog({ open: true, editing: grp })}
              onGroupDeleted={handleDeleteGroup}
              optionTemplates={templates} />
          )}

          <GroupDialog open={gDialog.open} onClose={() => setGDialog({ open: false, editing: null })}
            onSave={handleSaveGroup} initial={gDialog.editing} />
        </Box>
      ) : (
        <OptionTemplateManager templates={templates} onTemplatesChange={setTemplates} />
      )}
    </Box>
  );
}
