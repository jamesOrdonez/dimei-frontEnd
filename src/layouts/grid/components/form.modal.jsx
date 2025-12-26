import {
  Grid,
  TextField,
  MenuItem,
} from "@mui/material";

const FormModal = ({ schema, values, onChange }) => {
  const renderField = (field) => {
    switch (field.type) {
      case "select":
        return (
          <TextField
            select
            fullWidth
            name={field.name}
            label={field.label}
            value={values[field.name] || ""}
            onChange={onChange}
          >
            {field.options.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </TextField>
        );

      default:
        return (
          <TextField
            fullWidth
            type={field.type}
            name={field.name}
            label={field.label}
            value={values[field.name] || ""}
            onChange={onChange}
          />
        );
    }
  };

  return (
    <Grid container spacing={2}>
      {schema.map((row, i) =>
        row.columns.map((field, j) => (
          <Grid
            key={`${i}-${j}`}
            item
            xs={field.xs || 12}
            md={field.md || 12}
          >
            {renderField(field)}
          </Grid>
        ))
      )}
    </Grid>
  );
};

export default FormModal;
