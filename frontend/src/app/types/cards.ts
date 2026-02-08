export type LatestCardItem = {
  id: number;
  card_url: string | null;
  player_name: string;
  player_slug: string;
  rating: number;
  club_name: string | null;
};

export type LatestCardsResponse = {
  items: LatestCardItem[];
};

