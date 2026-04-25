import { TextField } from '@mui/material';
import { fCurrency } from '../../../../utils/formatNumber';
import React, { useState, useEffect } from 'react';

interface BaseCurrencyProps {
  name: string;
  label: string;
  value: string | number;
  size?: "medium" | "small"
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fullWidth?: boolean;
  required?: boolean;
  disabled?: boolean;
}

export default function BaseCurrency({
  name,
  label,
  value,
  size = 'medium',
  onChange,
  fullWidth = true,
  required = false,
  disabled = false,
}: BaseCurrencyProps) {
  const [displayValue, setDisplayValue] = useState('');

  useEffect(() => {
    // When external value changes, format it for display
    if (value != null && value !== '') {
      setDisplayValue(fCurrency(value));
    } else {
      setDisplayValue('');
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value;
    
    // Allow empty
    if (inputValue === '' || inputValue === '$ ') {
      setDisplayValue('');
      // Create synthetic event
      const syntheticEvent = {
        ...e,
        target: { ...e.target, value: '', name }
      } as React.ChangeEvent<HTMLInputElement>;
      onChange(syntheticEvent);
      return;
    }

    // Strip out non-numeric characters
    const numericString = inputValue.replace(/\D/g, '');
    
    if (numericString !== '') {
      const numericValue = parseInt(numericString, 10);
      setDisplayValue(fCurrency(numericValue));
      
      const syntheticEvent = {
        ...e,
        target: { ...e.target, value: numericValue, name }
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      onChange(syntheticEvent);
    } else {
      setDisplayValue('');
      const syntheticEvent = {
        ...e,
        target: { ...e.target, value: '', name }
      } as React.ChangeEvent<HTMLInputElement>;
      onChange(syntheticEvent);
    }
  };

  return (
    <TextField
      name={name}
      label={label}
      value={displayValue}
      onChange={handleChange}
      fullWidth={fullWidth}
      required={required}
      disabled={disabled}
      size={size}
      variant="outlined"
      type="text"
    />
  );
}
