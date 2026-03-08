import { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Paper } from '@mui/material';
import BaseTable from '../table/base.table.tsx';
import FormDialog from '../form/form.dialog.tsx';
import { BaseField } from '../form/base.form.tsx';
import GridHeader from './components/grid-header.tsx';
import GridActions from './components/grid-actions.tsx';
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
}

export default function BaseGrid({ 
  endpoint, 
  saveEndpoint,
  updateEndpoint,
  deleteEndpoint,
  fetchOneEndpoint,
  fields, 
  title, 
  excludeKeys = [] 
}: BaseGridProps) {
  const [data, setData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'update'>('create');
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(endpoint);
      const result = Array.isArray(response.data) ? response.data : response.data.data || [];
      setData(result);
      setFilteredData(result);
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
        onSearchChange={setSearch}
        onNewClick={() => {
          setDialogMode('create');
          setSelectedItem(null);
          setOpenDialog(true);
        }}
      />

      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          mt: -3, // Offset to integrate with header box
          borderRadius: '0 16px 16px 16px', 
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          position: 'relative',
          zIndex: 1
        }}
      >
        <BaseTable
          data={filteredData}
          excludeKeys={excludeKeys}
          extraHeaders={['ACCIONES']}
          renderExtraCell={(item) => (
            <GridActions
              onEdit={() => {
                setDialogMode('update');
                setSelectedItem(item);
                setOpenDialog(true);
              }}
              onDelete={() => handleDelete(item.id)}
            />
          )}
        />
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
        title={`${dialogMode === 'create' ? 'Nuevo' : 'Editar'} ${title}`}
      />
    </Box>
  );
}
