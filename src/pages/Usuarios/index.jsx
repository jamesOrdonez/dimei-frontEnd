import BaseGrid from '../../components/grid/base.grid.tsx';

export default function Usuarios() {
  const fields = [
    {
      name: 'name',
      label: 'Nombre completo',
      input: 'text',
      grid: { xs: 12, md: 12 },
      required: true,
    },
    {
      name: 'user',
      label: 'Usuario',
      input: 'text',
      grid: { xs: 12, md: 12 },
      required: true,
    },
    {
      name: 'password',
      label: 'Contraseña',
      input: 'password',
      grid: { xs: 12, md: 6 },
      required: true,
      hasToHide: ({ mode }) => mode === 'update',
    },
    {
      name: 'rol',
      label: 'Rol',
      input: 'select',
      endpoint: `/getRoles/${sessionStorage.getItem('company')}`,
      optionLabel: 'name',
      optionValue: 'id',
      grid: { xs: 12, md: 6 },
      required: true,
      dynamicProps: ({ values, mode }) => mode === 'update' ? { grid: { xs: 12, md: 12 } } : {},
    },
  ];

  const mapData = (users) => {
    return (Array.isArray(users) ? users : []).map(u => ({
      ...u,
      Rol: u.Rol?.name || 'S/N',
      rol: u.rol // Keep ID for form
    }));
  };

  return (
    <BaseGrid
      title="Usuario"
      endpoint={`/getUser/${sessionStorage.getItem('company')}`}
      saveEndpoint="/saveUser"
      updateEndpoint="/updateUser"
      deleteEndpoint="/deleteUser"
      fetchOneEndpoint="/getOneUser"
      fields={fields}
      mapData={mapData}
      excludeKeys={['company', 'state', 'created_at', 'updated_at', 'password', 'rol']}
    />
  );
}

