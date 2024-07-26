import { Helmet } from 'react-helmet-async';
import { DataGrid } from '../layouts/grid';

const data = [
  {
    id: 1,
    name: 'jhon mario',
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
