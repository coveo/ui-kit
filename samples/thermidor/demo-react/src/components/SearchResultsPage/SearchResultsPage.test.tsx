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
    selectPage: vi.fn(),
    setPageSize: vi.fn(),
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

describe('SearchResultsPage integration', () => {
  const defaultProps = {
    onSubmit: vi.fn(),
    isStreaming: false,
    routedInterface: {useCase: 'search', interface: {id: 'mock'}} as any,
  };

  function renderPage(overrides = {}) {
    const props = {...defaultProps, onSubmit: vi.fn(), ...overrides};
    const result = render(<SearchResultsPage {...props} />);
    return {...result, props};
  }

  it('renders header with PromptInput', () => {
    renderPage();

    const header = document.querySelector('header');
    expect(header).not.toBeNull();

    const textarea = screen.getByLabelText('Prompt');
    expect(textarea).toBeDefined();
    expect(header!.contains(textarea)).toBe(true);
  });

  it('renders sidebar with "Facets (coming soon)" text', () => {
    renderPage();

    expect(screen.getByText('Facets (coming soon)')).toBeDefined();
  });

  it('builds all 3 controllers via mock interface and renders without errors', () => {
    renderPage();

    expect(screen.getByText('No results found')).toBeDefined();
  });

  it('returns null when routedInterface is null', () => {
    const {container} = render(
      <SearchResultsPage onSubmit={vi.fn()} isStreaming={false} routedInterface={null as any} />
    );

    expect(container.firstChild).toBeNull();
  });

  it('toast is shared between SortPlaceholder and suggestion actions', () => {
    renderPage();

    const sortSelect = screen.getByLabelText('Sort by:');
    fireEvent.click(sortSelect);

    expect(screen.getByRole('status')).toBeDefined();
    expect(screen.getByText('Not supported yet')).toBeDefined();
  });
});

describe('SearchResultsPage suggestions integration', () => {
  const defaultProps = {
    onSubmit: vi.fn(),
    isStreaming: false,
    routedInterface: {useCase: 'search', interface: {id: 'mock'}} as any,
  };

  function renderPage(overrides = {}) {
    const props = {...defaultProps, onSubmit: vi.fn(), ...overrides};
    const result = render(<SearchResultsPage {...props} />);
    return {...result, props};
  }

  it('PromptInput receives suggestions prop with 3 sections', () => {
    renderPage();

    const textarea = screen.getByLabelText('Prompt');
    fireEvent.focus(textarea);

    const listbox = screen.getByRole('listbox');
    expect(listbox).toBeDefined();

    expect(screen.getByText('Search refinements')).toBeDefined();
    expect(screen.getByText('Search')).toBeDefined();
    expect(screen.getByText('Conversational')).toBeDefined();
  });

  it('selecting a search item triggers submit', () => {
    const {props} = renderPage();

    const textarea = screen.getByLabelText('Prompt');
    fireEvent.focus(textarea);

    fireEvent.mouseDown(screen.getByText('Surfboards'));

    expect(props.onSubmit).toHaveBeenCalledWith('Surfboards');
  });

  it('selecting a conversational item triggers submit', () => {
    const {props} = renderPage();

    const textarea = screen.getByLabelText('Prompt');
    fireEvent.focus(textarea);

    fireEvent.mouseDown(screen.getByText('Build a beginner surfing kit'));

    expect(props.onSubmit).toHaveBeenCalledWith('Build a beginner surfing kit');
  });

  it('selecting a refinement item shows toast notification', () => {
    renderPage();

    const textarea = screen.getByLabelText('Prompt');
    fireEvent.focus(textarea);

    fireEvent.mouseDown(screen.getByText('Show boards under $400'));

    expect(screen.getByRole('status')).toBeDefined();
    expect(screen.getByText('Not supported yet')).toBeDefined();
  });
});

describe('SearchResultsPage PageSizeSelector integration', () => {
  const defaultProps = {
    onSubmit: vi.fn(),
    isStreaming: false,
    routedInterface: {useCase: 'search', interface: {id: 'mock'}} as any,
  };

  function renderPage(overrides = {}) {
    const props = {...defaultProps, onSubmit: vi.fn(), ...overrides};
    const result = render(<SearchResultsPage {...props} />);
    return {...result, props};
  }

  it('renders the "Products per page:" label and select', () => {
    renderPage();

    expect(screen.getByLabelText('Products per page:')).toBeDefined();
    const select = screen.getByLabelText('Products per page:') as HTMLSelectElement;
    expect(select.tagName).toBe('SELECT');
  });

  it('renders page size options 10, 25, 50', () => {
    renderPage();

    const select = screen.getByLabelText('Products per page:');
    const options = select.querySelectorAll('option');
    expect(options).toHaveLength(3);
    expect(options[0].textContent).toBe('10');
    expect(options[1].textContent).toBe('25');
    expect(options[2].textContent).toBe('50');
  });
});
