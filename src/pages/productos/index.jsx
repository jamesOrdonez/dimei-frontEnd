import { Helmet } from 'react-helmet-async';
import { DataGrid } from '../../layouts/grid';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Loader } from '../../components/loaders';

export default function Productos() {
  const [error, setError] = useState(false);
  const [message, setMessage] = useState('');
  const [loader, setLoader] = useState(true);
  const [data, setData] = useState([]);

  useEffect(() => {
    const AllUser = async () => {
      try {
        const respon = await axios.get('/getProduct/1');
        setData(respon.data.data);
        setLoader(false);
      } catch (error) {
        setMessage(error.response.data.message);
        setError(true);
        return setLoader(false);
      }
    };
    AllUser();
  }, []);
  if (loader) {
    return <Loader />;
  }
  return (
    <>
      <Helmet>
        <title>Productos</title>
      </Helmet>

      <DataGrid datos={data} error={error} message={message} modulo={'Productos'} block={true} />
    </>
  );
}
