import {render, screen, fireEvent} from '@testing-library/react';
import {describe, it, expect, vi} from 'vitest';
import type {Turn} from '@coveo/thermidor';
import {ConversationPage} from './ConversationPage.js';

const baseTurn: Turn = {
  id: 'turn-1',
  prompt: 'tell me about shoes',
  status: 'complete',
};

function renderPage(overrides: Partial<Parameters<typeof ConversationPage>[0]> = {}) {
  const defaultProps = {
    onSubmit: vi.fn(),
    isStreaming: false,
    turns: [baseTurn],
    onBackToSearch: vi.fn(),
    canGoBackToSearch: false,
    onResetToLanding: vi.fn(),
  };

  return render(<ConversationPage {...defaultProps} {...overrides} />);
}

describe('ConversationPage shell', () => {
  describe('PromptInput rendering', () => {
    it('renders the PromptInput at the bottom of the page', () => {
      renderPage();
      const prompt = screen.getByLabelText('Prompt');
      expect(prompt).toBeDefined();

      const promptContainer = prompt.closest('[class*="promptContainer"]');
      expect(promptContainer).not.toBeNull();
    });
  });

  describe('Back to search results navigation', () => {
    it('shows "Back to search results" button when canGoBackToSearch is true', () => {
      renderPage({canGoBackToSearch: true});
      expect(screen.getByRole('button', {name: /Back to search results/})).toBeDefined();
    });

    it('hides "Back to search results" button when canGoBackToSearch is false', () => {
      renderPage({canGoBackToSearch: false});
      expect(screen.queryByRole('button', {name: /Back to search results/})).toBeNull();
    });

    it('calls onBackToSearch when "Back to search results" is clicked', () => {
      const onBackToSearch = vi.fn();
      renderPage({canGoBackToSearch: true, onBackToSearch});

      fireEvent.click(screen.getByRole('button', {name: /Back to search results/}));
      expect(onBackToSearch).toHaveBeenCalledTimes(1);
    });
  });

  describe('Reset button', () => {
    it('is always visible regardless of canGoBackToSearch', () => {
      renderPage({canGoBackToSearch: false});
      expect(screen.getByRole('button', {name: 'Reset'})).toBeDefined();
    });

    it('is visible when canGoBackToSearch is true', () => {
      renderPage({canGoBackToSearch: true});
      expect(screen.getByRole('button', {name: 'Reset'})).toBeDefined();
    });

    it('calls onResetToLanding when clicked', () => {
      const onResetToLanding = vi.fn();
      renderPage({onResetToLanding});

      fireEvent.click(screen.getByRole('button', {name: 'Reset'}));
      expect(onResetToLanding).toHaveBeenCalledTimes(1);
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
