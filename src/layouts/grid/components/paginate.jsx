import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

export default function Paginate({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center gap-2 p-4">
      <button
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="px-3 py-1 border rounded disabled:opacity-50"
      >
        ←
      </button>

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-3 py-1 border rounded ${page === currentPage ? 'bg-blue-600 text-white' : ''}`}
        >
          {page}
        </button>
      ))}

      <button
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="px-3 py-1 border rounded disabled:opacity-50"
      >
        →
      </button>
    </div>
  );
}
