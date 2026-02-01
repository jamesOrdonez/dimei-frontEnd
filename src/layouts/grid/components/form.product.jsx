import { Modal, Box, Card, CardContent, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import FormModal_product from './form.modal.product';
import useProductSchema from '../../../pages/productos/models';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',

  width: {
    xs: '95%',
    sm: '85%',
    md: 600,
  },

  maxHeight: '90vh',
  overflowY: 'auto',

  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 24,
};

export default function Form_product({ schema, title = 'Formulario', initialValues = null, onSubmit, onClose }) {
  const [open, setOpen] = useState(false);
  const emptyForm = {
    name: '',
    description: '',
    group_item: '',
    net_items: [],
  };

  const [formData, setFormData] = useState(emptyForm);

  const [selectedGroup, setSelectedGroup] = useState('');
  const schemaFinal = useProductSchema(selectedGroup);

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
    setFormData(emptyForm);
    setSelectedGroup('');
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setFormData({});
    onClose?.();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === 'group_item') {
      setSelectedGroup(value);
    }
  };

  const handleSubmit = () => {
    onSubmit(formData);
    handleClose();
  };

  const isEditing = Boolean(initialValues);

  useEffect(() => {
    if (initialValues?.group_item) {
      setSelectedGroup(initialValues.group_item);
    }
  }, [initialValues]);

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

              <FormModal_product schema={schemaFinal} values={formData} onChange={handleChange} />

              {/* BOTONES */}
              <Box
                sx={{
                  mt: 3,
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: 2,
                  flexWrap: 'wrap',
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
