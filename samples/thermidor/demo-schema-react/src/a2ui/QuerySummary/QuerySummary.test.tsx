import {describe, it, expect, beforeEach} from 'vitest';
import {render, screen} from '@testing-library/react';
import {vi} from 'vitest';
import {QuerySummaryRenderer} from './QuerySummary.js';

let mockControllerState: unknown = undefined;

vi.mock('../controllers.js', () => ({
  useRemoteController: () => ({
    state: mockControllerState,
    dispatch: vi.fn(),
    subscribe: () => () => undefined,
  }),
}));

vi.mock('../state-source-context.js', () => ({
  useStateSource: () => ({}),
}));

const props = {componentId: 'query-summary-2', componentType: 'query-summary' as const};

beforeEach(() => {
  mockControllerState = undefined;
});

describe('QuerySummaryRenderer', () => {
  it('renders nothing when state is undefined (loading)', () => {
    mockControllerState = undefined;
    const {container} = render(<QuerySummaryRenderer props={props} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders nothing when there are no results and no query', () => {
    mockControllerState = {query: '', firstIndex: 0, lastIndex: 0, totalEntries: 0};
    const {container} = render(<QuerySummaryRenderer props={props} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders a no-results message when there are no results but a query is present', () => {
    mockControllerState = {query: 'Kayaks', firstIndex: 0, lastIndex: 0, totalEntries: 0};
    render(<QuerySummaryRenderer props={props} />);
    expect(screen.getByText(/No results for/)).toBeDefined();
    expect(screen.getByText('Kayaks')).toBeDefined();
  });

  it('renders the result window with the query when results exist', () => {
    mockControllerState = {
      query: 'Water Sports',
      firstIndex: 1,
      lastIndex: 12,
      totalEntries: 43,
    };
    render(<QuerySummaryRenderer props={props} />);
    expect(screen.getByText(/Products/)).toBeDefined();
    expect(screen.getByText('1')).toBeDefined();
    expect(screen.getByText('12')).toBeDefined();
    expect(screen.getByText('43')).toBeDefined();
    expect(screen.getByText('Water Sports')).toBeDefined();
    expect(screen.getByText(/for/)).toBeDefined();
  });

  it('formats a large totalEntries with locale separators', () => {
    mockControllerState = {
      query: 'Gear',
      firstIndex: 1,
      lastIndex: 12,
      totalEntries: 1234,
    };
    render(<QuerySummaryRenderer props={props} />);
    expect(screen.getByText('1,234')).toBeDefined();
  });

  it('drops the trailing "for {query}" tail when the query is empty', () => {
    mockControllerState = {query: '', firstIndex: 1, lastIndex: 12, totalEntries: 43};
    render(<QuerySummaryRenderer props={props} />);
    expect(screen.getByText(/Products/)).toBeDefined();
    expect(screen.queryByText(/for/)).toBeNull();
  });
});
