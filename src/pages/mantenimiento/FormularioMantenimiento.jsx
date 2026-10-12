import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Stack, 
  Button, 
  CircularProgress,
  Chip,
  IconButton,
  Divider,
  Paper,
  Checkbox,
  FormGroup,
  Radio,
  RadioGroup,
  FormControlLabel,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import { 
  ChevronLeftIcon,
  CameraIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  ShieldCheckIcon,
  WrenchScrewdriverIcon,
  BoltIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import { BASE_URL } from '../../App';
import Swal from 'sweetalert2';
import { decrypt } from '../../utils/crypto.js';
import { pdf } from '@react-pdf/renderer';
import MaintenanceReportPdf from './MaintenanceReportPdf';

// --- Custom Signature Canvas Component ---
const SignaturePad = ({ onSave, title, onCancel }) => {
  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);
  const [history, setHistory] = useState([]); // Array of ImageData

  const initContext = () => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#0f172a';
    return ctx;
  };

  const getPos = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches && e.touches.length > 0 ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches && e.touches.length > 0 ? e.touches[0].clientY : e.clientY;
    const scaleX = canvas.width / (rect.width || 1);
    const scaleY = canvas.height / (rect.height || 1);
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = initContext();
    if (!ctx) return;

    try {
      const currentImgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setHistory(prev => [...prev, currentImgData]);
    } catch (err) {}

    isDrawingRef.current = true;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    ctx.lineTo(pos.x + 0.1, pos.y + 0.1);
    ctx.stroke();

    if (e.cancelable && e.touches) e.preventDefault();
  };

  const draw = (e) => {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();

    if (e.cancelable && e.touches) e.preventDefault();
  };

  const stopDrawing = () => {
    if (isDrawingRef.current) {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.closePath();
      }
      isDrawingRef.current = false;
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    initContext();

    const handleTouchStart = (e) => startDrawing(e);
    const handleTouchMove = (e) => draw(e);
    const handleTouchEnd = () => stopDrawing();

    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd);
    canvas.addEventListener('touchcancel', handleTouchEnd);

    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
      canvas.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, []);

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHistory([]);
  };

  const undo = () => {
    if (history.length === 0) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const lastState = history[history.length - 1];
    ctx.putImageData(lastState, 0, 0);
    setHistory(prev => prev.slice(0, -1));
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    const blank = document.createElement('canvas');
    blank.width = canvas.width;
    blank.height = canvas.height;
    if (canvas.toDataURL() === blank.toDataURL()) {
      Swal.fire('Error', 'Por favor, dibuja la firma primero.', 'warning');
      return;
    }
    onSave(canvas.toDataURL());
  };

  return (
    <Box sx={{ p: 1 }}>
      <Typography variant="subtitle1" fontWeight="800" gutterBottom>{title}</Typography>
      <Box sx={{ border: '2px dashed #cbd5e1', borderRadius: 4, overflow: 'hidden', bgcolor: '#fff', touchAction: 'none' }}>
        <canvas 
          ref={canvasRef} 
          width={500} 
          height={200} 
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          style={{
            display: 'block',
            cursor: 'crosshair',
            width: '100%',
            height: '200px',
            touchAction: 'none'
          }}
        />
      </Box>
      <Grid container spacing={1} sx={{ mt: 2 }}>
        {onCancel && (
          <Grid item xs={12}>
            <Button fullWidth variant="text" onClick={onCancel} sx={{ textTransform: 'none', color: '#64748b', fontWeight: '700', mb: 1 }}>
              Volver a firmas guardadas
            </Button>
          </Grid>
        )}
        <Grid item xs={4}>
          <Button fullWidth variant="outlined" color="warning" onClick={undo} disabled={history.length === 0} sx={{ textTransform: 'none', borderRadius: 2 }}>
            Deshacer
          </Button>
        </Grid>
        <Grid item xs={4}>
          <Button fullWidth variant="outlined" color="error" onClick={clear} sx={{ textTransform: 'none', borderRadius: 2 }}>
            Borrar
          </Button>
        </Grid>
        <Grid item xs={4}>
          <Button fullWidth variant="contained" onClick={handleSave} sx={{ textTransform: 'none', borderRadius: 2 }}>
            Listo
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default function FormularioMantenimiento() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tipoParam = searchParams.get('tipo') || 'Preventivo';
  const [maintenanceType, setMaintenanceType] = useState(tipoParam);
  const [recommendations, setRecommendations] = useState([]);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [loading, setLoading] = useState(true);
  const [equipo, setEquipo] = useState(null);
  const [questionGroup, setQuestionGroup] = useState(null);
  const [answers, setAnswers] = useState({});
  const [generalObservations, setGeneralObservations] = useState('');

  const addRecommendation = () => {
    setRecommendations(prev => [
      ...prev,
      {
        id: prev.length + 1,
        description: '',
        quantity: '1',
        priority: 'Media',
        observation: ''
      }
    ]);
  };

  const updateRecommendation = (idx, field, val) => {
    setRecommendations(prev => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: val };
      return updated;
    });
  };

  const removeRecommendation = (idx) => {
    setRecommendations(prev => {
      const filtered = prev.filter((_, i) => i !== idx);
      if (filtered.length === 0) {
        setShowRecommendations(false);
      }
      return filtered.map((item, i) => ({ ...item, id: i + 1 }));
    });
  };

  const renderRecommendationsSection = () => {
    if (!showRecommendations && recommendations.length === 0) {
      return (
        <Button
          fullWidth
          variant="outlined"
          onClick={() => {
            setShowRecommendations(true);
            addRecommendation();
          }}
          startIcon={<PlusIcon className="h-5 w-5" />}
          sx={{
            py: 1.8,
            borderRadius: 3,
            borderStyle: 'dashed',
            borderWidth: 2,
            borderColor: '#94a3b8',
            bgcolor: '#ffffff',
            color: '#1e3a8a',
            fontWeight: '700',
            textTransform: 'none',
            fontSize: '0.9rem',
            boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
            '&:hover': {
              borderStyle: 'dashed',
              borderWidth: 2,
              borderColor: '#1e3a8a',
              bgcolor: 'rgba(30, 58, 138, 0.04)',
            }
          }}
        >
          + Agregar Repuestos / Trabajos Recomendados (Opcional)
        </Button>
      );
    }

    return (
      <Card sx={{ borderRadius: 4, border: '1px solid #cbd5e1', overflow: 'hidden' }}>
        <Box sx={{ bgcolor: '#1e3a8a', px: 2, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle2" fontWeight="800" sx={{ color: '#ffffff', letterSpacing: 0.5 }}>
            REPUESTOS / TRABAJOS RECOMENDADOS (OPCIONAL)
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              variant="contained"
              onClick={addRecommendation}
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.2)', 
                color: '#fff', 
                textTransform: 'none', 
                fontWeight: '700', 
                borderRadius: 2,
                '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } 
              }}
            >
              + Agregar Fila
            </Button>
            <Button
              size="small"
              variant="text"
              onClick={() => {
                setShowRecommendations(false);
                setRecommendations([]);
              }}
              sx={{ 
                color: 'rgba(255,255,255,0.8)', 
                textTransform: 'none', 
                fontWeight: '700',
                '&:hover': { color: '#ffffff', bgcolor: 'rgba(255,255,255,0.1)' } 
              }}
            >
              Ocultar
            </Button>
          </Stack>
        </Box>
        <CardContent sx={{ p: 2 }}>
          {recommendations.length === 0 ? (
            <Box textAlign="center" py={2.5}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                No hay filas registradas en repuestos recomendados.
              </Typography>
              <Button
                size="small"
                variant="outlined"
                onClick={addRecommendation}
                startIcon={<PlusIcon className="h-4 w-4" />}
                sx={{ textTransform: 'none', borderRadius: 2 }}
              >
                Agregar Fila
              </Button>
            </Box>
          ) : (
            <Stack spacing={1.5}>
              {recommendations.map((rec, rIdx) => (
                <Paper
                  key={rIdx}
                  variant="outlined"
                  sx={{ p: 1.5, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#f8fafc' }}
                >
                  <Grid container spacing={1.5} alignItems="center">
                    <Grid item xs={2} sm={0.8}>
                      <Typography variant="caption" fontWeight="800" color="text.secondary" display="block">
                        Nº
                      </Typography>
                      <Typography variant="subtitle2" fontWeight="800" color="primary">
                        {rIdx + 1}
                      </Typography>
                    </Grid>
                    <Grid item xs={10} sm={4.2}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Descripción del repuesto o trabajo"
                        placeholder="Ej: Cambio de relé de seguridad"
                        value={rec.description}
                        onChange={(e) => updateRecommendation(rIdx, 'description', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={4} sm={1.8}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Cant."
                        placeholder="1"
                        value={rec.quantity}
                        onChange={(e) => updateRecommendation(rIdx, 'quantity', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={8} sm={2.2}>
                      <TextField
                        fullWidth
                        select
                        size="small"
                        label="Prioridad"
                        value={rec.priority}
                        onChange={(e) => updateRecommendation(rIdx, 'priority', e.target.value)}
                        SelectProps={{ native: true }}
                      >
                        <option value="Alta">Alta</option>
                        <option value="Media">Media</option>
                        <option value="Baja">Baja</option>
                      </TextField>
                    </Grid>
                    <Grid item xs={10} sm={2.5}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Observación"
                        placeholder="Detalle u observación..."
                        value={rec.observation}
                        onChange={(e) => updateRecommendation(rIdx, 'observation', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={2} sm={0.5} sx={{ textAlign: 'center' }}>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => removeRecommendation(rIdx)}
                        title="Eliminar fila"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Paper>
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>
    );
  };
  
  // --- Signature Flow State ---
  const [showSignatureFlow, setShowSignatureFlow] = useState(false);
  const [signatureStep, setSignatureStep] = useState('technician'); // 'technician' | 'customer'
  const [savedSignatures, setSavedSignatures] = useState([]);
  const [technicianSignature, setTechnicianSignature] = useState(null);
  const [isDrawingNewTech, setIsDrawingNewTech] = useState(false);
  const [customerName, setCustomerName] = useState('');

  const userId = decrypt(sessionStorage.getItem('userId'));
  const backendUrl = BASE_URL.replace('/api/v1/', '');

  const getImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('data:') || path.startsWith('blob:')) return path;
    const base = BASE_URL.endsWith('/') ? BASE_URL : BASE_URL + '/';
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    const token = sessionStorage.getItem('Token') || '';
    return `${base}${cleanPath}?token=${encodeURIComponent(token)}`;
  };

  useEffect(() => {
    fetchData();
    fetchMySignatures();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const resEquipo = await axios.get(`/getOneProject/${id}`);
      const equipoData = resEquipo.data.data?.[0];
      if (!equipoData) {
        Swal.fire('Error', 'Equipo no encontrado', 'error');
        navigate('/mantenimiento/clientes');
        return;
      }
      setEquipo(equipoData);

      // Todos los grupos de preguntas asignados al equipo (lista plana de preguntas)
      const resGroups = await axios.get(`/getProjectQuestionGroups/${id}`);
      setQuestionGroup(resGroups.data.data || { groups: [], questions: [] });
    } catch (error) {
      console.error("Error fetching form data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMySignatures = async () => {
    try {
      const res = await axios.get('/getMySignatures');
      setSavedSignatures(res.data.data || []);
      if (res.data.data?.length === 0) setIsDrawingNewTech(true);
    } catch (error) {
      console.error("Error fetching signatures:", error);
    }
  };

  const handleDeleteSignature = async (sig) => {
    const result = await Swal.fire({
      title: '¿Eliminar firma?',
      text: `Se eliminará "${sig.name || 'Firma Guardada'}" de forma permanente.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });
    if (!result.isConfirmed) return;
    try {
      await axios.delete(`/deleteSignature/${sig.id}`);
      const remaining = savedSignatures.filter(s => s.id !== sig.id);
      setSavedSignatures(remaining);
      if (remaining.length === 0) setIsDrawingNewTech(true);
      Swal.fire({ title: 'Eliminada', icon: 'success', timer: 1500, showConfirmButton: false });
    } catch (error) {
      Swal.fire('Error', 'No se pudo eliminar la firma', 'error');
    }
  };

  const handleAnswerChange = (questionId, value, type) => {
    setAnswers(prev => {
      const current = prev[questionId] || { question_id: questionId, optionIds: [], text: '', photos: [] };
      if (type === 'unica') return { ...prev, [questionId]: { ...current, optionIds: [value] } };
      if (type === 'multiple') {
        const ids = [...current.optionIds];
        const idx = ids.indexOf(value);
        if (idx > -1) ids.splice(idx, 1);
        else ids.push(value);
        return { ...prev, [questionId]: { ...current, optionIds: ids } };
      }
      if (type === 'texto') return { ...prev, [questionId]: { ...current, text: value } };
      return prev;
    });
  };

  const handleFileChange = async (questionId, e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const newPhotos = await Promise.all(files.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve({ file, preview: reader.result });
        };
        reader.readAsDataURL(file);
      });
    }));

    setAnswers(prev => {
      const current = prev[questionId] || { question_id: questionId, optionIds: [], text: '', photos: [] };
      return { ...prev, [questionId]: { ...current, photos: [...(current.photos || []), ...newPhotos] } };
    });
  };

  const removePhoto = (questionId, index) => {
    setAnswers(prev => {
      const current = prev[questionId];
      if (!current) return prev;
      const photos = [...current.photos];
      URL.revokeObjectURL(photos[index].preview);
      photos.splice(index, 1);
      return { ...prev, [questionId]: { ...current, photos } };
    });
  };

  useEffect(() => {
    if (maintenanceType === 'Emergencia') {
      setAnswers(prev => {
        if (!prev[9003]?.optionIds?.length) {
          return {
            ...prev,
            9003: {
              question_id: 9003,
              optionIds: ['SI'],
              text: 'SI',
              photos: []
            }
          };
        }
        return prev;
      });
    }
  }, [maintenanceType]);

  const validateForm = () => {
    if (maintenanceType === 'Emergencia') {
      const novedadText = (answers[9001]?.text || '').trim();
      const procedText = (answers[9002]?.text || '').trim();
      const subsanadaVal = answers[9003]?.optionIds?.[0] || answers[9003]?.text;

      if (!novedadText) {
        Swal.fire('Atención', 'Por favor ingresa la descripción de la novedad.', 'warning');
        return false;
      }
      if (!procedText) {
        Swal.fire('Atención', 'Por favor ingresa el procedimiento realizado.', 'warning');
        return false;
      }
      if (!subsanadaVal) {
        Swal.fire('Atención', 'Por favor indica si la falla fue subsanada (SI o NO).', 'warning');
        return false;
      }
      return true;
    }

    for (const q of (questionGroup?.questions || [])) {
      const ans = answers[q.id];
      const photoCount = ans?.photos?.length || 0;
      if (q.type === 'unica' || q.type === 'multiple') {
        if (!ans?.optionIds || ans.optionIds.length === 0) {
          Swal.fire('Atención', `La pregunta "${q.text}" no ha sido respondida.`, 'warning');
          return false;
        }
      } else if (q.type === 'abierta') {
        if (!ans?.text || !ans.text.trim()) {
          Swal.fire('Atención', `La pregunta "${q.text}" requiere una respuesta escrita.`, 'warning');
          return false;
        }
      }
      const selectedOptions = q.options?.filter(opt => ans?.optionIds?.includes(opt.id.toString())) || [];
      const optionRequiresEvidence = selectedOptions.some(opt => opt.requires_photo);
      const optionRequiresJustification = selectedOptions.some(opt => opt.requires_justification || opt.requires_justification === 1);
      if (optionRequiresJustification) {
        if (!ans?.text || !ans.text.trim()) {
          Swal.fire('Atención', `La opción seleccionada en la pregunta "${q.text}" requiere justificación escrita.`, 'warning');
          return false;
        }
      }
      if (q.type === 'fotos' || optionRequiresEvidence) {
        const minRequired = q.min_photos > 0 ? q.min_photos : (optionRequiresEvidence ? 1 : 0);
        if (photoCount < minRequired) {
          Swal.fire('Atención', `La pregunta "${q.text}" requiere al menos ${minRequired} foto(s) de evidencia.`, 'warning');
          return false;
        }
        if (q.max_photos > 0 && photoCount > q.max_photos) {
          Swal.fire('Atención', `La pregunta "${q.text}" excede el máximo de ${q.max_photos} fotos permitidas.`, 'warning');
          return false;
        }
      }
    }
    return true;
  };

  const fetchImageAsBase64 = async (path) => {
    if (!path) return null;
    if (path.startsWith('data:') || path.startsWith('blob:')) return path;
    try {
      const url = getImageUrl(path);
      const response = await axios.get(url, { responseType: 'blob' });
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(response.data);
      });
    } catch (error) {
      console.error('Error fetching image as base64:', error);
      return null;
    }
  };

  const handleSelectSavedSignature = async (sig) => {
    try {
      Swal.fire({
        title: 'Cargando firma...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });
      const base64 = await fetchImageAsBase64(sig.signature);
      Swal.close();
      if (base64) {
        setTechnicianSignature(base64);
        setSignatureStep('customer');
      } else {
        Swal.fire('Error', 'No se pudo cargar la firma seleccionada.', 'error');
      }
    } catch (error) {
      Swal.close();
      console.error(error);
      Swal.fire('Error', 'No se pudo cargar la firma seleccionada.', 'error');
    }
  };

  const handleStartSignature = () => {
    if (!validateForm()) return;
    if (savedSignatures.length > 0) {
      setIsDrawingNewTech(false);
    } else {
      setIsDrawingNewTech(true);
    }
    setShowSignatureFlow(true);
    setSignatureStep('technician');
  };

  const handleSaveTechSignature = async (base64) => {
    try {
      const res = await axios.post('/saveSignature', { user_id: userId, signature: base64, name: `Firma ${new Date().toLocaleDateString()}` });
      setTechnicianSignature(base64);
      setSavedSignatures([res.data.data, ...savedSignatures]);
      setSignatureStep('customer');
    } catch (error) {
      Swal.fire('Error', 'No se pudo guardar la firma', 'error');
    }
  };

  const handleFinalSubmit = async (custSig) => {
    if (!customerName.trim()) {
      Swal.fire('Atención', 'Por favor ingresa el nombre completo del cliente antes de guardar la firma.', 'warning');
      return;
    }
    try {
      setLoading(true);
      const answersArray = Object.keys(answers).map(qId => ({
        question_id: parseInt(qId, 10),
        answer_text: answers[qId].text || '',
        selected_options: answers[qId].optionIds || [],
        photos: (answers[qId].photos || []).map(p => p.preview)
      }));

      // Generate PDF — pass original answers state (keyed by questionId) not the backend payload format
      const techName = decrypt(sessionStorage.getItem('name'));
      const cleanRecommendations = recommendations.filter(r => r.description && r.description.trim() !== '');

      const principalEmail = equipo?.customerData?.contacto_principal?.correo 
        || equipo?.customerData?.contactos?.find(c => c.contactoPrincipal == 1)?.correo 
        || equipo?.customerData?.contactos?.[0]?.correo 
        || equipo?.customerData?.correo 
        || equipo?.customerData?.email 
        || '';

      const effectiveObservations = maintenanceType === 'Emergencia'
        ? `Novedad: ${answers[9001]?.text || ''} | Procedimiento: ${answers[9002]?.text || ''} | Subsanada: ${answers[9003]?.optionIds?.[0] || 'SI'}`
        : generalObservations.trim();

      const blob = await pdf(
        <MaintenanceReportPdf 
          data={{ 
            technicianSignature, 
            customerSignature: custSig,
            answers,  // original state: { [questionId]: { optionIds, text, photos } }
            maintenanceType,
            recommendations: cleanRecommendations,
            generalObservations: effectiveObservations
          }} 
          equipo={{
            ...equipo,
            customerEmail: principalEmail,
            customerData: {
              ...(equipo?.customerData || {}),
              correo: principalEmail,
              email: principalEmail,
            }
          }} 
          group={questionGroup}
          technicianName={techName}
          customerName={customerName.trim()}
          customerEmail={principalEmail}
          maintenanceType={maintenanceType}
          recommendations={cleanRecommendations}
          backendUrl={backendUrl}
        />
      ).toBlob();

      // Convert PDF to Base64
      const pdfBase64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });

      const payload = {
        project_id: id,
        technician_id: userId,
        customer_signature: custSig,
        technician_signature: technicianSignature,
        customer_name: customerName.trim(),
        maintenance_type: maintenanceType,
        recommendations: cleanRecommendations,
        general_observations: effectiveObservations,
        pdf_base64: pdfBase64,
        answers: answersArray
      };

      await axios.post('/saveMaintenanceReport', payload);
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Mantenimiento_${equipo?.elevatorTypeName}_${id}.pdf`;
      link.click();

      setShowSignatureFlow(false);

      await Swal.fire({
        title: '¡Mantenimiento Finalizado!',
        text: "El reporte se ha guardado y el PDF ha sido generado.",
        icon: 'success',
        confirmButtonText: 'Aceptar'
      });

      setSignatureStep('technician');
      setCustomerName('');
      navigate('/mantenimiento/clientes');
    } catch (error) {
      console.error("Error saving maintenance report:", error);
      Swal.fire('Error', 'No se pudo guardar el reporte de mantenimiento', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" py={10}><CircularProgress /></Box>;

  return (
    <Box sx={{ p: 2, pb: 10 }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <IconButton onClick={() => navigate(-1)}><ChevronLeftIcon className="h-6 w-6" /></IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" fontWeight="800">Mantenimiento</Typography>
          <Typography variant="caption" color="text.secondary">{equipo?.description} | {equipo?.elevatorTypeName}</Typography>
        </Box>
      </Stack>

      {/* Selector de Tipo de Mantenimiento */}
      <Card sx={{ mb: 3, borderRadius: 3, border: '1px solid #e2e8f0', p: 1.5, bgcolor: '#f8fafc' }}>
        <Typography variant="caption" fontWeight="800" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 1 }}>
          Tipo de Mantenimiento Seleccionado
        </Typography>
        <Grid container spacing={1}>
          {[
            { tipo: 'Preventivo', icon: ShieldCheckIcon, color: '#10b981', bg: '#dcfce7' },
            { tipo: 'Correctivo', icon: WrenchScrewdriverIcon, color: '#f59e0b', bg: '#fef3c7' },
            { tipo: 'Emergencia', icon: BoltIcon, color: '#ef4444', bg: '#fee2e2' }
          ].map(({ tipo, icon: Icon, color, bg }) => {
            const isSelected = maintenanceType === tipo;
            return (
              <Grid item xs={4} key={tipo}>
                <Paper
                  elevation={0}
                  onClick={() => setMaintenanceType(tipo)}
                  sx={{
                    p: 1.2,
                    borderRadius: 2.5,
                    border: `2px solid ${isSelected ? color : '#e2e8f0'}`,
                    bgcolor: isSelected ? bg : '#ffffff',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.2s',
                    '&:hover': { borderColor: color }
                  }}
                >
                  <Icon className="h-5 w-5 mx-auto" style={{ color: isSelected ? color : '#64748b' }} />
                  <Typography variant="body2" fontWeight={isSelected ? 800 : 600} sx={{ color: isSelected ? color : '#334155', mt: 0.5 }}>
                    {tipo}
                  </Typography>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      </Card>

      {/* Questions Section / Emergency Section */}
      {maintenanceType === 'Emergencia' ? (
        <Stack spacing={3}>
          {/* Alerta de Modo Emergencia */}
          <Card sx={{ borderRadius: 3, border: '1px solid #fecaca', bgcolor: '#fff5f5' }}>
            <CardContent sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <BoltIcon className="h-6 w-6 text-red-600 flex-shrink-0" />
              <Box>
                <Typography variant="subtitle2" fontWeight="800" sx={{ color: '#991b1b' }}>
                  Formato de Atención de Emergencia
                </Typography>
                <Typography variant="caption" sx={{ color: '#7f1d1d' }}>
                  Diligencia la novedad reportada, el procedimiento correctivo efectuado y el estado final de la falla.
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* 1. Descripción de novedad */}
          <Card sx={{ borderRadius: 4, border: '1px solid #cbd5e1', overflow: 'hidden' }}>
            <Box sx={{ bgcolor: '#1e3a8a', px: 2, py: 1.5 }}>
              <Typography variant="subtitle2" fontWeight="800" sx={{ color: '#ffffff', letterSpacing: 0.5 }}>
                1. DESCRIPCIÓN DE NOVEDAD *
              </Typography>
            </Box>
            <CardContent sx={{ p: 2.5 }}>
              <TextField
                fullWidth
                multiline
                rows={4}
                required
                label="Detalle de la novedad o falla reportada *"
                placeholder="Describe detalladamente la falla presentada, síntomas reportados, estado en que se encontró el equipo..."
                value={answers[9001]?.text || ''}
                onChange={(e) => handleAnswerChange(9001, e.target.value, 'texto')}
              />

              {/* Fotos de Novedad */}
              <Box sx={{ mt: 2.5, pt: 1.5, borderTop: '1px dashed #e2e8f0' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CameraIcon className="h-5 w-5 text-gray-500" />
                    <Typography variant="caption" fontWeight="700">FOTOS DE LA NOVEDAD ({answers[9001]?.photos?.length || 0})</Typography>
                  </Stack>
                  <Button
                    size="small"
                    component="label"
                    variant="contained"
                    startIcon={<CameraIcon className="h-4 w-4" />}
                    sx={{ borderRadius: 2, textTransform: 'none', bgcolor: '#f1f5f9', color: '#1e293b' }}
                  >
                    Cargar Fotos
                    <input type="file" hidden multiple accept="image/*" capture="environment" onChange={(e) => handleFileChange(9001, e)} />
                  </Button>
                </Box>
                {/* Photo Previews */}
                {answers[9001]?.photos?.length > 0 && (
                  <Box sx={{ display: 'flex', gap: 1.5, overflowX: 'auto', pt: 1, pb: 0.5 }}>
                    {answers[9001].photos.map((photo, pIdx) => (
                      <Box key={pIdx} sx={{ position: 'relative', flexShrink: 0, width: 75, height: 75, borderRadius: 2, overflow: 'hidden', border: '2px solid #e2e8f0' }}>
                        <img src={getImageUrl(photo.preview)} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <IconButton
                          size="small"
                          onClick={() => removePhoto(9001, pIdx)}
                          sx={{ position: 'absolute', top: 2, right: 2, bgcolor: 'rgba(255,255,255,0.9)', p: 0.5 }}
                        >
                          <Box sx={{ width: 12, height: 12, bgcolor: '#ef4444', borderRadius: '50%', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>×</Box>
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>

          {/* 2. Procedimiento realizado */}
          <Card sx={{ borderRadius: 4, border: '1px solid #cbd5e1', overflow: 'hidden' }}>
            <Box sx={{ bgcolor: '#1e3a8a', px: 2, py: 1.5 }}>
              <Typography variant="subtitle2" fontWeight="800" sx={{ color: '#ffffff', letterSpacing: 0.5 }}>
                2. PROCEDIMIENTO REALIZADO *
              </Typography>
            </Box>
            <CardContent sx={{ p: 2.5 }}>
              <TextField
                fullWidth
                multiline
                rows={4}
                required
                label="Detalle del procedimiento o labor ejecutada *"
                placeholder="Describe las maniobras, ajustes, pruebas o reparaciones realizadas para atender la emergencia..."
                value={answers[9002]?.text || ''}
                onChange={(e) => handleAnswerChange(9002, e.target.value, 'texto')}
              />

              {/* Fotos del Procedimiento */}
              <Box sx={{ mt: 2.5, pt: 1.5, borderTop: '1px dashed #e2e8f0' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CameraIcon className="h-5 w-5 text-gray-500" />
                    <Typography variant="caption" fontWeight="700">FOTOS DEL PROCEDIMIENTO ({answers[9002]?.photos?.length || 0})</Typography>
                  </Stack>
                  <Button
                    size="small"
                    component="label"
                    variant="contained"
                    startIcon={<CameraIcon className="h-4 w-4" />}
                    sx={{ borderRadius: 2, textTransform: 'none', bgcolor: '#f1f5f9', color: '#1e293b' }}
                  >
                    Cargar Fotos
                    <input type="file" hidden multiple accept="image/*" capture="environment" onChange={(e) => handleFileChange(9002, e)} />
                  </Button>
                </Box>
                {/* Photo Previews */}
                {answers[9002]?.photos?.length > 0 && (
                  <Box sx={{ display: 'flex', gap: 1.5, overflowX: 'auto', pt: 1, pb: 0.5 }}>
                    {answers[9002].photos.map((photo, pIdx) => (
                      <Box key={pIdx} sx={{ position: 'relative', flexShrink: 0, width: 75, height: 75, borderRadius: 2, overflow: 'hidden', border: '2px solid #e2e8f0' }}>
                        <img src={getImageUrl(photo.preview)} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <IconButton
                          size="small"
                          onClick={() => removePhoto(9002, pIdx)}
                          sx={{ position: 'absolute', top: 2, right: 2, bgcolor: 'rgba(255,255,255,0.9)', p: 0.5 }}
                        >
                          <Box sx={{ width: 12, height: 12, bgcolor: '#ef4444', borderRadius: '50%', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>×</Box>
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>

          {/* 3. La falla fue Subsanada */}
          <Card sx={{ borderRadius: 4, border: '1px solid #cbd5e1', overflow: 'hidden' }}>
            <Box sx={{ bgcolor: '#1e3a8a', px: 2, py: 1.5 }}>
              <Typography variant="subtitle2" fontWeight="800" sx={{ color: '#ffffff', letterSpacing: 0.5 }}>
                3. ¿LA FALLA FUE SUBSANADA? *
              </Typography>
            </Box>
            <CardContent sx={{ p: 2.5 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Paper
                    elevation={0}
                    onClick={() => handleAnswerChange(9003, 'SI', 'unica')}
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      border: `2px solid ${(answers[9003]?.optionIds?.[0] || 'SI') === 'SI' ? '#10b981' : '#e2e8f0'}`,
                      bgcolor: (answers[9003]?.optionIds?.[0] || 'SI') === 'SI' ? '#dcfce7' : '#ffffff',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.2s',
                      '&:hover': { borderColor: '#10b981' }
                    }}
                  >
                    <Typography variant="h6" fontWeight="800" sx={{ color: (answers[9003]?.optionIds?.[0] || 'SI') === 'SI' ? '#15803d' : '#475569' }}>
                      SI
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#166534', fontWeight: '600' }}>
                      Falla completamente corregida
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={6}>
                  <Paper
                    elevation={0}
                    onClick={() => handleAnswerChange(9003, 'NO', 'unica')}
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      border: `2px solid ${answers[9003]?.optionIds?.[0] === 'NO' ? '#ef4444' : '#e2e8f0'}`,
                      bgcolor: answers[9003]?.optionIds?.[0] === 'NO' ? '#fee2e2' : '#ffffff',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.2s',
                      '&:hover': { borderColor: '#ef4444' }
                    }}
                  >
                    <Typography variant="h6" fontWeight="800" sx={{ color: answers[9003]?.optionIds?.[0] === 'NO' ? '#b91c1c' : '#475569' }}>
                      NO
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#991b1b', fontWeight: '600' }}>
                      Pendiente por repuestos o intervención mayor
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {renderRecommendationsSection()}

          <Button fullWidth variant="contained" size="large" onClick={handleStartSignature} sx={{ borderRadius: 4, py: 1.5, fontWeight: '800', bgcolor: '#ef4444', '&:hover': { bgcolor: '#dc2626' } }}>
            Finalizar y Firmar Emergencia
          </Button>
        </Stack>
      ) : (
        <Stack spacing={3}>
          {questionGroup?.questions?.length === 0 && (
            <Card sx={{ borderRadius: 4, border: '1px dashed #cbd5e1' }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  Este equipo no tiene preguntas asignadas. Asígnalas desde el módulo de Equipos.
                </Typography>
              </CardContent>
            </Card>
          )}
          {questionGroup?.questions?.map((question, index) => {
            const ans = answers[question.id];
            const selectedOptions = question.options?.filter(opt => ans?.optionIds?.includes(opt.id.toString())) || [];
            const requiresEvidenceByOption = selectedOptions.some(opt => opt.requires_photo);
            const requiresJustificationByOption = selectedOptions.some(opt => opt.requires_justification || opt.requires_justification === 1);
            const prevQuestion = questionGroup.questions[index - 1];
            const showGroupHeader = question.group_name && (!prevQuestion || prevQuestion.group_id !== question.group_id);

            return (
              <Box key={question.id}>
              {showGroupHeader && (
                <Typography variant="overline" fontWeight="800" color="primary" sx={{ display: 'block', mb: 1, mt: index === 0 ? 0 : 1 }}>
                  {question.group_name}
                </Typography>
              )}
              <Card sx={{ borderRadius: 4, border: '1px solid #f1f5f9' }}>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight="700" sx={{ mb: 2 }}>{index + 1}. {question.text}</Typography>
                  
                  {question.type === 'unica' && (
                    <RadioGroup value={ans?.optionIds?.[0] || ''} onChange={(e) => handleAnswerChange(question.id, e.target.value, 'unica')}>
                      {question.options?.map((opt) => (
                        <FormControlLabel key={opt.id} value={opt.id.toString()} control={<Radio />} label={opt.text} />
                      ))}
                    </RadioGroup>
                  )}

                  {question.type === 'multiple' && (
                    <FormGroup>
                      {question.options?.map((opt) => (
                        <FormControlLabel key={opt.id} control={<Checkbox checked={ans?.optionIds?.includes(opt.id.toString()) || false} onChange={() => handleAnswerChange(question.id, opt.id.toString(), 'multiple')} />} label={opt.text} />
                      ))}
                    </FormGroup>
                  )}

                  {question.type === 'abierta' && (
                    <TextField fullWidth multiline rows={3} placeholder="Respuesta..." value={ans?.text || ''} onChange={(e) => handleAnswerChange(question.id, e.target.value, 'texto')} />
                  )}

                  {question.type !== 'abierta' && (
                    <Box sx={{ mt: 2 }}>
                      <TextField 
                        fullWidth 
                        multiline 
                        size="small" 
                        rows={2} 
                        label={requiresJustificationByOption ? "Justificación requerida *" : "Observación (Opcional)"} 
                        placeholder={requiresJustificationByOption ? "Escribe la justificación aquí..." : "Observación o detalle adicional..."} 
                        value={ans?.text || ''} 
                        onChange={(e) => handleAnswerChange(question.id, e.target.value, 'texto')} 
                        required={requiresJustificationByOption}
                      />
                    </Box>
                  )}

                  {/* Sección de fotos debajo de cada pregunta */}
                  <Box sx={{ mt: 2, pt: 1.5, borderTop: '1px dashed #e2e8f0' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <CameraIcon className="h-5 w-5 text-gray-400" />
                        <Typography variant="caption" fontWeight="700">FOTOS ({ans?.photos?.length || 0})</Typography>
                      </Stack>
                      <Stack direction="row" spacing={1}>
                        {requiresEvidenceByOption && (
                          <Chip 
                            label="Foto requerida *" 
                            size="small" 
                            sx={{ 
                              height: 18, 
                              fontSize: '0.6rem', 
                              bgcolor: (ans?.photos?.length || 0) > 0 ? '#dcfce7' : '#fee2e2',
                              color: (ans?.photos?.length || 0) > 0 ? '#166534' : '#991b1b',
                              fontWeight: '700'
                            }} 
                          />
                        )}
                        {question.min_photos > 0 && <Chip label={`Mín: ${question.min_photos}`} size="small" sx={{ height: 18, fontSize: '0.6rem', bgcolor: (ans?.photos?.length || 0) >= question.min_photos ? '#dcfce7' : '#fee2e2' }} />}
                        {question.max_photos > 0 && <Chip label={`Máx: ${question.max_photos}`} size="small" sx={{ height: 18, fontSize: '0.6rem' }} />}
                      </Stack>
                      {(!question.max_photos || (ans?.photos?.length || 0) < question.max_photos) && (
                        <Button size="small" component="label" variant="contained" startIcon={<CameraIcon className="h-4 w-4" />} sx={{ borderRadius: 2, textTransform: 'none', bgcolor: '#f1f5f9', color: '#1e293b' }}>
                          Cargar
                          <input type="file" hidden multiple accept="image/*" capture="environment" onChange={(e) => handleFileChange(question.id, e)} />
                        </Button>
                      )}
                    </Box>
                    {/* Photo Previews */}
                    {ans?.photos?.length > 0 && (
                      <Box sx={{ display: 'flex', gap: 1.5, overflowX: 'auto', pt: 1, pb: 0.5 }}>
                        {ans.photos.map((photo, pIdx) => (
                          <Box key={pIdx} sx={{ position: 'relative', flexShrink: 0, width: 70, height: 70, borderRadius: 2, overflow: 'hidden', border: '2px solid #e2e8f0' }}>
                            <img src={getImageUrl(photo.preview)} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <IconButton
                              size="small"
                              onClick={() => removePhoto(question.id, pIdx)}
                              sx={{ position: 'absolute', top: 2, right: 2, bgcolor: 'rgba(255,255,255,0.9)', p: 0.5 }}
                            >
                              <Box sx={{ width: 12, height: 12, bgcolor: '#ef4444', borderRadius: '50%', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>×</Box>
                            </IconButton>
                          </Box>
                        ))}
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
              </Box>
            );
          })}

          {/* REPUESTOS / TRABAJOS RECOMENDADOS (OPCIONAL) */}
          {renderRecommendationsSection()}

          {/* OBSERVACIONES GENERALES */}
          <Card sx={{ borderRadius: 4, border: '1px solid #cbd5e1', overflow: 'hidden' }}>
            <Box sx={{ bgcolor: '#475569', px: 2, py: 1.5 }}>
              <Typography variant="subtitle2" fontWeight="800" sx={{ color: '#ffffff', letterSpacing: 0.5 }}>
                OBSERVACIONES GENERALES
              </Typography>
            </Box>
            <CardContent sx={{ p: 2 }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="Escribe observaciones generales del mantenimiento..."
                value={generalObservations}
                onChange={(e) => setGeneralObservations(e.target.value)}
              />
            </CardContent>
          </Card>

          <Button fullWidth variant="contained" size="large" onClick={handleStartSignature} sx={{ borderRadius: 4, py: 1.5, fontWeight: '800', bgcolor: '#1e293b' }}>
            Finalizar y Firmar
          </Button>
        </Stack>
      )}

      <Dialog open={showSignatureFlow} fullWidth maxWidth="sm" onClose={() => setShowSignatureFlow(false)}>
        <DialogTitle component="div" sx={{ pb: 0 }}>
          <Typography variant="h6" fontWeight="800">Finalizar Mantenimiento</Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ width: '100%', my: 2 }}>
            <Stepper activeStep={signatureStep === 'technician' ? 0 : 1} alternativeLabel>
              <Step><StepLabel>Firma Técnico</StepLabel></Step>
              <Step><StepLabel>Firma Cliente</StepLabel></Step>
            </Stepper>
          </Box>

          <Divider sx={{ my: 2 }} />

          {signatureStep === 'technician' ? (
            <Box>
              {!isDrawingNewTech && savedSignatures.length > 0 ? (
                <Stack spacing={2}>
                  <Typography variant="body2" color="text.secondary" fontWeight="600">
                    Selecciona una firma guardada o dibuja una nueva:
                  </Typography>
                  <Button 
                    fullWidth 
                    variant="outlined"
                    startIcon={<PencilIcon className="h-4 w-4"/>} 
                    onClick={() => setIsDrawingNewTech(true)}
                    sx={{ borderRadius: 3, textTransform: 'none', fontWeight: '700' }}
                  >
                    Dibujar Nueva Firma
                  </Button>
                  <Grid container spacing={2}>
                    {savedSignatures.map((sig) => (
                      <Grid item xs={6} key={sig.id}>
                        <Box sx={{ position: 'relative' }}>
                          <Paper 
                            onClick={() => handleSelectSavedSignature(sig)}
                            sx={{ 
                              p: 1, 
                              border: '2px solid #f1f5f9', 
                              cursor: 'pointer', 
                              transition: 'all 0.2s',
                              '&:hover': { borderColor: 'primary.main', transform: 'translateY(-2px)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' } 
                            }}
                          >
                            <img src={getImageUrl(sig.signature)} alt="Firma" style={{ width: '100%', height: 'auto', display: 'block' }} />
                            <Typography variant="caption" align="center" display="block" sx={{ mt: 1, fontWeight: '700', color: '#64748b' }}>
                              {sig.name || 'Firma Guardada'}
                            </Typography>
                          </Paper>
                          <IconButton
                            size="small"
                            onClick={(e) => { e.stopPropagation(); handleDeleteSignature(sig); }}
                            sx={{
                              position: 'absolute',
                              top: -8,
                              right: -8,
                              bgcolor: '#ef4444',
                              color: '#fff',
                              width: 22,
                              height: 22,
                              '&:hover': { bgcolor: '#dc2626' },
                              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                            }}
                          >
                            <Box sx={{ fontSize: 13, fontWeight: 800, lineHeight: 1 }}>×</Box>
                          </IconButton>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Stack>
              ) : (
                <SignaturePad 
                  key="tech-sig"
                  title="Dibuja tu firma técnica" 
                  onSave={handleSaveTechSignature} 
                  onCancel={savedSignatures.length > 0 ? () => setIsDrawingNewTech(false) : null} 
                />
              )}
            </Box>
          ) : (
            <Box>
              <TextField
                fullWidth
                label="Nombre completo del cliente"
                placeholder="Ej: Juan Pérez García"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
                sx={{ mb: 2 }}
                inputProps={{ maxLength: 120 }}
                helperText="Este nombre quedará registrado junto a la firma en el reporte."
              />
              <SignaturePad 
                key="cust-sig"
                title="Solicite la firma del cliente" 
                onSave={(base64) => { handleFinalSubmit(base64); }} 
              />
              <Button 
                fullWidth 
                variant="text" 
                onClick={() => setSignatureStep('technician')}
                sx={{ mt: 1, color: '#64748b', textTransform: 'none', fontWeight: '700' }}
              >
                Volver a firma del técnico
              </Button>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: '#f8fafc' }}>
          <Button onClick={() => setShowSignatureFlow(false)} sx={{ color: '#64748b', fontWeight: '700' }}>
            Cancelar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
