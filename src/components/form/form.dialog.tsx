import { useState, useEffect, useRef } from 'react';
import { Button, CircularProgress, Box } from '@mui/material';
import axios from 'axios';
import BaseDialog from '../dialog/base.dialog.tsx';
import BaseForm, { BaseField } from './base.form.tsx';
import { decrypt } from '../../utils/crypto.js';
import Swal from 'sweetalert2';

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer;
    toast.onmouseleave = Swal.resumeTimer;
    const container = Swal.getContainer();
    if (container) {
      container.style.zIndex = '9999';
    }
  }
});

const Alert = Swal.mixin({
  confirmButtonColor: '#3b82f6',
  didOpen: () => {
    const container = Swal.getContainer();
    if (container) {
      container.style.zIndex = '9999';
    }
  }
});

interface FormDialogProps {
  open: boolean;
  onClose: () => void;
  onSave?: (data: Record<string, any>) => void;
  onSuccess?: (data: Record<string, any>) => void;
  fields: BaseField[];
  mode: 'create' | 'update';
  initialValues?: Record<string, any>;
  additionalValues?: Record<string, any>;
  title?: string;
  endpoint?: string;
  saveEndpoint?: string;
  updateEndpoint?: string;
  fetchOneEndpoint?: string;
  mapPayload?: (payload: any) => any;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
}

/** Returns true if any field in the form definition is of type 'file' */
const hasFileFields = (fields: BaseField[]) => fields.some((f) => f.input === 'file');

