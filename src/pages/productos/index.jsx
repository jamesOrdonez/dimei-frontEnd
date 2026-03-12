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

  

  const fields = useMemo(() => [
    {
      name: 'name',
      label: 'Nombre',
      input: 'text',
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
      label: 'Seleccione grupo de items',
      input: 'select',
      endpoint: `/getItemGroup/${sessionStorage.getItem('company')}`,
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

  return (
    <>
      <BaseGrid
        title="Items"
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
