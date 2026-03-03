import { useState, useEffect } from 'react';
import { Grid, TextField, Divider, Typography, Box, IconButton } from '@mui/material';
import { TrashIcon } from '@heroicons/react/24/outline';

const emptyContacto = { nombre: '', cargo: '', telefono: '', correo: '' };

const contactFields = [
  { key: 'nombre',   label: 'Nombre',    type: 'text'  },
  { key: 'cargo',    label: 'Cargo',     type: 'text'  },
  { key: 'telefono', label: 'Teléfono',  type: 'tel'   },
  { key: 'correo',   label: 'Correo',    type: 'email' },
];

function ContactoGrid({ values, onChange }) {
  return (
    <Grid container spacing={2}>
      {contactFields.map(({ key, label, type }) => (
        <Grid key={key} item xs={12} sm={6}>
          <TextField
            fullWidth
            size="small"
            label={label}
            type={type}
            value={values[key] || ''}
            onChange={(e) => onChange(key, e.target.value)}
          />
        </Grid>
      ))}
    </Grid>
  );
}

const FormModal_cliente = ({ schema, values, onChange }) => {
  /* ── Contacts internal state ─────────────────────── */
  const [contactoPrincipal, setContactoPrincipal] = useState(
    values?.contacto_principal || { ...emptyContacto }
  );
  const [contactosGenericos, setContactosGenericos] = useState(
    values?.contactos_genericos || []
  );

  // Sync when editing an existing record
  useEffect(() => {
    if (values?.contacto_principal) setContactoPrincipal(values.contacto_principal);
    if (values?.contactos_genericos) setContactosGenericos(values.contactos_genericos);
  }, [values?.contacto_principal, values?.contactos_genericos]);

  /* ── Helpers that emit synthetic onChange events ─── */
  const emitPrincipal = (updated) => {
    setContactoPrincipal(updated);
    onChange({ target: { name: 'contacto_principal', value: updated } });
  };

  const emitGenericos = (updated) => {
    setContactosGenericos(updated);
    onChange({ target: { name: 'contactos_genericos', value: updated } });
  };

  const handlePrincipalField = (key, val) =>
    emitPrincipal({ ...contactoPrincipal, [key]: val });

  const addGenerico = () =>
    emitGenericos([...contactosGenericos, { ...emptyContacto }]);

  const removeGenerico = (i) =>
    emitGenericos(contactosGenericos.filter((_, idx) => idx !== i));

  const updateGenerico = (i, key, val) =>
    emitGenericos(
      contactosGenericos.map((c, idx) => (idx === i ? { ...c, [key]: val } : c))
    );

  /* ── Standard schema fields (nombre, nit, dirección) */
  const renderField = (field) => (
    <TextField
      fullWidth
      size="small"
      type={field.type || 'text'}
      name={field.name}
      label={field.label}
      value={values[field.name] || ''}
      onChange={onChange}
      required={field.required}
    />
  );

  /* ── Render ───────────────────────────────────────── */
  return (
    <Grid container spacing={2}>
      {/* Standard schema fields */}
      {schema.map((row, i) =>
        row.columns.map((field, j) => (
          <Grid key={`${i}-${j}`} item xs={field.xs || 12} md={field.md || 12}>
            {renderField(field)}
          </Grid>
        ))
      )}

      {/* ── Contacto Principal ───────────────────────── */}
      <Grid item xs={12}>
        <Divider sx={{ mb: 1.5 }} />
        <Typography variant="subtitle2" fontWeight={600} mb={1.5}>
          Contacto Principal
        </Typography>
        <ContactoGrid
          values={contactoPrincipal}
          onChange={handlePrincipalField}
        />
      </Grid>

      {/* ── Contactos Genéricos ──────────────────────── */}
      <Grid item xs={12}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
          <Typography variant="subtitle2" fontWeight={600}>
            Contactos Adicionales
          </Typography>
          <button
            type="button"
            onClick={addGenerico}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#2563EB',
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            + Agregar contacto
          </button>
        </Box>

        {contactosGenericos.length === 0 && (
          <Typography variant="body2" color="text.disabled">
            Sin contactos adicionales.
          </Typography>
        )}

        {contactosGenericos.map((c, i) => (
          <Box
            key={i}
            sx={{ mt: 1.5, p: 1.5, border: '1px solid #e5e7eb', borderRadius: 1 }}
          >
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
              <Typography variant="caption" color="text.secondary">
                Contacto {i + 1}
              </Typography>
              <IconButton size="small" color="error" onClick={() => removeGenerico(i)}>
                <TrashIcon style={{ width: 16, height: 16 }} />
              </IconButton>
            </Box>
            <ContactoGrid
              values={c}
              onChange={(key, val) => updateGenerico(i, key, val)}
            />
          </Box>
        ))}
      </Grid>
    </Grid>
  );
};

export default FormModal_cliente;
