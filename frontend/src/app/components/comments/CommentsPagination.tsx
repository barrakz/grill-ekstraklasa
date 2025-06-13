'use client';

import { Dispatch, SetStateAction } from 'react';
import Pagination from '@/app/components/Pagination';

type CommentsPaginationProps = {
  count: number;
  currentPage: number;
  commentsPerPage: number;
  setCurrentPage: Dispatch<SetStateAction<number>>;
  setCommentsPerPage: Dispatch<SetStateAction<number>>;
};

export default function CommentsPagination({ 
  count, 
  currentPage, 
  commentsPerPage, 
  setCurrentPage, 
  setCommentsPerPage 
}: CommentsPaginationProps) {
  return (
    <div className="mt-6">
      {Math.ceil(count / commentsPerPage) > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(count / commentsPerPage)}
          onPageChange={(page) => setCurrentPage(page)}
        />
      )}
      
      {/* Selektor liczby komentarzy na stronę */}
      <div className="mt-4 flex justify-center items-center opacity-70 hover:opacity-100 transition-opacity text-xs">
        <div className="flex items-center space-x-2">
          <label htmlFor="commentsPerPage" className="text-text-muted">Pokaż:</label>
          <select 
            id="commentsPerPage"
            value={commentsPerPage}
            onChange={(e) => {
              setCommentsPerPage(Number(e.target.value));
              setCurrentPage(1); // Reset to page 1 when changing items per page
            }}
            className="text-xs px-2 py-1 bg-primary-bg border border-border-color/50 rounded"
            aria-label="Liczba komentarzy na stronę"
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
          </select>
          <span className="text-text-muted">na stronę</span>
        </div>
      </div>
    </div>
  );
}
