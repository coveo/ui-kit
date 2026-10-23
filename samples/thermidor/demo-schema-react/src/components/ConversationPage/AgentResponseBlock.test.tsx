import {render, screen} from '@testing-library/react';
import {describe, it, expect, vi} from 'vitest';
import type {ReasoningStep, TurnResponse} from '@coveo/thermidor';
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

interface AgentContent {
  messages?: {content: string; role: string}[];
  reasoningSteps?: ReasoningStep[];
}

function makeAgentResponse(overrides: AgentContent = {}): TurnResponse {
  const {messages = [], reasoningSteps = []} = overrides;
  return makeResponse({agent: {messages, reasoningSteps}});
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
  describe('render order (ThinkingBlock → StreamingMessage → turn blocks)', () => {
    it('renders ThinkingBlock, StreamingMessage, and the turn blocks in DOM order', () => {
      const response = makeAgentResponse({
        reasoningSteps: [{type: 'reasoning', content: 'Thinking...'}],
        messages: [{content: 'Hello world', role: 'assistant'}],
      });

      const {container} = render(
        <AgentResponseBlock response={response} isStreaming>
          <div data-testid="turn-blocks" />
        </AgentResponseBlock>
      );

      const allElements = container.querySelectorAll('[data-testid]');
      expect([...allElements].map((element) => element.getAttribute('data-testid'))).toEqual([
        'thinking-block',
        'streaming-message',
        'turn-blocks',
      ]);
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

    it('renders nothing except the container when all data is empty and not streaming', () => {
      renderBlock(makeAgentResponse(), {isStreaming: false});

      expect(screen.queryByTestId('thinking-block')).toBeNull();
      expect(screen.queryByTestId('streaming-message')).toBeNull();
    });
  });

  describe('turn blocks', () => {
    it('draws the turn blocks after the agent text', () => {
      render(
        <AgentResponseBlock
          response={makeResponse({
            agent: {messages: [{content: 'Answer', role: 'assistant'}], reasoningSteps: []},
          })}
          isStreaming={false}
        >
          <div data-testid="turn-blocks" />
        </AgentResponseBlock>
      );

      const message = screen.getByTestId('streaming-message');
      const blocks = screen.getByTestId('turn-blocks');
      expect(
        message.compareDocumentPosition(blocks) & Node.DOCUMENT_POSITION_FOLLOWING
      ).toBeTruthy();
    });
  });
});
