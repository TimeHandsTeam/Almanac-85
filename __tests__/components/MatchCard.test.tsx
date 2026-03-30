import React from 'react';
import { render } from '@testing-library/react-native';
import { MatchCard } from '@/components/ui/MatchCard';
import type { Match } from '@/lib/types';

const mockMatch: Match = {
  id: '1', league_id: 'l1', home_team_id: 't1', away_team_id: 't2',
  start_time: '2026-03-29T20:00:00Z', status: 'live',
  home_score: 2, away_score: 1, raw_data: null,
  cached_at: '2026-03-29T20:00:00Z',
  home_team: { id: 't1', league_id: 'l1', name: 'Arsenal', short_name: 'ARS', logo_url: null },
  away_team: { id: 't2', league_id: 'l1', name: 'Chelsea', short_name: 'CHE', logo_url: null },
};

describe('MatchCard', () => {
  it('renders team names', () => {
    const { getByText } = render(<MatchCard match={mockMatch} />);
    expect(getByText('Arsenal')).toBeTruthy();
    expect(getByText('Chelsea')).toBeTruthy();
  });
  it('renders scores when live', () => {
    const { getByText } = render(<MatchCard match={mockMatch} />);
    expect(getByText('2')).toBeTruthy();
    expect(getByText('1')).toBeTruthy();
  });
  it('renders LIVE badge for live matches', () => {
    const { getByText } = render(<MatchCard match={mockMatch} />);
    expect(getByText('LIVE')).toBeTruthy();
  });
});
