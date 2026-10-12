import { useState, useRef, useEffect } from 'react';
import { 
  Button, 
  Tooltip, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  Box, 
  Typography, 
  Grid, 
  Divider, 
  Stack
} from '@mui/material';
import BaseGrid from '../../components/grid/base.grid.tsx';
import { ArrowDownTrayIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import RemisionPDF from '../productos/remisionPDF.jsx';
import { pdf } from '@react-pdf/renderer';
import axios from 'axios';
import Swal from 'sweetalert2';
import { BASE_URL } from '../../App';

// --- Canvas Signature Pad Component ---
function SignaturePad({ onSave, title, initialImage }) {
  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);
  const [history, setHistory] = useState([]);
  const [hasDrawn, setHasDrawn] = useState(Boolean(initialImage));

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
      setHistory((prev) => [...prev, currentImgData]);
    } catch (err) {}

    isDrawingRef.current = true;
    setHasDrawn(true);
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    ctx.lineTo(pos.x + 0.1, pos.y + 0.1);
    ctx.stroke();

    if (e.cancelable && e.touches) {
      e.preventDefault();
    }
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

    if (e.cancelable && e.touches) {
      e.preventDefault();
    }
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
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHistory([]);
    setHasDrawn(false);
  };

  const undo = () => {
    if (history.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const lastState = history[history.length - 1];
    ctx.putImageData(lastState, 0, 0);
    setHistory((prev) => prev.slice(0, -1));
    if (history.length <= 1 && !initialImage) {
      setHasDrawn(false);
    }
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const blank = document.createElement('canvas');
    blank.width = canvas.width;
    blank.height = canvas.height;
    if (canvas.toDataURL() === blank.toDataURL() && !initialImage) {
      Swal.fire('Atención', 'Por favor realiza el trazo de la firma en el recuadro.', 'warning');
      return;
    }
    onSave(canvas.toDataURL());
  };

  return (
    <Box sx={{ mt: 1 }}>
      <Typography variant="subtitle2" fontWeight="700" gutterBottom sx={{ color: '#334155' }}>
        {title || 'Firma Digital de Recibido'}
      </Typography>
      <Box sx={{ border: '2px dashed #94a3b8', borderRadius: 3, overflow: 'hidden', bgcolor: '#fff', touchAction: 'none' }}>
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
      <Grid container spacing={1} sx={{ mt: 1.5 }}>
        <Grid item xs={6}>
          <Button fullWidth variant="outlined" color="warning" onClick={undo} disabled={history.length === 0} sx={{ textTransform: 'none', borderRadius: 2 }}>
            Deshacer trazo
          </Button>
        </Grid>
        <Grid item xs={6}>
          <Button fullWidth variant="outlined" color="error" onClick={clear} sx={{ textTransform: 'none', borderRadius: 2 }}>
            Limpiar firma
          </Button>
        </Grid>
      </Grid>
      <Box sx={{ mt: 2 }}>
        <Button
          fullWidth
          variant="contained"
          color="primary"
          onClick={handleSave}
          disabled={!hasDrawn && !initialImage}
          sx={{ borderRadius: 2, fontWeight: 700, py: 1 }}
        >
          Guardar Firma
        </Button>
      </Box>
    </Box>
  );
}

