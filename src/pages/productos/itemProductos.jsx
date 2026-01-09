import { Helmet } from 'react-helmet-async';
import { DataGrid } from '../../layouts/grid';
import { useEffect, useState } from 'react';
import { decrypt } from '../../utils/crypto';
import axios from 'axios';
import useProductSchema from './models';
import DataGrid_product from '../../layouts/grid/grid.product';

export default function ItemProductos() {
  const [error, setError] = useState(false);
  const [message, setMessage] = useState('');
  const [loader, setLoader] = useState(true);
  const [data, setData] = useState([]);
  const [block, setBlock] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  /* =========================
     FETCH PRODUCTS
  ========================= */

  const fetchProducts = async () => {
    try {
      setLoader(true);

      const res = await axios.get(`/getProduct/${sessionStorage.getItem('company')}`);

      setData(
        res.data.data.map((item) => ({
          id: item.id,
          Nombre: item.name,
          Descripcion: item.description,
        }))
      );
    } catch (err) {
      setError(true);
      setMessage('Error al cargar productos');
    } finally {
      setLoader(false);
    }
  };

  /* =========================
     CREATE / UPDATE
  ========================= */

  const onSubmit = async (formData) => {
    try {
      setError(false);

      const payload = {
        name: formData.name,
        description: formData.description,
        user: decrypt(sessionStorage.getItem('userId')),
        company: sessionStorage.getItem('company'),
      };

      let productId = formData.id;

      // CREATE
      if (!productId) {
        const res = await axios.post('/saveProduct', payload);
        productId = res.data.data.id;
        console.log(productId);
      }
      // UPDATE
      else {
        await axios.put(`/updateProduct/${productId}`, payload);
      }

      /* =========================
       SAVE ITEM PRODUCT
    ========================= */

      if (Array.isArray(formData.net_items) && formData.net_items.length > 0) {
        const requests = formData.net_items.map((items) =>
          axios.post('/saveItemProduct', {
            product: productId,
            item: items.id,
            quantity: items.quantity,
            company: sessionStorage.getItem('company'),
          })
        );

        await Promise.all(requests);
      }

      setEditingItem(null);
      fetchProducts();
    } catch (err) {
      setError(true);
      setMessage(err.response?.data?.message || 'Error al guardar');
    }
  };

  /* =========================
     EDIT
  ========================= */

  const handleEdit = (row) => {
    setEditingItem({
      id: row.id,
      name: row.Nombre,
      description: row.Descripcion,
    });
  };

  /* =========================
     DELETE
  ========================= */

  const onDelete = async (id) => {
    if (!id) return;

    if (!window.confirm('¿Eliminar este producto?')) return;

    try {
      setError(false);
      setMessage('');

      await axios.delete(`/deleteProduct/${id}`);
      fetchProducts();
    } catch (err) {
      setError(true);
      setMessage(err.response?.data?.message || 'No se pudo eliminar el producto');
    }
  };

  /* =========================
     EFFECT
  ========================= */

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleCloseForm = () => {
    setEditingItem(null);
  };
  const schema = useProductSchema();

  if (loader) return null; // o tu Loader si tienes uno

  return (
    <>
      <Helmet>
        <title>Productos</title>
      </Helmet>
      <DataGrid_product
        datos={data}
        error={error}
        message={message}
        modulo="Producto"
        block={block}
        onclick={setBlock}
        schema={schema}
        onSubmit={onSubmit}
        onEdit={handleEdit}
        onDelete={onDelete}
        editingItem={editingItem}
        onCloseForm={handleCloseForm}
      />
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </>
  );
}
