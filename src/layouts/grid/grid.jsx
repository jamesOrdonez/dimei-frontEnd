export default function DataGrid() {
  return (
    <div class="mx-auto max-w-screen-xl px-4 lg:px-12">
      <div class="bg-white  relative shadow-md sm:rounded-lg overflow-hidden">
        <div class="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-4 p-4">
          <div class="w-full md:w-1/2">
            <form class="flex items-center">
              <label for="simple-search" class="sr-only">
                Search
              </label>
              <div class="relative w-full">
                <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg
                    aria-hidden="true"
                    class="w-5 h-5 text-gray-500 dark:text-gray-400"
                    fill="currentColor"
                    viewbox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  id="simple-search"
                  class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                  placeholder="Search"
                  required=""
                />
              </div>
            </form>
          </div>
          <div class="w-full md:w-auto flex flex-col md:flex-row space-y-2 md:space-y-0 items-stretch md:items-center justify-end md:space-x-3 flex-shrink-0">
            <button
              type="button"
              class="flex items-center justify-center text-white bg-blue-700  font-medium rounded-lg text-sm px-4 py-2 hover:bg-blue-800"
            >
              Nuevo
            </button>
          </div>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm text-left ">
            <thead class="text-xs text-gray-700 uppercase bg-gray-200">
              <tr>
                <th scope="col" class="px-4 py-3">
                  Product name
                </th>
                <th scope="col" class="px-4 py-3">
                  Category
                </th>
                <th scope="col" class="px-4 py-3">
                  Brand
                </th>
                <th scope="col" class="px-4 py-3">
                  Description
                </th>
                <th scope="col" class="px-4 py-3">
                  Price
                </th>
                <th scope="col" class="px-4 py-3">
                  <span class="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr class="border-b border-gray-700">
                <th scope="row" class="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                  Apple iMac 27&#34;
                </th>
                <td class="px-4 py-3">PC</td>
                <td class="px-4 py-3">Apple</td>
                <td class="px-4 py-3">300</td>
                <td class="px-4 py-3">$2999</td>
                <td class="px-4 py-3 flex items-center justify-end">
                  <a href="#" class="block py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">
                    Edit
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <nav
          class="flex flex-col md:flex-row justify-between items-start md:items-center space-y-3 md:space-y-0 p-4"
          aria-label="Table navigation"
        >
          <ul class="inline-flex items-stretch -space-x-px">
            <li>
              <a
                href="#"
                class="flex items-center justify-center h-full py-1.5 px-3 ml-0  rounded-l-lg border border-gray-300"
              >
                <svg
                  class="w-5 h-5"
                  aria-hidden="true"
                  fill="currentColor"
                  viewbox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill-rule="evenodd"
                    d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                    clip-rule="evenodd"
                  />
                </svg>
              </a>
            </li>
            <li>
              <a
                href="#"
                class="flex items-center justify-center text-sm py-2 px-3 leading-tight text-gray-500 bg-white border "
              >
                1
              </a>
            </li>
            <li>
              <a
                href="#"
                class="flex items-center justify-center text-sm py-2 px-3 leading-tight text-gray-500 bg-white border "
              >
                2
              </a>
            </li>{' '}
            <li>
              <a
                href="#"
                class="flex items-center justify-center text-sm py-2 px-3 leading-tight text-gray-500 bg-white border "
              >
                3
              </a>
            </li>
            <li>
              <a
                href="#"
                class="flex items-center justify-center h-full py-1.5 px-3 ml-0  rounded-r-lg border border-gray-300"
              >
                <svg
                  class="w-5 h-5"
                  aria-hidden="true"
                  fill="currentColor"
                  viewbox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill-rule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clip-rule="evenodd"
                  />
                </svg>
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}
