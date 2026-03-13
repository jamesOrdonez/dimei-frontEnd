import { Box, IconButton } from '@mui/material';
import { TrashIcon } from '@heroicons/react/24/outline';
import BaseSelect from '../input-select/base.select.tsx';
import BaseNumber from '../input-number/base.number.tsx';

interface ItemRowProps {
  index: number;
  item: {
    id: any;
    quantity: number | string;
  };
  onChange: (index: number, field: string, value: any) => void;
  onRemove: (index: number) => void;
  options?: any[];
}

export default function ItemRow({
  index,
  item,
  onChange,
  onRemove,
  options = [],
}: ItemRowProps) {
  const handleProductChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(index, 'id', e.target.value);
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(index, 'quantity', e.target.value);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        py: 1.5,
        borderRadius: 2,
      }}
    >
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <BaseSelect
          name={`product-${index}`}
          label="Item"
          size='small'
          value={item.id}
          onChange={handleProductChange}
          options={options}
          fullWidth
        />
      </Box>
      <Box sx={{ flexShrink: 0, width: 120 }}>
        <BaseNumber
          name={`quantity-${index}`}
          label="Cantidad"
          size="small"
          value={item.quantity.toString()}
          onChange={handleQuantityChange}
          fullWidth
        />
      </Box>
      <IconButton
        onClick={() => onRemove(index)}
        sx={{ 
          ml: 0.5,
          color: '#ef4444',
          '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.1)' }
        }}
      >
        <TrashIcon className="h-6 w-6" />
      </IconButton>
    </Box>
  );
}
