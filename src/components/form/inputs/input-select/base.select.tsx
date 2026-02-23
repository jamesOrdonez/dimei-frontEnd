import { TextField, MenuItem } from '@mui/material';
import { useEffect, useState } from 'react';
import axios from 'axios';

interface Option {
  label: string;
  value: any;
}

interface BaseSelectProps {
  name: string;
  label: string;
  value: any;
  size?: "medium" | "small",
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  options?: Option[];
  fullWidth?: boolean;
  required?: boolean;
  endpoint?: string;
  optionLabel?: string;
  optionValue?: string;
}

const EMPTY_ARRAY: any[] = [];

export default function BaseSelect({
  name,
  label,
  value,
  onChange,
  options = EMPTY_ARRAY,
  fullWidth = true,
  required = false,
  endpoint,
  optionLabel = 'name',
  optionValue = 'id',
  size = 'medium'
}: BaseSelectProps) {
  const [items, setItems] = useState<Option[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (endpoint) {
      setLoading(true);
      axios
        .get(endpoint)
        .then((response) => {
          const formattedOptions = response.data.data.map((item: any) => ({
            label: item[optionLabel],
            value: item[optionValue],
          }));
          setItems(formattedOptions);
        })
        .catch((error) => console.error('Error fetching options:', error))
        .finally(() => setLoading(false));
    } else if (items !== options) {
      setItems(options);
    }
  }, [endpoint, options, optionLabel, optionValue]);

  return (
    <TextField
      select
      name={name}
      label={label}
      value={value || ''}
      onChange={onChange}
      fullWidth={fullWidth}
      required={required}
      disabled={loading}
      variant="outlined"
      size={size}
    >
      {loading ? (
        <MenuItem disabled value="">
          Cargando...
        </MenuItem>
      ) : (
        items.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))
      )}
    </TextField>
  );
}