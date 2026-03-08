import { useState } from 'react';
import { Button, Tooltip } from '@mui/material';
import BaseGrid from '../../components/grid/base.grid.tsx';
import FormDialog from '../../components/form/form.dialog.tsx';
import { ArrowLeftCircleIcon, ArrowRightCircleIcon } from '@heroicons/react/24/outline';

export default function Usuarios() {
  const [openModal, setOpenModal] = useState(false);
  const [movementType, setMovementType] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [movementKey, setMovementKey] = useState(0);

  const openMovement = (item, type) => {
    setSelectedItem(item);
    setMovementType(type);
    setOpenModal(true);
    setMovementKey(prev => prev + 1);
  };

  const fields = [
    {
      name: 'description',
      label: 'Descripción del item',
      input: 'text',
      grid: { xs: 12, md: 12 },
      rows: 3,
    },
    {
      name: 'amount',
      label: 'Cantidad que ingresa',
      input: 'number',
      grid: { xs: 12, md: 6 },
    },
    {
      name: 'group_item',
      label: 'Grupo al que pertenece',
      input: 'select',
      endpoint: `/getItemGroup/${sessionStorage.getItem('company')}`,
      grid: { xs: 12, md: 6 },
    },
    {
      name: 'position1',
      label: 'Lugar de almacenamiento 1',
      input: 'text',
      grid: { xs: 12 },
    },
    {
      name: 'position2',
      label: 'Lugar de almacenamiento 2',
      input: 'text',
      grid: { xs: 12 },
    },
    {
      name: 'position3',
      label: 'Lugar de almacenamiento 3',
      input: 'text',
      grid: { xs: 12 },
    },
    { 
      name: 'price', 
      label: 'Precio', 
      input: 'number', 
      grid: { xs: 12, md: 6 },
    },
    { 
      name: 'unitOfMeasure', 
      label: 'Unidad de medida', 
      input: 'select', 
      endpoint: '/unitOfMeasuremet', 
      optionLabel: 'unitOfMeasure',
      grid: { xs: 12, md: 6 },
    },
    {
      name: 'variable',
      label: '¿Es variable?',
      input: 'select',
      options: [
        { label: 'Si', value: '1' },
        { label: 'No', value: '0' },
      ],
      grid: { xs: 12 },
    },
    {
      name: 'value1',
      label: 'Valor 1',
      input: 'number',
      grid: { xs: 12, md: 4 },
      hasToHide: ({ values }) => values.variable === '0',
    },
    {
      name: 'mathOperation',
      label: 'Operación matemática',
      input: 'select',
      options: [
        { label: 'Suma', value: '+' },
        { label: 'Resta', value: '-' },
        { label: 'Multiplicación', value: '*' },
        { label: 'División', value: '/' },
      ],
      grid: { xs: 12, md: 4 },
      hasToHide: ({ values }) => values.variable === '0',
    },
    {
      name: 'value2',
      label: 'Valor 2',
      input: 'number',
      grid: { xs: 12, md: 4 },
      hasToHide: ({ values }) => values.variable === '0',
    },
    {
      name: 'img',
      label: 'Imagen del item',
      input: 'file',
      grid: { xs: 12 },
    }
  ];

  const movementFields = [
    {
      name: 'entranceAmount',
      label: 'Cantidad',
      input: 'number',
      grid: { xs: 12 },
    },
  ];

  return (
    <>
      <BaseGrid
      key={refreshKey}
      title="Items"
      endpoint={`/getItem/${sessionStorage.getItem('company')}`}
      saveEndpoint="/saveItem"
      updateEndpoint="/updateItem"
      deleteEndpoint="/deleteItem"
      fetchOneEndpoint="/oneItem"
      fields={fields}
      excludeKeys={['company', 'state', 'created_at', 'updated_at', 'password']}
      extraHeaders={[
        { label: 'ENTRADA/SALIDA' },
      ]}
      renderExtraCell={(item, index, headerLabel) => {
        if (headerLabel === 'ENTRADA/SALIDA') return (
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
        );
      }}
    />

    <FormDialog
      key={movementFields}
      open={openModal}
      onClose={() => setOpenModal(false)}
      onSuccess={() => setRefreshKey(prev => prev + 1)}
      fields={movementFields}
      mode="update"
      initialValues={selectedItem ? { id: selectedItem.id } : {}}
      title={`${movementType === 'entrance' ? 'Entrada' : 'Salida'} de inventario`}
      saveEndpoint={movementType === 'entrance' ? `/entrance` : `/exit`}
    />
  </>
);
}
