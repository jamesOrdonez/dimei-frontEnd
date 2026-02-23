import { useState, useMemo } from 'react';
import { Button, Tooltip } from '@mui/material';
import BaseGrid from '../../components/grid/base.grid.tsx';
import FormDialog from '../../components/form/form.dialog.tsx';
import { ArrowLeftCircleIcon, ArrowRightCircleIcon } from '@heroicons/react/24/outline';
import BaseButton from '../../components/ui/BaseButton.tsx';
import RemisionPDF from '../productos/remisionPDF.jsx';
import { decrypt } from '../../utils/crypto.js';
import { pdf } from '@react-pdf/renderer';

export default function Usuarios() {
  const [openModal, setOpenModal] = useState(false);
  const [openModalRemission, setOpenModalRemission] = useState(false);


  const [movementType, setMovementType] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [gridData, setGridData] = useState([]);

  const openMovement = (item, type) => {
    setSelectedItem(item);
    setMovementType(type);
    setOpenModal(true);
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

  const remissionFields = useMemo(() => [
    {
      name: 'group_item',
      label: 'Seleccione grupo de items',
      input: 'select',
      endpoint: `/getItemGroup/${sessionStorage.getItem('company')}`,
      grid: { xs: 12 },

    },
    {
      name: 'description',
      label: 'Descripción de la remisión',
      input: 'text',
      rows: 4,
      grid: { xs: 12 },
    },
    {
      name: 'net_items',
      input: 'items',
      hasToHide: ({ values }) => !values.group_item,
      dynamicProps: ({ values }) => ({
        options: gridData
          .filter(item => !values.group_item || String(item.group_item) === String(values.group_item))
          .map(item => ({
            label: item.description,
            value: item.id
          }))
      }),
      grid: { xs: 12 },
    }
  ], [gridData]);

  const movementFields = [
    {
      name: 'entranceAmount',
      label: 'Cantidad',
      input: 'number',
      grid: { xs: 12 },
    },
  ];

  const makeAndDownloadPDF = async (response, payload) => {
    const remisionPDF = {
      remisionId: response.data.remisionId,
      fecha: new Date().toLocaleDateString(),
      description: payload.description,
      items: payload.net_items.map(item => {
        const gItem = gridData.find(gItem => gItem.id === item.id);
        return {
          description: gItem.description,
          grupo: gItem.group,
          cantidad: item.quantity
        }
      }),
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
  }

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
        onDataChange={setGridData}
        excludeKeys={['company', 'state', 'created_at', 'updated_at', 'password']}
        extraHeaders={[
          { label: 'ENTRADA/SALIDA' },
        ]}
        extraHeaderActions={
          <BaseButton
            color="green"
            text="Remisionar"
            onClick={() => setOpenModalRemission(true)}
          />
        }
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
        title="Nueva remisión"
        open={openModalRemission}
        fields={remissionFields}
        saveEndpoint='saveRemision'
        onClose={() => setOpenModalRemission(false)}
        onSuccess={({ response, payload }) => makeAndDownloadPDF(response, payload)}
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
