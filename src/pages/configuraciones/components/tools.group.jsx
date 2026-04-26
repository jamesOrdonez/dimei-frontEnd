import { Helmet } from 'react-helmet-async';
import BaseGrid from '../../../components/grid/base.grid.tsx';

export default function ToolsGroup() {
  const fields = [
    {
      name: 'name',
      label: 'Nombre',
      input: 'text',
      grid: { xs: 12, md: 12 },
      required: true,
    },
    {
      name: 'state',
      label: 'Estado',
      input: 'select',
      options: [
        { label: 'Activo', value: 1 },
        { label: 'Inactivo', value: 0 },
      ],
      grid: { xs: 12, md: 12 },
      required: true,
    },
  ];

  return (
    <>
      <Helmet>
        <title>Grupo Herramientas</title>
      </Helmet>
      <BaseGrid
        title="Grupo Herramientas"
        endpoint={`/getToolGroup/${sessionStorage.getItem('company')}`}
        saveEndpoint="/saveToolGroup"
        updateEndpoint="/updateToolGroup"
        deleteEndpoint="/deleteToolGroup"
        hideDelete={true}
        fields={fields}
        excludeKeys={['company', 'created_at', 'updated_at', 'state']}
        formAdditionalValues={{ company: sessionStorage.getItem('company'), state: 1 }}
        extraHeaders={['ESTADO']}
        renderExtraCell={({ item, headerLabel }) => {
          if (headerLabel === 'ESTADO') {
            return item.state === 1 || item.state === '1' ? 'Activo' : 'Inactivo';
          }
          return null;
        }}
      />
    </>
  );
}
