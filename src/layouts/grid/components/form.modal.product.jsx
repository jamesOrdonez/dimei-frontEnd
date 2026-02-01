import {
  Grid,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Autocomplete,
} from '@mui/material';
import { TrashIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

const FormModal_product = ({ schema, values, onChange }) => {
  const shouldRenderField = (field) => {
    if (!field.dependsOn) return true;
    const { field: dependency, value } = field.dependsOn;
    return values[dependency] === value;
  };

  const renderField = (field) => {
    switch (field.type) {
      case 'autocomplete':
        return (
          <Autocomplete
            fullWidth
            options={field.options}
            getOptionLabel={(option) => option.label}
            value={field.options.find((o) => o.value === values[field.name]) || null}
            onChange={(_, newValue) => {
              onChange({
                target: {
                  name: field.name,
                  value: newValue ? newValue.value : '',
                },
              });

              // limpiar items al cambiar grupo
              onChange({
                target: {
                  name: 'net_items',
                  value: [],
                },
              });
            }}
            renderInput={(params) => <TextField {...params} label={field.label} />}
          />
        );

      case 'select':
        return (
          <TextField
            select
            fullWidth
            SelectProps={{ multiple: true }}
            label={field.label}
            value={(values.net_items || []).map((i) => i.id)}
            onChange={(e) => {
              const selectedIds = e.target.value;
              const current = values.net_items || [];

              const newItems = selectedIds.map((id) => {
                const found = current.find((i) => i.id === id);
                return found || { id, quantity: '' };
              });

              onChange({
                target: {
                  name: 'net_items',
                  value: newItems,
                },
              });
            }}
          >
            {field.options.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </TextField>
        );

      case 'textarea':
        return (
          <TextField
            fullWidth
            multiline
            rows={field.rows || 4}
            name={field.name}
            label={field.label}
            value={values[field.name] || ''}
            onChange={onChange}
          />
        );

      default:
        return (
          <TextField
            fullWidth
            type={field.type || 'text'}
            name={field.name}
            label={field.label}
            value={values[field.name] || ''}
            onChange={onChange}
          />
        );
    }
  };

  return (
    <>
      <Grid container spacing={2}>
        {schema.map((row, i) =>
          row.columns.map((field, j) =>
            shouldRenderField(field) ? (
              <Grid key={`${i}-${j}`} item xs={field.xs || 12} md={field.md || 12}>
                {renderField(field)}
              </Grid>
            ) : null
          )
        )}
      </Grid>
      {/* TABLA DE ITEMS NECESARIOS */}
      <div className="mt-5">
        {Array.isArray(values.net_items) && values.net_items.length > 0 && (
          <Grid item xs={12}>
            <TableHead>
              <TableRow>
                <TableCell>Item</TableCell>
                <TableCell>Cantidad</TableCell>
                <TableCell align="right">Acción</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {values.net_items.map((item) => {
                const option = schema
                  .flatMap((r) => r.columns)
                  .find((f) => f.name === 'net_items')
                  ?.options.find((o) => o.value === item.id);

                return (
                  <TableRow key={item.id_items || item.id}>
                    <TableCell>{option?.label}</TableCell>

                    {/* CANTIDAD */}
                    <TableCell>
                      <TextField
                        type="number"
                        size="small"
                        value={item.quantity}
                        error={!item.quantity}
                        helperText={!item.quantity ? 'Requerido' : ''}
                        onChange={(e) => {
                          onChange({
                            target: {
                              name: 'net_items',
                              value: values.net_items.map((i) =>
                                i.id === item.id ? { ...i, quantity: e.target.value } : i
                              ),
                            },
                          });
                        }}
                      />
                    </TableCell>

                    {/* DELETE */}
                    <TableCell align="right">
                      <IconButton
                        onClick={async () => {
                          if (item.id_items) {
                            await axios.delete(`/deleteItemProduct/${item.id_items}`);
                          }
                          onChange({
                            target: {
                              name: 'net_items',
                              value: values.net_items.filter((i) => i.id !== item.id),
                            },
                          });
                        }}
                      >
                        <TrashIcon className="h-5 w-5 text-red-500" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Grid>
        )}
      </div>
    </>
  );
};

export default FormModal_product;
