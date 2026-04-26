import { useState, useEffect } from 'react';
import { Grid, TextField, Divider, Typography, Box, IconButton } from '@mui/material';
import { TrashIcon } from '@heroicons/react/24/outline';

interface Contact {
  nombre: string;
  cargo: string;
  telefono: string;
  correo: string;
}

const emptyContacto: Contact = { nombre: '', cargo: '', telefono: '', correo: '' };

const contactFields = [
  { key: 'nombre',   label: 'Nombre',    type: 'text'  },
  { key: 'cargo',    label: 'Cargo',     type: 'text'  },
  { key: 'telefono', label: 'Teléfono',  type: 'tel'   },
  { key: 'correo',   label: 'Correo',    type: 'email' },
];

function ContactoGrid({ values, onChange }: { values: Partial<Contact>, onChange: (key: string, val: string) => void }) {
  return (
    <Grid container spacing={2}>
      {contactFields.map(({ key, label, type }) => (
        <Grid key={key} item xs={12} sm={6}>
          <TextField
            fullWidth
            size="small"
            label={label}
            type={type}
            value={(values as any)?.[key] || ''}
            onChange={(e) => onChange(key, e.target.value)}
          />
        </Grid>
      ))}
    </Grid>
  );
}

interface ClientContactsProps {
  value?: { principal?: Contact; genericos?: Contact[] };
  onChange: (e: any) => void;
  name: string;
}

export default function ClientContacts({ value, onChange, name }: ClientContactsProps) {
  const [contactoPrincipal, setContactoPrincipal] = useState<Contact>({ ...emptyContacto });
  const [contactosGenericos, setContactosGenericos] = useState<Contact[]>([]);

  useEffect(() => {
    if (value) {
      setContactoPrincipal(value.principal || { ...emptyContacto });
      setContactosGenericos(value.genericos || []);
    }
  }, [value]);

  const emitChange = (principal: Contact, genericos: Contact[]) => {
    onChange({
      target: {
        name,
        value: { principal, genericos },
        type: 'clientContacts',
      },
    });
  };

  const handlePrincipalField = (key: string, val: string) => {
    const updated = { ...contactoPrincipal, [key]: val } as Contact;
    setContactoPrincipal(updated);
    emitChange(updated, contactosGenericos);
  };

  const addGenerico = () => {
    const updated = [...contactosGenericos, { ...emptyContacto }];
    setContactosGenericos(updated);
    emitChange(contactoPrincipal, updated);
  };

  const removeGenerico = (i: number) => {
    const updated = contactosGenericos.filter((_, idx) => idx !== i);
    setContactosGenericos(updated);
    emitChange(contactoPrincipal, updated);
  };

  const updateGenerico = (i: number, key: string, val: string) => {
    const updated = contactosGenericos.map((c, idx) => (idx === i ? { ...c, [key]: val } as Contact : c));
    setContactosGenericos(updated);
    emitChange(contactoPrincipal, updated);
  };

  return (
    <Grid container spacing={2}>
      {/* ── Contacto Principal ───────────────────────── */}
      <Grid item xs={12}>
        <Divider sx={{ mb: 1.5, mt: 1.5 }} />
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
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={1} mt={2}>
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
}
