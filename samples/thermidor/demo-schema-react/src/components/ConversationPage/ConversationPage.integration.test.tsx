import {render, screen} from '@testing-library/react';
import {describe, it, expect, vi} from 'vitest';
import type {Turn} from '@coveo/thermidor';
import {ConversationPage} from './ConversationPage.js';
import {makeTurn} from '../../test/turn-fixtures.js';

// The blocks are drawn by the A2-UI renderer; the page only decides where each turn's blocks go
// and whether they are interactive.
vi.mock('../../a2ui/surfaces.js', () => ({
  TurnSurfaces: ({surfaceIds, interactive}: {surfaceIds: string[]; interactive: boolean}) =>
    surfaceIds.length === 0 ? null : (
      <div data-testid="turn-surfaces" data-interactive={String(interactive)}>
        {surfaceIds.join(',')}
      </div>
    ),
}));

function renderPage(overrides: Partial<Parameters<typeof ConversationPage>[0]> = {}) {
  const defaultProps = {
    onSubmit: vi.fn(),
    isStreaming: false,
    turns: [] as Turn[],
    surfacesByTurn: new Map<string, readonly string[]>(),
  };

  return {
    props: {...defaultProps, ...overrides},
    ...render(<ConversationPage {...defaultProps} {...overrides} />),
  };
}

