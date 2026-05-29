import { Box, TextField, Stack, InputAdornment, IconButton, Button, MenuItem } from '@mui/material';
import { Icon } from '@iconify/react';

export interface CustomFilter {
  key: string;
  label: string;
  type?: 'text' | 'select';
  options?: { value: any; label: string }[];
}

interface GridHeaderProps {
  title: string;
  search: string;
  viewMode?: 'list' | 'grid';
  onViewModeChange?: (mode: 'list' | 'grid') => void;
  onSearchChange: (value: string) => void;
  onNewClick?: () => void;
  extraActions?: React.ReactNode;
  customFilters?: CustomFilter[];
  activeFilters?: Record<string, any>;
  onFilterChange?: (key: string, value: any) => void;
}

export default function GridHeader({ 
  title, 
  search, 
  viewMode = 'list', 
  onViewModeChange, 
  onSearchChange, 
  onNewClick, 
  extraActions,
  customFilters = [],
  activeFilters = {},
  onFilterChange
}: GridHeaderProps) {
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
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ flexGrow: 1 }}>
            <TextField
              fullWidth
              placeholder="Buscar..."
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

            {customFilters.map((filter) => {
              const isText = filter.type === 'text';
              return (
                <TextField
                  key={filter.key}
                  select={!isText}
                  placeholder={isText ? `Buscar ${filter.label.toLowerCase()}` : undefined}
                  label={filter.label}
                  value={activeFilters[filter.key] || ''}
                  onChange={(e) => onFilterChange && onFilterChange(filter.key, e.target.value)}
                  sx={{ 
                    minWidth: { xs: '100%', sm: 160 },
                    '& .MuiInputBase-root': {
                      borderRadius: 2,
                      bgcolor: '#F4F6F8',
                      height: 50,
                      '& fieldset': { border: 'none' },
                    }
                  }}
                >
                  {!isText && <MenuItem value=""><em>Todos</em></MenuItem>}
                  {!isText && filter.options?.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </TextField>
              );
            })}
          </Stack>
          
          <Box 
            sx={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: 2, 
              alignItems: 'center', 
              justifyContent: { xs: 'flex-start', md: 'flex-end' } 
            }}
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
            
            {onNewClick && (
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
            )}
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}
