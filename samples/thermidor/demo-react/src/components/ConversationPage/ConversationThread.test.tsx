import {render, screen} from '@testing-library/react';
import {describe, it, expect, vi} from 'vitest';
import type {Turn} from '@coveo/thermidor';
import {ConversationThread} from './ConversationThread.js';

function createTurn(overrides: Partial<Turn> = {}): Turn {
  return {
    id: 'turn-1',
    prompt: 'Hello agent',
    status: 'complete',
    ...overrides,
  };
}

function renderThread(
  turns: Turn[],
  overrides: Partial<
    Omit<Parameters<typeof ConversationThread>[0], 'turns'>
  > = {}
) {
  const defaultProps = {
    turns,
    isStreaming: false,
    onAction: vi.fn(),
    turnRefs: {current: new Map<string, HTMLDivElement>()},
  };

  return render(<ConversationThread {...defaultProps} {...overrides} />);
}

describe('ConversationThread', () => {
  describe('UserPromptBubble rendering', () => {
    it('renders a UserPromptBubble for every turn', () => {
      const turns = [
        createTurn({id: 't1', prompt: 'First question'}),
        createTurn({id: 't2', prompt: 'Second question'}),
        createTurn({id: 't3', prompt: 'Third question'}),
      ];

      renderThread(turns);

      expect(screen.getByText('First question')).toBeDefined();
      expect(screen.getByText('Second question')).toBeDefined();
      expect(screen.getByText('Third question')).toBeDefined();
    });

    it('renders a UserPromptBubble even for streaming turns without a response', () => {
      const turns = [
        createTurn({id: 't1', prompt: 'Pending...', status: 'streaming'}),
      ];

      renderThread(turns);

      expect(screen.getByText('Pending...')).toBeDefined();
    });
  });

  describe('TurnSeparator rendering', () => {
    it('renders a separator between consecutive turns', () => {
      const turns = [
        createTurn({id: 't1', prompt: 'First'}),
        createTurn({id: 't2', prompt: 'Second'}),
      ];

      const {container} = renderThread(turns);

      const separators = container.querySelectorAll('hr');
      expect(separators.length).toBe(1);
    });

    it('does not render a separator after the last turn', () => {
      const turns = [
        createTurn({id: 't1', prompt: 'First'}),
        createTurn({id: 't2', prompt: 'Second'}),
        createTurn({id: 't3', prompt: 'Third'}),
      ];

      const {container} = renderThread(turns);

      const separators = container.querySelectorAll('hr');
      expect(separators.length).toBe(2);
    });

    it('does not render any separator for a single turn', () => {
      const turns = [createTurn({id: 't1', prompt: 'Only turn'})];

      const {container} = renderThread(turns);

      const separators = container.querySelectorAll('hr');
      expect(separators.length).toBe(0);
    });
  });
});
