import BaseGrid from '../../components/grid/base.grid.tsx';

export default function Usuarios() {
  const fields = [
    {
      name: 'elevatorType',
      label: 'Tipo de ascensor',
      input: 'select',
      optionLabel: 'elevatorType',
      endpoint: `/getElevatorTypes/${sessionStorage.getItem('company')}`,
      grid: { xs: 12 },
      required: true,
    },
    {
      name: 'typeDriveSystem',
      label: 'Tipo de sistema motriz',
      input: 'select',
      optionLabel: 'typeDriveSystem',
      endpoint: `/getTypeDriveSystems/${sessionStorage.getItem('company')}`,
      grid: { xs: 12 },
      required: true,
    },
    {
      name: 'customerId',
      label: 'Cliente',
      input: 'select',
      optionLabel: 'nombre',
      endpoint: `/getClientes/${sessionStorage.getItem('company')}`,
      grid: { xs: 12 },
      required: true,
    },
    {
      name: 'stopNumber',
      label: 'Número de paradas',
      input: 'number',
      grid: { xs: 12, sm: 4 },
      required: true,
    },
    {
      name: 'travel',
      label: 'Recorrido (m)',
      input: 'number',
      grid: { xs: 12, sm: 4 },
      required: true,
    },
    {
      name: 'capacity',
      label: 'Capacidad (kg)',
      input: 'number',
      grid: { xs: 12, sm: 4 },
      required: true,
    },
  ];

  return (
    <BaseGrid
      title="Proyectos"
      endpoint={`/getProjects/${sessionStorage.getItem('company')}`}
      saveEndpoint="/saveProject"
      updateEndpoint="/updateProject"
      deleteEndpoint="/deleteProject"
      fetchOneEndpoint="/getOneProject"
      fields={fields}
      excludeKeys={['company', 'state', 'created_at', 'updated_at', 'password']}
    />
  );
}
