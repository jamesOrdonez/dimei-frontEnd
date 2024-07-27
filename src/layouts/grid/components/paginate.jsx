import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

export default function Paginate() {
  return (
    <div class="md:flex m-4">
      <p class="text-sm text-gray-500 flex-1">Showind 1 to 5 of 100 entries</p>

      <div class="flex items-center max-md:mt-4">
        <p class="text-sm text-gray-500">Display</p>
        <select class="text-sm text-gray-500 border border-gray-400 rounded h-7 mx-4 px-1 outline-none">
          <option>5</option>
        </select>

        <ul class="flex space-x-1 ml-2">
          <li class="flex items-center justify-center cursor-pointer bg-blue-100 w-7 h-7 rounded">
            <ChevronLeftIcon className="w-4 text-gray-500" />
          </li>
          <li class="flex items-center justify-center cursor-pointer text-sm w-7 h-7 text-gray-500 rounded">1</li>
          <li class="flex items-center justify-center cursor-pointer text-sm bg-[#007bff] text-white w-7 h-7 rounded">
            2
          </li>
          <li class="flex items-center justify-center cursor-pointer text-sm w-7 h-7 text-gray-500 rounded">3</li>
          <li class="flex items-center justify-center cursor-pointer text-sm w-7 h-7 text-gray-500 rounded">4</li>
          <li class="flex items-center justify-center cursor-pointer bg-blue-100 w-7 h-7 rounded">
            <ChevronRightIcon className="w-3 text-gray-500" />
          </li>
        </ul>
      </div>
    </div>
  );
}
