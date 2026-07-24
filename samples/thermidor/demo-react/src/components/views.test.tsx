import {render, screen, fireEvent} from '@testing-library/react';
import {describe, it, expect, vi} from 'vitest';
import type {Turn, RoutedInterface} from '@coveo/thermidor';
import {LandingPage} from './LandingPage/LandingPage.js';
import {SearchResultsPage} from './SearchResultsPage/SearchResultsPage.js';
import {ConversationPage} from './ConversationPage.js';

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

describe('LandingPage', () => {
  it('renders the heading', () => {
    render(<LandingPage onSubmit={vi.fn()} isStreaming={false} />);
    expect(screen.getByRole('heading', {name: 'What can I help you find?'})).toBeDefined();
  });

  it('calls onSubmit with the textarea value when Enter is pressed', () => {
    const onSubmit = vi.fn();
    render(<LandingPage onSubmit={onSubmit} isStreaming={false} />);

    const textarea = screen.getByLabelText('Prompt');
    fireEvent.change(textarea, {target: {value: 'hello world'}});
    fireEvent.keyDown(textarea, {key: 'Enter', code: 'Enter'});

    expect(onSubmit).toHaveBeenCalledWith('hello world');
  });

  it('calls onSubmit when a suggestion pill is clicked', () => {
    const onSubmit = vi.fn();
    render(<LandingPage onSubmit={onSubmit} isStreaming={false} />);

    fireEvent.click(screen.getByRole('button', {name: 'kayaks'}));

    expect(onSubmit).toHaveBeenCalledWith('kayaks');
  });

  it('disables the textarea when isStreaming is true', () => {
    render(<LandingPage onSubmit={vi.fn()} isStreaming={true} />);
    expect((screen.getByLabelText('Prompt') as HTMLTextAreaElement).disabled).toBe(true);
  });

  it('disables suggestion pills when isStreaming is true', () => {
    render(<LandingPage onSubmit={vi.fn()} isStreaming={true} />);
    const pills = screen.getAllByRole('button');
    for (const pill of pills) {
      expect((pill as HTMLButtonElement).disabled).toBe(true);
    }
  });
});

describe('SearchResultsPage', () => {
  const mockRoutedInterface = {
    useCase: 'search',
    interface: {id: 'mock'},
  } as unknown as RoutedInterface;

  it('renders the search results page container', () => {
    render(
      <SearchResultsPage
        onSubmit={vi.fn()}
        isStreaming={false}
        routedInterface={mockRoutedInterface}
      />
    );
    expect(screen.getByTestId('search-results-page')).toBeDefined();
  });

  it('renders the facet sidebar placeholder', () => {
    render(
      <SearchResultsPage
        onSubmit={vi.fn()}
        isStreaming={false}
        routedInterface={mockRoutedInterface}
      />
    );
    expect(screen.getByText('Facets (coming soon)')).toBeDefined();
  });

  it('calls onSubmit with the input value on form submission', () => {
    const onSubmit = vi.fn();
    render(
      <SearchResultsPage
        onSubmit={onSubmit}
        isStreaming={false}
        routedInterface={mockRoutedInterface}
      />
    );

    const input = screen.getByLabelText('Prompt');
    fireEvent.change(input, {target: {value: 'find products'}});
    fireEvent.keyDown(input, {key: 'Enter', code: 'Enter'});

    expect(onSubmit).toHaveBeenCalledWith('find products');
  });

  it('disables the input when isStreaming is true', () => {
    render(
      <SearchResultsPage
        onSubmit={vi.fn()}
        isStreaming={true}
        routedInterface={mockRoutedInterface}
      />
    );
    expect((screen.getByLabelText('Prompt') as HTMLInputElement).disabled).toBe(true);
  });
});

describe('ConversationPage', () => {
  const baseTurn: Turn = {
    id: 'turn-1',
    prompt: 'tell me about shoes',
    status: 'complete',
  };

  it('renders the "Conversation" heading', () => {
    render(
      <ConversationPage
        onSubmit={vi.fn()}
        isStreaming={false}
        turns={[baseTurn]}
        onBackToSearch={vi.fn()}
        canGoBackToSearch={true}
        onResetToLanding={vi.fn()}
      />
    );
    expect(screen.getByRole('heading', {name: 'Conversation'})).toBeDefined();
  });

  it('displays the latest turn prompt', () => {
    const turns: Turn[] = [
      {id: 'turn-1', prompt: 'first question', status: 'complete'},
      {id: 'turn-2', prompt: 'second question', status: 'complete'},
    ];
    render(
      <ConversationPage
        onSubmit={vi.fn()}
        isStreaming={false}
        turns={turns}
        onBackToSearch={vi.fn()}
        canGoBackToSearch={true}
        onResetToLanding={vi.fn()}
      />
    );
    expect(screen.getByText('Latest prompt: second question')).toBeDefined();
  });

  it('calls onSubmit with the input value on form submission', () => {
    const onSubmit = vi.fn();
    render(
      <ConversationPage
        onSubmit={onSubmit}
        isStreaming={false}
        turns={[baseTurn]}
        onBackToSearch={vi.fn()}
        canGoBackToSearch={true}
        onResetToLanding={vi.fn()}
      />
    );

    const input = screen.getByLabelText('Prompt');
    fireEvent.change(input, {target: {value: 'follow up'}});
    fireEvent.submit(input.closest('form')!);

    expect(onSubmit).toHaveBeenCalledWith('follow up');
  });

  it('disables the input when isStreaming is true', () => {
    render(
      <ConversationPage
        onSubmit={vi.fn()}
        isStreaming={true}
        turns={[baseTurn]}
        onBackToSearch={vi.fn()}
        canGoBackToSearch={true}
        onResetToLanding={vi.fn()}
      />
    );
    expect((screen.getByLabelText('Prompt') as HTMLInputElement).disabled).toBe(true);
  });

  it('renders "Back to search results" button when onBackToSearch is provided', () => {
    const onBackToSearch = vi.fn();
    render(
      <ConversationPage
        onSubmit={vi.fn()}
        isStreaming={false}
        turns={[baseTurn]}
        onBackToSearch={onBackToSearch}
        canGoBackToSearch={true}
        onResetToLanding={vi.fn()}
      />
    );

    const btn = screen.getByRole('button', {name: 'Back to search results'});
    fireEvent.click(btn);
    expect(onBackToSearch).toHaveBeenCalled();
  });

  it('does not render "Back to search results" button when canGoBackToSearch is false', () => {
    render(
      <ConversationPage
        onSubmit={vi.fn()}
        isStreaming={false}
        turns={[baseTurn]}
        onBackToSearch={vi.fn()}
        canGoBackToSearch={false}
        onResetToLanding={vi.fn()}
      />
    );
    expect(screen.queryByRole('button', {name: 'Back to search results'})).toBeNull();
  });

  it('calls onResetToLanding when "Reset" button is clicked', () => {
    const onReset = vi.fn();
    render(
      <ConversationPage
        onSubmit={vi.fn()}
        isStreaming={false}
        turns={[baseTurn]}
        onBackToSearch={vi.fn()}
        canGoBackToSearch={false}
        onResetToLanding={onReset}
      />
    );

    fireEvent.click(screen.getByRole('button', {name: 'Reset'}));
    expect(onReset).toHaveBeenCalled();
  });
});
