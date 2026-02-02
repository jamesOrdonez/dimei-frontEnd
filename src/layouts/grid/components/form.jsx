import { Modal, Box, Card, CardContent, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import FormModal from './form.modal';
import FormModal_product from './form.modal.product';
import { useTheme, useMediaQuery } from '@mui/material';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',

  width: '90%',
  maxWidth: 600,

  maxHeight: '90vh',
  overflowY: 'auto',

  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 24,
};

export default function Form({
  schema,
  title = 'Formulario',
  initialValues = null,
  onSubmit,
  onClose,
  buttonName,
  color,
  aditionalSchema = null,
  onChangeForm,
}) {
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // 🔥 IMPORTANTE: inicializar net_items
  const [formData, setFormData] = useState({
    net_items: [],
  });

  /* =========================
     SYNC EDIT MODE
  ========================= */
  useEffect(() => {
    if (initialValues) {
      setFormData({
        ...initialValues,
        net_items: initialValues.net_items || [],
      });
      setOpen(true);
    }
  }, [initialValues]);

  /* =========================
     HANDLERS
  ========================= */
  const handleOpenNew = () => {
    setFormData({
      net_items: [],
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setFormData({
      net_items: [],
    });
    onClose?.();
  };
  const handleChange = (e) => {
    const { name, type, files, value } = e.target;

    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: type === 'file' ? files[0] : value,
      };

      if (onChangeForm) {
        onChangeForm(updated);
      }

      return updated;
    });
  };

  const handleSubmit = () => {
    onSubmit(formData);
    handleClose();
  };

  const isEditing = Boolean(initialValues);

  return (
    <>
      {/* BOTÓN NUEVO */}
      {!isEditing && (
        <button
          type="button"
          className={`flex items-center justify-center text-white bg-${
            color || 'blue'
          }-600 font-medium rounded-lg text-sm px-4 py-2 hover:bg-${color || 'blue'}-700`}
          onClick={handleOpenNew}
        >
          {buttonName || 'Nuevo'}
        </button>
      )}

      <Modal open={open} onClose={handleClose}>
        <Box sx={style}>
          <Card sx={{ boxShadow: 'none' }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant="h6" mb={2}>
                {isEditing ? `Editar ${title}` : `Nuevo ${title}`} 📝
              </Typography>

              {aditionalSchema ? (
                <FormModal_product schema={schema} values={formData} onChange={handleChange} />
              ) : (
                <FormModal schema={schema} values={formData} onChange={handleChange} />
              )}

              {/* BOTONES */}
              <div className="mt-6 flex justify-end gap-3">
                <button onClick={handleClose} className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400">
                  Cancelar
                </button>

                <button onClick={handleSubmit} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                  Guardar
                </button>
              </div>
            </CardContent>
          </Card>
        </Box>
      </Modal>
    </>
  );
}
