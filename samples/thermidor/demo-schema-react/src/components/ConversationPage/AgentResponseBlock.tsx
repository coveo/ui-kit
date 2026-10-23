import type {ReactNode} from 'react';
import type {TurnResponse} from '@coveo/thermidor';
import {citationsIn, citedDocuments, withInlineCitations} from '../../citations/citations.js';
import {CitedDocuments} from './CitedDocuments.js';
import {ThinkingBlock} from './ThinkingBlock.js';
import {StreamingMessage} from './StreamingMessage.js';
import styles from './AgentResponseBlock.module.css';

export interface AgentResponseBlockProps {
  response: TurnResponse;
  isStreaming: boolean;
  /** The turn's blocks, loading placeholders included, drawn after the agent's text. */
  children?: ReactNode;
}

export function AgentResponseBlock({response, isStreaming, children}: AgentResponseBlockProps) {
  const {agent} = response;
  const citations = citationsIn(response.activities);
  const messages = withInlineCitations(agent?.messages ?? [], citations);
  const reasoningSteps = agent?.reasoningSteps ?? [];

  const showThinkingBlock = reasoningSteps.length > 0 || isStreaming;
  const showStreamingMessage = messages.some((m) => m.content.length > 0);

  return (
    <div className={styles.container}>
      {showThinkingBlock && (
        <ThinkingBlock reasoningSteps={reasoningSteps} isStreaming={isStreaming} />
      )}
      {showStreamingMessage && <StreamingMessage messages={messages} />}
      <CitedDocuments documents={citedDocuments(citations)} />
      {children}
    </div>
  );
}
