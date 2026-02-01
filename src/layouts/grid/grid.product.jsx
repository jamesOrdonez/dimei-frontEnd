import { useState } from 'react';
import Search from './components/search';
import { TrashIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import Paginate from './components/paginate';
import Error from './components/error';
import Block from './components/block';
import Form_product from './components/form.product';

export default function DataGrid_product({
  datos,
  error,
  message,
  modulo,
  block,
  onclick,
  schema,
  onSubmit,
  onEdit,
  onDelete,
  editingItem,
  onCloseForm,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const filteredData = datos.filter((item) =>
    Object.values(item).some(
      (value) => typeof value === 'string' && value.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const paginatedData = filteredData.slice(startIndex, endIndex);

  return (
    <div className="mx-auto max-w-screen-xl px-4 lg:px-12">
      {error ? (
        <Error message={message} />
      ) : (
        <>
          <ul className="flex w-max border-b space-x-4 overflow-hidden">
            <li className="text-white font-bold bg-blue-600 text-sm py-3 px-6 rounded-t-2xl">{modulo}</li>
          </ul>

          <div className="bg-white shadow-md sm:rounded-lg overflow-hidden">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row items-center justify-between p-4 gap-3">
              <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

              <div className="flex gap-2">
                <Block block={block} onclick={onclick} />
                <Form_product
                  schema={schema}
                  title={modulo}
                  onSubmit={onSubmit}
                  initialValues={editingItem}
                  onClose={onCloseForm}
                />
              </div>
            </div>

            {/* TABLE */}
            {!block && (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead>
                    <tr>
                      {filteredData.length > 0 &&
                        Object.keys(filteredData[0]).map((key) => (
                          <th key={key} className="p-4 text-left text-sm font-semibold">
                            {key.toUpperCase()}
                          </th>
                        ))}
                      <th className="p-4 text-left text-sm font-semibold">ACCIONES</th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedData < 0 ? (
                      <tr>
                        <td colSpan="100%" className="p-6 text-center text-gray-500">
                          Aún no hay registros. Crea uno nuevo para empezar ✅
                        </td>
                      </tr>
                    ) : (
                      paginatedData.map((item) => (
                        <tr key={item.id} className="odd:bg-blue-50">
                          {Object.keys(item).map((key) => (
                            <td key={key} className="p-4 text-sm">
                              {item[key]}
                            </td>
                          ))}

                          <td className="p-4 flex gap-3">
                            {/* EDIT */}
                            <button title="Editar" onClick={() => onEdit(item)}>
                              <PencilSquareIcon className="h-6 w-6 text-blue-600" />
                            </button>

                            {/* DELETE */}
                            <button title="Eliminar" onClick={() => onDelete(item.id)}>
                              <TrashIcon className="h-6 w-6 text-red-500" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>

                <Paginate currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
