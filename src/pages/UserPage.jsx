import { Helmet } from 'react-helmet-async';
import { DataGrid } from '../layouts/grid';

const data = [
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
];

export default function UserPage() {
  return (
    <>
      <Helmet>
        <title> User | DIMEI </title>
      </Helmet>
      <DataGrid datos={data} />
    </>
  );
}
