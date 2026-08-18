import {render, screen} from '@testing-library/react';
import {describe, it, expect, vi} from 'vitest';
import type {AgentResponse, ReasoningStep} from '@coveo/thermidor';
import {AgentResponseBlock} from './AgentResponseBlock.js';

vi.mock('./ThinkingBlock.js', () => ({
  ThinkingBlock: ({
    reasoningSteps,
    isStreaming,
  }: {
    reasoningSteps: ReasoningStep[];
    isStreaming: boolean;
  }) => (
    <div
      data-testid="thinking-block"
      data-streaming={isStreaming}
      data-steps={reasoningSteps.length}
    />
  ),
}));

vi.mock('./StreamingMessage.js', () => ({
  StreamingMessage: ({messages}: {messages: {content: string; role: string}[]}) => (
    <div data-testid="streaming-message" data-message-count={messages.length} />
  ),
}));

vi.mock('../../a2ui/Skeleton/Skeleton.js', () => ({
  A2UISkeleton: ({componentType}: {componentType: string}) => (
    <div data-testid="skeleton" data-component-type={componentType} />
  ),
}));

vi.mock('../../a2ui/surfaces.js', () => ({
  getA2UIMessages: () => [],
  ThermidorA2UISurfaces: () => null,
}));

/**
 * Helper to build a surface snapshot that parseSurfaceSnapshots understands.
 * It expects `{messages: [{version: 'v1.0', createSurface: {...}}]}`.
 */
function makeSurfaceSnapshot(
  surfaceId: string,
  componentType: string,
  componentProps: Record<string, unknown> = {}
): Record<string, unknown> {
  return {
    messages: [
      {
        version: 'v1.0',
        createSurface: {
          surfaceId,
          components: [{id: 'root', component: componentType, props: componentProps}],
        },
      },
    ],
  };
}

function createAgentResponse(overrides: Partial<AgentResponse> = {}): AgentResponse {
  return {
    messages: [],
    surfaces: [],
    activities: [],
    state: {},
    reasoningSteps: [],
    ...overrides,
  };
}

function renderBlock(
  agentResponse: AgentResponse = createAgentResponse(),
  overrides: Partial<{
    isStreaming: boolean;
  }> = {}
) {
  const defaultProps = {
    agentResponse,
    isStreaming: false,
    ...overrides,
  };

  return render(<AgentResponseBlock {...defaultProps} />);
}

