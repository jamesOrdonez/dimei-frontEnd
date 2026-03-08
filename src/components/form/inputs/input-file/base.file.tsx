import { useRef } from 'react';
import { TextField, InputAdornment, IconButton, Tooltip } from '@mui/material';
import { Icon } from '@iconify/react';

interface BaseFileProps {
  name: string;
  label: string;
  value: any;
  onChange: (e: any) => void;
  fullWidth?: boolean;
  required?: boolean;
}

export default function BaseFile({
  name,
  label,
  value,
  onChange,
  fullWidth = true,
  required = false,
}: BaseFileProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange({
      target: {
        name,
        value: null,
        files: [],
      },
    });
  };

  // Helper to get display name from value
  const getDisplayName = () => {
    if (!value) return '';
    if (value instanceof File) return value.name;
    if (typeof value === 'string') {
      // If it's a URL, get the last part
      return value.split('/').pop() || value;
    }
    return 'Archivo seleccionado';
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={onChange}
        name={name}
        style={{ display: 'none' }}
      />
      <TextField
        name={name}
        label={label}
        value={getDisplayName()}
        fullWidth={fullWidth}
        required={required}
        variant="outlined"
        onClick={handleClick}
        autoComplete="off"
        InputProps={{
          readOnly: true,
          style: { cursor: 'pointer' },
          endAdornment: (
            <InputAdornment position="end">
              {value && (
                <Tooltip title="Limpiar">
                  <IconButton onClick={handleClear} size="small" sx={{ mr: 0.5 }}>
                    <Icon icon="eva:close-fill" />
                  </IconButton>
                </Tooltip>
              )}
              <Tooltip title="Subir archivo">
                <IconButton onClick={handleClick} edge="end">
                  <Icon icon="eva:cloud-upload-fill" />
                </IconButton>
              </Tooltip>
            </InputAdornment>
          ),
        }}
        sx={{
          '& .MuiInputBase-root': {
            cursor: 'pointer',
          },
          '& .MuiOutlinedInput-input': {
            cursor: 'pointer',
            textOverflow: 'ellipsis',
          }
        }}
      />
    </>
  );
}