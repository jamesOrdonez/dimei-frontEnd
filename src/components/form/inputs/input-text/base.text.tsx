import { TextField } from '@mui/material';

interface BaseTextProps {
  name: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fullWidth?: boolean;
  required?: boolean;
  rows?: number;
}

export default function BaseText({
  name,
  label,
  value,
  onChange,
  fullWidth = true,
  required = false,
  rows = 1,
}: BaseTextProps) {
  return (
    <TextField
      name={name}
      label={label}
      value={value || ''}
      onChange={onChange}
      fullWidth={fullWidth}
      required={required}
      variant="outlined"
      multiline
      rows={rows}
    />
  );
}
