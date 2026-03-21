import { useState } from 'react';
import { Tabs, Tab, Box } from '@mui/material';
import ItemsGroup from './components/items.group';
import Unidad_medida from './components/unidad.medida';

// 🔁 COMPONENTE TABS REUTILIZABLE
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
            className="
          normal-case font-semibold
          text-gray-600
          hover:text-blue-600
          data-[selected=true]:text-blue-600
        "
          />
        ))}
      </Tabs>

      <div className="mt-6">{tabs[value]?.component}</div>
    </Box>
  );
}

export default function Configuraciones() {
  const tabs = [
    {
      label: 'Grupo items',
      component: <ItemsGroup />,
    },
    {
      label: 'Unidad de medida',
      component: <Unidad_medida />,
    },
  ];

  return <ConfigTabs tabs={tabs} />;
}
