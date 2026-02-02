import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function DetalleItems() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchItem = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get('/oneItem/42');
      setData(res.data.data);
    } catch (err) {
      setError(err.response?.data || err.message || 'Error al obtener datos');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItem();
  }, []);

  return (
    <div style={{ padding: 16, fontFamily: 'Arial, sans-serif' }}>
      <h2>Detalle Item (JSON)</h2>
      <button onClick={fetchItem} disabled={loading} className="bg-green-500 text-white px-4 py-2 rounded mb-4">
        {loading ? 'Cargando...' : 'Refrescar'}
      </button>

      {error && (
        <div style={{ color: 'red', marginBottom: 12 }}>
          Error: {typeof error === 'string' ? error : JSON.stringify(error)}
        </div>
      )}

      <pre
        style={{
          background: '#f6f8fa',
          padding: 12,
          borderRadius: 6,
          maxHeight: '60vh',
          overflow: 'auto',
        }}
      >
        {data ? JSON.stringify(data, null, 2) : loading ? 'Cargando...' : 'Sin datos'}
      </pre>
    </div>
  );
}
