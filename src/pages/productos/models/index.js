import { useEffect, useState } from 'react';
import axios from 'axios';

export default function useProductSchema() {
  const [unitOfMeasure, setUnitOfMeasure] = useState([]);

  useEffect(() => {
    const loadUnits = async () => {
      try {
        const res = await axios.get('/getItem/1');
        setUnitOfMeasure(res.data.data.map((u) => ({ label: u.description, value: u.id })));
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
          name: 'net_items',
          label: 'Items Necesarios',
          type: 'select',
          multiple: true, // 👈 IMPORTANTE
          options: unitOfMeasure,
          xs: 12,
          md: 12,
        },
      ],
    },
  ];
}