export default function FormDialog({
  open,
  onClose,
  onSave,
  onSuccess,
  fields,
  mode = 'create',
  initialValues,
  additionalValues,
  title,
  endpoint,
  saveEndpoint,
  updateEndpoint,
  fetchOneEndpoint,
  mapPayload,
  maxWidth,
}: FormDialogProps) {
  const [currentData, setCurrentData] = useState<Record<string, any>>(initialValues || {});
  const [isFetching, setIsFetching] = useState(false);
  const [isFetchingCopy, setIsFetchingCopy] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  // Track previous copyFromProductId to detect changes
  const prevCopyFromRef = useRef<any>(null);
  // Module-level cache shared across all FormDialog instances
  const productCacheRef = useRef<Record<string, any>>({});

  // When copyFromProductId changes inside the form, fetch and prefill that product's data
  useEffect(() => {
    const copyId = currentData?.copyFromProductId;
    if (!copyId || copyId === prevCopyFromRef.current) return;
    prevCopyFromRef.current = copyId;

    // Return immediately from cache — 0ms, no network call
    if (productCacheRef.current[copyId]) {
      const product = productCacheRef.current[copyId];
      setCurrentData(prev => ({
        ...prev,
        name: product.name ?? prev.name,
        description: product.description ?? prev.description,
        fk_group_product: product.fk_group_product ?? prev.fk_group_product,
        por_metros_cuadrados: product.por_metros_cuadrados ?? prev.por_metros_cuadrados,
        net_items: product.net_items ?? prev.net_items,
        copyFromProductId: copyId,
      }));
      return;
    }

    // Not cached yet — fetch with abort support
    const controller = new AbortController();
    setIsFetchingCopy(true);

    axios.get(`/getOneproduct/${copyId}`, { signal: controller.signal })
      .then(res => {
        const product = res.data.data || res.data;
        // Store in cache for future selections
        productCacheRef.current[copyId] = product;
        setCurrentData(prev => ({
          ...prev,
          name: product.name ?? prev.name,
          description: product.description ?? prev.description,
          fk_group_product: product.fk_group_product ?? prev.fk_group_product,
          por_metros_cuadrados: product.por_metros_cuadrados ?? prev.por_metros_cuadrados,
          net_items: product.net_items ?? prev.net_items,
          copyFromProductId: copyId,
        }));
      })
      .catch(e => {
        if (axios.isCancel(e)) return; // Stale request — ignore silently
        console.error('Error fetching product to copy:', e);
      })
      .finally(() => setIsFetchingCopy(false));

    // Cleanup: abort if user changes selection before response arrives
    return () => controller.abort();
  }, [currentData?.copyFromProductId]);

  useEffect(() => {
    const fetchData = async () => {
      if (open && mode === 'update' && initialValues?.id) {
        // Preference: fetchOneEndpoint > updateEndpoint > endpoint
        const baseFetchUrl = fetchOneEndpoint || updateEndpoint || endpoint;
        const fetchUrl = baseFetchUrl ? `${baseFetchUrl}/${initialValues.id}` : null;

        if (fetchUrl) {
          setIsFetching(true);
          try {
            const response = await axios.get(fetchUrl);
            const fetchedData = response.data.data || response.data;
            const item = Array.isArray(fetchedData) 
              ? fetchedData.find((i: any) => i.id === initialValues.id) 
              : fetchedData;
            
            setCurrentData(item || initialValues);
          } catch (error) {
            console.error('Error fetching record for update:', error);
            setCurrentData(initialValues || {});
          } finally {
            setIsFetching(false);
          }
        } else {
          // If no fetch URL, just use initialValues when opening
          setCurrentData(initialValues || {});
        }
      } else if (open) {
        setCurrentData(initialValues || {});
      }
    };

    if (open) {
      // Reset copy-from tracker so user can re-select on next open
      prevCopyFromRef.current = null;
      fetchData();
    }
  }, [open, initialValues, mode, endpoint, updateEndpoint, fetchOneEndpoint]);

  const handleSave = async () => {
    // Use FormData if there is a new File selected OR if the form has file-type fields
    // (so multer always processes the request and req.file is available on the backend)
    const isFile = (val: any) => val instanceof File || (val && typeof val === 'object' && val.name && val.size !== undefined);
    const hasNewFile = Object.values(currentData).some(isFile);
    const useFormData = hasNewFile || hasFileFields(fields);

    let mappedData = currentData;
    if (mapPayload) {
      mappedData = mapPayload(currentData);
    }

    let payload: any = { 
      ...mappedData,
      ...(additionalValues || {}),
      state: 1, 
      fkUser: decrypt(sessionStorage.getItem('userId')),
      company: sessionStorage.getItem('company') 
    };
    let headers = {};

    if (useFormData) {
      const formData = new FormData();
      Object.keys(payload).forEach((key) => {
        const val = payload[key];
        if (isFile(val)) {
          // New file selected by user — append directly
          formData.append(key, val);
        } else if (key === 'img') {
          // Special case: null/undefined = user cleared the image → send '' to signal removal.
          // Non-null string = existing filename → skip (backend keeps current file unchanged).
          if (val === null || val === undefined) {
            formData.append('img', '');
          }
        } else if (val !== null && val !== undefined && typeof val !== 'object') {
          // Append primitives; skip objects/arrays
          formData.append(key, val);
        }
      });

      payload = formData;
      headers = { 'Content-Type': undefined };
    }

    if (mode === 'create') {
      const finalSaveEndpoint = saveEndpoint || endpoint;
      if (finalSaveEndpoint) {
        setIsSaving(true);
        try {
          const response = await axios.post(finalSaveEndpoint, payload, { headers });
          if (onSuccess) onSuccess({ response, payload });
          Toast.fire({ icon: 'success', title: 'Registro creado exitosamente' });
          onClose();
        } catch (error: any) {
          console.error('Error creating record:', error);
          const errorMessage = error.response?.data?.message || 'Error al crear el registro';
          const status = error.response?.status;

          if (status === 400) {
            Alert.fire({
              icon: 'error',
              title: errorMessage.includes('stock') ? 'Stock Insuficiente' : 'Error de Validación',
              html: `<div style="text-align: left;">${errorMessage.replace(/\n/g, '<br/>')}</div>`,
              confirmButtonText: 'Entendido'
            });
          } else {
            Toast.fire({ 
              icon: 'error', 
              title: errorMessage,
              timer: 5000 
            });
          }
        } finally {
          setIsSaving(false);
        }
      }
    } else {
      // mode === 'update'
      const finalUpdateEndpoint = updateEndpoint || saveEndpoint || endpoint;
      if (finalUpdateEndpoint) {
        setIsSaving(true);
        try {
          // Note: some backends prefer POST with _method=PUT for FormData
          // but here we follow the existing pattern of using PUT
          const response = await axios.put(`${finalUpdateEndpoint}/${currentData.id}`, payload, { headers });
          if (onSuccess) onSuccess({ response, payload });
          Toast.fire({ icon: 'success', title: 'Registro actualizado exitosamente' });
          onClose();
        } catch (error: any) {
          console.error('Error updating record:', error);
          const errorMessage = error.response?.data?.message || 'Error al actualizar el registro';
          const status = error.response?.status;

          if (status === 400) {
            Alert.fire({
              icon: 'error',
              title: 'Inconsistencia en la operación',
              html: `<div style="text-align: left;">${errorMessage.replace(/\n/g, '<br/>')}</div>`,
              confirmButtonText: 'Entendido'
            });
          } else {
            Toast.fire({ 
              icon: 'error', 
              title: errorMessage,
              timer: 5000
            });
          }
        } finally {
          setIsSaving(false);
        }
      }
    }

    if (!saveEndpoint && !endpoint && !updateEndpoint && onSave) {
      onSave(currentData);
      onClose();
    }
  };

  const dialogTitle = title || (mode === 'create' ? 'Crear registro' : 'Actualizar registro');

  const actions = (
    <>
      <Button onClick={onClose} color="inherit" disabled={isSaving}>
        Cancelar
      </Button>
      <Button 
        onClick={handleSave} 
        variant="contained" 
        color="primary"
        disabled={isSaving}
        startIcon={isSaving && <CircularProgress size={20} color="inherit" />}
      >
        Guardar
      </Button>
    </>
  );

  return (
    <BaseDialog
      open={open}
      onClose={onClose}
      title={dialogTitle}
      actions={actions}
      maxWidth={maxWidth || 'sm'}
      fullWidth
    >
      <Box sx={{ minHeight: 100, position: 'relative' }}>
        {isFetching ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {isFetchingCopy && (
              <Box sx={{
                position: 'absolute', inset: 0, zIndex: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                bgcolor: 'rgba(255,255,255,0.7)',
                borderRadius: 1,
              }}>
                <CircularProgress size={28} />
              </Box>
            )}
            <BaseForm
              mode={mode}
              fields={fields}
              initialValues={currentData}
              onChange={(data) => setCurrentData(data)}
            />
          </>
        )}
      </Box>
    </BaseDialog>
  );
}
