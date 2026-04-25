import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconButton, Chip } from '@mui/material';
import { Icon } from '@iconify/react';
import axios from 'axios';
import BaseGrid from '../../components/grid/base.grid.tsx';
import { usePermissions, PERMISOS } from '../../context/PermissionsContext.jsx';

export default function Proyectos() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const { hasPermission, isAdmin } = usePermissions();

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const company = sessionStorage.getItem('company');
        const response = await axios.get(`/getClientes/${company}`);
        const result = Array.isArray(response.data) ? response.data : response.data.data || [];
        setCustomers(result);
      } catch (error) {
        console.error('Error fetching customers for filter:', error);
      }
    };
    fetchCustomers();
  }, []);

  const handleView = (item) => {
    navigate(`/proyectos/${item.id}`);
  };

  const statusOptions = useMemo(
    () => [
      { value: 'Creado', label: 'Creado' },
      { value: 'Iniciado', label: 'Iniciado' },
      { value: 'Finalizado', label: 'Finalizado' },
      { value: 'Cancelado', label: 'Cancelado' },
    ],
    []
  );

  const customerOptions = useMemo(() => {
    if (!Array.isArray(customers)) return [];
    return customers.map((c) => ({
      value: c.nombre,
      label: c.nombre,
    }));
  }, [customers]);

  const customFilters = useMemo(
    () => [
      { key: 'state', label: 'Estado', options: statusOptions },
      { key: 'customerName', label: 'Cliente', options: customerOptions },
    ],
    [statusOptions, customerOptions]
  );

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
      label: 'Tipo de sistema',
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
    <>
      <BaseGrid
        title="Proyectos"
        endpoint={`/getProjects/${sessionStorage.getItem('company')}`}
        saveEndpoint="/saveProject"
        updateEndpoint="/updateProject"
        deleteEndpoint="/deleteProject"
        fetchOneEndpoint="/getOneProject"
        fields={fields}
        hideCreate={!hasPermission(PERMISOS.CREAR_PROYECTOS)}
        hideEdit={!isAdmin}
        hideDelete={!isAdmin}
        extraHeaders={[{ label: 'Estado', after: 'customerId' }]}
        renderExtraCell={({ item, headerLabel }) => {
          if (headerLabel === 'Estado') {
            const stateColors = {
              Creado: 'default',
              Iniciado: 'info',
              Finalizado: 'success',
              Cancelado: 'error',
            };
            return (
              <Chip
                label={item.state}
                color={stateColors[item.state] || 'default'}
                size="small"
                variant="outlined"
                sx={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.65rem' }}
              />
            );
          }
          return null;
        }}
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
        excludeKeys={['company', 'state', 'created_at', 'updated_at', 'password', 'signed_act']}
        customFilters={customFilters}
      />
    </>
  );
}
