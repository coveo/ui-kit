import {render, screen} from '@testing-library/react';
import {describe, it, expect, vi} from 'vitest';
import type {Activity, ReasoningStep, TurnResponse} from '@coveo/thermidor';
import {AgentResponseBlock} from './AgentResponseBlock.js';
import {makeResponse} from '../../test/turn-fixtures.js';

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
 * Builds an `a2ui-surface` activity whose payload is a v1.0 createSurface
 * snapshot that `parseSurfaceSnapshots` understands. Skeleton derivation reads
 * these raw snapshots off `response.activities`.
 */
function makeSurfaceActivity(
  surfaceId: string,
  componentType: string,
  componentProps: Record<string, unknown> = {}
): Activity {
  return {
    id: `activity-${surfaceId}`,
    kind: 'a2ui-surface',
    replace: true,
    payload: {
      messages: [
        {
          version: 'v1.0',
          createSurface: {
            surfaceId,
            components: [{id: 'root', component: componentType, props: componentProps}],
          },
        },
      ],
    },
  };
}

interface AgentContent {
  messages?: {content: string; role: string}[];
  reasoningSteps?: ReasoningStep[];
}

function makeAgentResponse(overrides: {activities?: Activity[]} & AgentContent = {}): TurnResponse {
  const {activities = [], messages = [], reasoningSteps = []} = overrides;
  return makeResponse({
    activities,
    agent: {messages, reasoningSteps},
  });
}

function renderBlock(
  response: TurnResponse = makeAgentResponse(),
  overrides: Partial<{
    isStreaming: boolean;
  }> = {}
) {
  const defaultProps = {
    response,
    isStreaming: false,
    ...overrides,
  };

  return render(<AgentResponseBlock {...defaultProps} />);
}

describe('AgentResponseBlock', () => {
  describe('render order (ThinkingBlock → StreamingMessage → Skeletons)', () => {
    it('renders ThinkingBlock, StreamingMessage, and skeletons in DOM order', () => {
      const response = makeAgentResponse({
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

      const {container} = renderBlock(response, {isStreaming: true});

      const allElements = container.querySelectorAll('[data-testid]');
      expect(allElements[0].getAttribute('data-testid')).toBe('thinking-block');
      expect(allElements[1].getAttribute('data-testid')).toBe('streaming-message');
      expect(allElements[2].getAttribute('data-testid')).toBe('skeleton');
      expect(allElements[2].getAttribute('data-component-type')).toBe('ProductCarousel');
    });
  });

  describe('components are omitted when their data is empty', () => {
    it('omits ThinkingBlock when reasoningSteps is empty and not streaming', () => {
      const response = makeAgentResponse({
        messages: [{content: 'Hello', role: 'assistant'}],
      });

      renderBlock(response, {isStreaming: false});

      expect(screen.queryByTestId('thinking-block')).toBeNull();
      expect(screen.queryByTestId('streaming-message')).not.toBeNull();
    });

    it('shows ThinkingBlock when isStreaming is true even with no reasoning steps', () => {
      renderBlock(makeAgentResponse(), {isStreaming: true});
      expect(screen.queryByTestId('thinking-block')).not.toBeNull();
    });

    it('shows ThinkingBlock when reasoningSteps is non-empty even if not streaming', () => {
      const response = makeAgentResponse({
        reasoningSteps: [{type: 'reasoning', content: 'done'}],
      });

      renderBlock(response, {isStreaming: false});
      expect(screen.queryByTestId('thinking-block')).not.toBeNull();
    });

    it('omits StreamingMessage when messages all have empty content', () => {
      const response = makeAgentResponse({
        messages: [{content: '', role: 'assistant'}],
      });

      renderBlock(response, {isStreaming: false});
      expect(screen.queryByTestId('streaming-message')).toBeNull();
    });

    it('omits StreamingMessage when messages array is empty', () => {
      renderBlock(makeAgentResponse(), {isStreaming: false});
      expect(screen.queryByTestId('streaming-message')).toBeNull();
    });

    it('does not show skeletons when not streaming', () => {
      const response = makeAgentResponse({
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

      renderBlock(response, {isStreaming: false});
      expect(screen.queryByTestId('skeleton')).toBeNull();
    });

    it('renders nothing except the container when all data is empty and not streaming', () => {
      renderBlock(makeAgentResponse(), {isStreaming: false});

      expect(screen.queryByTestId('thinking-block')).toBeNull();
      expect(screen.queryByTestId('streaming-message')).toBeNull();
      expect(screen.queryByTestId('skeleton')).toBeNull();
    });
  });

  describe('skeleton sources', () => {
    it('shows skeletons from store_render_plan tool calls during streaming', () => {
      const response = makeAgentResponse({
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

      renderBlock(response, {isStreaming: true});

      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton.getAttribute('data-component-type')).toBe('BundleDisplay');
    });

    it('shows skeletons from surface activities with skeleton- prefix (speculative backend support)', () => {
      const response = makeAgentResponse({
        activities: [makeSurfaceActivity('skeleton-comparison', 'ComparisonTable')],
      });

      renderBlock(response, {isStreaming: true});

      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton.getAttribute('data-component-type')).toBe('ComparisonTable');
    });

    it('shows skeletons from surface activities with isLoading prop (speculative backend support)', () => {
      const response = makeAgentResponse({
        activities: [makeSurfaceActivity('bundle-1', 'BundleDisplay', {isLoading: true})],
      });

      renderBlock(response, {isStreaming: true});

      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton.getAttribute('data-component-type')).toBe('BundleDisplay');
    });

    it('does not show skeleton when a real surface of same type exists', () => {
      const response = makeAgentResponse({
        activities: [makeSurfaceActivity('carousel-1', 'ProductCarousel')],
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

      renderBlock(response, {isStreaming: true});
      expect(screen.queryByTestId('skeleton')).toBeNull();
    });
  });
});
