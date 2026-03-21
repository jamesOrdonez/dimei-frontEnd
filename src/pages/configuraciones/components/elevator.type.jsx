import BaseGrid from '../../../components/grid/base.grid.tsx';

export default function ElevatorType() {
  const fields = [
    {
      name: 'elevatorType',
      label: 'Tipo de Ascensor',
      input: 'text',
      grid: { xs: 12, md: 12 },
      required: true,
    },
  ];

  return (
    <BaseGrid
      title="Tipo de Ascensor"
      endpoint={`/getElevatorTypes/${sessionStorage.getItem('company')}`}
      saveEndpoint="/saveElevatorTypes"
      updateEndpoint="/updateElevatorTypes"
      deleteEndpoint="/deleteElevatorTypes"
      fetchOneEndpoint="/getOneElevatorTypes"
      excludeKeys={['company']}
      fields={fields}
    />
  );
}
