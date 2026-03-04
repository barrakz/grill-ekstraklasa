export interface MatchLineupPlayer {
  id: number;
  player_id: number | null;
  player_name: string | null;
  raw_name: string;
  club_name: string;
  selection_status: string;
  shirt_number: number | null;
  position: string | null;
  captain: boolean;
  rating_avg?: number;
  ratings_count?: number;
}

export interface MatchFixture {
  id: number;
  season_name: string;
  round_number?: number | null;
  kickoff_at: string;
  status: string;
  result_home?: number | null;
  result_away?: number | null;
  slug: string;
  share_slug: string;
  home_club_name: string;
  away_club_name: string;
  players_count: number;
  ratings_total: number;
  home_players_count: number;
  away_players_count: number;
  published_at?: string | null;
  lineup_confirmed_at?: string | null;
}

export interface MatchFixtureDetail {
  id: number;
  season_name: string;
  round_number?: number | null;
  kickoff_at: string;
  status: string;
  result_home?: number | null;
  result_away?: number | null;
  slug: string;
  share_slug: string;
  published_at?: string | null;
  lineup_confirmed_at?: string | null;
  ratings_count: number;
  home_rating_avg: number;
  away_rating_avg: number;
  home_club_name: string;
  away_club_name: string;
  lineup: {
    home?: MatchLineupPlayer[];
    away?: MatchLineupPlayer[];
  };
}

export interface MatchRatingResponse {
  fixture_player_id: number;
  value: number;
  player_summary: MatchLineupPlayer | null;
  fixture_ratings_count: number;
  home_rating_avg: number;
  away_rating_avg: number;
}
