import { useState, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import axios from 'axios';
import BaseGrid from '../../components/grid/base.grid.tsx';

export default function DetalleProyecto() {
  const { id: projectId } = useParams();
  const [items, setItems] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios.get(`/getItem/${sessionStorage.getItem('company')}`)
      .then(res => setItems(res.data.data ?? res.data))
      .catch(err => console.error('Error cargando items:', err));
  }, []);

  useEffect(() => {
    axios.get(`/getProduct/${sessionStorage.getItem('company')}`)
      .then(res => setProducts(res.data.data ?? res.data))
      .catch(err => console.error('Error cargando productos:', err));
  }, []);

    const fields = useMemo(() => [
      {
        name: 'group_item',
        label: 'Seleccione grupo de items',
        input: 'select',
        endpoint: `/getItemGroup/${sessionStorage.getItem('company')}`,
        grid: { xs: 12 },
      },
      {
        name: 'items',
        input: 'items',
        hasToHide: ({ values }) => !values.group_item,
        dynamicProps: ({ values }) => ({
          options: items
            .filter(item => !values.group_item || String(item.group_item) === String(values.group_item))
            .map(item => ({
              label: item.description,
              value: item.id
            }))
        }),
        grid: { xs: 12 },
      },
      {
        name: 'group_product',
        label: 'Seleccione grupo de productos',
        input: 'select',
        endpoint: `/getItemGroup/${sessionStorage.getItem('company')}`,
        grid: { xs: 12 },
      },
      {
        name: 'products',
        input: 'items',
        rowLabel: 'Producto',
        addLabel: 'AGREGAR OTRO PRODUCTO',
        hasToHide: ({ values }) => !values.group_product,
        dynamicProps: ({ values }) => ({
          options: products
            .filter(product => !values.group_product || String(product.group_product) === String(values.group_product))
            .map(product => ({
              label: product.description,
              value: product.id
            }))
        }),
        grid: { xs: 12 },
      }
    ], [items, products]);

  return (
    <BaseGrid
      title="Detalle del proyecto"
      formAdditionalValues={{ projectId }}
      endpoint={`/getProjectItems/${projectId}`}
      saveEndpoint="/saveProjectItem"
      updateEndpoint="/updateProjectItem"
      deleteEndpoint="/deleteProjectItem"
      fetchOneEndpoint="/getOneProjectItem"
      fields={fields}
      excludeKeys={['company', 'state', 'created_at', 'updated_at', 'password']}
    />
  );
}
