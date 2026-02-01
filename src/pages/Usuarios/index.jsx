import { Helmet } from 'react-helmet-async';
import { DataGrid } from '../../layouts/grid';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { Loader, LoaderModule } from '../../components/loaders';
import { options } from 'numeral';
export default function Usuarios() {
  const [error, setError] = useState(false);
  const [message, setMessage] = useState('');
  const [loader, setLoader] = useState(true);
  const [data, setData] = useState([]);
  const [block, setBlock] = useState(false);

  const userSchema = [
    {
      row: 1,
      columns: [
        { name: 'name', label: 'Nombre', type: 'text', xs: 12, required: true },
        {
          name: 'rol',
          label: 'Rol asignado',
          type: 'select',
          options: [{ label: 'Admin', value: 1 }],
          xs: 12,
          md: 12,
        },
      ],
    },
    {
      row: 2,
      columns: [
        { name: 'user', label: 'Usuario', type: 'text', xs: 6, md: 6, required: true },
        { name: 'password', label: 'Contraseña', type: 'text', xs: 6, md: 6, required: true },
      ],
    },
  ];

  const saveUser = async (formData) => {
    const formDataFormated = {
      ...formData,
      state: 1,
      company: sessionStorage.getItem('company'),
    };

    const saved = await axios.post('/saveUser', formDataFormated);

    if (saved) {
      AllUser();
      setBlock(false);
    }
  };
  const AllUser = async () => {
    try {
      const respon = await axios.get('/getUser/1');
      setData(respon.data.data);
      setLoader(false);
    } catch (error) {
      setMessage(error.response.data.message);
      setError(true);
      return setLoader(false);
    }
  };

  useEffect(() => {
    AllUser();
  }, []);

  if (loader) {
    return <Loader />;
  }
  return (
    <>
      <Helmet>
        <title> Usuarios</title>
      </Helmet>
      <DataGrid
        datos={data}
        error={error}
        message={message}
        modulo={'Usuario'}
        block={block}
        onclick={setBlock}
        schema={userSchema}
        onSubmit={saveUser}
      />
    </>
  );
}
