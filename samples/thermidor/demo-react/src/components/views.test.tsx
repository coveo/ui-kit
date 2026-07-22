import {render, screen, fireEvent} from '@testing-library/react';
import {describe, it, expect, vi} from 'vitest';
import type {Turn, RoutedInterface} from '@coveo/thermidor';
import {LandingPage} from './LandingPage.js';
import {SearchResultsPage} from './SearchResultsPage.js';
import {ConversationPage} from './ConversationPage.js';

describe('LandingPage', () => {
  it('renders the "Landing" heading', () => {
    render(<LandingPage onSubmit={vi.fn()} isStreaming={false} error={null} />);
    expect(screen.getByRole('heading', {name: 'Landing'})).toBeDefined();
  });

  it('calls onSubmit with the input value on form submission', () => {
    const onSubmit = vi.fn();
    render(
      <LandingPage onSubmit={onSubmit} isStreaming={false} error={null} />
    );

    const input = screen.getByLabelText('Prompt');
    fireEvent.change(input, {target: {value: 'hello world'}});
    fireEvent.submit(input.closest('form')!);

    expect(onSubmit).toHaveBeenCalledWith('hello world');
  });

  it('disables the input when isStreaming is true', () => {
    render(<LandingPage onSubmit={vi.fn()} isStreaming={true} error={null} />);
    expect((screen.getByLabelText('Prompt') as HTMLInputElement).disabled).toBe(
      true
    );
  });

  it('disables the submit button when isStreaming is true', () => {
    render(<LandingPage onSubmit={vi.fn()} isStreaming={true} error={null} />);
    expect(
      (screen.getByRole('button', {name: 'Submit'}) as HTMLButtonElement)
        .disabled
    ).toBe(true);
  });
});

describe('SearchResultsPage', () => {
  const mockRoutedInterface = {
    useCase: 'search',
    interface: {},
  } as unknown as RoutedInterface;

  it('renders the "Search Results" heading', () => {
    render(
      <SearchResultsPage
        onSubmit={vi.fn()}
        isStreaming={false}
        routedInterface={mockRoutedInterface}
        error={null}
      />
    );
    expect(screen.getByRole('heading', {name: 'Search Results'})).toBeDefined();
  });

  it('displays the routedInterface useCase', () => {
    render(
      <SearchResultsPage
        onSubmit={vi.fn()}
        isStreaming={false}
        routedInterface={mockRoutedInterface}
        error={null}
      />
    );
    expect(screen.getByText('Use case: search')).toBeDefined();
  });

  it('calls onSubmit with the input value on form submission', () => {
    const onSubmit = vi.fn();
    render(
      <SearchResultsPage
        onSubmit={onSubmit}
        isStreaming={false}
        routedInterface={mockRoutedInterface}
        error={null}
      />
    );

    const input = screen.getByLabelText('Prompt');
    fireEvent.change(input, {target: {value: 'find products'}});
    fireEvent.submit(input.closest('form')!);

    expect(onSubmit).toHaveBeenCalledWith('find products');
  });

  it('disables the input when isStreaming is true', () => {
    render(
      <SearchResultsPage
        onSubmit={vi.fn()}
        isStreaming={true}
        routedInterface={mockRoutedInterface}
        error={null}
      />
    );
    expect((screen.getByLabelText('Prompt') as HTMLInputElement).disabled).toBe(
      true
    );
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
        error={null}
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
        error={null}
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
        error={null}
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
        error={null}
      />
    );
    expect((screen.getByLabelText('Prompt') as HTMLInputElement).disabled).toBe(
      true
    );
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
        error={null}
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
        error={null}
      />
    );
    expect(
      screen.queryByRole('button', {name: 'Back to search results'})
    ).toBeNull();
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
        error={null}
      />
    );

    fireEvent.click(screen.getByRole('button', {name: 'Reset'}));
    expect(onReset).toHaveBeenCalled();
  });
});
