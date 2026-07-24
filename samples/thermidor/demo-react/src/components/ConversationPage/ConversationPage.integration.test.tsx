import {render, screen, fireEvent} from '@testing-library/react';
import {describe, it, expect, vi} from 'vitest';
import type {Turn} from '@coveo/thermidor';
import {ConversationPage} from './ConversationPage.js';

function renderPage(
  overrides: Partial<Parameters<typeof ConversationPage>[0]> = {}
) {
  const defaultProps = {
    onSubmit: vi.fn(),
    isStreaming: false,
    turns: [] as Turn[],
    onBackToSearch: vi.fn(),
    canGoBackToSearch: false,
    onResetToLanding: vi.fn(),
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
        {
          id: 'turn-1',
          prompt: 'Find me running shoes',
          status: 'complete',
          agentResponse: {
            messages: [
              {content: 'Here are some running shoes.', role: 'assistant'},
            ],
            surfaces: [],
            reasoningSteps: [
              {type: 'reasoning', content: 'Looking up running shoes'},
            ],
          },
        },
        {
          id: 'turn-2',
          prompt: 'Show me results',
          status: 'complete',
          routedInterface: {
            interface: {dispose: vi.fn()},
          } as unknown as Turn['routedInterface'],
        },
        {
          id: 'turn-3',
          prompt: 'What about hiking boots?',
          status: 'error',
          error: 'Service unavailable',
        },
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
        {
          id: 'turn-1',
          prompt: 'First question',
          status: 'complete',
          agentResponse: {
            messages: [{content: 'First answer', role: 'assistant'}],
            surfaces: [],
            reasoningSteps: [],
          },
        },
        {
          id: 'turn-2',
          prompt: 'Second question',
          status: 'complete',
          agentResponse: {
            messages: [{content: 'Second answer', role: 'assistant'}],
            surfaces: [],
            reasoningSteps: [],
          },
        },
      ];

      const {container} = renderPage({turns});

      const separators = container.querySelectorAll('hr');
      expect(separators.length).toBe(1);
    });
  });

  describe('streaming state', () => {
    it('disables prompt input and shows thinking dots when streaming with no response yet', () => {
      const turns: Turn[] = [
        {
          id: 'turn-1',
          prompt: 'Tell me about shoes',
          status: 'streaming',
        },
      ];

      renderPage({turns, isStreaming: true});

      const textarea = screen.getByLabelText('Prompt') as HTMLTextAreaElement;
      expect(textarea.disabled).toBe(true);

      expect(screen.getByLabelText('Processing').textContent).toContain(
        'Working'
      );
    });

    it('shows thinking block with reasoning steps during streaming', () => {
      const turns: Turn[] = [
        {
          id: 'turn-1',
          prompt: 'Compare these products',
          status: 'streaming',
          agentResponse: {
            messages: [],
            surfaces: [],
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
      ];

      renderPage({turns, isStreaming: true});

      expect(screen.getByLabelText('In progress')).toBeDefined();
    });
  });

  describe('Back to search results visibility', () => {
    it('shows "Back to search results" when canGoBackToSearch is true', () => {
      const turns: Turn[] = [
        {id: 'turn-1', prompt: 'Hello', status: 'complete'},
      ];

      renderPage({turns, canGoBackToSearch: true});
      expect(
        screen.getByRole('button', {name: /Back to search results/})
      ).toBeDefined();
    });

    it('hides "Back to search results" when canGoBackToSearch is false', () => {
      const turns: Turn[] = [
        {id: 'turn-1', prompt: 'Hello', status: 'complete'},
      ];

      renderPage({turns, canGoBackToSearch: false});
      expect(
        screen.queryByRole('button', {name: /Back to search results/})
      ).toBeNull();
    });

    it('calls onBackToSearch when the button is clicked', () => {
      const onBackToSearch = vi.fn();
      const turns: Turn[] = [
        {id: 'turn-1', prompt: 'Hello', status: 'complete'},
      ];

      renderPage({turns, canGoBackToSearch: true, onBackToSearch});
      fireEvent.click(
        screen.getByRole('button', {name: /Back to search results/})
      );
      expect(onBackToSearch).toHaveBeenCalledTimes(1);
    });
  });

  describe('Reset button', () => {
    it('is always visible regardless of canGoBackToSearch', () => {
      const turns: Turn[] = [
        {id: 'turn-1', prompt: 'Hello', status: 'complete'},
      ];

      renderPage({turns, canGoBackToSearch: false});
      expect(screen.getByRole('button', {name: 'Reset'})).toBeDefined();
    });

    it('is visible when canGoBackToSearch is true', () => {
      const turns: Turn[] = [
        {id: 'turn-1', prompt: 'Hello', status: 'complete'},
      ];

      renderPage({turns, canGoBackToSearch: true});
      expect(screen.getByRole('button', {name: 'Reset'})).toBeDefined();
    });

    it('calls onResetToLanding when clicked', () => {
      const onResetToLanding = vi.fn();
      const turns: Turn[] = [
        {id: 'turn-1', prompt: 'Hello', status: 'complete'},
      ];

      renderPage({turns, onResetToLanding});
      fireEvent.click(screen.getByRole('button', {name: 'Reset'}));
      expect(onResetToLanding).toHaveBeenCalledTimes(1);
    });
  });

  describe('NextActionsBar button click submits through onSubmit', () => {
    it('calls onSubmit with the action text when a next-action button is clicked', () => {
      const onSubmit = vi.fn();
      const nextActionsSurface = {
        operations: [
          {
            beginRendering: {
              surfaceId: 'surface-actions',
              root: 'root-1',
            },
          },
          {
            surfaceUpdate: {
              surfaceId: 'surface-actions',
              components: [
                {
                  id: 'comp-1',
                  component: {
                    NextActionsBar: {
                      actions: [{text: 'Show more', type: 'prompt'}],
                    },
                  },
                },
              ],
            },
          },
          {
            dataModelUpdate: {
              surfaceId: 'surface-actions',
              contents: [
                {
                  key: 'actions',
                  valueMap: [
                    {
                      valueMap: [
                        {key: 'text', valueString: 'Show more'},
                        {key: 'type', valueString: 'prompt'},
                      ],
                    },
                  ],
                },
              ],
            },
          },
        ],
      };

      const turns: Turn[] = [
        {
          id: 'turn-1',
          prompt: 'Tell me about shoes',
          status: 'complete',
          agentResponse: {
            messages: [{content: 'Here is some info.', role: 'assistant'}],
            surfaces: [
              nextActionsSurface as unknown as Record<string, unknown>,
            ],
            reasoningSteps: [],
          },
        },
      ];

      renderPage({turns, onSubmit});

      const actionButton = screen.getByRole('button', {name: 'Show more'});
      fireEvent.click(actionButton);

      expect(onSubmit).toHaveBeenCalledWith('Show more');
    });
  });
});
