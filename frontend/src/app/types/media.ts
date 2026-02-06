export type LatestMediaItem = {
  id: string | number;
  type: 'gif' | 'tweet';
  url: string;
  player_name: string;
  player_slug?: string | null;
  rating?: number | null;
};

export type LatestMediaResponse = {
  items: LatestMediaItem[];
};
