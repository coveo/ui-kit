import {render, screen, fireEvent} from '@testing-library/react';
import {describe, it, expect, vi} from 'vitest';
import {LandingPage} from './LandingPage/LandingPage.js';
import {ConversationPage} from './ConversationPage/index.js';
import {makeTurn} from '../test/turn-fixtures.js';

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

  it('submits when a suggestion pill is clicked', () => {
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

describe('ConversationPage', () => {
  const baseTurn = makeTurn({id: 'turn-1', prompt: 'tell me about shoes'});

  it('renders the PromptInput', () => {
    render(
      <ConversationPage
        onSubmit={vi.fn()}
        isStreaming={false}
        turns={[baseTurn]}
        surfacesByTurn={new Map()}
      />
    );
    expect(screen.getByLabelText('Prompt')).toBeDefined();
  });

  it('calls onSubmit with the input value when Enter is pressed', () => {
    const onSubmit = vi.fn();
    render(
      <ConversationPage
        onSubmit={onSubmit}
        isStreaming={false}
        turns={[baseTurn]}
        surfacesByTurn={new Map()}
      />
    );

    const input = screen.getByLabelText('Prompt');
    fireEvent.change(input, {target: {value: 'follow up'}});
    fireEvent.keyDown(input, {key: 'Enter', code: 'Enter'});

    expect(onSubmit).toHaveBeenCalledWith('follow up');
  });

  it('disables the input when isStreaming is true', () => {
    render(
      <ConversationPage
        onSubmit={vi.fn()}
        isStreaming={true}
        turns={[baseTurn]}
        surfacesByTurn={new Map()}
      />
    );
    expect((screen.getByLabelText('Prompt') as HTMLTextAreaElement).disabled).toBe(true);
  });
});
