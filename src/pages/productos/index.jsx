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
  const [block, setBlock] = useState(true);

  useEffect(() => {
    const AllUser = async () => {
      try {
        const respon = await axios.get('/getProduct/1');
        const Form = respon.data.data.reverse().map((item) => {
          return {
            id: item.id,
            nombre: item.name,
            descricion: item.description,
            usuarios: item.user,
            compañia: item.company,
            imagen: <img src={item.img} alt="" className="w-12" />,
          };
        });
        console.log('🚀 ~ Form ~ Form:', Form);
        setData(Form);
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

      <DataGrid datos={data} error={error} message={message} modulo={'Productos'} block={block} onclick={setBlock} />
    </>
  );
}
