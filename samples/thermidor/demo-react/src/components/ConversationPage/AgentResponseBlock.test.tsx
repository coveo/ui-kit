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

vi.mock('../../a2ui/SurfaceRenderer/SurfaceRenderer.js', () => ({
  SurfaceRenderer: ({
    surfaces,
    onAction,
  }: {
    surfaces: unknown[];
    onAction?: (text: string, type: string) => void;
  }) => (
    <div
      data-testid="surface-renderer"
      data-surface-count={surfaces.length}
      onClick={() => onAction?.('clicked', 'action')}
    />
  ),
}));

function createAgentResponse(overrides: Partial<AgentResponse> = {}): AgentResponse {
  return {
    messages: [],
    surfaces: [],
    reasoningSteps: [],
    ...overrides,
  };
}

function renderBlock(
  agentResponse: AgentResponse = createAgentResponse(),
  overrides: Partial<{
    isStreaming: boolean;
    onAction: (text: string, type: string) => void;
  }> = {}
) {
  const defaultProps = {
    agentResponse,
    isStreaming: false,
    onAction: vi.fn(),
    ...overrides,
  };

  return render(<AgentResponseBlock {...defaultProps} />);
}

describe('AgentResponseBlock', () => {
  describe('correct render order (ThinkingBlock → StreamingMessage → SurfaceRenderer)', () => {
    it('renders all three sub-components in DOM order when all data is present', () => {
      const agentResponse = createAgentResponse({
        reasoningSteps: [{type: 'reasoning', content: 'Thinking...'}],
        messages: [{content: 'Hello world', role: 'assistant'}],
        surfaces: [{componentType: 'ProductCarousel'}],
      });

      const {container} = renderBlock(agentResponse, {isStreaming: true});

      const thinkingBlock = container.querySelector('[data-testid="thinking-block"]');
      const streamingMessage = container.querySelector('[data-testid="streaming-message"]');
      const surfaceRenderer = container.querySelector('[data-testid="surface-renderer"]');

      expect(thinkingBlock).not.toBeNull();
      expect(streamingMessage).not.toBeNull();
      expect(surfaceRenderer).not.toBeNull();

      const allElements = container.querySelectorAll('[data-testid]');
      expect(allElements[0].getAttribute('data-testid')).toBe('thinking-block');
      expect(allElements[1].getAttribute('data-testid')).toBe('streaming-message');
      expect(allElements[2].getAttribute('data-testid')).toBe('surface-renderer');
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
      const agentResponse = createAgentResponse();

      renderBlock(agentResponse, {isStreaming: true});

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
      const agentResponse = createAgentResponse({
        messages: [],
      });

      renderBlock(agentResponse, {isStreaming: false});

      expect(screen.queryByTestId('streaming-message')).toBeNull();
    });

    it('omits SurfaceRenderer when surfaces array is empty', () => {
      const agentResponse = createAgentResponse({
        surfaces: [],
      });

      renderBlock(agentResponse, {isStreaming: false});

      expect(screen.queryByTestId('surface-renderer')).toBeNull();
    });

    it('renders nothing except the container when all data is empty and not streaming', () => {
      const agentResponse = createAgentResponse();

      renderBlock(agentResponse, {isStreaming: false});

      expect(screen.queryByTestId('thinking-block')).toBeNull();
      expect(screen.queryByTestId('streaming-message')).toBeNull();
      expect(screen.queryByTestId('surface-renderer')).toBeNull();
    });
  });

  describe('onAction prop is passed through to SurfaceRenderer', () => {
    it('passes onAction to SurfaceRenderer which can be triggered', () => {
      const onAction = vi.fn();
      const agentResponse = createAgentResponse({
        surfaces: [{componentType: 'NextActionsBar'}],
      });

      renderBlock(agentResponse, {onAction});

      const surfaceRenderer = screen.getByTestId('surface-renderer');
      surfaceRenderer.click();

      expect(onAction).toHaveBeenCalledWith('clicked', 'action');
    });
  });
});
