import { TextField, MenuItem } from '@mui/material';

interface Option {
  label: string;
  value: any;
}

interface BaseSelectProps {
  name: string;
  label: string;
  value: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  options: Option[];
  fullWidth?: boolean;
  required?: boolean;
}

export default function BaseSelect({
  name,
  label,
  value,
  onChange,
  options = [],
  fullWidth = true,
  required = false,
}: BaseSelectProps) {
  return (
    <TextField
      select
      name={name}
      label={label}
      value={value || ''}
      onChange={onChange}
      fullWidth={fullWidth}
      required={required}
      variant="outlined"
    >
      {options.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </TextField>
  );
}