export interface Comment {
  id: number;
  content: string;
  user: {
    id: number;
    username: string;
  }; player: {
    id: number;
    name: string;
    slug?: string;
  };
  likes_count: number;
  is_liked_by_user: boolean;
  ai_response?: string;
  created_at: string;
  updated_at: string;
}

export interface PaginatedComments {
  count: number;
  next: string | null;
  previous: string | null;
  results: Comment[];
}
