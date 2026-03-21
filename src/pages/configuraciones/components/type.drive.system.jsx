import BaseGrid from '../../../components/grid/base.grid.tsx';

export default function TypeDriveSystem() {
  const fields = [
    {
      name: 'typeDriveSystem',
      label: 'Tipo de sistema hidraulico',
      input: 'text',
      grid: { xs: 12, md: 12 },
      required: true,
    },
  ];

  return (
    <BaseGrid
      title="Tipo de sistema hidraulico"
      endpoint={`/getTypeDriveSystems/${sessionStorage.getItem('company')}`}
      saveEndpoint="/saveTypeDriveSystems"
      updateEndpoint="/updateTypeDriveSystems"
      deleteEndpoint="/deleteTypeDriveSystems"
      fetchOneEndpoint="/getOneTypeDriveSystems"
      excludeKeys={['company']}
      fields={fields}
    />
  );
}
