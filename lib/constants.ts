export const COLORS = {
  background: '#0A0A0A',
  surface: '#141414',
  elevated: '#1E1E1E',
  gold: '#C9A84C',
  danger: '#E03131',
  primary: '#F5F5F5',
  muted: '#8A8A8A',
  border: '#2A2A2A',
} as const;

export const FONTS = {
  display: 'System',
  body: 'System',
} as const;

export const SPORTS = [
  { id: 'soccer', name: 'Soccer', slug: 'soccer', espnSport: 'soccer', espnLeague: 'eng.1', icon: '⚽' },
  { id: 'basketball', name: 'Basketball', slug: 'basketball', espnSport: 'basketball', espnLeague: 'nba', icon: '🏀' },
  { id: 'football', name: 'NFL', slug: 'football', espnSport: 'football', espnLeague: 'nfl', icon: '🏈' },
  { id: 'baseball', name: 'MLB', slug: 'baseball', espnSport: 'baseball', espnLeague: 'mlb', icon: '⚾' },
  { id: 'tennis', name: 'Tennis', slug: 'tennis', espnSport: 'tennis', espnLeague: 'atp', icon: '🎾' },
  { id: 'cricket', name: 'Cricket', slug: 'cricket', espnSport: 'cricket', espnLeague: 'icc', icon: '🏏' },
  { id: 'hockey', name: 'NHL', slug: 'hockey', espnSport: 'hockey', espnLeague: 'nhl', icon: '🏒' },
  { id: 'golf', name: 'Golf', slug: 'golf', espnSport: 'golf', espnLeague: 'pga', icon: '⛳' },
  { id: 'mma', name: 'MMA', slug: 'mma', espnSport: 'mma', espnLeague: 'ufc', icon: '🥊' },
  { id: 'boxing', name: 'Boxing', slug: 'boxing', espnSport: 'boxing', espnLeague: 'boxing', icon: '🥋' },
  { id: 'rugby', name: 'Rugby', slug: 'rugby', espnSport: 'rugby', espnLeague: 'premiership', icon: '🏉' },
  { id: 'volleyball', name: 'Volleyball', slug: 'volleyball', espnSport: 'volleyball', espnLeague: 'avp', icon: '🏐' },
] as const;

export const CREDIT_PACKS = [
  { id: 'pack_10', credits: 10, price: 1.99, label: '10 Credits' },
  { id: 'pack_50', credits: 50, price: 6.99, label: '50 Credits' },
  { id: 'pack_200', credits: 200, price: 19.99, label: '200 Credits' },
] as const;

export const SIGNUP_BONUS_CREDITS = 2;
export const PREDICTION_COST = 1;

export const ESPN_BASE = 'https://site.api.espn.com/apis/site/v2/sports';
export const CACHE_TTL = {
  LIVE_SCORES: 60,       // seconds
  SCHEDULED_SCORES: 300, // 5 minutes
  NEWS: 900,             // 15 minutes
  STANDINGS: 300,        // 5 minutes
} as const;
