'use client';

import { Dispatch, SetStateAction } from 'react';
import Button from '@/app/components/common/Button';

type CommentSortingProps = {
  sortBy: string;
  setSortBy: Dispatch<SetStateAction<string>>;
  setCurrentPage: Dispatch<SetStateAction<number>>;
};

export default function CommentSorting({ sortBy, setSortBy, setCurrentPage }: CommentSortingProps) {
  return (
    <div className="flex justify-center mb-4">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-slate-500 text-xs mr-1">Sortuj:</span>
        <div className="flex border border-slate-200 rounded-lg overflow-hidden shadow-sm">
          <Button
            size="small"
            variant="filter"
            onClick={() => {
              setSortBy('-created_at');
              setCurrentPage(1);
            }}
            aria-label="Sortuj od najnowszych"
            active={sortBy === '-created_at'}
            className={`rounded-none border-none filter-button ${sortBy === '-created_at' ? 'active' : ''}`}
          >
            Najnowsze
          </Button>
          <Button 
            size="small"
            variant="filter"
            onClick={() => {
              setSortBy('-likes_count');
              setCurrentPage(1);
            }}
            aria-label="Sortuj według popularności"
            active={sortBy === '-likes_count'}
            className={`rounded-none border-none filter-button ${sortBy === '-likes_count' ? 'active' : ''}`}
          >
            Popularne
          </Button>
        </div>
      </div>
    </div>
  );
}
