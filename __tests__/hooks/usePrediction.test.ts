import { renderHook, act } from '@testing-library/react-native';
import { usePrediction } from '@/hooks/usePrediction';

jest.mock('@/lib/supabase', () => ({
  supabase: {
    functions: {
      invoke: jest.fn(),
    },
  },
}));

import { supabase } from '@/lib/supabase';
const mockInvoke = supabase.functions.invoke as jest.Mock;

const mockOutcomeResult = {
  type: 'outcome',
  home_win_pct: 55,
  away_win_pct: 30,
  draw_pct: 15,
  confidence: 8,
  reasoning: 'Home team has stronger form.',
};

const mockPropResult = {
  type: 'prop',
  prop_probability: 62,
  prop_hit_rate: '6/10 last games',
  confidence: 7,
  reasoning: 'Player has exceeded this line recently.',
};

describe('usePrediction', () => {
  beforeEach(() => {
    mockInvoke.mockReset();
  });

  it('initializes with null result and not loading', () => {
    const { result } = renderHook(() => usePrediction());
    expect(result.current.result).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('returns outcome prediction result on success', async () => {
    mockInvoke.mockResolvedValueOnce({
      data: { result: mockOutcomeResult },
      error: null,
    });

    const { result } = renderHook(() => usePrediction());

    let prediction: ReturnType<typeof result.current.predict> extends Promise<infer T> ? T : never;
    await act(async () => {
      prediction = await result.current.predict({
        type: 'outcome',
        sport: 'basketball',
        homeTeam: 'Lakers',
        awayTeam: 'Celtics',
      });
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.result).toEqual(mockOutcomeResult);
    expect(result.current.error).toBeNull();
  });

  it('returns prop prediction result on success', async () => {
    mockInvoke.mockResolvedValueOnce({
      data: { result: mockPropResult },
      error: null,
    });

    const { result } = renderHook(() => usePrediction());

    await act(async () => {
      await result.current.predict({
        type: 'prop',
        sport: 'basketball',
        propDescription: 'LeBron over 25.5 points',
      });
    });

    expect(result.current.result).toEqual(mockPropResult);
  });

  it('sets error when function returns error field', async () => {
    mockInvoke.mockResolvedValueOnce({
      data: { error: 'Insufficient credits' },
      error: null,
    });

    const { result } = renderHook(() => usePrediction());

    await act(async () => {
      await result.current.predict({
        type: 'outcome',
        sport: 'basketball',
        homeTeam: 'Lakers',
        awayTeam: 'Celtics',
      });
    });

    expect(result.current.result).toBeNull();
    expect(result.current.error).toBe('Insufficient credits');
  });

  it('sets error when invoke throws', async () => {
    mockInvoke.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => usePrediction());

    await act(async () => {
      await result.current.predict({
        type: 'prop',
        sport: 'basketball',
        propDescription: 'test prop',
      });
    });

    expect(result.current.result).toBeNull();
    expect(result.current.error).toContain('Network error');
  });

  it('reset clears result and error', async () => {
    mockInvoke.mockResolvedValueOnce({
      data: { result: mockOutcomeResult },
      error: null,
    });

    const { result } = renderHook(() => usePrediction());

    await act(async () => {
      await result.current.predict({
        type: 'outcome',
        sport: 'basketball',
        homeTeam: 'Lakers',
        awayTeam: 'Celtics',
      });
    });

    expect(result.current.result).not.toBeNull();

    act(() => {
      result.current.reset();
    });

    expect(result.current.result).toBeNull();
    expect(result.current.error).toBeNull();
  });
});
