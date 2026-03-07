import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';

interface BaseTableProps {
  data: any[];
  extraHeaders?: string[];
  renderExtraCell?: (item: any, index: number) => React.ReactNode;
  excludeKeys?: string[];
}

export default function BaseTable({
  data,
  extraHeaders = [],
  renderExtraCell,
  excludeKeys = [],
}: BaseTableProps) {
  if (!data || data.length === 0) {
    return <div>No hay datos disponibles</div>;
  }

  // Generate headers from the first item's keys, excluding specified ones
  const dataKeys = Object.keys(data[0]).filter((key) => !excludeKeys.includes(key));
  const allHeaders = [...dataKeys, ...extraHeaders];

  return (
    <TableContainer component={Paper} sx={{ mt: 2, mb: 2, borderRadius: 2, overflow: 'hidden' }}>
      <Table aria-label="customized table">
        <TableHead>
          <TableRow sx={{ backgroundColor: '#ffffff' }}>
            {allHeaders.map((header) => (
              <TableCell 
                key={header} 
                sx={{ 
                  fontWeight: 'bold', 
                  textTransform: 'uppercase', // Uppercase headers
                  color: '#000000' // Black color for headers
                }}
              >
                {header}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((item, rowIndex) => (
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
  );
}