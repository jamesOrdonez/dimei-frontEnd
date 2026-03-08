import React, { useState } from 'react';
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

interface BaseTableProps {
  data: any[];
  extraHeaders?: string[];
  renderExtraCell?: (item: any, index: number) => React.ReactNode;
  excludeKeys?: string[];
  rowsPerPageOptions?: number[];
}

export default function BaseTable({
  data,
  extraHeaders = [],
  renderExtraCell,
  excludeKeys = [],
  rowsPerPageOptions = [5, 10, 25],
}: BaseTableProps) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(rowsPerPageOptions[0]);
  const [goToPage, setGoToPage] = useState('');

  if (!data || data.length === 0) {
    return <div>No hay datos disponibles</div>;
  }

  // Generate headers from the first item's keys, excluding specified ones
  const dataKeys = Object.keys(data[0]).filter((key) => !excludeKeys.includes(key));
  const allHeaders = [...dataKeys, ...extraHeaders];

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
              {allHeaders.map((header) => (
                <TableCell 
                  key={header} 
                  sx={{ 
                    fontWeight: 'bold', 
                    textTransform: 'uppercase', // Uppercase headers
                    color: '#000000', // Black color for headers
                    backgroundColor: '#ffffff'
                  }}
                >
                  {header}
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
                {dataKeys.map((key) => (
                  <TableCell key={key}>{item[key]?.toString() || '-'}</TableCell>
                ))}
                {extraHeaders.length > 0 && renderExtraCell && (
                  <TableCell>{renderExtraCell(item, rowIndex)}</TableCell>
                )}
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