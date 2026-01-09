import { Modal, Box, Card, CardContent, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import FormModal_product from './form.modal.product';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',

  width: {
    xs: '95%', // 📱 móvil
    sm: '85%', // tablet
    md: 600, // desktop
  },

  maxHeight: '90vh',
  overflowY: 'auto',

  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 24,
};

export default function Form_product({ schema, title = 'Formulario', initialValues = null, onSubmit, onClose }) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({});

  /* =========================
     SYNC EDIT MODE
  ========================= */
  useEffect(() => {
    if (initialValues) {
      setFormData(initialValues);
      setOpen(true);
    }
  }, [initialValues]);

  /* =========================
     HANDLERS
  ========================= */
  const handleOpenNew = () => {
    setFormData({});
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setFormData({});
    onClose?.();
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
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
          className="flex items-center justify-center text-white bg-blue-600 font-medium rounded-lg text-sm px-4 py-2 hover:bg-blue-700"
          onClick={handleOpenNew}
        >
          Nuevo
        </button>
      )}

      <Modal open={open} onClose={handleClose}>
        <Box sx={style}>
          <Card>
            <CardContent>
              <Typography variant="h6" mb={2}>
                {isEditing ? `Editar ${title}` : `Nuevo ${title}`} 📝
              </Typography>

              <FormModal_product schema={schema} values={formData} onChange={handleChange} />

              {/* BOTONES */}
              <Box
                sx={{
                  mt: 3,
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: 2,
                  flexWrap: 'wrap', // 📱 botones uno debajo del otro si no caben
                }}
              >
                <button onClick={handleClose} className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400">
                  Cancelar
                </button>

                <button onClick={handleSubmit} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                  Guardar
                </button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Modal>
    </>
  );
}
