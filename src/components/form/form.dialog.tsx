import { useState, useEffect } from 'react';
import { Button, CircularProgress, Box } from '@mui/material';
import axios from 'axios';
import BaseDialog from '../dialog/base.dialog.tsx';
import BaseForm, { BaseField } from './base.form.tsx';
import { decrypt } from '../../utils/crypto.js';

interface FormDialogProps {
  open: boolean;
  onClose: () => void;
  onSave?: (data: Record<string, any>) => void;
  onSuccess?: (data: Record<string, any>) => void;
  fields: BaseField[];
  mode: 'create' | 'update';
  initialValues?: Record<string, any>;
  title?: string;
  endpoint?: string;
  saveEndpoint?: string;
  updateEndpoint?: string;
  fetchOneEndpoint?: string;
}

export default function FormDialog({
  open,
  onClose,
  onSave,
  onSuccess,
  fields,
  mode = 'create',
  initialValues,
  title,
  endpoint,
  saveEndpoint,
  updateEndpoint,
  fetchOneEndpoint,
}: FormDialogProps) {
  const [currentData, setCurrentData] = useState<Record<string, any>>(initialValues || {});
  const [isFetching, setIsFetching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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
        }
      } else if (open) {
        setCurrentData(initialValues || {});
      }
    };

    fetchData();
  }, [open, initialValues, mode, endpoint, updateEndpoint]);

  const handleSave = async () => {
    const hasFile = Object.values(currentData).some((val) => val instanceof File);

    let payload: any = { 
      ...currentData, 
      state: 1, 
      fkUser: decrypt(sessionStorage.getItem('userId')),
      company: sessionStorage.getItem('company') 
    };
    let headers = {};

    if (hasFile) {
      const formData = new FormData();
      Object.keys(payload).forEach((key) => {
        if (payload[key] !== null && payload[key] !== undefined) {
          formData.append(key, payload[key]);
        }
      });
      payload = formData;
      headers = { 'Content-Type': 'multipart/form-data' };
    }

    if (mode === 'create') {
      const finalSaveEndpoint = saveEndpoint || endpoint;
      if (finalSaveEndpoint) {
        setIsSaving(true);
        try {
          const response = await axios.post(finalSaveEndpoint, payload, { headers });
          if (onSuccess) onSuccess({ response, payload });
          onClose();
        } catch (error) {
          console.error('Error creating record:', error);
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
          onClose();
        } catch (error) {
          console.error('Error updating record:', error);
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
      maxWidth="sm"
      fullWidth
    >
      <Box sx={{ minHeight: 100, position: 'relative' }}>
        {isFetching ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <BaseForm
            mode={mode}
            fields={fields}
            initialValues={currentData}
            onChange={(data) => setCurrentData(data)}
          />
        )}
      </Box>
    </BaseDialog>
  );
}
