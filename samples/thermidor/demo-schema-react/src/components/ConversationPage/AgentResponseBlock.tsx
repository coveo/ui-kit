import type {ReactNode} from 'react';
import type {TurnResponse} from '@coveo/thermidor';
import {ThinkingBlock} from './ThinkingBlock.js';
import {StreamingMessage} from './StreamingMessage.js';
import styles from './AgentResponseBlock.module.css';

export interface AgentResponseBlockProps {
  response: TurnResponse;
  isStreaming: boolean;
  /** The turn's blocks, loading placeholders included, drawn after the agent's text. */
  children?: ReactNode;
  /**
   * Whether the turn's progress, from its `ProgressBlock` surface, is drawn above this block. Such a turn shows it instead of the thinking block.
   */
  hasProgress?: boolean;
}

export function AgentResponseBlock({
  response,
  isStreaming,
  children,
  hasProgress = false,
}: AgentResponseBlockProps) {
  const {agent} = response;
  const messages = agent?.messages ?? [];
  const toolCalls = agent?.toolCalls ?? [];

  const showThinkingBlock = !hasProgress && (toolCalls.length > 0 || isStreaming);
  const showStreamingMessage = messages.some((m) => m.content.length > 0);

  return (
    <div className={styles.container}>
      {showThinkingBlock && <ThinkingBlock toolCalls={toolCalls} isStreaming={isStreaming} />}
      {showStreamingMessage && <StreamingMessage messages={messages} />}
      {children}
    </div>
  );
}
