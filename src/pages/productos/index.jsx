import { useMemo, useState, useEffect } from 'react';
import axios from 'axios';
import { Tooltip, Button } from '@mui/material';
import InventoryLogModal from '../../components/dialog/InventoryLogModal.jsx';
import { ClockIcon } from '@heroicons/react/24/outline';
import BaseGrid from '../../components/grid/base.grid.tsx';
import { usePermissions, PERMISOS } from '../../context/PermissionsContext.jsx';
export default function Productos() {
  const { hasPermission, isAdmin } = usePermissions();
  const [productGroups, setProductGroups] = useState([]);
  const [openLogModal, setOpenLogModal] = useState(false);
  const [selectedLogProduct, setSelectedLogProduct] = useState(null);
  const company = sessionStorage.getItem('company');

  useEffect(() => {
    axios.get(`/getProductGroup/${company}`).then(res => {
      setProductGroups(res.data.data || res.data || []);
    }).catch(err => console.error('Error fetching product groups', err));
  }, [company]);

  const mapProductsData = (products) => {
    return products.map(item => ({
      ...item,
      Grupo: item.group_product?.name || 'S/N'
    }));
  };

  const fields = useMemo(() => [
    {
      name: 'copyFromProductId',
      label: 'Copiar de producto (opcional)',
      input: 'select',
      endpoint: `/getProduct/${sessionStorage.getItem('company')}`,
      grid: { xs: 12 },
      // When a product is selected, its data can be used to pre-fill the form in the modal.
      // The actual pre-filling logic should be handled within the BaseGrid component or its form handling.
    },
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
      name: 'por_metros_cuadrados',
      label: 'Por metros cuadrados',
      input: 'switch',
      grid: { xs: 12 },
    },
    {
      name: 'net_items',
      input: 'itemTransfer',
      grid: { xs: 12 },
      dynamicProps: ({ values }) => ({
        disableVariable: values?.por_metros_cuadrados === 1 || values?.por_metros_cuadrados === true || values?.por_metros_cuadrados === '1',
      }),
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
        excludeKeys={['id', 'company', 'user', 'fk_group_product', 'group_product', 'mathOperation', 'group_item', 'net_items', 'Grupo', 'por_metros_cuadrados', 'copyFromProductId']}
        extraHeaders={[
          { label: 'Grupo', after: 'name' },
          { label: 'Acciones' }
        ]}
        renderExtraCell={({ item, headerLabel }) => {
          switch (headerLabel) {
            case 'Grupo':
              return item.group_product?.name || '-';
            case 'Acciones':
              return (
                <Tooltip title="Historial de movimientos" placement="top">
                  <span>
                    <Button onClick={() => {
                      setSelectedLogProduct(item);
                      setOpenLogModal(true);
                    }}>
                      <ClockIcon className="h-6 w-6 text-blue-600" />
                    </Button>
                  </span>
                </Tooltip>
              );
            default:
              return null;
          }
        }}
      />
      
      <InventoryLogModal 
        open={openLogModal} 
        onClose={() => setOpenLogModal(false)} 
        targetId={selectedLogProduct?.id} 
        targetType="product" 
        targetName={selectedLogProduct?.name} 
      />
    </>
    );
}
