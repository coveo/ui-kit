import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import type {QuerySummaryProps} from '@coveo/thermidor-schema';
import {QuerySummaryRenderer} from './QuerySummary.js';

function renderSummary(props: QuerySummaryProps) {
  return render(<QuerySummaryRenderer props={props} />);
}

describe('QuerySummaryRenderer', () => {
  it('renders nothing when there are no results and no query', () => {
    const {container} = renderSummary({query: '', firstIndex: 0, lastIndex: 0, totalEntries: 0});
    expect(container.innerHTML).toBe('');
  });

  it('renders a no-results message when there are no results but a query is present', () => {
    renderSummary({query: 'Kayaks', firstIndex: 0, lastIndex: 0, totalEntries: 0});
    expect(screen.getByText(/No results for/)).toBeDefined();
    expect(screen.getByText('Kayaks')).toBeDefined();
  });

  it('renders the result window with the query when results exist', () => {
    renderSummary({query: 'Water Sports', firstIndex: 1, lastIndex: 12, totalEntries: 43});
    expect(screen.getByText(/Products/)).toBeDefined();
    expect(screen.getByText('1')).toBeDefined();
    expect(screen.getByText('12')).toBeDefined();
    expect(screen.getByText('43')).toBeDefined();
    expect(screen.getByText('Water Sports')).toBeDefined();
    expect(screen.getByText(/for/)).toBeDefined();
  });

  it('formats a large totalEntries with locale separators', () => {
    renderSummary({query: 'Gear', firstIndex: 1, lastIndex: 12, totalEntries: 1234});
    expect(screen.getByText('1,234')).toBeDefined();
  });

  it('drops the trailing "for {query}" tail when the query is empty', () => {
    renderSummary({query: '', firstIndex: 1, lastIndex: 12, totalEntries: 43});
    expect(screen.getByText(/Products/)).toBeDefined();
    expect(screen.queryByText(/for/)).toBeNull();
  });
});
