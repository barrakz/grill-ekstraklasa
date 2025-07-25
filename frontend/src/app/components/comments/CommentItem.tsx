'use client';

import { HandThumbUpIcon } from '@heroicons/react/24/solid';
import { HandThumbUpIcon as HandThumbUpOutline } from '@heroicons/react/24/outline';
import { Comment } from '@/app/types/comment';
import Link from 'next/link';

type CommentItemProps = {
  comment: Comment;
  isFirst: boolean;
  onLike: (commentId: number) => Promise<void>;
  isLoggedIn: boolean;
};

export default function CommentItem({ comment, isFirst, onLike, isLoggedIn }: CommentItemProps) {  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    
    // Format date manually to ensure consistent output
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${day}.${month}.${year}, ${hours}:${minutes}`;
  };
  return (
    <div className="py-3 mb-1 relative">
      {!isFirst && (
        <div className="absolute top-0 left-1/4 right-1/4 h-px bg-border-color/5"></div>
      )}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-1 mb-2">        <div className="flex items-center gap-2">          <div className="font-bold text-gray-300 text-lg tracking-wide">{comment.user.username}</div>          <div className="text-sm text-gray-400">
            o zawodniku {' '}
            <Link 
              href={comment.player.slug 
                ? `/players/${comment.player.slug}` 
                : `/api/redirect?playerId=${comment.player.id}`}
              className="text-amber-400 hover:text-amber-300 transition-colors ml-1"
            >
              {comment.player.name}
            </Link>
          </div>
          <div className="flex items-center gap-1">
            <button 
              onClick={() => onLike(comment.id)}
              className="like-button bg-transparent hover:bg-transparent border-none p-0 cursor-pointer flex items-center"
              disabled={!isLoggedIn}
              aria-label="Polub komentarz"
              title={isLoggedIn ? 'Polub ten komentarz' : 'Zaloguj się aby polubić komentarz'}
            >
              {comment.is_liked_by_user ? (
                <HandThumbUpIcon className="w-4 h-4 text-blue-500" />
              ) : (
                <HandThumbUpOutline className="w-4 h-4 text-gray-400" />
              )}
            </button>
            <span className={`text-xs ${comment.is_liked_by_user ? 'text-blue-500' : 'text-gray-400'}`}>
              {comment.likes_count}
            </span>
          </div>
        </div>
        <div className="text-xs text-text-muted">
          {formatDate(comment.created_at)}
        </div>
      </div>
      <p className="mb-2 leading-relaxed text-sm whitespace-pre-line">{comment.content}</p>
    </div>
  );
}
