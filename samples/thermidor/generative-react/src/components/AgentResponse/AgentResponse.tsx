import {StreamingMessage} from '../StreamingMessage/StreamingMessage.js';
import {ThinkingBlock} from '../ThinkingBlock/ThinkingBlock.js';
import {SurfaceRenderer} from '../../a2ui/SurfaceRenderer/SurfaceRenderer.js';
import styles from './AgentResponse.module.css';

interface AgentResponseData {
  messages: {content: string; role: string}[];
  surfaces: Record<string, unknown>[];
  toolCalls: {
    id: string;
    name: string;
    args: string;
    result?: string;
    status: 'calling' | 'completed';
  }[];
}

export interface AgentResponseProps {
  agentResponse: AgentResponseData;
  isStreaming: boolean;
  onAction?: (text: string, type: string) => void;
}

export function AgentResponse({
  agentResponse,
  isStreaming,
  onAction,
}: AgentResponseProps) {
  const {messages, toolCalls, surfaces} = agentResponse;

  const hasContent =
    messages.length > 0 || toolCalls.length > 0 || surfaces.length > 0;

  if (!hasContent) {
    return isStreaming ? (
      <div className={styles.container}>
        <TypingIndicator />
      </div>
    ) : null;
  }

  const allToolCallsCompleted =
    toolCalls.length > 0 && toolCalls.every((tc) => tc.status === 'completed');
  const isWaitingAfterToolCalls =
    isStreaming && allToolCallsCompleted && messages.length === 0;

  return (
    <div className={styles.container}>
      {toolCalls.length > 0 && (
        <ThinkingBlock toolCalls={toolCalls} isStreaming={isStreaming} />
      )}
      {messages.length > 0 && <StreamingMessage messages={messages} />}
      {surfaces.length > 0 && (
        <SurfaceRenderer surfaces={surfaces} onAction={onAction} />
      )}
      {isWaitingAfterToolCalls && <TypingIndicator />}
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className={styles.typingIndicator} aria-label="Waiting for response">
      <span className={styles.typingDot} />
      <span className={styles.typingDot} />
      <span className={styles.typingDot} />
    </div>
  );
}

export {TypingIndicator};
