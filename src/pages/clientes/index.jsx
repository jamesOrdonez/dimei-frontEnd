import { Helmet } from 'react-helmet-async';
import { ConfigTabs } from '../configuraciones/index.jsx';
import BaseGrid from '../../components/grid/base.grid.tsx';

const fields = [
  { name: 'nombre', label: 'Nombre', input: 'text', grid: { xs: 12, md: 6 }, required: true },
  { name: 'nit', label: 'NIT', input: 'text', grid: { xs: 12, md: 6 }, required: true },
  { name: 'direccion', label: 'Dirección', input: 'text', grid: { xs: 12 } },
  { name: '_contactos', label: '', input: 'clientContacts', grid: { xs: 12 } },
];

const mapData = (data) => {
  return data.map((c) => {
    // Parse contacto_principal safely
    let principal = c.contacto_principal;
    if (typeof principal === 'string' && principal.trim()) {
      try { principal = JSON.parse(principal); } catch (e) { principal = null; }
    }
    // Parse contactos_genericos safely
    let genericos = c.contactos_genericos;
    if (typeof genericos === 'string' && genericos.trim()) {
      try { genericos = JSON.parse(genericos); } catch (e) { genericos = []; }
    }

    return {
      ...c,
      contacto: principal?.nombre || '',
      telefono: principal?.telefono || '',
      correo: principal?.correo || '',
      _contactos: {
        principal: principal || { nombre: '', cargo: '', telefono: '', correo: '' },
        genericos: Array.isArray(genericos) ? genericos : [],
      },
    };
  });
};

const mapPayload = (payload) => {
  const mapped = { ...payload };
  if (mapped._contactos) {
    mapped.contacto_principal = mapped._contactos.principal;
    mapped.contactos_genericos = mapped._contactos.genericos;
    delete mapped._contactos;
  }
  return mapped;
};

function ClientsGrid({ type, title }) {
  return (
    <BaseGrid
      title={title}
      endpoint={`/getClientes/${sessionStorage.getItem('company')}?tipo=${type}`}
      saveEndpoint="/saveCliente"
      updateEndpoint="/updateCliente"
      deleteEndpoint="/deleteCliente"
      fields={fields}
      mapData={mapData}
      mapPayload={mapPayload}
      formAdditionalValues={{ tipo: type }}
      excludeKeys={[
        'contacto_principal',
        'contactos_genericos',
        'company_id',
        'state',
        'created_at',
        'updated_at',
        '_contactos',
        'tipo'
      ]}
    />
  );
}

export default function Clientes() {
  const tabs = [
    {
      label: 'Clientes de Proyectos',
      component: <ClientsGrid type="cliente" title="Cliente de Proyecto" />,
    },
    {
      label: 'Clientes de Mantenimiento',
      component: <ClientsGrid type="mantenimiento" title="Cliente de Mantenimiento" />,
    },
  ];

  return (
    <>
      <Helmet>
        <title>Clientes</title>
      </Helmet>
      <ConfigTabs tabs={tabs} />
    </>
  );
}

