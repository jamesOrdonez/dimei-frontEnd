import { Helmet } from 'react-helmet-async';
import BaseGrid from '../../../components/grid/base.grid.tsx';

export default function ItemsGroup() {
  const fields = [
    {
      name: 'name',
      label: 'Nombre',
      input: 'text',
      grid: { xs: 12, md: 12 },
      required: true,
    },
  ];

  return (
    <>
      <Helmet>
        <title>Grupo Items</title>
      </Helmet>
      <BaseGrid
        title="Grupo Items"
        endpoint={`/getItemGroup/${sessionStorage.getItem('company')}`}
        saveEndpoint="/saveItemGroup"
        updateEndpoint="/updateItemGroup"
        deleteEndpoint="/deleteItemgroup"
        hideDelete={true}
        fields={fields}
        excludeKeys={['company', 'created_at', 'updated_at', 'state']}
        formAdditionalValues={{ company: sessionStorage.getItem('company') }}
      />
    </>
  );
}
