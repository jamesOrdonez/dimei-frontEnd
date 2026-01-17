import { Helmet } from 'react-helmet-async';
import { DataGrid } from '../../layouts/grid';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Loader } from '../../components/loaders';
import { ArrowRightCircleIcon, ArrowLeftCircleIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Tooltip } from '@mui/material';
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
        { name: 'description', label: 'Descripcion del item', type: 'textarea', xs: 12 },
        { name: 'amount', label: 'Cantidad que ingresa', type: 'number', xs: 12, md: 6 },
        { name: 'group_item', label: 'Grupo al que pertenece', type: 'select', options: itemGroup, xs: 12, md: 6 },
      ],
    },
    {
      row: 2,
      columns: [
        { name: 'position1', label: 'Lugar de almacenamiento', type: 'text', xs: 12, md: 4 },
        { name: 'position2', label: 'Lugar de almacenamiento', type: 'text', xs: 12, md: 4 },
        { name: 'position3', label: 'Lugar de almacenamiento', type: 'text', xs: 12, md: 4 },
      ],
    },
    {
      row: 3,
      columns: [
        { name: 'price', label: 'Precio', type: 'number', xs: 12, md: 6 },
        { name: 'unitOfMeasure', label: 'Unidad de medida', type: 'select', options: unitOfMeasure, xs: 12, md: 6 },
        {
          name: 'variable',
          label: '¿Es variable?',
          type: 'select',
          options: [
            { label: 'Si', value: '1' },
            { label: 'No', value: '0' },
          ],
          xs: 12,
          md: 12,
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
          type: 'select',
          options: [
            { label: 'Suma', value: '+' },
            { label: 'Resta', value: '-' },
            { label: 'Multiplicación', value: '*' },
            { label: 'División', value: '/' },
          ],
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
      ],
    },
  ];

  const aditionalSchema = [
    {
      row: 1,
      columns: [
        {
          name: 'items',
          label: 'Seleccione grupo de items',
          type: 'select',
          options: itemGroup,
          xs: 12,
        },
        {
          name: 'net_items',
          label: 'Seleccione los items para la remision',
          type: 'select',
          multiple: true,
          options: [
            { label: 'Si', value: '1' },
            { label: 'No', value: '0' },
          ],
          xs: 12,
        },
        { name: 'description', label: 'Descripcion de la remision', type: 'textarea', xs: 12 },
      ],
    },
  ];

  const fetchItems = async () => {
    try {
      setLoader(true);
      const res = await axios.get(`/getItem/${sessionStorage.getItem('company')}`);
      const ops = {};

      setData(
        res.data.data.map((item) => {
          ops[item.id] = item.mathOperation;

          return {
            id: item.id,
            Descripcion: item.description,
            cantidad: item.amount,
            grupo: item.name,
            ubicacion: [item.position1, item.position2, item.position3].filter(Boolean).join(' - '),
            precio: item.price,
            variable: item.variable === 1 ? 'si' : 'no',
            'valor 1': item.value1,
            'valor 2': item.value2,
            'unidad de medida': item.unitOfMeasure,

            'operacion matemática':
              item.mathOperation === '+'
                ? 'Suma'
                : item.mathOperation === '-'
                ? 'Resta'
                : item.mathOperation === '*'
                ? 'Multiplicación'
                : item.mathOperation === '/'
                ? 'División'
                : '',

            'entrada/salida': (
              <div className="flex items-center gap-2">
                <Tooltip title="Entrada" placement="top">
                  <span>
                    <Button onClick={() => openMovement(item, 'entrance')}>
                      <ArrowRightCircleIcon className="h-6 w-6 text-green-600" />
                    </Button>
                  </span>
                </Tooltip>

                <Tooltip title="Salida" placement="top">
                  <span>
                    <Button onClick={() => openMovement(item, 'exit')}>
                      <ArrowLeftCircleIcon className="h-6 w-6 text-red-600" />
                    </Button>
                  </span>
                </Tooltip>
              </div>
            ),
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
    const groupSelected = itemGroup.find((g) => g.label === row.grupo);
    const unitSelected = unitOfMeasure.find((u) => u.label === row['unidad de medida']);

    const [position1 = '', position2 = '', position3 = ''] = row.ubicacion?.split(' - ') || [];

    setEditingItem({
      id: row.id,
      description: row.Descripcion,
      amount: row.cantidad,
      position1,
      position2,
      position3,
      price: row.precio,
      group_item: groupSelected?.value || '',
      unitOfMeasure: unitSelected?.value || '',
      variable: row.variable === 'si' ? '1' : '0',
      value1: row['valor 1'],
      mathOperation: mathOperationMap[row.id],
      value2: row['valor 2'],
    });
  };

  /* =========================
     UPDATE/CREATE
  ========================= */
  const onSubmit = async (formData) => {
    if (editingItem) {
      await axios.put(`/updateItem/${formData.id}`, {
        ...formData,
        variable: Number(formData.variable),
      });
    } else {
      const { net_items, ...cleanFormData } = formData;

      console.log(cleanFormData);

      await axios.post('/saveItem', {
        ...cleanFormData,
        variable: Number(formData.variable),
        company: sessionStorage.getItem('company'),
        user: decrypt(sessionStorage.getItem('userId')),
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
    await axios.delete(`/deleteItem/${id}`);
    fetchItems();
  };

  /* =========================
     ENTRADA / SALIDA
  ========================= */
  const [openModal, setOpenModal] = useState(false);
  const [movementType, setMovementType] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [movementAmount, setMovementAmount] = useState('');

  const openMovement = (item, type) => {
    setSelectedItem(item);
    setMovementType(type);
    setMovementAmount('');
    setOpenModal(true);
  };

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
        aditionalButton={true}
        aditionalSchema={aditionalSchema}
      />
      {/* 
      <pre>{JSON.stringify(data, null, 2)}</pre> */}
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
