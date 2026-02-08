export type DramaMedia = {
  type: 'gif' | 'tweet';
  url: string;
};

export type DramaHighlightComment = {
  id: number;
  content: string;
  user?: {
    username: string;
  } | null;
  created_at?: string | null;
};

export type WeeklyDramaItem = {
  id: number;
  player: {
    id: number;
    name: string;
    slug: string;
    photo_url: string | null;
    card_url?: string | null;
    club_name: string | null;
    club_logo_url?: string | null;
  };
  average_rating: number;
  total_ratings: number;
  highlight_comment: DramaHighlightComment | null;
  media?: DramaMedia | null;
};

export type WeeklyDramasResponse = {
  week_label?: string | null;
  items: WeeklyDramaItem[];
};
