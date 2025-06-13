'use client';

import { ArrowPathIcon } from '@heroicons/react/24/solid';

type RefreshButtonProps = {
  onRefresh: () => void;
  isRefreshing?: boolean;
  className?: string;
};

export default function RefreshButton({ 
  onRefresh, 
  isRefreshing = false,
  className = ''
}: RefreshButtonProps) {
  return (
    <button
      onClick={onRefresh}
      disabled={isRefreshing}
      className={`flex items-center justify-center text-sm hover:text-accent-color transition-colors ${isRefreshing ? 'opacity-50' : ''} ${className}`}
      aria-label="Odśwież dane"
      title="Odśwież dane"
    >
      <ArrowPathIcon className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
      {isRefreshing ? 'Odświeżanie...' : 'Odśwież'}
    </button>
  );
}
