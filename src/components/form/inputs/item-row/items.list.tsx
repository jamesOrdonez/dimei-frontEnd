import { Box, Button, Typography } from '@mui/material';
import { PlusIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import axios from 'axios';
import ItemRow from './item.row.tsx';

interface Item {
  id: any;
  quantity: number | string;
}

interface Option {
  label: string;
  value: any;
}

interface ItemsListProps {
  name: string;
  label?: string;
  value: Item[];
  onChange: (e: { target: { name: string; value: Item[] } }) => void;
  options?: Option[];
  productEndpoint?: string;
  optionLabel?: string;
  optionValue?: string;
}

const EMPTY_ARRAY: any[] = [];

export default function ItemsList({
  name,
  label,
  value = [],
  onChange,
  options = EMPTY_ARRAY,
  productEndpoint,
  optionLabel = 'name',
  optionValue = 'id',
}: ItemsListProps) {
  const [items, setItems] = useState<Option[]>([]);

  useEffect(() => {
    if (options.length > 0) {
      setItems(options);
    } else if (productEndpoint) {
      axios
        .get(productEndpoint)
        .then((response) => {
          const formattedOptions = response.data.data.map((item: any) => ({
            label: item[optionLabel],
            value: item[optionValue],
          }));
          setItems(formattedOptions);
        })
        .catch((error) => console.error('Error fetching items for list:', error));
    }
  }, [options, productEndpoint, optionLabel, optionValue]);

  const handleItemChange = (index: number, field: string, newValue: any) => {
    const newList = [...value];
    newList[index] = { ...newList[index], [field]: newValue };
    onChange({
      target: {
        name,
        value: newList,
      },
    });
  };

  const handleRemoveItem = (index: number) => {
    const newList = value.filter((_, i) => i !== index);
    onChange({
      target: {
        name,
        value: newList,
      },
    });
  };

  const handleAddItem = () => {
    const newItem: Item = { id: '', quantity: '' };
    onChange({
      target: {
        name,
        value: [...value, newItem],
      },
    });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" className='text-gray-600 font-light text-md'>{label}</Typography>
      </Box>
      {value.map((item, index) => (
        <ItemRow
          key={index}
          index={index}
          item={item}
          onChange={handleItemChange}
          onRemove={handleRemoveItem}
          options={items}
        />
      ))}
      <Button
        fullWidth
        variant="outlined"
        startIcon={<PlusIcon className="h-5 w-5" />}
        onClick={handleAddItem}
        sx={{
          py: 1.5,
          color: '#333',
          borderColor: '#ccc',
          '&:hover': {
            borderColor: '#999',
            bgcolor: 'rgba(0, 0, 0, 0.04)',
          },
          textTransform: 'none',
          fontWeight: 600,
          borderWidth: 2,
        }}
      >
        AGREGAR OTRO ITEM
      </Button>
    </Box>
  );
}
