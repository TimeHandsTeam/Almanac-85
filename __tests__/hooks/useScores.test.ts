import { renderHook, waitFor } from '@testing-library/react-native';
import { useScores } from '@/hooks/useScores';

jest.mock('@/lib/supabase', () => ({
  supabase: {
    functions: {
      invoke: jest.fn().mockResolvedValue({
        data: { matches: [{ id: '1', status: 'live', home_score: 2, away_score: 1 }] },
        error: null,
      }),
    },
  },
}));

describe('useScores', () => {
  it('initializes with empty matches and loading true', () => {
    const { result } = renderHook(() => useScores('basketball'));
    expect(result.current.matches).toEqual([]);
    expect(result.current.loading).toBe(true);
  });

  it('loads matches after mount', async () => {
    const { result } = renderHook(() => useScores('basketball'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.matches).toHaveLength(1);
  });
});
