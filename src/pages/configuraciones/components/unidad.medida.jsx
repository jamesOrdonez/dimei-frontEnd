import { Helmet } from 'react-helmet-async';
import BaseGrid from '../../../components/grid/base.grid.tsx';

export default function Unidad_medida() {
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
        <title>Unidad de Medida</title>
      </Helmet>
      <BaseGrid
        title="Unidad de Medida"
        endpoint="/unitOfMeasuremet"
        saveEndpoint="/unitOfMeasuremet"
        updateEndpoint="/unitOfMeasuremet"
        deleteEndpoint="/unitOfMeasuremet"
        fields={fields}
        excludeKeys={['company', 'created_at', 'updated_at', 'unitOfMeasure']}
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
