'use client';

import { Comment } from '@/app/types/comment';
import CommentItem from './comments/CommentItem';
import { useAuth } from '@/app/hooks/useAuth';
import { API_BASE_URL } from '@/app/config';
import { useState, useEffect } from 'react';

type ClubLatestCommentsProps = {
  clubId: number;
};

export default function ClubLatestComments({ clubId }: ClubLatestCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/comments/club_latest/?club_id=${clubId}&limit=5`,
          {
            headers: user?.token
              ? { Authorization: `Token ${user.token}` }
              : undefined,
          }
        );
        if (!response.ok) {
          throw new Error('Failed to fetch comments');
        }
        const data = await response.json();
        setComments(data);
      } catch (error) {
        console.error('Error fetching club comments:', error);
      }
    };

    fetchComments();
  }, [clubId, user?.token]);

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
      );

      if (response.ok) {
        setComments((prevComments) =>
          prevComments.map((comment) =>
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

  if (comments.length === 0) {
    return null;
  }

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-4 text-slate-900">5 ostatnich komentarzy dla piłkarzy tego klubu</h2>
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
    </div>
  );
}
