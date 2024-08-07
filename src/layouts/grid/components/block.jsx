import { Bars3BottomLeftIcon, RectangleGroupIcon } from '@heroicons/react/24/outline';

export default function Block({ block, onclick }) {
  return (
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
        <button type="button" class="px-5 py-2.5 flex items-center text-sm tracking-wider outline-none bg-blue-50">
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
  );
}
