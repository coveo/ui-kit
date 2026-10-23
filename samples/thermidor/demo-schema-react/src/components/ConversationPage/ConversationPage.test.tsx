import {render, screen, fireEvent} from '@testing-library/react';
import {describe, it, expect, vi} from 'vitest';
import {ConversationPage} from './ConversationPage.js';
import {makeTurn} from '../../test/turn-fixtures.js';

const baseTurn = makeTurn({id: 'turn-1', prompt: 'tell me about shoes'});

function renderPage(overrides: Partial<Parameters<typeof ConversationPage>[0]> = {}) {
  const defaultProps = {
    onSubmit: vi.fn(),
    isStreaming: false,
    turns: [baseTurn],
    surfacesByTurn: new Map<string, readonly string[]>(),
  };

  return render(<ConversationPage {...defaultProps} {...overrides} />);
}

describe('ConversationPage shell', () => {
  describe('PromptInput rendering', () => {
    it('renders the PromptInput', () => {
      renderPage();
      const prompt = screen.getByLabelText('Prompt');
      expect(prompt).toBeDefined();
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
    it('disables the PromptInput when isStreaming is true', () => {
      renderPage({isStreaming: true});
      const textarea = screen.getByLabelText('Prompt') as HTMLTextAreaElement;
      expect(textarea.disabled).toBe(true);
    });

    it('enables the PromptInput when isStreaming is false', () => {
      renderPage({isStreaming: false});
      const textarea = screen.getByLabelText('Prompt') as HTMLTextAreaElement;
      expect(textarea.disabled).toBe(false);
    });
  });
});
