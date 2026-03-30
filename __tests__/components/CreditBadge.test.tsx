import React from 'react';
import { render } from '@testing-library/react-native';
import { CreditBadge } from '@/components/ui/CreditBadge';

describe('CreditBadge', () => {
  it('renders credit balance', () => {
    const { getByText } = render(<CreditBadge balance={5} />);
    expect(getByText('5')).toBeTruthy();
  });
  it('renders zero balance', () => {
    const { getByText } = render(<CreditBadge balance={0} />);
    expect(getByText('0')).toBeTruthy();
  });
});
