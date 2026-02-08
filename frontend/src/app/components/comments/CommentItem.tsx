'use client';

import { HandThumbUpIcon, StarIcon } from '@heroicons/react/24/solid';
import { HandThumbUpIcon as HandThumbUpOutline } from '@heroicons/react/24/outline';
import { Comment } from '@/app/types/comment';
import Link from 'next/link';

type CommentItemProps = {
  comment: Comment;
  isFirst: boolean;
  onLike: (commentId: number) => Promise<void>;
  isLoggedIn: boolean;
};

export default function CommentItem({ comment, isFirst, onLike, isLoggedIn }: CommentItemProps) {
  const formatDate = (dateString: string): string => {
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
        <div className="absolute top-0 left-1/4 right-1/4 h-px bg-slate-200/70"></div>
      )}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-1 mb-2">
        <div className="flex items-center gap-2">
          <div className="font-semibold text-slate-800 text-base tracking-wide">{comment.user.username}</div>
          <div className="text-sm text-slate-500">
            o zawodniku{' '}
            <Link
              href={comment.player.slug ? `/players/${comment.player.slug}` : `/api/redirect?playerId=${comment.player.id}`}
              className={`inline-flex items-center gap-1.5 transition-colors ml-1 ${
                comment.player.has_magic_card
                  ? 'text-amber-600 hover:text-amber-700'
                  : 'text-accent-color hover:text-accent-hover'
              }`}
            >
              <span
                className={`font-semibold ${comment.player.has_magic_card ? 'text-amber-700' : ''}`}
              >
                {comment.player.name}
              </span>
              {comment.player.has_magic_card && (
                <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 ring-1 ring-amber-200/70 shadow-sm">
                  <StarIcon className="h-3 w-3 text-amber-950" aria-hidden="true" />
                  <span className="sr-only">Ma kartę magic</span>
                </span>
              )}
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
                <HandThumbUpIcon className="w-4 h-4 text-accent-color" />
              ) : (
                <HandThumbUpOutline className="w-4 h-4 text-slate-400" />
              )}
            </button>
            <span className={`text-xs ${comment.is_liked_by_user ? 'text-accent-color' : 'text-slate-400'}`}>
              {comment.likes_count}
            </span>
          </div>
        </div>

        <div className="text-xs text-slate-400">{formatDate(comment.created_at)}</div>
      </div>
      <p className="mb-2 leading-relaxed text-sm text-slate-700 whitespace-pre-line">{comment.content}</p>

      {comment.ai_response && (
        <div className="mt-2">
          <div className="inline-flex items-center text-[11px] text-slate-400 select-none">
            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200 uppercase tracking-wider">
              @ADMIN_AI
            </span>
            <span className="ml-2 text-slate-400">@{comment.user.username}</span>
          </div>

          <div className="mt-2 ml-1 pl-3 border-l-2 border-slate-200">
            <p className="text-xs text-slate-500 leading-relaxed">{comment.ai_response}</p>
          </div>
        </div>
      )}
    </div>
  );
}
