import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate page numbers
  const pageNumbers: number[] = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 glass-panel rounded-xl sm:rounded-2xl p-2.5 sm:p-4 border border-amber-500/15">
      {/* Information text (compact on mobile) */}
      <div className="text-[10px] sm:text-xs text-stone-400 font-medium text-center sm:text-left">
        Showing <span className="font-semibold text-white font-mono">{startItem}–{endItem}</span> of{' '}
        <span className="font-semibold text-white font-mono">{totalItems}</span> (18/page)
      </div>

      {/* Page Controls */}
      <div className="flex items-center gap-1 sm:gap-1.5">
        <button
          onClick={() => {
            if (currentPage > 1) {
              onPageChange(currentPage - 1);
              window.scrollTo({ top: 320, behavior: 'smooth' });
            }
          }}
          disabled={currentPage === 1}
          className="px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-semibold glass-panel text-stone-300 hover:text-amber-300 hover:border-amber-400 disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1 transition-all"
          aria-label="Previous Page"
        >
          <ChevronLeft className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          <span>Prev</span>
        </button>

        {pageNumbers.map((page) => (
          <button
            key={page}
            onClick={() => {
              onPageChange(page);
              window.scrollTo({ top: 320, behavior: 'smooth' });
            }}
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold font-mono transition-all flex items-center justify-center ${
              currentPage === page
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/25 scale-105'
                : 'glass-panel text-stone-300 hover:text-amber-300 hover:border-amber-500/30'
            }`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => {
            if (currentPage < totalPages) {
              onPageChange(currentPage + 1);
              window.scrollTo({ top: 320, behavior: 'smooth' });
            }
          }}
          disabled={currentPage === totalPages}
          className="px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-semibold glass-panel text-stone-300 hover:text-amber-300 hover:border-amber-400 disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1 transition-all"
          aria-label="Next Page"
        >
          <span>Next</span>
          <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
        </button>
      </div>
    </div>
  );
};
