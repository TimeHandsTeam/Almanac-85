export interface Profile {
  id: string;
  username: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface CreditBalance {
  id: string;
  user_id: string;
  balance: number;
  updated_at: string;
}

export interface Sport {
  id: string;
  name: string;
  slug: string;
  icon_url: string | null;
  display_order: number;
}

export interface League {
  id: string;
  sport_id: string;
  name: string;
  slug: string;
  country: string | null;
}

export interface Team {
  id: string;
  league_id: string;
  name: string;
  short_name: string;
  logo_url: string | null;
}

export interface Match {
  id: string;
  league_id: string;
  home_team_id: string;
  away_team_id: string;
  start_time: string;
  status: 'scheduled' | 'live' | 'finished';
  home_score: number | null;
  away_score: number | null;
  raw_data: Record<string, unknown> | null;
  cached_at: string;
  home_team?: Team;
  away_team?: Team;
  league?: League;
}

export interface Standing {
  id: string;
  league_id: string;
  team_id: string;
  position: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  points: number;
  cached_at: string;
  team?: Team;
}

export interface Article {
  id: string;
  sport_id: string;
  title: string;
  summary: string | null;
  image_url: string | null;
  source_url: string;
  published_at: string;
  cached_at: string;
}

export interface Prediction {
  id: string;
  user_id: string;
  match_id: string | null;
  type: 'outcome' | 'prop';
  prompt: Record<string, unknown>;
  result: PredictionResult;
  credits_used: number;
  created_at: string;
}

export interface PredictionResult {
  type: 'outcome' | 'prop';
  home_win_pct?: number;
  away_win_pct?: number;
  draw_pct?: number;
  prop_probability?: number;
  prop_hit_rate?: string;
  confidence: number;
  reasoning: string;
}

export interface CreditTransaction {
  id: string;
  user_id: string;
  amount: number;
  type: 'purchase' | 'spend' | 'signup_bonus';
  created_at: string;
}
