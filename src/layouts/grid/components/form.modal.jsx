import { Grid, TextField, MenuItem } from '@mui/material';

const FormModal = ({ schema, values, onChange }) => {
  const shouldRenderField = (field) => {
    if (!field.dependsOn) return true;
    const { field: dependency, value } = field.dependsOn;
    return values[dependency] === value;
  };
  const renderField = (field) => {
    switch (field.type) {
      case 'select':
        return (
          <TextField
            select
            fullWidth
            name={field.name}
            label={field.label}
            value={values[field.name] || ''}
            onChange={onChange}
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

      case 'file': // ✅ CASO ESPECIAL
        return (
          <TextField
            fullWidth
            type="file"
            name={field.name}
            label={field.label}
            InputLabelProps={{ shrink: true }}
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
  );
};

export default FormModal;
