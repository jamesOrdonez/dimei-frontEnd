import BaseGrid from '../../../components/grid/base.grid.tsx';

export default function ElevatorType() {
  const fields = [
    {
      name: 'elevatorType',
      label: 'Tipo de Sistema',
      input: 'text',
      grid: { xs: 12, md: 12 },
      required: true,
    },
  ];

  return (
    <BaseGrid
      title="Tipo de Sistema"
      endpoint={`/getElevatorTypes/${sessionStorage.getItem('company')}`}
      saveEndpoint="/saveElevatorTypes"
      updateEndpoint="/updateElevatorType"
      deleteEndpoint="/deleteElevatorType"
      fetchOneEndpoint="/getOneElevatorTypes"
      hideDelete={true}
      excludeKeys={['company']}
      fields={fields}
    />
  );
}
