import { Helmet } from 'react-helmet-async';
import { DataGrid } from '../../layouts/grid';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { Loader, LoaderModule } from '../../components/loaders';

/* const data = [
  {
    id: 1,
    nombre: 'Jhon Mario Chilito',
    imagen: (
      <div class="flex items-center cursor-pointer w-max">
        <img src="./img/profile/pngfind.com-pirate-flag-png-2847145.png" class="w-9 h-9 rounded-full shrink-0" />
        <div class="ml-4">
          <p class="text-xs text-gray-500 mt-0.5">whoaomi@gmail.com</p>
        </div>
      </div>
    ),
    fecha: '07/07/24',
  },
  {
    id: 2,
    nombre: 'Jhon Mario Chilito',
    imagen: (
      <div class="flex items-center cursor-pointer w-max">
        <img src="./img/profile/pngfind.com-pirate-flag-png-2847145.png" class="w-9 h-9 rounded-full shrink-0" />
        <div class="ml-4">
          <p class="text-xs text-gray-500 mt-0.5">whoaomi@gmail.com</p>
        </div>
      </div>
    ),
    fecha: '07/07/24',
  },
  {
    id: 3,
    nombre: 'Jhon Mario Chilito',
    imagen: (
      <div class="flex items-center cursor-pointer w-max">
        <img src="./img/profile/pngfind.com-pirate-flag-png-2847145.png" class="w-9 h-9 rounded-full shrink-0" />
        <div class="ml-4">
          <p class="text-xs text-gray-500 mt-0.5">whoaomi@gmail.com</p>
        </div>
      </div>
    ),
    fecha: '07/07/24',
  },
  {
    id: 4,
    nombre: 'Jhon Mario Chilito',
    imagen: (
      <div class="flex items-center cursor-pointer w-max">
        <img src="./img/profile/pngfind.com-pirate-flag-png-2847145.png" class="w-9 h-9 rounded-full shrink-0" />
        <div class="ml-4">
          <p class="text-xs text-gray-500 mt-0.5">whoaomi@gmail.com</p>
        </div>
      </div>
    ),
    fecha: '07/07/24',
  },
  {
    id: 5,
    nombre: 'Jhon Mario Chilito',
    imagen: (
      <div class="flex items-center cursor-pointer w-max">
        <img src="./img/profile/pngfind.com-pirate-flag-png-2847145.png" class="w-9 h-9 rounded-full shrink-0" />
        <div class="ml-4">
          <p class="text-xs text-gray-500 mt-0.5">whoaomi@gmail.com</p>
        </div>
      </div>
    ),
    fecha: '07/07/24',
  },
  {
    id: 6,
    nombre: 'Jhon Mario Chilito',
    imagen: (
      <div class="flex items-center cursor-pointer w-max">
        <img src="./img/profile/pngfind.com-pirate-flag-png-2847145.png" class="w-9 h-9 rounded-full shrink-0" />
        <div class="ml-4">
          <p class="text-xs text-gray-500 mt-0.5">whoaomi@gmail.com</p>
        </div>
      </div>
    ),
    fecha: '07/07/24',
  },
];
 */
export default function Usuarios() {
  const [error, setError] = useState(false);
  const [message, setMessage] = useState('');
  const [loader, setLoader] = useState(true);
  const [data, setData] = useState([]);
  const [block, setBlock] = useState(false);

  useEffect(() => {
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

      <DataGrid datos={data} error={error} message={message} modulo={'Usuarios'} block={block} onclick={setBlock} />
    </>
  );
}
