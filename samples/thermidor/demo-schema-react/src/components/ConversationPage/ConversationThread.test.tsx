import {render, screen} from '@testing-library/react';
import {describe, it, expect, vi} from 'vitest';
import type {Turn} from '@coveo/thermidor';
import {A2UIProvider} from '@copilotkit/a2ui-renderer';
import {ConversationThread} from './ConversationThread.js';
import {makeTurn} from '../../test/turn-fixtures.js';
import {createThermidorCatalog} from '../../a2ui/components.js';
import {ThermidorA2UIStream} from '../../a2ui/surfaces.js';

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

  describe('loading placeholders', () => {
    const placeholders = new Map([
      ['turn-1/first', 'ProductCarousel'],
      ['turn-1/second', 'ProductCarousel'],
    ]);
    const followUp = {
      prompt: 'Show more',
      activityCount: 0,
      messageCount: 0,
      reasoningStepCount: 0,
      surfaceCount: 1,
    };

    function renderPlaceholders(
      turn: Turn,
      overrides: Partial<Omit<Parameters<typeof ConversationThread>[0], 'turns'>> = {}
    ) {
      return render(
        <A2UIProvider catalog={createThermidorCatalog()} onAction={() => {}}>
          <ThermidorA2UIStream messages={[]} loadingSurfaces={placeholders}>
            <ConversationThread
              turns={[turn]}
              turnRefs={{current: new Map<string, HTMLDivElement>()}}
              surfacesByTurn={new Map([[turn.id, ['turn-1/first', 'turn-1/second']]])}
              {...overrides}
            />
          </ThermidorA2UIStream>
        </A2UIProvider>
      );
    }

    function placeholderRegion(surfaceId: string) {
      return screen.queryByRole('region', {name: `A2-UI surface ${surfaceId}`});
    }

    it('draws the placeholders of a streaming turn', () => {
      renderPlaceholders(createTurn({status: 'streaming'}));

      expect(placeholderRegion('turn-1/first')).not.toBeNull();
      expect(placeholderRegion('turn-1/second')).not.toBeNull();
    });

    it('draws nothing for the placeholders a completed turn left behind', () => {
      renderPlaceholders(createTurn({status: 'complete'}));

      expect(placeholderRegion('turn-1/first')).toBeNull();
      expect(placeholderRegion('turn-1/second')).toBeNull();
    });

    it('draws only the placeholders of the follow-up in flight', () => {
      const turn = createTurn({status: 'complete'});

      renderPlaceholders(turn, {
        followUps: new Map([[turn.id, [followUp]]]),
        pendingTurnId: turn.id,
      });

      expect(placeholderRegion('turn-1/first')).toBeNull();
      expect(placeholderRegion('turn-1/second')).not.toBeNull();
    });
  });
});
