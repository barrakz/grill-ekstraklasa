'use client';

import { useAuth } from '@/app/hooks/useAuth';
import { API_BASE_URL } from '@/app/config';
import CommentItem from './comments/CommentItem';
import { Comment } from '../types/comment';
import Link from 'next/link';
import { useState } from 'react';

type LatestCommentsProps = {
  comments: Comment[];
  title?: string;
  description?: string;
};

export default function LatestComments({ 
  comments: initialComments, 
  title = "Najnowsze komentarze", 
  description = "Ostatnie opinie kibiców o piłkarzach" 
}: LatestCommentsProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState(initialComments);

  const handleLike = async (commentId: number) => {
    if (!user) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/comments/${commentId}/like/`,
        {
          method: 'POST',
          headers: {
            Authorization: `Token ${user.token}`,
          },
        }
      );      if (response.ok) {
        setComments(prevComments =>
          prevComments.map(comment =>
            comment.id === commentId
              ? {
                  ...comment,
                  is_liked_by_user: !comment.is_liked_by_user,
                  likes_count: comment.is_liked_by_user
                    ? comment.likes_count - 1
                    : comment.likes_count + 1,
                }
              : comment
          )
        );
      }
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };
  return (
    <div className="card">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-semibold mb-1 text-slate-900">{title}</h2>
        <p className="text-sm text-slate-500">{description}</p>
      </div>      {comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((comment, index) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              isFirst={index === 0}
              onLike={handleLike}
              isLoggedIn={!!user}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-slate-400">
          <p>Brak komentarzy</p>
        </div>
      )}
      
      <div className="text-center mt-4">
        <Link 
          href="/players" 
          className="text-accent-color text-sm font-medium hover:underline"
        >
          Przeglądaj wszystkich piłkarzy
        </Link>
      </div>
    </div>
  );
}
