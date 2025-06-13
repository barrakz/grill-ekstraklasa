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
      <div className="flex items-center gap-1 text-xs">
        <span className="text-text-muted text-xs">Sortuj:</span>
        <div className="flex border border-border-color/30 rounded-md overflow-hidden">
          <Button 
            size="small"
            variant={sortBy === '-created_at' ? 'primary' : 'secondary'}
            onClick={() => {
              setSortBy('-created_at');
              setCurrentPage(1);
            }}
            aria-label="Sortuj od najnowszych"
            className="rounded-none border-none"
          >
            Najnowsze
          </Button>
          <Button 
            size="small"
            variant={sortBy === '-likes_count' ? 'primary' : 'secondary'}
            onClick={() => {
              setSortBy('-likes_count');
              setCurrentPage(1);
            }}
            aria-label="Sortuj według popularności"
            className="rounded-none border-none"
          >
            Popularne
          </Button>
        </div>
      </div>
    </div>
  );
}
