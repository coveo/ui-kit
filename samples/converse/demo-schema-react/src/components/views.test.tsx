import {screen, fireEvent} from '@testing-library/react';
import {afterEach, describe, it, expect, vi} from 'vitest';
import {LandingPage} from './LandingPage/LandingPage.js';
import {ConversationPage} from './ConversationPage/index.js';
import {makeTurn} from '../test/turn-fixtures.js';
import {findSearchBox, renderWithSession} from '../test/session.js';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('LandingPage', () => {
  it('renders the heading', () => {
    renderWithSession(<LandingPage onSubmit={vi.fn()} isStreaming={false} />);
    expect(screen.getByRole('heading', {name: 'What can I help you find?'})).toBeDefined();
  });

  it('calls onSubmit with the textarea value when Enter is pressed', async () => {
    const onSubmit = vi.fn();
    renderWithSession(<LandingPage onSubmit={onSubmit} isStreaming={false} />);

    const textarea = await findSearchBox();
    fireEvent.change(textarea, {target: {value: 'hello world'}});
    fireEvent.keyDown(textarea, {key: 'Enter', code: 'Enter'});

    expect(onSubmit).toHaveBeenCalledWith('hello world');
  });

  it('submits when a suggestion pill is clicked', () => {
    const onSubmit = vi.fn();
    renderWithSession(<LandingPage onSubmit={onSubmit} isStreaming={false} />);

    fireEvent.click(screen.getByRole('button', {name: 'kayaks'}));

    expect(onSubmit).toHaveBeenCalledWith('kayaks');
  });

  it('holds the submit when isStreaming is true', async () => {
    const onSubmit = vi.fn();
    renderWithSession(<LandingPage onSubmit={onSubmit} isStreaming={true} />);

    const textarea = await findSearchBox();
    fireEvent.change(textarea, {target: {value: 'hello world'}});
    fireEvent.keyDown(textarea, {key: 'Enter', code: 'Enter'});

    expect((screen.getByLabelText('Submit') as HTMLButtonElement).disabled).toBe(true);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('disables suggestion pills when isStreaming is true', () => {
    renderWithSession(<LandingPage onSubmit={vi.fn()} isStreaming={true} />);
    const pills = screen.getAllByRole('button');
    for (const pill of pills) {
      expect((pill as HTMLButtonElement).disabled).toBe(true);
    }
  });
});

describe('ConversationPage', () => {
  const baseTurn = makeTurn({id: 'turn-1', prompt: 'tell me about shoes'});

  it('renders the prompt input', () => {
    renderWithSession(
      <ConversationPage onSubmit={vi.fn()} isStreaming={false} turns={[baseTurn]} />
    );
    expect(screen.getByLabelText('Prompt')).toBeDefined();
  });

  it('calls onSubmit with the input value when Enter is pressed', async () => {
    const onSubmit = vi.fn();
    renderWithSession(
      <ConversationPage onSubmit={onSubmit} isStreaming={false} turns={[baseTurn]} />
    );

    const input = await findSearchBox();
    fireEvent.change(input, {target: {value: 'follow up'}});
    fireEvent.keyDown(input, {key: 'Enter', code: 'Enter'});

    expect(onSubmit).toHaveBeenCalledWith('follow up');
  });

  it('holds the submit when isStreaming is true', async () => {
    const onSubmit = vi.fn();
    renderWithSession(
      <ConversationPage onSubmit={onSubmit} isStreaming={true} turns={[baseTurn]} />
    );

    const input = await findSearchBox();
    fireEvent.change(input, {target: {value: 'follow up'}});
    fireEvent.keyDown(input, {key: 'Enter', code: 'Enter'});

    expect(onSubmit).not.toHaveBeenCalled();
  });
});
