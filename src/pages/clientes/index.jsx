import { Helmet } from 'react-helmet-async';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { DataGrid } from '../../layouts/grid';
import { Loader } from '../../components/loaders';

const clienteSchema = [
  {
    row: 1,
    columns: [
      { name: 'nombre', label: 'Nombre', type: 'text', xs: 12, md: 6, required: true },
      { name: 'nit', label: 'NIT', type: 'text', xs: 12, md: 6, required: true },
    ],
  },
  {
    row: 2,
    columns: [{ name: 'direccion', label: 'Dirección', type: 'text', xs: 12 }],
  },
];

export default function Clientes() {
  const [error, setError] = useState(false);
  const [message, setMessage] = useState('');
  const [loader, setLoader] = useState(true);
  const [data, setData] = useState([]);
  const [block, setBlock] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const company = sessionStorage.getItem('company');

  /* ── Fetch ─────────────────────────────────────────── */
  const fetchClientes = async () => {
    try {
      const res = await axios.get(`/getClientes/${company}`);
      // Flatten for table display
      const formatted = res.data.data.map((c) => ({
        id: c.id,
        nombre: c.nombre,
        nit: c.nit,
        direccion: c.direccion,
        /*         contacto: c.contacto_principal?.nombre || '',
        telefono: c.contacto_principal?.telefono || '',
        correo: c.contacto_principal?.correo || '',
        // keep raw data for editing
        contacto_principal: c.contacto_principal,
        contactos_genericos: c.contactos_genericos, */
      }));
      setData(formatted);
      setLoader(false);
    } catch (err) {
      setMessage(err?.response?.data?.message || 'Error cargando clientes');
      setError(true);
      setLoader(false);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  /* ── Save ──────────────────────────────────────────── */
  const saveCliente = async (formData) => {
    try {
      const payload = {
        ...formData,
        company: sessionStorage.getItem('company'),
      };
      if (formData.id) {
        await axios.put(`/updateCliente/${formData.id}`, payload);
      } else {
        await axios.post('/saveCliente', payload);
      }
      setEditingItem(null);
      fetchClientes();
    } catch (err) {
      console.error(err);
    }
  };

  /* ── Edit / Delete ─────────────────────────────────── */
  const handleEdit = (item) => setEditingItem(item);
  const handleDelete = async (id) => {
    try {
      await axios.delete(`/deleteCliente/${id}`);
      fetchClientes();
    } catch (err) {
      console.error(err);
    }
  };

  if (loader) return <Loader />;

  return (
    <>
      <Helmet>
        <title>Clientes</title>
      </Helmet>
      <DataGrid
        datos={data}
        error={error}
        message={message}
        modulo="Cliente"
        block={block}
        onclick={setBlock}
        schema={clienteSchema}
        clienteSchema={true}
        onSubmit={saveCliente}
        onEdit={handleEdit}
        onDelete={handleDelete}
        editingItem={editingItem}
        onCloseForm={() => setEditingItem(null)}
      />
    </>
  );
}
