import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

export default function Paginate({ currentPage, totalPages, onPageChange }) {
  if (!totalPages || totalPages <= 1) return null;

  const windowSize = 2;

  const pages = [];

  // siempre primera
  pages.push(1);

  // rango alrededor
  for (let i = currentPage - windowSize; i <= currentPage + windowSize; i++) {
    if (i > 1 && i < totalPages) {
      pages.push(i);
    }
  }

  // última
  if (totalPages > 1) pages.push(totalPages);

  // ordenar y quitar duplicados
  const unique = [...new Set(pages)].sort((a, b) => a - b);

  const finalPages = [];
  for (let i = 0; i < unique.length; i++) {
    if (i > 0 && unique[i] - unique[i - 1] > 1) {
      finalPages.push('dots-' + i); // 👈 clave única
    }
    finalPages.push(unique[i]);
  }

  return (
    <div className="flex items-center justify-center gap-2 p-4">
      {/* Prev */}
      <button
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="px-3 py-1 border rounded disabled:opacity-50"
      >
        <ChevronLeftIcon className="w-4 h-4" />
      </button>

      {finalPages.map((p) =>
        typeof p === 'string' ? (
          <span key={p} className="px-2 select-none">
            ...
          </span>
        ) : (
          <button
            key={`page-${p}`} // 👈 key única REAL
            onClick={() => onPageChange(p)}
            className={`px-3 py-1 border rounded transition
              ${p === currentPage ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}
            `}
          >
            {p}
          </button>
        )
      )}

      {/* Next */}
      <button
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="px-3 py-1 border rounded disabled:opacity-50"
      >
        <ChevronRightIcon className="w-4 h-4" />
      </button>
    </div>
  );
}
