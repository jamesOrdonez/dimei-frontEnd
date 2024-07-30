import { PencilSquareIcon } from '@heroicons/react/24/outline';

export default function Form({ id }) {
  return (
    <>
      {id ? (
        <button class="mr-4" title="Edit">
          <PencilSquareIcon className="h-6 w-6 text-blue-500" />
        </button>
      ) : (
        <div class="w-full md:w-auto flex flex-col md:flex-row space-y-2 md:space-y-0 items-stretch md:items-center justify-end md:space-x-3 flex-shrink-0">
          <button
            type="button"
            class="flex items-center justify-center text-white bg-blue-600  font-medium rounded-lg text-sm px-4 py-2 hover:bg-blue-700"
          >
            Nuevo
          </button>
        </div>
      )}
    </>
  );
}
