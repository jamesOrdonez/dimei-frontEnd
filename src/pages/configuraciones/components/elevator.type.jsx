import BaseGrid from '../../../components/grid/base.grid.tsx';

// Los grupos de preguntas ahora se asocian al tipo de sistema desde la pestaña "Preguntas"
// y se asignan a cada equipo desde el módulo de Equipos.
export default function ElevatorType() {
  const fields = [
    {
      name: 'elevatorType',
      label: 'Tipo de Sistema',
      input: 'text',
      grid: { xs: 12 },
      required: true,
    },
  ];

  const mapData = (data) => data.map(item => ({
    id: item.id,
    elevatorType: item.elevatorType,
  }));

  return (
    <BaseGrid
      title="Tipo de Sistema"
      endpoint={`/getElevatorTypes/${sessionStorage.getItem('company')}`}
      saveEndpoint="/saveElevatorTypes"
      updateEndpoint="/updateElevatorType"
      deleteEndpoint="/deleteElevatorType"
      fetchOneEndpoint="/getOneElevatorTypes"
      hideDelete={true}
      excludeKeys={['company', 'question_group_id', 'state']}
      fields={fields}
      mapData={mapData}
      mapPayload={(payload) => {
        const { questionGroup, ...rest } = payload || {};
        return rest;
      }}
    />
  );
}
