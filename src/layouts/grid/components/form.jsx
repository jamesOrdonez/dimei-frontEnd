import { PencilSquareIcon } from '@heroicons/react/24/outline';


import {
  Modal,
  Box,
  Card,
  CardContent,
  Typography,
} from "@mui/material";

import FormModal from './form.modal';
import { useState } from 'react';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  bgcolor: 'background.paper',
};


const formSchema = [
  {
    row: 1,
    columns: [
      {
        name: "name",
        label: "Nombre",
        type: "text",
        xs: 12,
        md: 6,
      },
      {
        name: "email",
        label: "Correo",
        type: "email",
        xs: 12,
        md: 6,
      },
    ],
  },
  {
    row: 2,
    columns: [
      {
        name: "age",
        label: "Edad",
        type: "number",
        xs: 12,
        md: 4,
      },
      {
        name: "role",
        label: "Rol",
        type: "select",
        options: [
          { label: "Admin", value: "admin" },
          { label: "Usuario", value: "user" },
        ],
        xs: 12,
        md: 8,
      },
    ],
  },
];


export default function Form({ id }) {
  const [open, setOpen] = useState(false);
  const handleClose = () => setOpen(false);


  const [formData, setFormData] = useState({});

  const handleChange = (e) => {
    console.log(formData);
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <>
      {id ? (
        <button class="mr-4" title="Edit">
          <PencilSquareIcon className="h-6 w-6 text-blue-500" />
        </button>
      ) : (
        <div class="w-full md:w-auto flex flex-col md:flex-row space-y-2 md:space-y-0 items-stretch md:items-center justify-end md:space-x-3 flex-shrink-0">
          <button
            type="button"
            class="flex items-center justify-center text-white bg-blue-600  font-medium rounded-lg text-sm px-4 py-2 hover:bg-blue-700"
            onClick={() => setOpen(true)}
          >
            Nuevo
          </button>
        </div>
      )}
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Card>
            <CardContent>
              <Typography variant="h6" mb={2}>
                Formulario dinámico
              </Typography>

              <FormModal
                schema={formSchema}
                values={formData}
                onChange={handleChange}
              />
            </CardContent>
          </Card>
        </Box>
      </Modal>
    </>
  );
}
