import { useEffect, useState } from 'react';
import axios from 'axios';

export default function useProductSchema() {
  const [unitOfMeasure, setUnitOfMeasure] = useState([]);
  const [GrupoItems, setGrupoItems] = useState([]);

  useEffect(() => {
    const loadUnits = async () => {
      try {
        const res = await axios.get('/getItem/1');
        const grupo = await axios.get(`/getItemGroup/${sessionStorage.getItem('company')}`);

        // grupos
        const grupo_data = grupo.data.data.map((g) => ({
          label: g.name,
          value: g.id,
          name: g.name,
        }));

        // items SIN transformar aún
        const items = res.data.data;

        // filtrar correctamente
        const Filter = items
          .filter((item) => grupo_data.some((g) => g.name === item.group_name))
          .map((item) => ({
            label: item.description,
            value: item.id,
          }));

        console.log(Filter);

        setGrupoItems(grupo_data);
        setUnitOfMeasure(Filter);
      } catch (error) {
        console.error('Error cargando unidades de medida', error);
      }
    };

    loadUnits();
  }, []);

  return [
    {
      row: 1,
      columns: [
        {
          name: 'name',
          label: 'Nombre del producto',
          type: 'text',
          xs: 12,
          md: 12,
        },
        {
          name: 'description',
          label: 'Descripción',
          type: 'textarea',
          xs: 12,
          md: 12,
        },
      ],
    },
    {
      row: 2,
      columns: [
        {
          name: 'group_item',
          label: 'Grupo al que pertenece',
          type: 'select',
          options: GrupoItems,
          xs: 12,
          md: 6,
        },
      ],
    },
    {
      row: 2,
      columns: [
        {
          name: 'net_items',
          label: 'Items',
          type: 'select',
          multiple: true,
          options: unitOfMeasure,
          xs: 12,
          md: 12,
        },
      ],
    },
  ];
}
