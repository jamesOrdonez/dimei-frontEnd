import { Box, TextField, Stack, InputAdornment, IconButton, Button } from '@mui/material';
import { Icon } from '@iconify/react';

interface GridHeaderProps {
  title: string;
  search: string;
  onSearchChange: (value: string) => void;
  onNewClick: () => void;
}

export default function GridHeader({ title, search, onSearchChange, onNewClick }: GridHeaderProps) {
  return (
    <Box>
      {/* Tab Style Title */}
      <Box sx={{ position: 'relative', mb: -0.5, ml: 2 }}>
        <Box
          sx={{
            display: 'inline-block',
            bgcolor: 'primary.main',
            color: 'white',
            px: 4,
            py: 1.5,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            fontWeight: 'bold',
            fontSize: '1.1rem',
          }}
        >
          {title}
        </Box>
      </Box>

      <Box 
        sx={{ 
          p: 3, 
          borderRadius: '0 16px 16px 16px', 
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          bgcolor: 'background.paper'
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 4 }}>
          <TextField
            fullWidth
            placeholder="Search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Icon icon="eva:search-fill" width={24} height={24} />
                </InputAdornment>
              ),
              sx: { 
                borderRadius: 2, 
                bgcolor: '#F4F6F8',
                '& fieldset': { border: 'none' },
                height: 50
              },
            }}
          />
          
          <Stack direction="row" spacing={0.5} sx={{ bgcolor: '#F4F6F8', p: 0.5, borderRadius: 2 }}>
             <IconButton size="medium" sx={{ color: 'text.secondary' }}>
               <Icon icon="ic:round-format-list-bulleted" width={24} height={24} />
             </IconButton>
             <IconButton 
               size="medium" 
               sx={{ 
                 bgcolor: 'white', 
                 color: 'primary.main',
                 boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                 '&:hover': { bgcolor: 'white' }
               }}
             >
               <Icon icon="ic:round-grid-view" width={24} height={24} />
             </IconButton>
          </Stack>

          <Button
            variant="contained"
            disableElevation
            onClick={onNewClick}
            sx={{ 
              px: 4, 
              py: 1.5, 
              borderRadius: 2, 
              textTransform: 'none', 
              fontWeight: 'bold',
              minWidth: 120,
              height: 50,
              fontSize: '1rem'
            }}
          >
            Nuevo
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}
