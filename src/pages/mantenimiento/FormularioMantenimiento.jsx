import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Stack, 
  Button, 
  CircularProgress,
  Chip,
  Collapse,
  IconButton,
  Divider,
  Paper,
  Checkbox,
  FormGroup,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
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
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PencilIcon,
  TrashIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import Swal from 'sweetalert2';
import { decrypt } from '../../utils/crypto.js';

// --- Custom Signature Canvas Component ---
const SignaturePad = ({ onSave, title, onCancel }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [history, setHistory] = useState([]); // Array of ImageData

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000';

    const getPos = (e) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return { x: clientX - rect.left, y: clientY - rect.top };
    };

    const startDrawing = (e) => {
      // Save current state to history before starting new stroke
      const currentImgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setHistory(prev => [...prev, currentImgData]);

      setIsDrawing(true);
      const pos = getPos(e);
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
      if (e.touches) e.preventDefault();
    };

    const draw = (e) => {
      if (!isDrawing) return;
      const pos = getPos(e);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      if (e.touches) e.preventDefault();
    };

    const stopDrawing = () => {
      setIsDrawing(false);
    };

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('touchstart', startDrawing);
    canvas.addEventListener('touchmove', draw, { passive: false });
    canvas.addEventListener('touchend', stopDrawing);

    return () => {
      canvas.removeEventListener('mousedown', startDrawing);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('mouseup', stopDrawing);
      canvas.removeEventListener('touchstart', startDrawing);
      canvas.removeEventListener('touchmove', draw);
      canvas.removeEventListener('touchend', stopDrawing);
    };
  }, [isDrawing]);

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
          width={window.innerWidth > 500 ? 450 : window.innerWidth - 60} 
          height={200} 
          style={{ display: 'block', cursor: 'crosshair' }}
        />
      </Box>
      <Grid container spacing={1} sx={{ mt: 2 }}>
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
  const [loading, setLoading] = useState(true);
  const [equipo, setEquipo] = useState(null);
  const [questionGroup, setQuestionGroup] = useState(null);
  const [answers, setAnswers] = useState({});
  
  // --- Signature Flow State ---
  const [showSignatureFlow, setShowSignatureFlow] = useState(false);
  const [signatureStep, setSignatureStep] = useState('technician'); // 'technician' | 'customer'
  const [savedSignatures, setSavedSignatures] = useState([]);
  const [technicianSignature, setTechnicianSignature] = useState(null);
  const [customerSignature, setCustomerSignature] = useState(null);
  const [isDrawingNewTech, setIsDrawingNewTech] = useState(false);

  const userId = decrypt(sessionStorage.getItem('userId'));
  const backendUrl = 'http://localhost:8080'; // Should ideally come from a config file

  const getImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('data:') || path.startsWith('blob:')) return path;
    return `${backendUrl}${path}`;
  };

  useEffect(() => {
    fetchData();
    fetchMySignatures();
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

      if (equipoData.questionGroupId) {
        const resGroup = await axios.get(`/getOneQuestionGroup/${equipoData.questionGroupId}`);
        setQuestionGroup(resGroup.data.data);
      } else {
        setQuestionGroup({ questions: [] });
      }
    } catch (error) {
      console.error("Error fetching form data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMySignatures = async () => {
    try {
      const res = await axios.get(`/getMySignatures/${userId}`);
      setSavedSignatures(res.data.data || []);
      if (res.data.data?.length === 0) setIsDrawingNewTech(true);
    } catch (error) {
      console.error("Error fetching signatures:", error);
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

  const validateForm = () => {
    for (const q of questionGroup.questions) {
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

  const handleStartSignature = () => {
    if (!validateForm()) return;
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
    try {
      setLoading(true);
      setShowSignatureFlow(false); // Close modal immediately
      const payload = {
        project_id: id,
        technician_id: userId,
        customer_signature: custSig,
        technician_signature: technicianSignature,
        answers: answers
      };

      await axios.post('/saveMaintenanceReport', payload);

      Swal.fire({
        title: '¡Mantenimiento Finalizado!',
        text: "El reporte se ha guardado exitosamente.",
        icon: 'success',
        confirmButtonText: 'Aceptar'
      }).then(() => {
        setSignatureStep('technician'); // Reset for next time
        navigate('/mantenimiento/clientes');
      });
    } catch (error) {
      console.error("Error saving maintenance report:", error);
      Swal.fire('Error', 'No se pudo guardar el reporte de mantenimiento', 'error');
      setShowSignatureFlow(true); // Re-open if error to allow retry
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" py={10}><CircularProgress /></Box>;

  return (
    <Box sx={{ p: 2, pb: 10 }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
        <IconButton onClick={() => navigate(-1)}><ChevronLeftIcon className="h-6 w-6" /></IconButton>
        <Box>
          <Typography variant="h5" fontWeight="800">Mantenimiento</Typography>
          <Typography variant="caption" color="text.secondary">{equipo?.description} | {equipo?.elevatorTypeName}</Typography>
        </Box>
      </Stack>

      {/* Questions Section */}
      <Stack spacing={3}>
        {questionGroup?.questions?.map((question, index) => {
          const ans = answers[question.id];
          const selectedOptions = question.options?.filter(opt => ans?.optionIds?.includes(opt.id.toString())) || [];
          const requiresEvidenceByOption = selectedOptions.some(opt => opt.requires_photo);
          const showPhotoSection = question.type === 'fotos' || requiresEvidenceByOption;

          return (
            <Card key={question.id} sx={{ borderRadius: 4, border: '1px solid #f1f5f9' }}>
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

                {showPhotoSection && (
                  <Box sx={{ mt: 3, pt: 2, borderTop: '1px dashed #e2e8f0' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <CameraIcon className="h-5 w-5 text-gray-400" />
                        <Typography variant="caption" fontWeight="700">FOTOS ({ans?.photos?.length || 0})</Typography>
                      </Stack>
                      <Stack direction="row" spacing={1}>
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
                      <Box sx={{ display: 'flex', gap: 1.5, overflowX: 'auto', pt: 1.5, pb: 0.5 }}>
                        {ans.photos.map((photo, pIdx) => (
                          <Box key={pIdx} sx={{ position: 'relative', flexShrink: 0, width: 80, height: 80, borderRadius: 3, overflow: 'hidden', border: '2px solid #f1f5f9' }}>
                            <img src={getImageUrl(photo.preview)} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <IconButton
                              size="small"
                              onClick={() => removePhoto(question.id, pIdx)}
                              sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'rgba(255,255,255,0.9)', '&:hover': { bgcolor: 'white' } }}
                            >
                              <Box sx={{ width: 12, height: 12, bgcolor: '#ef4444', borderRadius: '50%', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>×</Box>
                            </IconButton>
                          </Box>
                        ))}
                      </Box>
                    )}
                  </Box>
                )}
              </CardContent>
            </Card>
          );
        })}

        <Button fullWidth variant="contained" size="large" onClick={handleStartSignature} sx={{ borderRadius: 4, py: 1.5, fontWeight: '800', bgcolor: '#1e293b' }}>
          Finalizar y Firmar
        </Button>
      </Stack>

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
                  <Grid container spacing={2}>
                    {savedSignatures.map((sig) => (
                      <Grid item xs={6} key={sig.id}>
                        <Paper 
                          onClick={() => { setTechnicianSignature(sig.signature); setSignatureStep('customer'); }}
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
                      </Grid>
                    ))}
                  </Grid>
                  <Button 
                    fullWidth 
                    variant="outlined"
                    startIcon={<PencilIcon className="h-4 w-4"/>} 
                    onClick={() => setIsDrawingNewTech(true)}
                    sx={{ borderRadius: 3, textTransform: 'none', fontWeight: '700' }}
                  >
                    Dibujar Nueva Firma
                  </Button>
                </Stack>
              ) : (
                <SignaturePad 
                  title="Dibuja tu firma técnica" 
                  onSave={handleSaveTechSignature} 
                  onCancel={savedSignatures.length > 0 ? () => setIsDrawingNewTech(false) : null} 
                />
              )}
            </Box>
          ) : (
            <Box>
              <SignaturePad 
                title="Solicite la firma del cliente" 
                onSave={(base64) => { setCustomerSignature(base64); handleFinalSubmit(base64); }} 
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
