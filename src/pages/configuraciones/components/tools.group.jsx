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
      />
    </>
  );
}
