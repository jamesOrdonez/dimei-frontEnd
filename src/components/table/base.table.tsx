import React, { useState } from 'react';
import axios from 'axios';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Box,
  TextField,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { PhotoIcon } from '@heroicons/react/24/outline';

interface ExtraHeader {
  label: string;
  after?: string;
}

interface BaseTableProps {
  data: any[];
  extraHeaders?: (string | ExtraHeader)[];
  renderExtraCell?: (params: { item: any; rowIndex: number; headerLabel: string }) => React.ReactNode;
  excludeKeys?: string[];
  rowsPerPageOptions?: number[];
  firstHeader?: string | ExtraHeader; // New prop for first column
}

export default function BaseTable({
  data,
  extraHeaders = [],
  renderExtraCell,
  excludeKeys = [],
  rowsPerPageOptions = [5, 10, 25],
  firstHeader,
}: BaseTableProps) {

  const { t } = useTranslation();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(rowsPerPageOptions[0]);
  const [goToPage, setGoToPage] = useState('');

  if (!data || data.length === 0) {
    return <div>No hay datos disponibles</div>;
  }

  // Normalize extra headers
  const normalizedExtraHeaders: ExtraHeader[] = extraHeaders.map(eh => 
    typeof eh === 'string' ? { label: eh } : eh
  );

  // Generate headers from the first item's keys, excluding specified ones
  const dataKeys = Object.keys(data[0]).filter((key) => !excludeKeys.includes(key));
  
  // Combine headers with positioning logic
  const combinedHeaders: { label: string; isExtra: boolean }[] = [];
  
  // 0. Add first header if provided
  if (firstHeader) {
    const fh = typeof firstHeader === 'string' ? { label: firstHeader } : firstHeader;
    combinedHeaders.push({ label: fh.label, isExtra: true });
  }

  // 1. Add data keys and their associated extra headers
  dataKeys.forEach(key => {
    combinedHeaders.push({ label: key, isExtra: false });
    
    // Find extra headers that should go after this key
    normalizedExtraHeaders
      .filter(eh => eh.after === key)
      .forEach(eh => {
        combinedHeaders.push({ label: eh.label, isExtra: true });
      });
  });

  // 2. Add remaining extra headers (those without 'after' or with non-existent 'after')
  normalizedExtraHeaders.forEach(eh => {
    const isAlreadyAdded = combinedHeaders.some(ch => ch.isExtra && ch.label === eh.label);
    if (!isAlreadyAdded) {
      combinedHeaders.push({ label: eh.label, isExtra: true });
    }
  });

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleGoToPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setGoToPage(value);
    const newPage = parseInt(value, 10);
    const totalPages = Math.ceil(data.length / rowsPerPage);
    if (!isNaN(newPage) && newPage > 0 && newPage <= totalPages) {
      setPage(newPage - 1);
    }
  };

  const paginatedData = data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Paper sx={{ width: '100%', mb: 2, borderRadius: 2, overflow: 'hidden' }}>
      <TableContainer sx={{ overflow: 'auto' }}>
        <Table stickyHeader aria-label="customized table">
          <TableHead>
            <TableRow>
              {combinedHeaders.map((header) => (
                <TableCell 
                  key={header.label} 
                  sx={{ 
                    fontWeight: 'bold', 
                    textTransform: 'uppercase', // Uppercase headers
                    color: '#000000', // Black color for headers
                    backgroundColor: '#ffffff'
                  }}
                >
                  {t(header.label)}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.map((item, rowIndex) => (
              <TableRow 
                key={rowIndex}
                sx={{ 
                  backgroundColor: rowIndex % 2 === 0 ? '#f0f7ff' : '#ffffff', // Interleaved light blue
                  '&:hover': {
                    backgroundColor: '#e3efff' // Subtle hover effect
                  }
                }}
              >
                {combinedHeaders.map((header) => {
                  if (!header.isExtra) {
                    const value = item[header.label];
                    // Render image if header is named img or Imagen
                    if (['img', 'Imagen', 'image', 'imagen'].includes(header.label.toLowerCase())) {
                      const src = value && typeof value === 'string' && value.startsWith('http') 
                        ? value 
                        : value ? `${axios.defaults.baseURL}getItem/image/${item.id}` : null;
                      return (
                        <TableCell key={header.label}>
                          {src ? (
                            <Box 
                              component="img" 
                              src={src} 
                              sx={{ width: 50, height: 50, borderRadius: 1, objectFit: 'cover' }} 
                              alt={header.label}
                            />
                          ) : (
                            <Box sx={{ 
                              width: 50, 
                              height: 50, 
                              borderRadius: 1, 
                              bgcolor: 'rgba(59, 130, 246, 0.05)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              <PhotoIcon className="h-6 w-6 text-blue-200" />
                            </Box>
                          )}
                        </TableCell>
                      );
                    }
                    return <TableCell key={header.label}>{value?.toString() || '-'}</TableCell>;
                  }
                  return (
                    <TableCell key={header.label}>
                      {renderExtraCell ? renderExtraCell({ item, rowIndex, headerLabel: header.label }) : '-'}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2">Ir a pág:</Typography>
          <TextField
            size="small"
            variant="outlined"
            value={goToPage}
            onChange={handleGoToPageChange}
            sx={{ width: 60 }}
            inputProps={{ style: { padding: '4px 8px' } }}
          />
        </Box>
        <TablePagination
          rowsPerPageOptions={rowsPerPageOptions}
          component="div"
          count={data.length}
          rowsPerPage={rowsPerPage}
          page={page}
          showFirstButton 
          showLastButton
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Filas por página"
        />
      </Box>
    </Paper>
  );
}