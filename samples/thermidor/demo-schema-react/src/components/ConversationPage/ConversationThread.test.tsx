import {render, screen} from '@testing-library/react';
import {describe, it, expect, vi} from 'vitest';
import type {Turn} from '@coveo/thermidor';
import {A2UIProvider} from '@copilotkit/a2ui-renderer';
import {ConversationThread} from './ConversationThread.js';
import {makeFollowUpTurn, makeSurfaces, makeTurn} from '../../test/turn-fixtures.js';
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

    it('renders only the error of a failed turn', () => {
      renderThread([failedTurn()]);

      expect(screen.getByRole('alert').textContent).toBe('Service unavailable');
      expect(screen.queryByText('Here are some kayaks')).toBeNull();
    });

    it('keeps the earlier answer and draws the error of a failed follow-up after it', () => {
      const answered = {...failedTurn(), status: 'complete' as const, error: undefined};
      const followUp = makeFollowUpTurn({
        id: 'turn-2',
        text: 'Show more life jackets',
        status: 'error',
        error: 'Service unavailable',
      });

      renderThread([answered, followUp]);

      expect(screen.getByText('Here are some kayaks')).toBeTruthy();
      expect(screen.getByText('Show more life jackets')).toBeTruthy();
      expect(screen.getByRole('alert').textContent).toBe('Service unavailable');
    });
  });

  describe('turns opened by an action', () => {
    it('shows the chip text of a follow-up as the shopper message', () => {
      renderThread([
        makeTurn({id: 'turn-1', prompt: 'kayaks'}),
        makeFollowUpTurn({id: 'turn-2', text: 'Show more life jackets'}),
      ]);

      const followUp = screen.getByRole('article', {name: 'Turn 2'});
      expect(followUp.textContent).toContain('Show more life jackets');
    });

    it('spaces a follow-up from the answer above it, without a separator', () => {
      const {container} = renderThread([
        makeTurn({id: 'turn-1', prompt: 'kayaks'}),
        makeFollowUpTurn({id: 'turn-2', text: 'Show more life jackets'}),
      ]);

      const followUp = screen.getByRole('article', {name: 'Turn 2'});
      expect(container.querySelectorAll('hr')).toHaveLength(0);
      expect(followUp.parentElement?.className).toMatch(/followUp/);
    });

    it('shows the text of a search option as the shopper message', () => {
      renderThread([
        makeTurn({id: 'turn-1', prompt: 'kayaks'}),
        makeFollowUpTurn({id: 'turn-2', text: 'Tandem kayaks', searchOption: true}),
      ]);

      const option = screen.getByRole('article', {name: 'Turn 2'});
      expect(option.textContent).toContain('Tandem kayaks');
    });
  });

  describe('loading placeholders', () => {
    const placeholders = new Map([
      ['first-1', 'ProductCarousel'],
      ['second-2', 'ProductCarousel'],
    ]);

    function renderPlaceholders(turns: Turn[]) {
      return render(
        <A2UIProvider catalog={createThermidorCatalog()} onAction={() => {}}>
          <ThermidorA2UIStream messages={[]} loadingSurfaces={placeholders}>
            <ConversationThread
              turns={turns}
              turnRefs={{current: new Map<string, HTMLDivElement>()}}
            />
          </ThermidorA2UIStream>
        </A2UIProvider>
      );
    }

    function withSurfaces(turn: Turn, ...surfaceIds: string[]): Turn {
      return {...turn, response: {...turn.response, surfaces: makeSurfaces(...surfaceIds)}};
    }

    function placeholderRegion(surfaceId: string) {
      return screen.queryByRole('region', {name: `A2-UI surface ${surfaceId}`});
    }

    it('draws the placeholders of a streaming turn', () => {
      renderPlaceholders([withSurfaces(createTurn({status: 'streaming'}), 'first-1')]);

      expect(placeholderRegion('first-1')).not.toBeNull();
    });

    it('draws nothing for the placeholders a completed turn left behind', () => {
      renderPlaceholders([withSurfaces(createTurn({status: 'complete'}), 'first-1')]);

      expect(placeholderRegion('first-1')).toBeNull();
    });

    it('draws only the placeholders of the follow-up in flight', () => {
      renderPlaceholders([
        withSurfaces(createTurn({status: 'complete'}), 'first-1'),
        withSurfaces(
          makeFollowUpTurn({id: 'turn-2', text: 'Show more', status: 'streaming'}),
          'second-2'
        ),
      ]);

      expect(placeholderRegion('first-1')).toBeNull();
      expect(placeholderRegion('second-2')).not.toBeNull();
    });
  });
});
