import { Helmet } from 'react-helmet-async';
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
      options: [
        { label: 'Administrador', value: 1 },
        { label: 'Usuario', value: 2 },
      ],
      grid: { xs: 12, md: 6 },
      required: true,
      dynamicProps: ({ mode }) => mode === 'update' ? { grid: { xs: 12, md: 12 } } : {},
    },
  ];

  return (
    <BaseGrid
      title="Usuario"
      endpoint={`/getUser/${sessionStorage.getItem('company')}`}
      saveEndpoint="/saveUser"
      updateEndpoint="/updateUser"
      deleteEndpoint="/deleteUser"
      fetchOneEndpoint="/getOneUser"
      fields={fields}
      excludeKeys={['company', 'state', 'created_at', 'updated_at', 'password']}
    />
  );
}
