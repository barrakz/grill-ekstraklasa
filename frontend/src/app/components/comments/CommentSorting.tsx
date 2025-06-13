'use client';

import { Dispatch, SetStateAction } from 'react';

type CommentSortingProps = {
  sortBy: string;
  setSortBy: Dispatch<SetStateAction<string>>;
  setCurrentPage: Dispatch<SetStateAction<number>>;
};

export default function CommentSorting({ sortBy, setSortBy, setCurrentPage }: CommentSortingProps) {
  return (
    <div className="flex justify-center mb-4">
      <div className="flex items-center gap-1 text-xs">
        <span className="text-text-muted text-xs">Sortuj:</span>
        <div className="flex border border-border-color/30 rounded-md overflow-hidden scale-90 transform">
          <button 
            onClick={() => {
              setSortBy('-created_at');
              setCurrentPage(1);
            }}
            className={`px-1.5 py-0.5 text-xs ${sortBy === '-created_at' ? 'bg-accent-color/20 text-accent-color' : 'bg-primary-bg hover:bg-primary-bg-light'}`}
            aria-label="Sortuj od najnowszych"
          >
            Najnowsze
          </button>
          <button 
            onClick={() => {
              setSortBy('-likes_count');
              setCurrentPage(1);
            }}
            className={`px-1.5 py-0.5 text-xs ${sortBy === '-likes_count' ? 'bg-accent-color/20 text-accent-color' : 'bg-primary-bg hover:bg-primary-bg-light'}`}
            aria-label="Sortuj według popularności"
          >
            Popularne
          </button>
        </div>
      </div>
    </div>
  );
}
