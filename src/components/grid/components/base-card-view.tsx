import React, { useState } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Divider,
  Pagination,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

interface BaseCardViewProps {
  data: any[];
  excludeKeys?: string[];
  renderActions?: (item: any) => React.ReactNode;
  itemsPerPageOptions?: number[];
  extraHeaders?: (string | { label: string; after?: string })[];
  renderExtraCell?: (params: { item: any; rowIndex: number; headerLabel: string }) => React.ReactNode;
}

export default function BaseCardView({
  data,
  excludeKeys = [],
  renderActions,
  itemsPerPageOptions = [12, 24, 48],
  extraHeaders = [],
  renderExtraCell
}: BaseCardViewProps) {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(itemsPerPageOptions[0]);

  if (!data || data.length === 0) {
    return <Box p={3} textAlign="center" color="text.secondary">No hay datos disponibles</Box>;
  }

  // Normalize extra headers
  const normalizedExtraHeaders = extraHeaders.map(eh => 
    typeof eh === 'string' ? { label: eh } : eh
  );

  // Combine standard keys and extra cell headers without "ACCIONES" since actions have their tailored footer
  const dataKeys = Object.keys(data[0]).filter((key) => !excludeKeys.includes(key));
  
  const displayFields: { label: string; isExtra: boolean }[] = [];
  dataKeys.forEach(key => {
    displayFields.push({ label: key, isExtra: false });
    
    // Check if there are extras to insert after this key
    normalizedExtraHeaders
      .filter(eh => eh.after === key && eh.label !== 'ACCIONES')
      .forEach(eh => {
        displayFields.push({ label: eh.label, isExtra: true });
      });
  });

  normalizedExtraHeaders.forEach(eh => {
    if (eh.label === 'ACCIONES') return;
    const isAlreadyAdded = displayFields.some(ch => ch.isExtra && ch.label === eh.label);
    if (!isAlreadyAdded) {
      displayFields.push({ label: eh.label, isExtra: true });
    }
  });

  const totalPages = Math.ceil(data.length / itemsPerPage);
  
  const handleChangePage = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const paginatedData = data.slice((page - 1) * itemsPerPage, (page - 1) * itemsPerPage + itemsPerPage);

  return (
    <Box>
      <Grid container spacing={3}>
        {paginatedData.map((item, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={index} sx={{ display: 'flex' }}>
            <Card sx={{ 
              width: '100%',
              display: 'flex', 
              flexDirection: 'column',
              borderRadius: 4,
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              border: '1px solid',
              borderColor: 'divider',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 24px rgba(0,0,0,0.1)',
              }
            }}>
              <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
                {displayFields.map((field, i) => (
                  <Box key={field.label} sx={{ mb: i === displayFields.length - 1 ? 0 : 1.5 }}>
                    <Typography variant="overline" color="text.secondary" sx={{ display: 'block', lineHeight: 1.2, mb: 0.2, fontWeight: 600 }}>
                      {t(field.label)}
                    </Typography>
                    <Typography variant="body2" fontWeight={i === 0 ? 600 : 400} color={i === 0 ? 'primary.main' : 'text.primary'}>
                      {field.isExtra 
                        ? (renderExtraCell ? renderExtraCell({ item, rowIndex: index, headerLabel: field.label }) : '-') 
                        : (item[field.label]?.toString() || '-')}
                    </Typography>
                  </Box>
                ))}
              </CardContent>
              {renderActions && (
                <>
                  <Divider sx={{ borderStyle: 'dashed' }} />
                  <Box sx={{ p: 1.5, display: 'flex', justifyContent: 'flex-end', bgcolor: '#f8fafc' }}>
                    {renderActions(item)}
                  </Box>
                </>
              )}
            </Card>
          </Grid>
        ))}
      </Grid>
      
      {data.length > 0 && (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 4, px: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Mostrando {(page - 1) * itemsPerPage + 1} a {Math.min(page * itemsPerPage, data.length)} de {data.length} registros
          </Typography>
          <Pagination 
            count={totalPages} 
            page={page} 
            onChange={handleChangePage} 
            color="primary" 
            shape="rounded"
          />
        </Box>
      )}
    </Box>
  );
}
