import { FormControlLabel, Switch, Box, Typography } from '@mui/material';

interface BaseSwitchProps {
  name: string;
  label: string;
  value: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}

export default function BaseSwitch({
  name,
  label,
  value,
  onChange,
  disabled = false,
}: BaseSwitchProps) {
  // Normalize: accept 0/1, true/false, "true"/"false"
  const isChecked = value === true || value === 1 || value === '1' || value === 'true';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Emit a synthetic event with the boolean value as string for uniform handling
    const syntheticEvent = {
      target: {
        name,
        value: e.target.checked ? 1 : 0,
        type: 'switch',
      },
    } as any;
    onChange(syntheticEvent);
  };

  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        px: 2,
        py: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: isChecked ? 'primary.50' : 'transparent',
        transition: 'background-color 0.2s',
      }}
    >
      <Typography variant="body2" color="text.secondary" fontWeight={500}>
        {label}
      </Typography>
      <FormControlLabel
        control={
          <Switch
            checked={isChecked}
            onChange={handleChange}
            name={name}
            disabled={disabled}
            color="primary"
          />
        }
        label={isChecked ? 'Sí' : 'No'}
        labelPlacement="start"
        sx={{ m: 0, gap: 1 }}
      />
    </Box>
  );
}
