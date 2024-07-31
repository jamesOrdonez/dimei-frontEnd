import { useState } from 'react';
import Form from './components/form';
import Search from './components/search';
import { Bars3BottomLeftIcon, Bars3Icon, RectangleGroupIcon, TrashIcon } from '@heroicons/react/24/outline';
import Paginate from './components/paginate';
import Error from './components/error';

export default function DataGrid({ datos, error, message, modulo, block, onclick }) {
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
        <Error message={message} />
      ) : (
        <>
          <ul class="flex w-max border-b space-x-4 overflow-hidden">
            <li
              id="homeTab"
              class="tab text-white font-bold bg-blue-600 text-center text-sm py-3 px-6 rounded-tl-2xl rounded-tr-2xl cursor-pointer"
            >
              {modulo}
            </li>
          </ul>

          <div class="bg-white  relative shadow-md sm:rounded-lg overflow-hidden">
            {' '}
            <div class="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-4 p-4">
              <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
              <div className="flex">
                <div class="font-[sans-serif] w-max bg-white border-2 flex rounded-lg overflow-hidden mx-auto mr-5">
                  {block ? (
                    <button
                      type="button"
                      class="px-5 py-2.5 flex items-center text-sm tracking-wider outline-none"
                      onClick={() => onclick(false)}
                    >
                      <Bars3BottomLeftIcon class="h-6 w-6 text-gray-500" />
                    </button>
                  ) : (
                    <button type="button" class="px-5 py-2.5 flex items-center text-sm tracking-wider outline-none">
                      <Bars3BottomLeftIcon class="h-6 w-6 text-blue-600" />
                    </button>
                  )}
                  {block ? (
                    <button
                      type="button"
                      class="px-5 py-2.5 flex items-center text-sm tracking-wider outline-none bg-blue-50"
                    >
                      <RectangleGroupIcon class="h-6 w-6 text-blue-600" />
                    </button>
                  ) : (
                    <button
                      onClick={() => onclick(true)}
                      type="button"
                      class="px-5 py-2.5 flex items-center text-sm tracking-wider outline-none bg-blue-50"
                    >
                      <RectangleGroupIcon class="h-6 w-6 text-gray-500" />
                    </button>
                  )}
                </div>
                <Form />
              </div>
            </div>
            {block ? (
              ''
            ) : (
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
            )}
          </div>
        </>
      )}
    </div>
  );
}
