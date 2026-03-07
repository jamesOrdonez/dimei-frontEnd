import { useState } from 'react';
import { TextField, IconButton, InputAdornment } from '@mui/material';
import { Icon } from '@iconify/react';

interface BasePasswordProps {
  name: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fullWidth?: boolean;
  required?: boolean;
}

export default function BasePassword({
  name,
  label,
  value,
  onChange,
  fullWidth = true,
  required = false,
}: BasePasswordProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <TextField
      name={name}
      label={label}
      value={value || ''}
      onChange={onChange}
      fullWidth={fullWidth}
      required={required}
      type={showPassword ? 'text' : 'password'}
      variant="outlined"
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
              <Icon icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  );
}
