import { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Paper } from '@mui/material';
import BaseTable from '../table/base.table.tsx';
import FormDialog from '../form/form.dialog.tsx';
import { BaseField } from '../form/base.form.tsx';
import GridHeader from './components/grid-header.tsx';
import GridActions from './components/grid-actions.tsx';
import BaseCardView from './components/base-card-view.tsx';
import { Loader } from '../../components/loaders';

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
}: BaseGridProps) {
  const [data, setData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'update'>('create');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(endpoint);
      let result = Array.isArray(response.data) ? response.data : response.data.data || [];
      if (mapData) {
        result = mapData(result);
      }
      setData(result);
      setFilteredData(result);
      if (onDataChange) onDataChange(result);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [endpoint]);

  useEffect(() => {
    const filtered = data.filter((item) =>
      Object.values(item).some(
        (val) => val && val.toString().toLowerCase().includes(search.toLowerCase())
      )
    );
    setFilteredData(filtered);
  }, [search, data]);

  const handleDelete = async (id: any) => {
    if (window.confirm('¿Estás seguro de eliminar este registro?')) {
      try {
        const url = deleteEndpoint || endpoint;
        // Append /:id for delete
        await axios.delete(`${url}/${id}`, { data: { id, state: 0 } });
        fetchData();
      } catch (error) {
        console.error('Error deleting item:', error);
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
