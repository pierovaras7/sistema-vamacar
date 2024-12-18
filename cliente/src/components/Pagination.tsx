import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  // Maneja el cambio de página (previa, siguiente o página específica)
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  return (
    <div className="p-4 flex items-center justify-between text-gray-500">
      {/* Botón "Prev" */}
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="py-2 px-4 rounded-md bg-slate-200 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed mr-4"
      >
        Prev
      </button>

      {/* Páginas numeradas */}
      <div className="flex items-center gap-2 text-sm justify-center mx-4">
        {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`py-1 px-2 rounded-sm ${page === currentPage ? 'bg-lamaSky' : ''}`}
          >
            {page}
          </button>
        ))}
      </div>

      {/* Botón "Next" */}
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="py-2 px-4 rounded-md bg-slate-200 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed ml-4"
      >
        Next
      </button>
    </div>

  );
  
};

export default Pagination;

