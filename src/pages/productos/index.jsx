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
      name: 'group_item',
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
      name: 'group_item',
      label: 'Seleccione grupo de productos',
      input: 'select',
      endpoint: `/getProductGroup/${sessionStorage.getItem('company')}`,
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
      grid: { xs: 12, md: 4 },
      hasToHide: ({ values }) => hasToHide(values),
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
      hasToHide: ({ values }) => hasToHide(values),
    },
    {
      name: 'value2',
      label: 'Valor 2',
      input: 'number',
      grid: { xs: 12, md: 4 },
      hasToHide: ({ values }) => hasToHide(values),
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

  return (
    <>
      <BaseGrid
        title="Productos"
        endpoint={`/getProduct/${sessionStorage.getItem('company')}`}
        saveEndpoint="/saveProduct"
        updateEndpoint="/updateProduct"
        deleteEndpoint="/deleteProduct"
        fetchOneEndpoint="/oneProduct"
        fields={fields}
        excludeKeys={['company', 'user']}
      />
    </>
    );
}
