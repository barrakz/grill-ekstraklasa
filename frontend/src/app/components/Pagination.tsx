'use client';

import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ 
  currentPage, 
  totalPages, 
  onPageChange 
}) => {
  // Ogranicz liczbę widocznych stron na raz
  const maxVisiblePages = 5;
  
  // Oblicz, które strony powinny być widoczne
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = startPage + maxVisiblePages - 1;
  
  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }
  
  const pages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);

  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center space-x-1 mt-6">
      {/* Przycisk "Poprzednia strona" */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`px-3 py-2 rounded-md ${
          currentPage === 1
            ? 'text-slate-400 cursor-not-allowed'
            : 'text-accent-color hover:bg-accent-color/10'
        }`}
        aria-label="Poprzednia strona"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      {/* Wyświetl przycisk do pierwszej strony, jeśli nie jest widoczna */}
      {startPage > 1 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            className="px-3 py-1 rounded-md text-accent-color hover:bg-accent-color/10"
            aria-label="Pierwsza strona"
          >
            1
          </button>
          {startPage > 2 && <span className="px-2">...</span>}
        </>
      )}
      
      {/* Wyświetl przyciski stron */}
      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-3 py-1 rounded-md ${
            currentPage === page
              ? 'bg-accent-color text-white shadow-sm'
              : 'text-accent-color hover:bg-accent-color/10'
          }`}
          aria-label={`Strona ${page}`}
          aria-current={currentPage === page ? 'page' : undefined}
        >
          {page}
        </button>
      ))}
      
      {/* Wyświetl przycisk do ostatniej strony, jeśli nie jest widoczna */}
      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && <span className="px-2">...</span>}
          <button
            onClick={() => onPageChange(totalPages)}
            className="px-3 py-1 rounded-md text-accent-color hover:bg-accent-color/10"
            aria-label="Ostatnia strona"
          >
            {totalPages}
          </button>
        </>
      )}
      
      {/* Przycisk "Następna strona" */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`px-3 py-2 rounded-md ${
          currentPage === totalPages
            ? 'text-slate-400 cursor-not-allowed'
            : 'text-accent-color hover:bg-accent-color/10'
        }`}
        aria-label="Następna strona"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
};

export default Pagination;
