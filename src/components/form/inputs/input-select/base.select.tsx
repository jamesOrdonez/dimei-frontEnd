import { TextField, Autocomplete, CircularProgress, Box } from '@mui/material';
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
  autoFocus?: boolean;
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
  size = 'medium',
  autoFocus = false
}: BaseSelectProps) {
  const [items, setItems] = useState<Option[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (endpoint) {
      setLoading(true);
      axios
        .get(endpoint)
        .then((response) => {
          const rawData = response.data.data || response.data;
          const formattedOptions = (Array.isArray(rawData) ? rawData : []).map((item: any) => ({
            label: `${item[optionValue]} - ${item[optionLabel] || ''}`,
            value: item[optionValue],
          }));
          setItems(formattedOptions);
        })
        .catch((error) => console.error('Error fetching options:', error))
        .finally(() => setLoading(false));
    } else if (items !== options) {
      setItems(options || []);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint, options, optionLabel, optionValue]);

  const selectedOption = items.find((opt) => String(opt.value) === String(value)) || null;

  return (
    <Autocomplete
      id={`${name}-autocomplete`}
      options={items}
      getOptionLabel={(option) => option.label || ''}
      value={selectedOption}
      loading={loading}
      fullWidth={fullWidth}
      onChange={(_, newValue) => {
        onChange({
          target: {
            name,
            value: newValue ? newValue.value : '',
          },
        } as React.ChangeEvent<HTMLInputElement>);
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          name={name}
          label={label}
          required={required}
          variant="outlined"
          size={size}
          autoFocus={autoFocus}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      renderOption={(props, option) => (
        <Box component="li" {...props} key={option.value}>
          {option.label}
        </Box>
      )}
    />
  );
}
