import {screen, fireEvent, waitFor} from '@testing-library/react';
import {afterEach, describe, it, expect, vi} from 'vitest';
import {ConversationPage} from './ConversationPage.js';
import {makeTurn} from '../../test/turn-fixtures.js';
import {findSearchBox, renderWithSession} from '../../test/session.js';

const baseTurn = makeTurn({id: 'turn-1', prompt: 'tell me about shoes'});

function renderPage(overrides: Partial<Parameters<typeof ConversationPage>[0]> = {}) {
  const defaultProps = {
    onSubmit: vi.fn(),
    isStreaming: false,
    turns: [baseTurn],
  };

  return renderWithSession(<ConversationPage {...defaultProps} {...overrides} />);
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('ConversationPage shell', () => {
  describe('search box', () => {
    it('renders the search box', async () => {
      renderPage();
      expect(await findSearchBox()).toBeDefined();
    });

    it('opens the completions above the prompt bar', async () => {
      renderPage();

      const textarea = await findSearchBox();
      textarea.focus();
      fireEvent.change(textarea, {target: {value: 'surf'}});

      await waitFor(() => expect(screen.getByRole('listbox').className).toMatch(/above/));
    });
  });

  describe('submit behavior', () => {
    it('calls onSubmit with the trimmed prompt when Enter is pressed, and clears the input', async () => {
      const onSubmit = vi.fn();
      renderPage({onSubmit});

      const textarea = await findSearchBox();
      fireEvent.change(textarea, {target: {value: '  follow up question '}});
      fireEvent.keyDown(textarea, {key: 'Enter', code: 'Enter'});

      expect(onSubmit).toHaveBeenCalledWith('follow up question');
      expect(textarea.value).toBe('');
    });
  });

  describe('streaming state', () => {
    it('keeps the input usable but holds the submit when isStreaming is true', async () => {
      const onSubmit = vi.fn();
      renderPage({onSubmit, isStreaming: true});

      const textarea = await findSearchBox();
      fireEvent.change(textarea, {target: {value: 'follow up question'}});
      fireEvent.keyDown(textarea, {key: 'Enter', code: 'Enter'});

      expect(textarea.disabled).toBe(false);
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });
});
