import BaseGrid from '../../../components/grid/base.grid.tsx';

export default function ProductsGroup() {
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
    <BaseGrid
      title="Grupos de productos"
      endpoint={`/getProductGroup/${sessionStorage.getItem('company')}`}
      saveEndpoint="/saveProductGroup"
      updateEndpoint="/updateProductGroup"
      deleteEndpoint="/deleteProductGroup"
      fetchOneEndpoint="/getOneProductGroup"
      excludeKeys={['company']}
      fields={fields}
    />
  );
}
