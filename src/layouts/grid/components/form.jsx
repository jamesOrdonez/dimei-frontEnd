import { Modal, Box, Card, CardContent, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import FormModal from './form.modal';
import FormModal_product from './form.modal.product';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  bgcolor: 'background.paper',
  minWidth: 400,
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
}) {
  const [open, setOpen] = useState(false);

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
          <Card>
            <CardContent>
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
