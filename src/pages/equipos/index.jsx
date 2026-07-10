import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import BaseGrid from '../../components/grid/base.grid.tsx';
import { usePermissions, PERMISOS } from '../../context/PermissionsContext.jsx';

export default function Equipos() {
  const [customers, setCustomers] = useState([]);
  const { hasPermission, isAdmin } = usePermissions();

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const company = sessionStorage.getItem('company');
        const response = await axios.get(`/getClientes/${company}?tipo=equipo`);
        const result = Array.isArray(response.data) ? response.data : response.data.data || [];
        setCustomers(result);
      } catch (error) {
        console.error('Error fetching customers for filter:', error);
      }
    };
    fetchCustomers();
  }, []);

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
      name: 'nombre',
      label: 'Nombre del equipo',
      input: 'text',
      grid: { xs: 12 },
      required: true,
    },
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
      endpoint: `/getClientes/${sessionStorage.getItem('company')}?tipo=equipo`,
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

  const mapData = (data) => {
    return data.map((item) => ({
      ...item,
      'Nombre': item.nombre,
      'Tipo de ascensor': item.typeDriveSystemName,
      'Tipo de sistema': item.elevatorTypeName,
      'Cliente': item.customerName,
    }));
  };

  return (
    <>
      <BaseGrid
        title="Equipos"
        endpoint={`/getProjects/${sessionStorage.getItem('company')}?tipo=equipo`}
        saveEndpoint="/saveProject"
        updateEndpoint="/updateProject"
        deleteEndpoint="/deleteProject"
        fetchOneEndpoint="/getOneProject"
        fields={fields}
        mapData={mapData}
        formAdditionalValues={{ tipo: 'equipo' }}
        hideCreate={!hasPermission(PERMISOS.CREAR_PROYECTOS)}
        hideEdit={!isAdmin}
        hideDelete={!isAdmin}

        excludeKeys={['company', 'state', 'created_at', 'updated_at', 'password', 'signed_act', 'elevatorType', 'typeDriveSystem', 'customerId', 'elevatorTypeName', 'typeDriveSystemName', 'customerName', 'tipo', 'nombre', 'questionGroupId', 'lastMaintenance', 'user']}

        customFilters={customFilters}
      />
    </>
  );
}
