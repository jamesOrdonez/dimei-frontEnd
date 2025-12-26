import { Helmet } from 'react-helmet-async';
import { DataGrid } from '../../layouts/grid';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Loader } from '../../components/loaders';
import { decrypt } from '../../utils/crypto';

export default function Items() {
  const [error, setError] = useState(false);
  const [message, setMessage] = useState('');
  const [loader, setLoader] = useState(true);
  const [data, setData] = useState([]);
  const [block, setBlock] = useState(false);

  const [unitOfMeasure, setUnitOfMeasure] = useState([]);
  const [itemGroup, setItemGroup] = useState([]);

  const [editingItem, setEditingItem] = useState(null);

  const handleCloseForm = () => {
    setEditingItem(null);
  };

  /* =========================
     OPTIONS
  ========================= */

  const unitOfMeasureOptions = async () => {
    try {
      const res = await axios.get('/unitOfMeasuremet');
      setUnitOfMeasure(
        res.data.data.map((u) => ({
          label: u.unitOfMeasure,
          value: u.id,
        }))
      );
    } catch (error) {
      console.error('Error cargando unidades', error);
    }
  };

  const itemGroupOptions = async () => {
    try {
      const res = await axios.get(`/getItemGroup/${sessionStorage.getItem('company')}`);
      setItemGroup(
        res.data.data.map((g) => ({
          label: g.name,
          value: g.id,
        }))
      );
    } catch (error) {
      console.error('Error cargando grupos', error);
    }
  };

  /* =========================
     FORM SCHEMA
  ========================= */

  const userFormSchema = [
    {
      row: 1,
      columns: [
        { name: 'description', label: 'Descripcion del item', type: 'textarea', xs: 12, md: 12 },
        { name: 'amount', label: 'Cantidad que ingresa', type: 'number', xs: 12, md: 6 },
        {
          name: 'group_item',
          label: 'Grupo al que pertenece',
          type: 'select',
          options: itemGroup,
          xs: 12,
          md: 6,
        },
      ],
    },
    {
      row: 2,
      columns: [
        { name: 'position', label: 'Lugar de almacenamiento', type: 'text', xs: 12, md: 6 },
        { name: 'price', label: 'Precio', type: 'number', xs: 12, md: 6 },
      ],
    },
    {
      row: 3,
      columns: [
        {
          name: 'variable',
          label: '¿Es variable?',
          type: 'select',
          options: [
            { label: 'Si', value: '1' },
            { label: 'No', value: '0' },
          ],
          xs: 12,
          md: 4,
        },
        {
          name: 'value1',
          label: 'Valor 1',
          type: 'number',
          xs: 12,
          md: 4,
          dependsOn: { field: 'variable', value: '1' },
        },
        {
          name: 'mathOperation',
          label: 'Operación matemática',
          type: 'text',
          xs: 12,
          md: 4,
          dependsOn: { field: 'variable', value: '1' },
        },
        {
          name: 'value2',
          label: 'Valor 2',
          type: 'number',
          xs: 12,
          md: 4,
          dependsOn: { field: 'variable', value: '1' },
        },
        {
          name: 'unitOfMeasure',
          label: 'Unidad de medida',
          type: 'select',
          options: unitOfMeasure,
          xs: 12,
          md: 8,
        },
      ],
    },
  ];

  /* =========================
     FETCH ITEMS
  ========================= */

  const fetchItems = async () => {
    try {
      const res = await axios.get(`/getItem/${sessionStorage.getItem('company')}`);

      setData(
        res.data.data.map((item) => ({
          id: item.id,
          Descripcion: item.description,
          cantidad: item.amount,
          grupo: item.name,
          estante: item.position,
          precio: item.price,
          variable: item.variable === 1 ? 'si' : 'no',
          valor1: item.value1,
          operacionmatematica: item.mathOperation,
          valor2: item.value2,
          medida: item.unitOfMeasure,
        }))
      );

      setLoader(false);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error al cargar');
      setError(true);
      setLoader(false);
    }
  };

  useEffect(() => {
    fetchItems();
    unitOfMeasureOptions();
    itemGroupOptions();
  }, []);

  /* =========================
     EDIT HANDLER
  ========================= */

  const handleEdit = (row) => {
    setEditingItem({
      id: row.id,
      description: row.Descripcion,
      amount: row.cantidad,
      group_item: itemGroup.find((g) => g.label === row.grupo)?.value || '',
      position: row.estante,
      price: row.precio,
      variable: row.variable === 'si' ? '1' : '0',
      value1: row.valor1,
      mathOperation: row.operacionmatematica,
      value2: row.valor2,
      unitOfMeasure: unitOfMeasure.find((u) => u.label === row.medida)?.value || '',
    });
  };

  /* =========================
     CREATE / UPDATE
  ========================= */

  const onSubmit = async (formData) => {
    try {
      setError(false);

      // ======================
      // PAYLOAD BASE
      // ======================
      const basePayload = {
        description: formData.description,
        amount: Number(formData.amount),
        group_item: formData.group_item,
        position: formData.position,
        price: Number(formData.price),
        variable: Number(formData.variable),
        unitOfMeasure: formData.unitOfMeasure,
      };

      // ======================
      // SOLO SI ES VARIABLE
      // ======================
      if (formData.variable === '1') {
        basePayload.value1 = Number(formData.value1);
        basePayload.mathOperation = formData.mathOperation;
        basePayload.value2 = Number(formData.value2);
      }

      // ======================
      // UPDATE
      // ======================
      if (formData.id) {
        await axios.put(`/updateItem/${formData.id}`, basePayload);
      }

      // ======================
      // CREATE
      // ======================
      else {
        const createPayload = {
          ...basePayload,
          user: decrypt(sessionStorage.getItem('userId')),
          company: sessionStorage.getItem('company'),
        };

        await axios.post('/saveItem', createPayload);
      }

      setEditingItem(null);
      fetchItems();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error al guardar');
      setError(true);
    }
  };

  /* =========================
     DELETE
  ========================= */

  const onDelete = async (id) => {
    if (!window.confirm('¿Eliminar este registro?')) return;

    try {
      await axios.delete(`/deleteItem/${id}`);
      fetchItems();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error al eliminar');
      setError(true);
    }
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
        modulo={editingItem ? 'Editar Item' : 'Nuevo Item'}
        block={block}
        onclick={setBlock}
        schema={userFormSchema}
        onSubmit={onSubmit}
        onEdit={handleEdit}
        onDelete={onDelete}
        editingItem={editingItem}
        onCloseForm={handleCloseForm}
      />
    </>
  );
}
