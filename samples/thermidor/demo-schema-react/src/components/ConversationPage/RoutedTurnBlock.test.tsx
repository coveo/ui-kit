import {render, screen} from '@testing-library/react';
import {describe, it, expect} from 'vitest';
import {RoutedTurnBlock} from './RoutedTurnBlock.js';

describe('RoutedTurnBlock', () => {
  it('renders the "Search results updated." message', () => {
    render(<RoutedTurnBlock />);
    expect(screen.getByText('Search results updated.')).toBeDefined();
  });

  it('is not clickable (no button or link)', () => {
    render(<RoutedTurnBlock />);
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.queryByRole('link')).toBeNull();
  });
});