// --- Signature Modal Dialog ---
function RemisionSignatureModal({ open, onClose, remision, onSignedSuccess }) {
  const [customerName, setCustomerName] = useState('');
  const [signatureData, setSignatureData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [isRedrawing, setIsRedrawing] = useState(false);

  useEffect(() => {
    if (open && remision) {
      setCustomerName(remision.customer_name || remision.customer || '');
      setSignatureData(remision.customer_signature || null);
      setIsRedrawing(!remision.customer_signature);
    }
  }, [open, remision]);

  const backendUrl = BASE_URL.replace('/api/v1/', '');
  const getFullUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('data:') || path.startsWith('blob:')) return path;
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    const token = sessionStorage.getItem('Token') || '';
    return `${backendUrl}/${cleanPath}?token=${encodeURIComponent(token)}`;
  };

  const handleSaveSignature = async (base64) => {
    if (!customerName.trim()) {
      Swal.fire('Atención', 'Por favor ingresa el nombre de la persona que recibe la remisión.', 'warning');
      return;
    }

    try {
      setSaving(true);
      await axios.post(`/signRemision/${remision.id}`, {
        customer_signature: base64,
        customer_name: customerName.trim()
      });

      Swal.fire({
        title: '¡Firma Guardada!',
        text: 'La firma de recibido ha sido registrada exitosamente en la remisión.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });

      onSignedSuccess();
      onClose();
    } catch (error) {
      console.error('Error guardando firma de remision:', error);
      Swal.fire('Error', 'No se pudo guardar la firma de la remisión.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!remision) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>
        <Typography variant="h6" fontWeight="800">
          Firma Digital de Recibido
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Remisión #{remision.id} — {remision.customer || 'Cliente'} ({remision.project || 'Proyecto'})
        </Typography>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ pt: 2 }}>
        <Stack spacing={2}>
          <TextField
            fullWidth
            size="small"
            label="Nombre de quien recibe (Cliente)"
            placeholder="Ej: Juan Pérez"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            required
            helperText="Nombre completo de la persona que recibe los materiales o equipos."
          />

          {!isRedrawing && remision.customer_signature ? (
            <Box sx={{ border: '1px solid #cbd5e1', borderRadius: 3, p: 2, textAlign: 'center', bgcolor: '#f8fafc' }}>
              <Typography variant="caption" color="text.secondary" fontWeight="700" display="block" sx={{ mb: 1 }}>
                FIRMA REGISTRADA ACTUALMENTE
              </Typography>
              <img
                src={getFullUrl(remision.customer_signature)}
                alt="Firma Registrada"
                style={{ maxHeight: 120, maxWidth: '100%', objectFit: 'contain', margin: '0 auto', display: 'block' }}
              />
              <Typography variant="body2" fontWeight="700" sx={{ mt: 1, color: '#1e293b' }}>
                {remision.customer_name || 'Cliente'}
              </Typography>
              {remision.signed_date && (
                <Typography variant="caption" color="text.secondary">
                  Firmado el: {new Date(remision.signed_date).toLocaleDateString()}
                </Typography>
              )}
              <Button
                variant="outlined"
                size="small"
                onClick={() => setIsRedrawing(true)}
                sx={{ mt: 2, textTransform: 'none', borderRadius: 2 }}
              >
                Volver a firmar / Cambiar firma
              </Button>
            </Box>
          ) : (
            <SignaturePad
              title="Dibuja la firma del cliente"
              onSave={handleSaveSignature}
            />
          )}
        </Stack>
      </DialogContent>
      <Divider />
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={saving} sx={{ color: '#64748b', fontWeight: 600 }}>
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function Remisiones() {
  const [gridKey, setGridKey] = useState(0);
  const [selectedRemisionForSign, setSelectedRemisionForSign] = useState(null);
  const [signModalOpen, setSignModalOpen] = useState(false);

  const fields = [
    {
      name: 'id',
      label: 'ID Remisión',
      input: 'text',
      grid: { xs: 12 },
    },
    {
      name: 'date',
      label: 'Fecha',
      input: 'text',
      grid: { xs: 12 },
    },
    {
      name: 'fk_proyect',
      label: 'Proyecto',
      input: 'text',
      grid: { xs: 12 },
    },
    {
      name: 'customer',
      label: 'Cliente',
      input: 'text',
      grid: { xs: 12 },
    },
    {
      name: 'description',
      label: 'Descripción',
      input: 'text',
      grid: { xs: 12 },
    },
    {
      name: 'elaboradoPor',
      label: 'Elaborado Por',
      input: 'text',
      grid: { xs: 12 },
    },
    {
      name: 'recibidoPor',
      label: 'Recibido Por (Cliente)',
      input: 'text',
      grid: { xs: 12 },
    }
  ];

  const mapRemisionesData = (items) => {
    return items.map(item => ({
      ...item,
      id: item.id,
      date: new Date(item.date).toLocaleDateString(),
      customer: item.customer,
      description: item.description,
      elaboradoPor: item.elaboradoPor,
      recibidoPor: item.customer_signature
        ? (item.customer_name ? `Firmado: ${item.customer_name}` : 'Firmado')
        : 'Sin firmar'
    }));
  };

  const handleOpenSignature = (remision) => {
    setSelectedRemisionForSign(remision);
    setSignModalOpen(true);
  };

  const handleSignatureSuccess = () => {
    setGridKey((k) => k + 1);
  };

  const makeAndDownloadPDF = async (remision) => {
    const backendUrl = BASE_URL.replace('/api/v1/', '');

    // Transform backend data to match RemisionPDF expected structure
    const remisionPDF = {
      remisionId: remision.id,
      projectId: remision.proyect?.id ? String(remision.proyect.id) : '',
      cliente: remision.customer,
      fecha: remision.date,
      description: remision.description,
      elaboradoPor: remision.elaboradoPor,
      aprobadoPor: remision.customer_name || ' ',
      customer_signature: remision.customer_signature,
      customer_name: remision.customer_name,
      signed_date: remision.signed_date,
      products: (remision.remisionProducts || []).map(rp => ({
        id: rp.product?.id || rp.fk_product,
        name: rp.product?.name || `Producto ${rp.fk_product}`,
        cantidad: rp.quantity,
        components: []
      })),
      items: (remision.remisionItems || []).map(ri => ({
        id: ri.item?.id || ri.fk_item,
        description: ri.item?.description || `Ítem ${ri.fk_item}`,
        cantidad: ri.quantity,
        ubicacion: [ri.item?.position1, ri.item?.position2, ri.item?.position3].filter(Boolean).join(' - ') || 'S/N'
      }))
    };

    try {
      const blob = await pdf(<RemisionPDF remision={remisionPDF} backendUrl={backendUrl} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `remision_${remision.id}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generando PDF:', error);
    }
  };

  return (
    <>
      <BaseGrid
        key={gridKey}
        title="Remisiones Realizadas"
        endpoint={`/getAll/${sessionStorage.getItem('company')}`}
        fields={fields}
        mapData={mapRemisionesData}
        hideCreate={true}
        hideEdit={true}
        hideDelete={true}
        excludeKeys={['company', 'fkUser', 'proyect', 'user', 'remisionProducts', 'remisionItems', 'customer_signature', 'customer_name', 'signed_date']}
        renderExtraActions={(item) => (
          <Stack direction="row" spacing={1}>
            <Tooltip title={item.customer_signature ? `Firmado por ${item.customer_name || 'cliente'} (Clic para ver/editar)` : "Firmar recibido (Cliente)"} placement="top">
              <span>
                <Button 
                  variant={item.customer_signature ? "contained" : "outlined"} 
                  size="small" 
                  color={item.customer_signature ? "success" : "warning"}
                  onClick={() => handleOpenSignature(item)}
                  sx={{ minWidth: '40px', p: 1 }}
                >
                  <PencilSquareIcon className="h-5 w-5" />
                </Button>
              </span>
            </Tooltip>
            <Tooltip title="Descargar PDF" placement="top">
              <span>
                <Button 
                  variant="outlined" 
                  size="small" 
                  color="primary" 
                  onClick={() => makeAndDownloadPDF(item)}
                  sx={{ minWidth: '40px', p: 1 }}
                >
                  <ArrowDownTrayIcon className="h-5 w-5" />
                </Button>
              </span>
            </Tooltip>
          </Stack>
        )}
      />

      {/* Modal para firma digital de remisión */}
      <RemisionSignatureModal
        open={signModalOpen}
        onClose={() => setSignModalOpen(false)}
        remision={selectedRemisionForSign}
        onSignedSuccess={handleSignatureSuccess}
      />
    </>
  );
}
