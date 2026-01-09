import { Helmet } from 'react-helmet-async';
import { DataGrid } from '../../../layouts/grid';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Loader } from '../../../components/loaders';
import { ArrowRightCircleIcon, ArrowLeftCircleIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Tooltip } from '@mui/material';
import { decrypt } from '../../../utils/crypto';

export default function Grupo() {
  const [error, setError] = useState(false);
  const [message, setMessage] = useState('');
  const [loader, setLoader] = useState(true);
  const [data, setData] = useState([]);
  const [block, setBlock] = useState(false);

  const [unitOfMeasure, setUnitOfMeasure] = useState([]);
  const [itemGroup, setItemGroup] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [mathOperationMap, setMathOperationMap] = useState({});

  const unitOfMeasureOptions = async () => {
    const res = await axios.get('/unitOfMeasuremet');
    setUnitOfMeasure(res.data.data.map((u) => ({ label: u.unitOfMeasure, value: u.id })));
  };

  const itemGroupOptions = async () => {
    const res = await axios.get(`/getItemGroup/${sessionStorage.getItem('company')}`);
    setItemGroup(res.data.data.map((g) => ({ label: g.name, value: g.id })));
  };

  useEffect(() => {
    unitOfMeasureOptions();
    itemGroupOptions();
  }, []);

  const itemSchema = [
    {
      row: 1,
      columns: [
        { name: 'name', label: 'Nombre', type: 'text', xs: 12, md: 12 },
        {
          name: 'state',
          label: 'Estado',
          type: 'select',
          options: [
            { label: 'Activo', value: '1' },
            { label: 'Inactivo', value: '0' },
          ],
          xs: 12,
          md: 12,
        },
      ],
    },
  ];

  const fetchItems = async () => {
    try {
      setLoader(true);
      const res = await axios.get(`/getItemGroup/${sessionStorage.getItem('company')}`);
      const ops = {};

      setData(
        res.data.data.map((item) => {
          ops[item.id] = item.mathOperation;

          return {
            id: item.id,
            name: item.name,
            state: item.state,
          };
        })
      );

      setMathOperationMap(ops);
    } catch {
      setError(true);
      setMessage('Error cargando items');
    } finally {
      setLoader(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  /* =========================
     EDIT
  ========================= */
  const handleEdit = (row) => {
    setEditingItem({
      id: row.id,
      name: row.name,
      state: row.state === 'Activo' ? '1' : '0',
    });
  };

  /* =========================
     UPDATE/CREATE
  ========================= */
  const onSubmit = async (formData) => {
    if (editingItem) {
      await axios.put(`/updateItemGroup/${formData.id}`, {
        ...formData,
        state: Number(formData.state),
      });
    } else {
      await axios.post('/saveItemGroup', {
        ...formData,
        state: Number(formData.state),
        company: sessionStorage.getItem('company'),
      });
    }

    setEditingItem(null);
    fetchItems();
  };

  /* =========================
     DELETE
  ========================= */
  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este item?')) return;
    await axios.delete(`/deleteItemgroup/${id}`);
    fetchItems();
  };

  /* =========================
     ENTRADA / SALIDA
  ========================= */
  const [openModal, setOpenModal] = useState(false);
  const [movementType, setMovementType] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [movementAmount, setMovementAmount] = useState('');

  const submitMovement = async () => {
    const url = movementType === 'entrance' ? `/entrance/${selectedItem.id}` : `/exit/${selectedItem.id}`;

    await axios.put(url, {
      entranceAmount: Number(movementAmount),
    });

    setOpenModal(false);
    fetchItems();
  };

  if (loader) return <Loader />;

  return (
    <>
      <Helmet>
        <title>Items</title>
      </Helmet>
      <DataGrid
        datos={data}
        error={error}
        message={message}
        modulo="Item"
        block={block}
        onclick={setBlock}
        schema={itemSchema}
        onSubmit={onSubmit}
        onEdit={handleEdit}
        editingItem={editingItem}
        onDelete={handleDelete}
        onCloseForm={() => setEditingItem(null)}
      />
      <Dialog open={openModal} onClose={() => setOpenModal(false)} fullWidth maxWidth="sm">
        <DialogTitle>{movementType === 'entrance' ? 'Entrada' : 'Salida'} de inventario</DialogTitle>
        <DialogContent>
          <TextField
            label="Cantidad"
            type="number"
            value={movementAmount}
            onChange={(e) => setMovementAmount(e.target.value)}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModal(false)}>Cancelar</Button>
          <Button variant="contained" onClick={submitMovement}>
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
