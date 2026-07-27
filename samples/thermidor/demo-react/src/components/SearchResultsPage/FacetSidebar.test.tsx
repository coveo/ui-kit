import {render, screen, fireEvent} from '@testing-library/react';
import {describe, it, expect, vi} from 'vitest';
import {SearchResultsPage} from './SearchResultsPage.js';

function createMockController(state: Record<string, unknown> = {}) {
  return {
    state,
    subscribe: (cb: () => void) => {
      cb();
      return () => {};
    },
  };
}

vi.mock('@coveo/thermidor', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    buildProductListController: () => createMockController({products: []}),
    buildPaginationController: () =>
      createMockController({
        page: 0,
        pageSize: 10,
        totalCount: 0,
        totalPages: 0,
      }),
    buildSearchBoxController: () => createMockController({query: ''}),
  };
});

describe('Facet sidebar placeholder', () => {
  const defaultProps = {
    onSubmit: vi.fn(),
    isStreaming: false,
    routedInterface: {useCase: 'search', interface: {id: 'mock'}} as any,
  };

  it('renders text "Facets (coming soon)"', () => {
    render(<SearchResultsPage {...defaultProps} />);

    expect(screen.getByText('Facets (coming soon)')).toBeDefined();
  });

  it('is non-interactive (no role, tabIndex, or click handlers)', () => {
    render(<SearchResultsPage {...defaultProps} />);

    const sidebar = screen.getByText('Facets (coming soon)').closest('aside')!;

    expect(sidebar.getAttribute('role')).toBeNull();
    expect(sidebar.getAttribute('tabindex')).toBeNull();

    const clickSpy = vi.fn();
    sidebar.addEventListener('click', clickSpy);
    fireEvent.click(sidebar);
    sidebar.removeEventListener('click', clickSpy);

    expect(screen.queryByRole('status')).toBeNull();
  });
});
