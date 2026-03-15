import { useNavigate } from 'react-router-dom';
import { IconButton } from '@mui/material';
import { Icon } from '@iconify/react';
import BaseGrid from '../../components/grid/base.grid.tsx';

export default function Proyectos() {
  const navigate = useNavigate();

  const handleView = (item) => {
    navigate(`/proyectos/${item.id}`);
  };

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
      renderExtraActions={(item) => (
        <IconButton
          sx={{
            color: 'info.main',
            border: '1.5px solid',
            borderColor: 'info.light',
            borderRadius: 1.5,
          }}
          onClick={() => handleView(item)}
        >
          <Icon icon="lucide:eye" width={20} />
        </IconButton>
      )}
      excludeKeys={['company', 'state', 'created_at', 'updated_at', 'password']}
    />
  );
}
