import { Helmet } from 'react-helmet-async';
import BaseGrid from '../../../components/grid/base.grid.tsx';

export default function ToolUnidadMedida() {
  const fields = [
    {
      name: 'unitOfMeasure',
      label: 'Nombre',
      input: 'text',
      grid: { xs: 12, md: 12 },
      required: true,
    },
  ];

  return (
    <>
      <Helmet>
        <title>Unidad de Medida Herramientas</title>
      </Helmet>
      <BaseGrid
        title="Unidad de Medida Herramientas"
        endpoint={`/getToolUnitOfMeasure/${sessionStorage.getItem('company')}`}
        saveEndpoint="/saveToolUnitOfMeasure"
        updateEndpoint="/updateToolUnitOfMeasure"
        deleteEndpoint="/deleteToolUnitOfMeasure"
        hideDelete={true}
        fields={fields}
        excludeKeys={['company', 'created_at', 'updated_at', 'unitOfMeasure', 'state']}
        formAdditionalValues={{ company: sessionStorage.getItem('company') }}
        extraHeaders={['NOMBRE']}
        renderExtraCell={({ item, headerLabel }) => {
          if (headerLabel === 'NOMBRE') {
            return item.unitOfMeasure;
          }
          return null;
        }}
      />
    </>
  );
}
