import * as React from 'react';
import Dialog, { DialogProps } from '@mui/material/Dialog';
import { DialogActions, DialogContent, DialogTitle, IconButton } from '@mui/material';
import { Icon } from '@iconify/react';

export interface BaseDialogProps extends Omit<DialogProps, 'title'> {
  title: React.ReactNode;
  children?: React.ReactNode;
  actions?: React.ReactNode;
  onClose: () => void;
}

export default function BaseDialog({ 
  title, 
  children, 
  actions, 
  open, 
  onClose, 
  scroll = 'paper',
  ...rest 
}: BaseDialogProps) {
  return (
      <Dialog
        open={open}
        onClose={onClose}
        scroll={scroll}
        aria-labelledby="scroll-dialog-title"
        aria-describedby="scroll-dialog-description"
        {...rest}
      >
         <DialogTitle id="scroll-dialog-title" sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {title}
            {onClose ? (
              <IconButton
                aria-label="close"
                onClick={onClose}
                sx={{
                  color: (theme) => theme.palette.grey[500],
                }}
              >
                <Icon icon="eva:close-fill" width={20} />
              </IconButton>
            ) : null}
         </DialogTitle>
         <DialogContent dividers={scroll === 'paper'}>
            {children}
         </DialogContent>
         {actions && (
            <DialogActions>
              {actions}
            </DialogActions>
         )}
      </Dialog>
  )
}