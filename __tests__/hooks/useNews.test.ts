import { renderHook, waitFor } from '@testing-library/react-native';
import { useNews } from '@/hooks/useNews';

jest.mock('@/lib/supabase', () => ({
  supabase: {
    functions: {
      invoke: jest.fn().mockResolvedValue({
        data: { articles: [{ id: '1', title: 'Test Article', published_at: '2026-03-29T12:00:00Z' }] },
        error: null,
      }),
    },
  },
}));

describe('useNews', () => {
  it('initializes with empty articles and loading true', () => {
    const { result } = renderHook(() => useNews('basketball'));
    expect(result.current.articles).toEqual([]);
    expect(result.current.loading).toBe(true);
  });

  it('loads articles after mount', async () => {
    const { result } = renderHook(() => useNews('basketball'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.articles).toHaveLength(1);
  });
});
