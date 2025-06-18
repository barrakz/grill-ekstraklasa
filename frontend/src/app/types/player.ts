export interface Player {
  id: number;
  name: string;
  position: string;
  club_name: string | null;
  club_id: number | null;
  nationality: string;
  date_of_birth: string | null;
  height: number | null;
  weight: number | null;
  photo_url: string | null;
  average_rating: number;
  rating_avg?: number; // Dla kompatybilności ze starym kodem
  total_ratings: number;
  recent_ratings: number;
  user_rating: {
    id: number;
    value: number;
    created_at: string;
  } | null;
  recent_comments: Array<{
    id: number;
    content: string;
    user: {
      id: number;
      username: string;
    };
    likes_count: number;
    is_liked_by_user: boolean;
    created_at: string;
    updated_at: string;
  }>;
}