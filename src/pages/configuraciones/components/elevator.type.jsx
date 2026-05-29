import React, { useState, useEffect } from 'react';
import BaseGrid from '../../../components/grid/base.grid.tsx';
import axios from 'axios';

export default function ElevatorType() {
  const [questionGroups, setQuestionGroups] = useState([]);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const company = sessionStorage.getItem('company');
        const res = await axios.get(`/getQuestionGroups/${company}`);
        const groups = res.data.data || [];
        setQuestionGroups(groups.map(g => ({ value: g.id, label: g.name })));
      } catch (e) {
        console.error(e);
      }
    };
    fetchGroups();
  }, []);

  const fields = [
    {
      name: 'elevatorType',
      label: 'Tipo de Sistema',
      input: 'text',
      grid: { xs: 12, md: 6 },
      required: true,
    },
    {
      name: 'question_group_id',
      label: 'Grupo de Preguntas',
      input: 'select',
      options: questionGroups,
      grid: { xs: 12, md: 6 },
      required: true,
    },
  ];

  // Mapear los datos para mostrar el nombre del grupo de preguntas en la tabla
  const mapData = (data) => data.map(item => ({
    id: item.id,
    elevatorType: item.elevatorType,
    'Grupo de Preguntas': item.questionGroup?.name || 'No asignado',
    question_group_id: item.question_group_id,
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
    />
  );
}
