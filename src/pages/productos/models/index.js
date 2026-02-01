// dimei-frontEnd/src/pages/productos/models/index.js
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function useProductSchema(selectedGroup) {
  const [items, setItems] = useState([]);
  const [GrupoItems, setGrupoItems] = useState([]);
  const [unitOfMeasure, setUnitOfMeasure] = useState([]);

  useEffect(() => {
    const loadUnits = async () => {
      try {
        const res = await axios.get('/getItem/1');
        const grupo = await axios.get(`/getItemGroup/${sessionStorage.getItem('company')}`);

        setItems(res.data.data);

        setGrupoItems(
          grupo.data.data.map((g) => ({
            label: g.name,
            value: g.name,
          }))
        );
      } catch (error) {
        console.error(error);
      }
    };

    loadUnits();
  }, []);

  useEffect(() => {
    if (!selectedGroup) {
      setUnitOfMeasure([]);
      return;
    }

    const filtered = items
      .filter((item) => item.group_name && item.group_name.trim() === selectedGroup)
      .map((item) => ({
        label: item.description,
        value: item.id,
      }));

    setUnitOfMeasure(filtered);
  }, [selectedGroup, items]);

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
          md: 6,
        },
      ],
    },
  ];
}
