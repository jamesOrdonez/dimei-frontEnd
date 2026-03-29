import { useState, useEffect, useCallback, useRef } from 'react';


import axios from 'axios';
import { Box, Paper } from '@mui/material';
import BaseTable from '../table/base.table.tsx';
import FormDialog from '../form/form.dialog.tsx';
import { BaseField } from '../form/base.form.tsx';
import GridHeader, { CustomFilter } from './components/grid-header.tsx';
import GridActions from './components/grid-actions.tsx';
import BaseCardView from './components/base-card-view.tsx';
import { Loader } from '../../components/loaders';
import Swal from 'sweetalert2';

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer;
    toast.onmouseleave = Swal.resumeTimer;
    const container = Swal.getContainer();
    if (container) {
      container.style.zIndex = '9999';
    }
  }
});

interface BaseGridProps {
  endpoint: string;
  saveEndpoint?: string;
  updateEndpoint?: string;
  deleteEndpoint?: string;
  fetchOneEndpoint?: string;
  fields: BaseField[];
  title: string;
  excludeKeys?: string[];
  extraHeaderActions?: React.ReactNode;
  extraHeaders?: (string | { label: string; after?: string })[];
  renderExtraCell?: (params: { item: any; rowIndex: number; headerLabel: string }) => React.ReactNode;
  onDataChange?: (data: any[]) => void;
  formAdditionalValues?: Record<string, any>;
  renderExtraActions?: (item: any) => React.ReactNode;
  mapData?: (data: any[]) => any[];
  mapPayload?: (payload: any) => any;
  customFilters?: CustomFilter[];
  firstHeader?: string | { label: string; after?: string };
}

export default function BaseGrid({ 
  endpoint, 
  saveEndpoint,
  updateEndpoint,
  deleteEndpoint,
  fetchOneEndpoint,
  fields, 
  title, 
  excludeKeys = [],
  extraHeaderActions,
  extraHeaders: propExtraHeaders = [],
  renderExtraCell: propRenderExtraCell,
  onDataChange,
  formAdditionalValues,
  renderExtraActions,
  mapData,
  mapPayload,
  customFilters = [],
  firstHeader,
}: BaseGridProps) {
  const [data, setData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'update'>('create');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  // Use refs for props that are often unmemoized in parent components to avoid infinite loops
  const mapDataRef = useRef(mapData);
  const onDataChangeRef = useRef(onDataChange);

  useEffect(() => {
    mapDataRef.current = mapData;
    onDataChangeRef.current = onDataChange;
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(endpoint);
      let result = Array.isArray(response.data) ? response.data : response.data.data || [];
      if (mapDataRef.current) {
        result = mapDataRef.current(result);
      }
      setData(result);
      setFilteredData(result);
      if (onDataChangeRef.current) onDataChangeRef.current(result);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [endpoint]);


  useEffect(() => {
    fetchData();
  }, [fetchData]);


  useEffect(() => {
    let filtered = data;

    // 1. Text search
    if (search) {
      filtered = filtered.filter((item) =>
        Object.values(item).some(
          (val) => val && val.toString().toLowerCase().includes(search.toLowerCase())
        )
      );
    }

    // 2. Custom filters
    Object.entries(activeFilters).forEach(([key, value]) => {
      if (value) {
        filtered = filtered.filter(item => {
          // Flexible match (direct or nested)
          const itemValue = item[key];
          return itemValue === value || itemValue?.toString() === value?.toString();
        });
      }
    });

    setFilteredData(filtered);
  }, [search, data, activeFilters]);

  const handleFilterChange = (key: string, value: any) => {
    setActiveFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleDelete = async (id: any) => {
    if (window.confirm('¿Estás seguro de eliminar este registro?')) {
      try {
        const url = deleteEndpoint || endpoint;
        // Append /:id for delete
        await axios.delete(`${url}/${id}`, { data: { id, state: 0 } });
        Toast.fire({ icon: 'success', title: 'Registro eliminado exitosamente' });
        fetchData();
      } catch (error) {
        console.error('Error deleting item:', error);
        Toast.fire({ icon: 'error', title: 'Error al eliminar el registro' });
      }
    }
  };

  if (loading) return <Loader />;

  return (
    <Box>
      <GridHeader
        title={title}
        search={search}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onSearchChange={setSearch}
        onNewClick={() => {
          setDialogMode('create');
          setSelectedItem(null);
          setOpenDialog(true);
        }}
        extraActions={extraHeaderActions}
        customFilters={customFilters}
        activeFilters={activeFilters}
        onFilterChange={handleFilterChange}
      />

      <Paper 
        elevation={0} 
        sx={{ 
          p: viewMode === 'list' ? 3 : 0, 
          mt: viewMode === 'list' ? -3 : 3, // Offset to integrate with header box
          borderRadius: viewMode === 'list' ? '0 0 16px 16px' : 0, 
          border: viewMode === 'list' ? '1px solid' : 'none',
          borderColor: 'divider',
          boxShadow: viewMode === 'list' ? '0 4px 20px rgba(0,0,0,0.05)' : 'none',
          position: 'relative',
          zIndex: 1,
          backgroundColor: viewMode === 'list' ? '#ffffff' : 'transparent'
        }}
      >
        {viewMode === 'list' ? (
          <BaseTable
            data={filteredData}
            excludeKeys={excludeKeys}
            firstHeader={firstHeader}
            extraHeaders={[...propExtraHeaders, 'ACCIONES']}
            renderExtraCell={({ item, rowIndex, headerLabel }) => {
              if (headerLabel === 'ACCIONES') {
                return (
                  <GridActions
                    onEdit={() => {
                      setDialogMode('update');
                      setSelectedItem(item);
                      setOpenDialog(true);
                    }}
                    onDelete={() => handleDelete(item.id)}
                    extraActions={renderExtraActions ? renderExtraActions(item) : undefined}
                  />
                );
              }
              return propRenderExtraCell ? propRenderExtraCell({ item, rowIndex, headerLabel }) : null;
            }}
          />
        ) : (
          <BaseCardView
            data={filteredData}
            excludeKeys={excludeKeys}
            extraHeaders={propExtraHeaders}
            renderExtraCell={propRenderExtraCell}
            renderActions={(item) => (
              <GridActions
                onEdit={() => {
                  setDialogMode('update');
                  setSelectedItem(item);
                  setOpenDialog(true);
                }}
                onDelete={() => handleDelete(item.id)}
                extraActions={renderExtraActions ? renderExtraActions(item) : undefined}
              />
            )}
          />
        )}
      </Paper>

      <FormDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onSuccess={fetchData}
        endpoint={endpoint}
        saveEndpoint={saveEndpoint}
        updateEndpoint={updateEndpoint}
        fetchOneEndpoint={fetchOneEndpoint}
        fields={fields}
        mode={dialogMode}
        initialValues={selectedItem}
        additionalValues={formAdditionalValues}
        title={`${dialogMode === 'create' ? 'Nuevo' : 'Editar'} ${title}`}
        mapPayload={mapPayload}
      />
    </Box>
  );
}
