import { useState } from 'react';
import Form from './components/form';
import Search from './components/search';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import Paginate from './components/paginate';

export default function DataGrid({ datos, error, message }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = datos.filter((item) => {
    for (const key in item) {
      if (Object.prototype.hasOwnProperty.call(item, key)) {
        const value = item[key];
        if (value && typeof value === 'string' && value.toLowerCase().includes(searchTerm.toLowerCase())) {
          return true;
        }
      }
    }
    return false;
  });

  return (
    <div class="mx-auto max-w-screen-xl px-4 lg:px-12">
      {error ? (
        <div
          class="bg-white flex min-h-[60px] text-red-600 border border-red-500 rounded-lg overflow-hidden relative"
          role="alert"
        >
          <div class="bg-red-500 w-16 shrink-0 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 fill-white" viewBox="0 0 32 32">
              <path
                d="M16 1a15 15 0 1 0 15 15A15 15 0 0 0 16 1zm6.36 20L21 22.36l-5-4.95-4.95 4.95L9.64 21l4.95-5-4.95-4.95 1.41-1.41L16 14.59l5-4.95 1.41 1.41-5 4.95z"
                data-original="#ea2d3f"
              />
            </svg>
          </div>

          <div class="flex flex-col justify-center px-4 py-1">
            <p class="font-bold text-sm mr-4 mb-0.5">Error Message!</p>
            <span class="text-sm">{message}</span>
          </div>

          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-3 cursor-pointer fill-red-500 absolute right-4 top-3"
            viewBox="0 0 320.591 320.591"
          >
            <path
              d="M30.391 318.583a30.37 30.37 0 0 1-21.56-7.288c-11.774-11.844-11.774-30.973 0-42.817L266.643 10.665c12.246-11.459 31.462-10.822 42.921 1.424 10.362 11.074 10.966 28.095 1.414 39.875L51.647 311.295a30.366 30.366 0 0 1-21.256 7.288z"
              data-original="#000000"
            />
            <path
              d="M287.9 318.583a30.37 30.37 0 0 1-21.257-8.806L8.83 51.963C-2.078 39.225-.595 20.055 12.143 9.146c11.369-9.736 28.136-9.736 39.504 0l259.331 257.813c12.243 11.462 12.876 30.679 1.414 42.922-.456.487-.927.958-1.414 1.414a30.368 30.368 0 0 1-23.078 7.288z"
              data-original="#000000"
            />
          </svg>
        </div>
      ) : (
        <div class="bg-white  relative shadow-md sm:rounded-lg overflow-hidden">
          <div class="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-4 p-4">
            <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
            <Form />
          </div>
          <div class="font-[sans-serif] overflow-x-auto">
            <table class="min-w-full bg-white">
              <thead class="whitespace-nowrap">
                <tr>
                  {filteredData.length > 0 &&
                    Object.keys(filteredData[0]).map((key, index) => {
                      if (key !== 'children') {
                        return (
                          <th key={index} className="p-4 text-left text-sm font-semibold text-black">
                            {key.toUpperCase()}
                          </th>
                        );
                      }
                      return null;
                    })}{' '}
                  <th class="p-4 text-left text-sm font-semibold text-black">Action</th>
                </tr>
              </thead>

              <tbody class="whitespace-nowrap">
                {filteredData.map((item) => (
                  <tr class="odd:bg-blue-50">
                    {Object.keys(item).map((key) => {
                      if (key !== 'children') {
                        return (
                          <td key={key} class="p-4 text-sm text-black">
                            {item[key]}
                          </td>
                        );
                      }
                      return null;
                    })}
                    <td class="p-4">
                      <Form id={item.id} />
                      <button title="Delete">
                        <TrashIcon className="h-6 w-6 text-red-500" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <Paginate />
          </div>
        </div>
      )}
    </div>
  );
}