describe('AgentResponseBlock', () => {
  describe('render order (ThinkingBlock → StreamingMessage → Skeletons)', () => {
    it('renders ThinkingBlock, StreamingMessage, and skeletons in DOM order', () => {
      const agentResponse = createAgentResponse({
        reasoningSteps: [
          {type: 'reasoning', content: 'Thinking...'},
          {
            type: 'tool-call',
            id: 'tc1',
            name: 'store_render_plan',
            args: JSON.stringify({route: 'discovery'}),
            status: 'completed',
          },
        ],
        messages: [{content: 'Hello world', role: 'assistant'}],
      });

      const {container} = renderBlock(agentResponse, {isStreaming: true});

      const allElements = container.querySelectorAll('[data-testid]');
      expect(allElements[0].getAttribute('data-testid')).toBe('thinking-block');
      expect(allElements[1].getAttribute('data-testid')).toBe('streaming-message');
      expect(allElements[2].getAttribute('data-testid')).toBe('skeleton');
      expect(allElements[2].getAttribute('data-component-type')).toBe('ProductCarousel');
    });
  });

  describe('components are omitted when their data is empty', () => {
    it('omits ThinkingBlock when reasoningSteps is empty and not streaming', () => {
      const agentResponse = createAgentResponse({
        messages: [{content: 'Hello', role: 'assistant'}],
      });

      renderBlock(agentResponse, {isStreaming: false});

      expect(screen.queryByTestId('thinking-block')).toBeNull();
      expect(screen.queryByTestId('streaming-message')).not.toBeNull();
    });

    it('shows ThinkingBlock when isStreaming is true even with no reasoning steps', () => {
      renderBlock(createAgentResponse(), {isStreaming: true});
      expect(screen.queryByTestId('thinking-block')).not.toBeNull();
    });

    it('shows ThinkingBlock when reasoningSteps is non-empty even if not streaming', () => {
      const agentResponse = createAgentResponse({
        reasoningSteps: [{type: 'reasoning', content: 'done'}],
      });

      renderBlock(agentResponse, {isStreaming: false});
      expect(screen.queryByTestId('thinking-block')).not.toBeNull();
    });

    it('omits StreamingMessage when messages all have empty content', () => {
      const agentResponse = createAgentResponse({
        messages: [{content: '', role: 'assistant'}],
      });

      renderBlock(agentResponse, {isStreaming: false});
      expect(screen.queryByTestId('streaming-message')).toBeNull();
    });

    it('omits StreamingMessage when messages array is empty', () => {
      renderBlock(createAgentResponse(), {isStreaming: false});
      expect(screen.queryByTestId('streaming-message')).toBeNull();
    });

    it('does not show skeletons when not streaming', () => {
      const agentResponse = createAgentResponse({
        reasoningSteps: [
          {
            type: 'tool-call',
            id: 'tc1',
            name: 'store_render_plan',
            args: JSON.stringify({route: 'discovery'}),
            status: 'completed',
          },
        ],
      });

      renderBlock(agentResponse, {isStreaming: false});
      expect(screen.queryByTestId('skeleton')).toBeNull();
    });

    it('renders nothing except the container when all data is empty and not streaming', () => {
      renderBlock(createAgentResponse(), {isStreaming: false});

      expect(screen.queryByTestId('thinking-block')).toBeNull();
      expect(screen.queryByTestId('streaming-message')).toBeNull();
      expect(screen.queryByTestId('skeleton')).toBeNull();
    });
  });

  describe('skeleton sources', () => {
    it('shows skeletons from store_render_plan tool calls during streaming', () => {
      const agentResponse = createAgentResponse({
        reasoningSteps: [
          {
            type: 'tool-call',
            id: 'tc1',
            name: 'store_render_plan',
            args: JSON.stringify({route: 'bundle'}),
            status: 'calling',
          },
        ],
      });

      renderBlock(agentResponse, {isStreaming: true});

      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton.getAttribute('data-component-type')).toBe('BundleDisplay');
    });

    it('shows skeletons from surfaces with skeleton- prefix (speculative backend support)', () => {
      const agentResponse = createAgentResponse({
        surfaces: [
          makeSurfaceSnapshot('skeleton-comparison', 'ComparisonTable'),
        ] as AgentResponse['surfaces'],
      });

      renderBlock(agentResponse, {isStreaming: true});

      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton.getAttribute('data-component-type')).toBe('ComparisonTable');
    });

    it('shows skeletons from surfaces with isLoading prop (speculative backend support)', () => {
      const agentResponse = createAgentResponse({
        surfaces: [
          makeSurfaceSnapshot('bundle-1', 'BundleDisplay', {isLoading: true}),
        ] as AgentResponse['surfaces'],
      });

      renderBlock(agentResponse, {isStreaming: true});

      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton.getAttribute('data-component-type')).toBe('BundleDisplay');
    });

    it('does not show skeleton when a real surface of same type exists', () => {
      const agentResponse = createAgentResponse({
        surfaces: [
          makeSurfaceSnapshot('carousel-1', 'ProductCarousel'),
        ] as AgentResponse['surfaces'],
        reasoningSteps: [
          {
            type: 'tool-call',
            id: 'tc1',
            name: 'store_render_plan',
            args: JSON.stringify({route: 'discovery'}),
            status: 'completed',
          },
        ],
      });

      renderBlock(agentResponse, {isStreaming: true});
      expect(screen.queryByTestId('skeleton')).toBeNull();
    });
  });
});
