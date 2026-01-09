import { Helmet } from 'react-helmet-async';
import { DataGrid } from '../../../layouts/grid';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Loader } from '../../../components/loaders';

export default function Unidad_medida() {
  const [error, setError] = useState(false);
  const [message, setMessage] = useState('');
  const [loader, setLoader] = useState(true);
  const [data, setData] = useState([]);
  const [block, setBlock] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

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
      const res = await axios.get(`/unitOfMeasuremet`);

      setData(
        res.data.data.map((item) => {
          return {
            id: item.id,
            nombre: item.unitOfMeasure,
          };
        })
      );
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

  if (loader) return <Loader />;

  return (
    <>
      <Helmet>
        <title>Unidad de Medida</title>
      </Helmet>
      <DataGrid
        datos={data}
        error={error}
        message={message}
        modulo="Unidad de Medida"
        block={block}
        onclick={setBlock}
        schema={itemSchema}
        onSubmit={onSubmit}
        onEdit={handleEdit}
        editingItem={editingItem}
        onDelete={handleDelete}
        onCloseForm={() => setEditingItem(null)}
      />
    </>
  );
}