describe('ConversationPage integration', () => {
  describe('multi-turn conversation rendering', () => {
    it('renders a mix of agent turns, search turns, and error turns', () => {
      const turns: Turn[] = [
        makeTurn({
          id: 'turn-1',
          prompt: 'Find me running shoes',
          response: {
            agent: {
              messages: [{content: 'Here are some running shoes.', role: 'assistant'}],
              reasoningSteps: [{type: 'reasoning', content: 'Looking up running shoes'}],
            },
          },
        }),
        makeTurn({
          id: 'turn-2',
          prompt: 'Show me results',
        }),
        makeTurn({
          id: 'turn-3',
          prompt: 'What about hiking boots?',
          status: 'error',
          error: 'Service unavailable',
        }),
      ];

      renderPage({turns, surfacesByTurn: new Map([['turn-2', ['turn-2/ui-search']]])});

      expect(screen.getByText('Find me running shoes')).toBeDefined();
      expect(screen.getByText('Here are some running shoes.')).toBeDefined();

      expect(screen.getByText('Show me results')).toBeDefined();
      expect(screen.getByTestId('turn-surfaces').textContent).toBe('turn-2/ui-search');

      expect(screen.getByText('What about hiking boots?')).toBeDefined();
      expect(screen.getByText('Service unavailable')).toBeDefined();
    });

    it('draws an agent answer and the search block its option opened in the same turn', () => {
      const turns: Turn[] = [
        makeTurn({
          id: 'turn-1',
          prompt: 'Recommend waterproof trail shoes',
          response: {
            agent: {
              messages: [{content: 'Here are a few directions.', role: 'assistant'}],
              reasoningSteps: [],
            },
          },
        }),
      ];

      renderPage({
        turns,
        surfacesByTurn: new Map([['turn-1', ['turn-1/agent-answer', 'turn-1/ui-search']]]),
      });

      expect(screen.getByText('Here are a few directions.')).toBeDefined();
      expect(screen.getByTestId('turn-surfaces').textContent).toBe(
        'turn-1/agent-answer,turn-1/ui-search'
      );
    });

    it('keeps only the latest turn interactive', () => {
      const turns: Turn[] = [
        makeTurn({id: 'turn-1', prompt: 'kayaks'}),
        makeTurn({id: 'turn-2', prompt: 'which are best for rivers?'}),
      ];

      renderPage({
        turns,
        surfacesByTurn: new Map([
          ['turn-1', ['turn-1/ui-search']],
          ['turn-2', ['turn-2/agent-answer']],
        ]),
      });

      expect(
        screen.getAllByTestId('turn-surfaces').map((block) => block.dataset['interactive'])
      ).toEqual(['false', 'true']);
    });

    it('draws a follow-up as its own exchange after the answer it follows', () => {
      const turns: Turn[] = [
        makeTurn({
          id: 'turn-1',
          prompt: 'boating safety',
          response: {
            agent: {
              messages: [
                {content: 'Here is the safety gear.', role: 'assistant'},
                {content: 'Here are more Mustang Survival jackets.', role: 'assistant'},
              ],
              reasoningSteps: [],
            },
          },
        }),
      ];

      renderPage({
        turns,
        surfacesByTurn: new Map([['turn-1', ['turn-1/agent-a', 'turn-1/agent-b']]]),
        followUps: new Map([
          [
            'turn-1',
            [
              {
                prompt: 'Show more Mustang Survival life jackets',
                activityCount: 0,
                messageCount: 1,
                reasoningStepCount: 0,
                surfaceCount: 1,
              },
            ],
          ],
        ]),
      });

      const article = screen.getByRole('article', {name: 'Turn 1'});
      const order = [
        'Here is the safety gear.',
        'turn-1/agent-a',
        'Show more Mustang Survival life jackets',
        'Here are more Mustang Survival jackets.',
        'turn-1/agent-b',
      ].map((text) => article.textContent!.indexOf(text));
      expect(order.every((position) => position >= 0)).toBe(true);
      expect([...order].sort((x, y) => x - y)).toEqual(order);
    });

    it('shows the reasoning indicator while a follow-up is in flight', () => {
      const turns: Turn[] = [
        makeTurn({
          id: 'turn-1',
          prompt: 'boating safety',
          response: {
            agent: {
              messages: [{content: 'Here is the safety gear.', role: 'assistant'}],
              reasoningSteps: [],
            },
          },
        }),
      ];

      renderPage({
        turns,
        followUps: new Map([
          [
            'turn-1',
            [
              {
                prompt: 'Show more',
                activityCount: 0,
                messageCount: 1,
                reasoningStepCount: 0,
                surfaceCount: 0,
              },
            ],
          ],
        ]),
        pendingTurnId: 'turn-1',
      });

      expect(screen.getByText('Working')).toBeDefined();
    });

    it('renders separators between turns but not after the last turn', () => {
      const turns: Turn[] = [
        makeTurn({
          id: 'turn-1',
          prompt: 'First question',
          response: {
            agent: {messages: [{content: 'First answer', role: 'assistant'}], reasoningSteps: []},
          },
        }),
        makeTurn({
          id: 'turn-2',
          prompt: 'Second question',
          response: {
            agent: {messages: [{content: 'Second answer', role: 'assistant'}], reasoningSteps: []},
          },
        }),
      ];

      const {container} = renderPage({turns});

      const separators = container.querySelectorAll('hr');
      expect(separators.length).toBe(1);
    });
  });

  describe('streaming state', () => {
    it('disables prompt input and shows thinking dots when streaming with no response yet', () => {
      const turns: Turn[] = [
        makeTurn({id: 'turn-1', prompt: 'Tell me about shoes', status: 'streaming'}),
      ];

      renderPage({turns, isStreaming: true});

      const textarea = screen.getByLabelText('Prompt') as HTMLTextAreaElement;
      expect(textarea.disabled).toBe(true);

      expect(screen.getByText(/Working/)).toBeDefined();
    });

    it('shows thinking block with reasoning steps during streaming', () => {
      const turns: Turn[] = [
        makeTurn({
          id: 'turn-1',
          prompt: 'Compare these products',
          status: 'streaming',
          response: {
            agent: {
              messages: [],
              reasoningSteps: [
                {type: 'reasoning', content: 'Analyzing products...'},
                {
                  type: 'tool-call',
                  id: 'tc-1',
                  name: 'product_search',
                  args: '{"query":"shoes"}',
                  status: 'calling',
                },
              ],
            },
          },
        }),
      ];

      renderPage({turns, isStreaming: true});

      expect(screen.getByText(/Calling tool:/)).toBeDefined();
    });
  });
});
