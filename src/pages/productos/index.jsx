import { useMemo } from 'react';
import BaseGrid from '../../components/grid/base.grid.tsx';
import { usePermissions, PERMISOS } from '../../context/PermissionsContext.jsx';
export default function Productos() {
  const { hasPermission, isAdmin } = usePermissions();

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
        hideCreate={!hasPermission(PERMISOS.CREAR_PRODUCTOS)}
        hideEdit={!isAdmin}
        hideDelete={!isAdmin}
        formMaxWidth="md"
        formAdditionalValues={{ mathOperation: '+' }}
        excludeKeys={['id', 'company', 'user', 'fk_group_product', 'group_product', 'mathOperation', 'group_item', 'net_items']}
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
