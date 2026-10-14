import {render, screen} from '@testing-library/react';
import {describe, it, expect, vi} from 'vitest';
import type {Turn} from '@coveo/thermidor';
import {ConversationThread} from './ConversationThread.js';
import {makeTurn} from '../../test/turn-fixtures.js';

function createTurn(overrides: {id?: string; prompt?: string; status?: Turn['status']} = {}): Turn {
  return makeTurn({id: 'turn-1', prompt: 'Hello agent', ...overrides});
}

function renderThread(
  turns: Turn[],
  overrides: Partial<Omit<Parameters<typeof ConversationThread>[0], 'turns'>> = {}
) {
  const defaultProps = {
    turns,
    turnRefs: {current: new Map<string, HTMLDivElement>()},
    surfacesByTurn: new Map<string, readonly string[]>(),
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
      const turns = [createTurn({id: 't1', prompt: 'Pending...', status: 'streaming'})];

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

  describe('error rendering', () => {
    function failedTurn(): Turn {
      return makeTurn({
        status: 'error',
        error: 'Service unavailable',
        response: {
          agent: {
            messages: [{content: 'Here are some kayaks', role: 'assistant'}],
            reasoningSteps: [],
          },
        },
      });
    }

    it('renders only the error when the turn failed before any follow-up', () => {
      renderThread([failedTurn()]);

      expect(screen.getByRole('alert').textContent).toBe('Service unavailable');
      expect(screen.queryByText('Here are some kayaks')).toBeNull();
    });

    it('keeps the earlier answer and draws the error after a failed follow-up', () => {
      const turn = failedTurn();
      const followUp = {
        prompt: 'Show more life jackets',
        activityCount: 0,
        messageCount: 1,
        reasoningStepCount: 0,
        surfaceCount: 0,
      };

      renderThread([turn], {followUps: new Map([[turn.id, [followUp]]])});

      expect(screen.getByText('Here are some kayaks')).toBeTruthy();
      expect(screen.getByText('Show more life jackets')).toBeTruthy();
      expect(screen.getByRole('alert').textContent).toBe('Service unavailable');
    });
  });
});
