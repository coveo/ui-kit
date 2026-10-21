import {screen, fireEvent, waitFor} from '@testing-library/react';
import {describe, it, expect, vi} from 'vitest';
import {ConversationPage} from './ConversationPage.js';
import {makeTurn} from '../../test/turn-fixtures.js';
import {answerLookups, createTestSession, renderWithSession} from '../../test/session.js';

const baseTurn = makeTurn({id: 'turn-1', prompt: 'tell me about shoes'});

function renderPage(
  overrides: Partial<Parameters<typeof ConversationPage>[0]> = {},
  session = createTestSession().session
) {
  const defaultProps = {
    onSubmit: vi.fn(),
    isStreaming: false,
    turns: [baseTurn],
    surfacesByTurn: new Map<string, readonly string[]>(),
  };

  return renderWithSession(<ConversationPage {...defaultProps} {...overrides} />, session);
}

describe('ConversationPage shell', () => {
  describe('search box', () => {
    it('renders the search box', () => {
      renderPage();
      const prompt = screen.getByLabelText('Prompt');
      expect(prompt).toBeDefined();
    });

    it('opens the completions above the prompt bar', async () => {
      renderPage({}, createTestSession(answerLookups).session);

      const textarea = screen.getByLabelText('Prompt');
      textarea.focus();
      fireEvent.change(textarea, {target: {value: 'surf'}});

      await waitFor(() => expect(screen.getByRole('listbox').className).toMatch(/above/));
    });
  });

  describe('submit behavior', () => {
    it('calls onSubmit with the trimmed prompt when Enter is pressed', () => {
      const onSubmit = vi.fn();
      renderPage({onSubmit});

      const textarea = screen.getByLabelText('Prompt');
      fireEvent.change(textarea, {target: {value: 'follow up question'}});
      fireEvent.keyDown(textarea, {key: 'Enter', code: 'Enter'});

      expect(onSubmit).toHaveBeenCalledWith('follow up question');
    });
  });

  describe('streaming state', () => {
    it('keeps the input usable but holds the submit when isStreaming is true', () => {
      const onSubmit = vi.fn();
      renderPage({onSubmit, isStreaming: true});

      const textarea = screen.getByLabelText('Prompt') as HTMLTextAreaElement;
      fireEvent.change(textarea, {target: {value: 'follow up question'}});
      fireEvent.keyDown(textarea, {key: 'Enter', code: 'Enter'});

      expect(textarea.disabled).toBe(false);
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });
});
