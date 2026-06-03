import { useMemo, useState, useEffect } from 'react';
import axios from 'axios';
import BaseGrid from '../../components/grid/base.grid.tsx';
import { usePermissions, PERMISOS } from '../../context/PermissionsContext.jsx';
export default function Productos() {
  const { hasPermission, isAdmin } = usePermissions();
  const [productGroups, setProductGroups] = useState([]);
  const company = sessionStorage.getItem('company');

  useEffect(() => {
    axios.get(`/getProductGroup/${company}`).then(res => {
      setProductGroups(res.data.data || res.data || []);
    }).catch(err => console.error("Error fetching product groups", err));
  }, [company]);

  const mapProductsData = (products) => {
    return products.map(item => ({
      ...item,
      Grupo: item.group_product?.name || 'S/N'
    }));
  };

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
      name: 'net_items',
      input: 'itemTransfer',
      grid: { xs: 12 },
    }
  ], []);

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
        mapData={mapProductsData}
        customFilters={[
          {
            key: 'name',
            label: 'Nombre',
            type: 'text'
          },
          {
            key: 'Grupo',
            label: 'Grupo',
            type: 'select',
            options: productGroups.map(g => ({ value: g.name || g.description, label: g.name || g.description }))
          }
        ]}
        hideCreate={!hasPermission(PERMISOS.CREAR_PRODUCTOS)}
        hideEdit={!isAdmin}
        hideDelete={!isAdmin}
        formMaxWidth="md"
        formAdditionalValues={{ mathOperation: '+' }}
        excludeKeys={['id', 'company', 'user', 'fk_group_product', 'group_product', 'mathOperation', 'group_item', 'net_items', 'Grupo']}
        extraHeaders={[
          { label: 'Grupo', after: 'name' },
        ]}
        renderExtraCell={({ item, headerLabel }) => {
          switch (headerLabel) {
            case 'Grupo':
              return item.group_product?.name || '-';
            default:
              return null;
          }
        }}
      />
    </>
    );
}
