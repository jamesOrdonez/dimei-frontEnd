import { useState } from 'react';
import { Tabs, Tab, Box } from '@mui/material';
import Grupo from './components/grupo';

// 🔁 TAB PANEL REUTILIZABLE
function TabPanel({ children, value, index }) {
  return <div hidden={value !== index}>{value === index && <Box sx={{ pt: 2 }}>{children}</Box>}</div>;
}

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

      <div className="mt-6 rounded-xl bg-white p-6 shadow-md">{tabs[value]?.component}</div>
    </Box>
  );
}

export default function Configuraciones() {
  const tabs = [
    {
      label: 'Grupo',
      component: <Grupo />,
    },
    /* {
      label: 'Unidad de medida',
      component: <div>Configuración de items</div>,
    }, */
  ];

  return <ConfigTabs tabs={tabs} />;
}
