import { useState } from 'react';
import { Box, Button, Menu, MenuItem, Typography, Stack } from '@mui/material';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import ItemsGroup from './components/items.group';
import UnidadMedida from './components/unidad.medida';
import ElevatorType from './components/elevator.type';
import TypeDriveSystem from './components/type.drive.system';
import ProductsGroup from './components/products.groups';
import RolesManagement from './components/roles.management';
import ToolsGroup from './components/tools.group';
import ToolUnidadMedida from './components/tool.unidad.medida';
import Preguntas from './components/preguntas';
import { Tabs, Tab } from '@mui/material';

// 🔁 COMPONENTE TABS REUTILIZABLE (Mantenido para compatibilidad con otras vistas)
export function ConfigTabs({ tabs }) {
  const [value, setValue] = useState(0);

  return (
    <Box className="w-full">
      <Tabs
        value={value}
        onChange={(_, newValue) => setValue(newValue)}
        variant="scrollable"
        scrollButtons="auto"
        className="rounded-xl bg-gray-100 px-2"
        TabIndicatorProps={{
          className: 'bg-blue-600 h-1 rounded-full',
        }}
      >
        {tabs.map((tab, index) => (
          <Tab
            key={index}
            label={tab.label}
            className="normal-case font-semibold text-gray-600 hover:text-blue-600"
          />
        ))}
      </Tabs>

      <div className="mt-6">{tabs[value]?.component}</div>
    </Box>
  );
}

// 🔁 COMPONENTE MENU DESPLEGABLE
function DropdownMenu({ label, items, activeLabel, onSelect }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (item) => {
    onSelect(item);
    handleClose();
  };

  const isChildActive = items.some(item => item.label === activeLabel);

  return (
    <Box>
      <Button
        onClick={handleClick}
        endIcon={<ChevronDownIcon className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />}
        sx={{
          px: 2,
          py: 1,
          borderRadius: '12px',
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.9rem',
          bgcolor: isChildActive ? 'rgba(59, 130, 246, 0.1)' : '#ffffff',
          color: isChildActive ? '#1e40af' : '#475569',
          border: '1px solid',
          borderColor: isChildActive ? '#3b82f6' : '#e2e8f0',
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
          '&:hover': {
            bgcolor: isChildActive ? 'rgba(59, 130, 246, 0.15)' : '#f8fafc',
            borderColor: isChildActive ? '#2563eb' : '#cbd5e1',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          },
        }}
      >
        {label}
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          elevation: 0,
          sx: {
            mt: 1,
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            minWidth: 200,
            overflow: 'visible',
          },
        }}
        transformOrigin={{ horizontal: 'left', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
      >
        {items.map((item) => (
          <MenuItem
            key={item.label}
            onClick={() => handleSelect(item)}
            selected={item.label === activeLabel}
            sx={{
              mx: 1,
              my: 0.5,
              borderRadius: '8px',
              fontWeight: 500,
              fontSize: '0.875rem',
              '&.Mui-selected': {
                bgcolor: 'rgba(59, 130, 246, 0.1)',
                color: '#2563eb',
                '&:hover': { bgcolor: 'rgba(59, 130, 246, 0.15)' },
              },
            }}
          >
            {item.label}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
}

export default function Configuraciones() {
  const [activeItem, setActiveItem] = useState({
    label: 'Grupo Items',
    component: <ItemsGroup />,
  });

  const groups = [
    {
      label: 'Grupos',
      items: [
        { label: 'Grupo Items', component: <ItemsGroup /> },
        { label: 'Grupo Herramientas', component: <ToolsGroup /> },
        { label: 'Grupo Productos', component: <ProductsGroup /> },
      ],
    },
    {
      label: 'Unidades de medida',
      items: [
        { label: 'Unidad de Medida Items', component: <UnidadMedida /> },
        { label: 'Unidad de Medida Herramientas', component: <ToolUnidadMedida /> },
      ],
    },
    {
      label: 'Tipos',
      items: [
        { label: 'Tipo de sistema', component: <ElevatorType /> },
        { label: 'Tipo de ascensor', component: <TypeDriveSystem /> },
      ],
    },
    {
      label: 'Mantenimiento',
      items: [
        { label: 'Preguntas', component: <Preguntas /> },
      ],
    },
  ];

  return (
    <Box sx={{ width: '100%' }}>
      <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: 'wrap', gap: 1 }}>
        {groups.map((group) => (
          <DropdownMenu
            key={group.label}
            label={group.label}
            items={group.items}
            activeLabel={activeItem.label}
            onSelect={(item) => setActiveItem(item)}
          />
        ))}
        
        <Button
          onClick={() => setActiveItem({ label: 'Roles y Permisos', component: <RolesManagement /> })}
          sx={{
            px: 2,
            py: 1,
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.9rem',
            bgcolor: activeItem.label === 'Roles y Permisos' ? 'rgba(59, 130, 246, 0.1)' : '#ffffff',
            color: activeItem.label === 'Roles y Permisos' ? '#1e40af' : '#475569',
            border: '1px solid',
            borderColor: activeItem.label === 'Roles y Permisos' ? '#3b82f6' : '#e2e8f0',
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
            '&:hover': {
              bgcolor: activeItem.label === 'Roles y Permisos' ? 'rgba(59, 130, 246, 0.15)' : '#f8fafc',
              borderColor: activeItem.label === 'Roles y Permisos' ? '#2563eb' : '#cbd5e1',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            },
          }}
        >
          Roles y Permisos
        </Button>
      </Stack>

      <Box sx={{ 
        p: 3, 
        bgcolor: 'white', 
        borderRadius: '24px', 
        border: '1px solid #f1f5f9',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.01), 0 1px 2px -1px rgba(0, 0, 0, 0.01)'
      }}>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, color: '#1e293b' }}>
          {activeItem.label}
        </Typography>
        {activeItem.component}
      </Box>
    </Box>
  );
}

