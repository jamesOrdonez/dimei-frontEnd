import React from 'react';
import { Card, Box, Typography } from '@mui/material';

/**
 * A standard summary card for displaying statistics with an icon.
 * 
 * @param {string} title - The label for the statistic.
 * @param {string|number} value - The main value to display.
 * @param {React.ElementType} icon - HeroIcon component or similar.
 * @param {string} iconColor - Tailwind-style text color class for the icon (e.g., 'text-blue-600').
 * @param {string} iconBgColor - CSS color for the icon background (e.g., '#eff6ff').
 * @param {string} [textColor] - Optional custom color for the value text.
 * @param {string} [borderColor] - Optional border color for the card.
 * @param {React.ReactNode} [footer] - Optional content to display below the main value.
 */
export default function SummaryCard({ 
  title, 
  value, 
  icon: Icon, 
  iconColor, 
  iconBgColor, 
  textColor, 
  borderColor, 
  footer 
}) {
  return (
    <Card sx={{ 
      height: '100%', 
      borderRadius: 3, 
      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center',
      p: 2,
      border: borderColor ? `1px solid ${borderColor}` : 'none'
    }}>
      <Box display="flex" alignItems="center">
        {Icon && (
          <Box sx={{ bgcolor: iconBgColor, p: 1.5, borderRadius: 2, mr: 2, display: 'flex' }}>
            <Icon className={`w-6 h-6 ${iconColor}`} />
          </Box>
        )}
        <Box>
          <Typography variant="caption" fontWeight={600} color="#94a3b8" letterSpacing={1} sx={{ textTransform: 'uppercase' }}>
            {title}
          </Typography>
          <Typography variant="h4" fontWeight={800} color={textColor || 'inherit'} lineHeight={1}>
            {value}
          </Typography>
        </Box>
      </Box>
      {footer && <Box mt={1} pl={Icon ? 8 : 0}>{footer}</Box>}
    </Card>
  );
}
