export type LiveLowestRatingsItem = {
  player_name: string;
  player_slug: string;
  average_rating: number;
  total_ratings: number;
};

export type LiveLowestRatingsResponse = {
  updated_at: string;
  items: LiveLowestRatingsItem[];
};
