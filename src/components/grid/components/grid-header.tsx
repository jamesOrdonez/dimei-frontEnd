import { Box, TextField, Stack, InputAdornment, IconButton, Button } from '@mui/material';
import { Icon } from '@iconify/react';

interface GridHeaderProps {
  title: string;
  search: string;
  viewMode?: 'list' | 'grid';
  onViewModeChange?: (mode: 'list' | 'grid') => void;
  onSearchChange: (value: string) => void;
  onNewClick: () => void;
  extraActions?: React.ReactNode;
}

export default function GridHeader({ title, search, viewMode = 'list', onViewModeChange, onSearchChange, onNewClick, extraActions }: GridHeaderProps) {
  return (
    <Box>
      {/* Tab Style Title */}
      <Box sx={{ position: 'relative' }}>
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
        <Stack 
          direction={{ xs: 'column', md: 'row' }} 
          spacing={2} 
          alignItems={{ xs: 'stretch', md: 'center' }} 
          sx={{ mb: 4 }}
        >
          <Box sx={{ flexGrow: 1 }}>
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
          </Box>
          
          <Stack 
            direction="row" 
            spacing={2} 
            alignItems="center" 
            sx={{ flexWrap: 'wrap' }}
          >
            <Stack direction="row" spacing={0.5} sx={{ bgcolor: '#F4F6F8', p: 0.5, borderRadius: 2 }}>
             <IconButton 
               size="medium" 
               onClick={() => onViewModeChange && onViewModeChange('list')}
               sx={{ 
                 ...(viewMode === 'list' 
                   ? { bgcolor: 'white', color: 'primary.main', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', '&:hover': { bgcolor: 'white' } } 
                   : { color: 'text.secondary', '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' } }
                 )
               }}
             >
               <Icon icon="ic:round-format-list-bulleted" width={24} height={24} />
             </IconButton>
             <IconButton 
               size="medium" 
               onClick={() => onViewModeChange && onViewModeChange('grid')}
               sx={{ 
                 ...(viewMode === 'grid' 
                   ? { bgcolor: 'white', color: 'primary.main', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', '&:hover': { bgcolor: 'white' } } 
                   : { color: 'text.secondary', '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' } }
                 )
               }}
             >
               <Icon icon="ic:round-grid-view" width={24} height={24} />
             </IconButton>
            </Stack>

            {extraActions}
            
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
        </Stack>
      </Box>
    </Box>
  );
}
