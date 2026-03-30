import React from 'react';
import { render } from '@testing-library/react-native';
import { ArticleCard } from '@/components/ui/ArticleCard';
import type { Article } from '@/lib/types';

const mockArticle: Article = {
  id: '1', sport_id: 's1',
  title: 'Arsenal wins Premier League title',
  summary: 'A stunning victory', image_url: null,
  source_url: 'https://example.com',
  published_at: '2026-03-29T12:00:00Z',
  cached_at: '2026-03-29T12:00:00Z',
};

describe('ArticleCard', () => {
  it('renders article title', () => {
    const { getByText } = render(<ArticleCard article={mockArticle} />);
    expect(getByText('Arsenal wins Premier League title')).toBeTruthy();
  });
});
