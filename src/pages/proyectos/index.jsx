import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconButton, Chip, Tooltip, Stack } from '@mui/material';
import { Icon } from '@iconify/react';
import axios from 'axios';
import Swal from 'sweetalert2';
import BaseGrid from '../../components/grid/base.grid.tsx';
import { usePermissions, PERMISOS } from '../../context/PermissionsContext.jsx';
import { exportProjectBudgetExcel } from './components/exportProjectBudgetExcel.js';

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

  const handleDownloadBudgetExcel = async (item) => {
    try {
      Swal.fire({
        title: 'Generando Presupuesto...',
        text: 'Cargando información del proyecto para exportar a Excel',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const response = await axios.get(`/getOneProject/${item.id}`);
      const raw = response.data?.data ?? response.data;
      const projectData = Array.isArray(raw)
        ? raw.find((i) => String(i.id) === String(item.id)) || raw[0]
        : raw;

      Swal.close();

      if (!projectData) {
        Swal.fire('Error', 'No se encontraron datos del proyecto.', 'error');
        return;
      }

      exportProjectBudgetExcel(projectData);
    } catch (err) {
      console.error('Error exportando presupuesto a Excel:', err);
      Swal.close();
      Swal.fire('Error', 'No se pudo generar el archivo Excel del presupuesto.', 'error');
    }
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
    {
      name: 'observaciones',
      label: 'Observaciones',
      input: 'text',
      grid: { xs: 12 },
      rows: 3,
      required: false,
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
      'Observaciones': item.observaciones || '',
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
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Tooltip title="Ver detalles del proyecto">
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
              </Tooltip>
              <Tooltip title="Descargar Presupuesto en Excel">
                <IconButton
                  sx={{
                    color: 'success.main',
                    border: '1.5px solid',
                    borderColor: 'success.light',
                    borderRadius: 1.5,
                  }}
                  onClick={() => handleDownloadBudgetExcel(item)}
                >
                  <Icon icon="vscode-icons:file-type-excel" width={20} />
                </IconButton>
              </Tooltip>
            </Stack>
          )
        )}
        excludeKeys={['proyectos', 'questionGroupId', 'user', 'lastMaintenance', 'company', 'state', 'created_at', 'updated_at', 'password', 'signed_act', 'elevatorType', 'typeDriveSystem', 'customerId', 'elevatorTypeName', 'typeDriveSystemName', 'customerName', 'tipo', 'nombre', 'necesita_encerramiento', 'metros_cuadrados', 'displayLabel', 'observaciones', 'Observaciones']}
        customFilters={customFilters}
      />
    </>
  );
}
