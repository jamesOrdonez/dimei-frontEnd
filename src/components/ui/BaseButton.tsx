import React from 'react';
import { Icon } from '@iconify/react';
import { Button } from '@mui/material';

/**
 * Interface for BaseButton props as requested by the user.
 * Restricted to color, text, and onClick function.
 */
interface BaseButtonProps {
  color?: string;
  icon?: string;
  text: string;
  onClick: () => void;
}

/**
 * BaseButton component that uses Material UI's Button with custom styles.
 * 
 * @param {string} color - The background color of the button (defaults to 'green').
 * @param {string} icon - The icon for the button.
 * @param {string} text - The label text for the button.
 * @param {() => void} onClick - The callback function to execute on click.
 */
const BaseButton: React.FC<BaseButtonProps> = ({ color = 'green', icon, text, onClick }) => {
  return (
    <Button
      variant="contained"
      disableElevation
      onClick={onClick}
      startIcon={icon && <Icon icon={icon} width={20} />}
      sx={{ 
        px: 4, 
        py: 1.5, 
        borderRadius: 2, 
        textTransform: 'none', 
        fontWeight: 'bold',
        minWidth: 120,
        height: 50,
        fontSize: '1rem',
        backgroundColor: color,
        '&:hover': {
          backgroundColor: color,
          filter: 'brightness(90%)', // Providing a subtle hover effect across different colors
        }
      }}
    >
      {text}
    </Button>
  );
};

export default BaseButton;