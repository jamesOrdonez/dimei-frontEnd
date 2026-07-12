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
      label: 'Sistema Motriz',
      input: 'select',
      optionLabel: 'elevatorType',
      endpoint: `/getElevatorTypes/${sessionStorage.getItem('company')}`,
      grid: { xs: 12 },
      required: true,
    },
    {
      name: 'typeDriveSystem',
      label: 'Tipo de ascensor',
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
      endpoint: `/getClientes/${sessionStorage.getItem('company')}?tipo=cliente`,
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
    {
      name: 'necesita_encerramiento',
      label: '¿Necesita encerramiento?',
      input: 'switch',
      grid: { xs: 12 },
    },
    {
      name: 'metros_cuadrados',
      label: 'Metros cuadrados de encerramiento',
      input: 'number',
      grid: { xs: 12 },
      hasToHide: ({ values }) => !(values?.necesita_encerramiento === 1 || values?.necesita_encerramiento === true || values?.necesita_encerramiento === '1'),
    },
  ];

  const mapData = (data) => {
    return data.map((item) => ({
      id: item.id,
      Cliente: item.customerName,
      'Tipo de ascensor': item.typeDriveSystemName,
      'Tipo de sistema': item.elevatorTypeName,
      stopNumber: item.stopNumber,
      travel: item.travel,
      capacity: item.capacity,
      ...item
    }));
  };

  return (
    <>
      <BaseGrid
        title="Proyectos"
        endpoint={`/getProjects/${sessionStorage.getItem('company')}?tipo=proyecto`}
        saveEndpoint="/saveProject"
        updateEndpoint="/updateProject"
        deleteEndpoint="/deleteProject"
        fetchOneEndpoint="/getOneProject"
        fields={fields}
        mapData={mapData}
        formAdditionalValues={{ tipo: 'proyecto' }}
        hideCreate={!hasPermission(PERMISOS.CREAR_PROYECTOS)}
        hideEdit={!isAdmin}
        hideDelete={!isAdmin}
        extraHeaders={[{ label: 'Estado', after: 'capacity' }]}
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
          (hasPermission(PERMISOS.VER_PROYECTOS) || hasPermission(PERMISOS.CREAR_PROYECTOS)) && (
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
          )
        )}
        excludeKeys={['proyectos', 'questionGroupId', 'user', 'lastMaintenance', 'company', 'state', 'created_at', 'updated_at', 'password', 'signed_act', 'elevatorType', 'typeDriveSystem', 'customerId', 'elevatorTypeName', 'typeDriveSystemName', 'customerName', 'tipo', 'nombre', 'necesita_encerramiento', 'metros_cuadrados', 'displayLabel']}
        customFilters={customFilters}
      />
    </>
  );
}
