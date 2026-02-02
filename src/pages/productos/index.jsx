import { Helmet } from 'react-helmet-async';
import { DataGrid } from '../../layouts/grid';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Loader } from '../../components/loaders';
import { ArrowRightCircleIcon, ArrowLeftCircleIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Tooltip } from '@mui/material';
import { decrypt } from '../../utils/crypto';
import { pdf } from '@react-pdf/renderer';
import RemisionPDF from './remisionPDF';

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
  const [totalItems, setTotalItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [selectedGroupRemision, setSelectedGroupRemision] = useState(null);

  const unitOfMeasureOptions = async () => {
    const res = await axios.get('/unitOfMeasuremet');
    setUnitOfMeasure(res.data.data.map((u) => ({ label: u.unitOfMeasure, value: u.id })));
  };

  const itemGroupOptions = async () => {
    const res = await axios.get(`/getItemGroup/${sessionStorage.getItem('company')}`);
    setItemGroup(res.data.data.map((g) => ({ label: g.name, value: g.name, realValue: g.id })));
  };

  const itemsOptions = async () => {
    const res = await axios.get(`/getItem/${sessionStorage.getItem('company')}`);

    setTotalItems(
      res.data.data.map((i) => ({
        id: i.id, // 👈 ⭐ CLAVE
        label: i.description,
        value: i.id,
        group: i.group_name,
      }))
    );
  };

  useEffect(() => {
    unitOfMeasureOptions();
    itemGroupOptions();
    itemsOptions();
  }, []);

  const handleRemisionChange = (formData) => {
    if (!formData.items) return;

    // items del grupo actual
    const groupItems = totalItems.filter((item) => item.group === formData.items);

    // items ya seleccionados (de cualquier grupo)
    const selectedIds = (formData.net_items || []).map((i) => i.id || i);

    const selectedItems = totalItems.filter((item) => selectedIds.includes(item.value));

    // 🔥 unir ambos (sin duplicados)
    const merged = [...groupItems, ...selectedItems].filter((v, i, a) => a.findIndex((t) => t.value === v.value) === i);

    setFilteredItems(merged);
  };

  const itemSchema = [
    {
      row: 1,
      columns: [
        { name: 'description', label: 'Descripcion del item', type: 'textarea', xs: 12, required: true },
        { name: 'amount', label: 'Cantidad que ingresa', type: 'number', xs: 12, md: 6 },
        {
          name: 'group_item',
          label: 'Grupo al que pertenece',
          type: 'select',
          options: itemGroup.map((g) => ({
            label: g.label,
            value: g.realValue,
          })),
          xs: 12,
          md: 6,
        },
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
        {
          name: 'img',
          label: 'Imagen del item',
          type: 'file',
          xs: 12,
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
          options: filteredItems,
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
            img: <img src={item.img} className="w-50 h-30" />,
            Descripcion: item.description,
            cantidad: item.amount,
            grupo: item.group_name,
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
      group_item: groupSelected?.realValue || '',
      unitOfMeasure: unitSelected?.value || '',
      variable: row.variable === 'si' ? '1' : '0',
      value1: row['valor 1'],
      mathOperation: mathOperationMap[row.id],
      value2: row['valor 2'],
    });
  };
  const generarYDescargarPDF = async (formData, remisionId, userId) => {
    const itemsPDF = formData.net_items.map((ni) => {
      const info = totalItems.find((t) => t.value === ni.id);

      return {
        description: info?.label || 'Item desconocido',
        grupo: info?.group || '',
        cantidad: ni.quantity,
      };
    });

    const remisionPDF = {
      remisionId: remisionId,
      fecha: new Date().toLocaleDateString(),
      description: formData.description,
      grupo: formData.items,
      items: itemsPDF,
      elaboradoPor: decrypt(sessionStorage.getItem('user')),
      aprobadoPor: ' ',
    };

    const blob = await pdf(<RemisionPDF remision={remisionPDF} />).toBlob();

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `remision_${remisionPDF.remisionId}.pdf`;
    link.click();

    URL.revokeObjectURL(url);
  };

  /* =========================
     UPDATE/CREATE
  ========================= */
  const onSubmit = async (formData) => {
    try {
      if (formData.net_items && formData.net_items.length > 0) {
        if (!formData.description || formData.description.trim() === '') {
          alert('La descripción de la remisión es obligatoria');
          return;
        }

        const netItemsFormateados = formData.net_items.map((item) => ({
          id: item.id,
          quantity: Number(item.quantity),
        }));

        const res = await axios.post('/saveRemision', {
          description: formData.description,
          net_items: netItemsFormateados,
          company: sessionStorage.getItem('company'),
          fkUser: decrypt(sessionStorage.getItem('userId')),
        });

        const remisionId = res.data.id || res.data.remisionId || res.data.data?.id;

        await generarYDescargarPDF(formData, remisionId, decrypt(sessionStorage.getItem('userId')));

        fetchItems();
        return;
      }
    } catch (error) {
      const data = error.response?.data;

      if (data?.errors && data.errors.length > 0) {
        let mensaje = 'Problemas de stock:\n\n';

        data.errors.forEach((err) => {
          mensaje += `• ${err.description}: solicitados ${err.solicitado}, disponibles ${err.disponible}\n`;
        });

        alert(mensaje);
        return;
      } else {
        alert(data?.message || 'Error creando remisión');
        return;
      }
    }

    /* =========================
     ITEM NORMAL (CREATE / UPDATE)
  ========================= */

    const payload = new FormData();

    if (formData.img instanceof File) {
      payload.append('img', formData.img);
    }

    Object.keys(formData).forEach((key) => {
      if (key === 'img') return;

      let value = formData[key];

      if (key === 'variable') {
        value = Array.isArray(value) ? Number(value[0]) : Number(value);
      }

      if (value !== undefined && value !== null) {
        payload.append(key, value);
      }
    });

    payload.append('company', sessionStorage.getItem('company'));
    payload.append('user', decrypt(sessionStorage.getItem('userId')));

    const config = {
      headers: { 'Content-Type': 'multipart/form-data' },
    };

    if (editingItem) {
      await axios.put(`/updateItem/${formData.id}`, payload, config);
    } else {
      await axios.post('/saveItem', payload, config);
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
        onChangeForm={handleRemisionChange}
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
