import { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import BaseGrid from '../../components/grid/base.grid.tsx';

export default function Usuarios() {
  const [gridData, setGridData] = useState([]);

  useEffect(() => {
    axios.get(`/getItem/${sessionStorage.getItem('company')}`)
      .then(res => setGridData(res.data.data ?? res.data))
      .catch(err => console.error('Error cargando items:', err));
  }, []);

  
  const hasToHide = (values) => values.variable === '0' || !values.variable;

  const fields = useMemo(() => [
    {
      name: 'name',
      label: 'Nombre',
      input: 'text',
      grid: { xs: 12 },
    },
    {
      name: 'fk_group_product',
      label: 'Grupo al que pertenece',
      input: 'select',
      endpoint: `/getProductGroup/${sessionStorage.getItem('company')}`,
      grid: { xs: 12 },
    },
    {
      name: 'description',
      label: 'Descripción',
      input: 'text',
      rows: 4,
      grid: { xs: 12 },
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
      grid: { xs: 12, md: 6 },
      hasToHide: ({ values }) => hasToHide(values),
    },
    {
      name: 'value2',
      label: 'Valor 2',
      input: 'number',
      grid: { xs: 12, md: 6 },
      hasToHide: ({ values }) => hasToHide(values),
    },
    {
      name: 'group_item',
      label: 'Seleccione grupo de items',
      input: 'select',
      endpoint: `/getItemGroup/${sessionStorage.getItem('company')}`,
      grid: { xs: 12 },
    },
    {
      name: 'net_items',
      input: 'items',
      hasToHide: ({ values }) => !values.group_item && (!values.net_items || values.net_items.length === 0),
      dynamicProps: ({ values }) => ({
        options: gridData
          .filter(item => 
            !values.group_item || 
            String(item.group_item) === String(values.group_item) ||
            values.net_items?.some(selected => String(selected.id) === String(item.id))
          )
          .map(item => ({
            label: `${item.id} - ${item.description}`,
            value: item.id
          }))
      }),
      grid: { xs: 12 },
    }
  ], [gridData]);

  return (
    <>
      <BaseGrid
        title="Productos"
        endpoint={`/getProduct/${sessionStorage.getItem('company')}`}
        saveEndpoint="/saveProduct"
        updateEndpoint="/updateProduct"
        deleteEndpoint="/deleteProduct"
        fetchOneEndpoint="/getOneproduct"
        fields={fields}
        formAdditionalValues={{ mathOperation: '+' }}
        excludeKeys={['id', 'company', 'user', 'fk_group_product', 'group_product', 'variable', 'mathOperation', 'value1', 'value2', 'group_item', 'net_items']}
        extraHeaders={[
          { label: 'Grupo', after: 'name' },
          { label: '¿Es Variable?', after: 'description' },
          { label: 'Valor 1', after: '¿Es Variable?' },
          { label: 'Valor 2', after: 'Valor 1' },
        ]}
        renderExtraCell={({ item, headerLabel }) => {
          switch (headerLabel) {
            case 'Grupo':
              return item.group_product?.name || '-';
            case '¿Es Variable?':
              return item.variable === '1' || item.variable === 1 ? 'Si' : 'No';
            case 'Valor 1':
              return item.value1 ?? '-';
            case 'Valor 2':
              return item.value2 ?? '-';
            default:
              return null;
          }
        }}
      />
    </>
    );
}
