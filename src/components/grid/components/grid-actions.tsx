import { Stack, IconButton } from '@mui/material';
import { Icon } from '@iconify/react';

interface GridActionsProps {
  onEdit: () => void;
  onDelete: () => void;
  extraActions?: React.ReactNode;
}

export default function GridActions({ onEdit, onDelete, extraActions }: GridActionsProps) {
  return (
    <Stack direction="row" spacing={1}>
      {extraActions}
      <IconButton
        sx={{ 
          color: 'primary.main', 
          border: '1.5px solid', 
          borderColor: 'primary.light', 
          borderRadius: 1.5 
        }}
        onClick={onEdit}
      >
        <Icon icon="lucide:square-pen" width={20} />
      </IconButton>
      <IconButton 
        sx={{ 
          color: 'error.main', 
          border: '1.5px solid', 
          borderColor: 'error.light', 
          borderRadius: 1.5 
        }}
        onClick={onDelete}
      >
        <Icon icon="lucide:trash-2" width={20} />
      </IconButton>
    </Stack>
  );
}
