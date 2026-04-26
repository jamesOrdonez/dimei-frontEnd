import BaseGrid from '../../../components/grid/base.grid.tsx';

export default function TypeDriveSystem() {
  const fields = [
    {
      name: 'typeDriveSystem',
      label: 'Tipo de Ascensor',
      input: 'text',
      grid: { xs: 12, md: 12 },
      required: true,
    },
  ];

  return (
    <BaseGrid
      title="Tipo de Ascensor"
      endpoint={`/getTypeDriveSystems/${sessionStorage.getItem('company')}`}
      saveEndpoint="/saveTypeDriveSystems"
      updateEndpoint="/updateTypeDriveSystems"
      deleteEndpoint="/deleteTypeDriveSystems"
      fetchOneEndpoint="/getOneTypeDriveSystems"
      hideDelete={true}
      excludeKeys={['company']}
      fields={fields}
    />
  );
}
