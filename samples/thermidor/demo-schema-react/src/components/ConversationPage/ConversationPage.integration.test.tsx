import {render, screen, fireEvent} from '@testing-library/react';
import {describe, it, expect, vi} from 'vitest';
import type {Turn} from '@coveo/thermidor';
import {ConversationPage} from './ConversationPage.js';
import {makeTurn, makeSurface} from '../../test/turn-fixtures.js';

function renderPage(overrides: Partial<Parameters<typeof ConversationPage>[0]> = {}) {
  const defaultProps = {
    onSubmit: vi.fn(),
    isStreaming: false,
    turns: [] as Turn[],
    onBackToSearch: vi.fn(),
    canGoBackToSearch: false,
    products: [],
    onProductsChange: vi.fn(),
  };

  return {
    props: {...defaultProps, ...overrides},
    ...render(<ConversationPage {...defaultProps} {...overrides} />),
  };
}

describe('ConversationPage integration', () => {
  describe('multi-turn conversation rendering', () => {
    it('renders a mix of agent turns, routed turns, and error turns', () => {
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
          response: {surfaces: [makeSurface('s1', 'commerce-search')]},
        }),
        makeTurn({
          id: 'turn-3',
          prompt: 'What about hiking boots?',
          status: 'error',
          error: 'Service unavailable',
        }),
      ];

      renderPage({turns});

      expect(screen.getByText('Find me running shoes')).toBeDefined();
      expect(screen.getByText('Here are some running shoes.')).toBeDefined();

      expect(screen.getByText('Show me results')).toBeDefined();
      expect(screen.getByText('Search results updated.')).toBeDefined();

      expect(screen.getByText('What about hiking boots?')).toBeDefined();
      expect(screen.getByText('Service unavailable')).toBeDefined();
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

  describe('Back to search results visibility', () => {
    it('shows "Back to search results" when canGoBackToSearch is true', () => {
      const turns: Turn[] = [makeTurn({id: 'turn-1', prompt: 'Hello'})];

      renderPage({turns, canGoBackToSearch: true});
      expect(screen.getByRole('button', {name: /Back to search results/})).toBeDefined();
    });

    it('hides "Back to search results" when canGoBackToSearch is false', () => {
      const turns: Turn[] = [makeTurn({id: 'turn-1', prompt: 'Hello'})];

      renderPage({turns, canGoBackToSearch: false});
      expect(screen.queryByRole('button', {name: /Back to search results/})).toBeNull();
    });

    it('calls onBackToSearch when the button is clicked', () => {
      const onBackToSearch = vi.fn();
      const turns: Turn[] = [makeTurn({id: 'turn-1', prompt: 'Hello'})];

      renderPage({turns, canGoBackToSearch: true, onBackToSearch});
      fireEvent.click(screen.getByRole('button', {name: /Back to search results/}));
      expect(onBackToSearch).toHaveBeenCalledTimes(1);
    });
  });
});
