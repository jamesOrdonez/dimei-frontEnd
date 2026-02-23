import { TextField } from '@mui/material';

interface BaseTextProps {
  name: string;
  label: string;
  value: string;
  size?: "medium" | "small"
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fullWidth?: boolean;
  required?: boolean;
}

export default function BaseText({
  name,
  label,
  value,
  size = 'medium',
  onChange,
  fullWidth = true,
  required = false,
}: BaseTextProps) {
  return (
    <TextField
      name={name}
      label={label}
      value={value || ''}
      onChange={onChange}
      fullWidth={fullWidth}
      required={required}
      size={size}
      variant="outlined"
      type="number"
    />
  );
}
