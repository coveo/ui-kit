import type {AgentResponse} from '@coveo/thermidor';
import {ThinkingBlock} from './ThinkingBlock.js';
import {StreamingMessage} from './StreamingMessage.js';
import {SurfaceRenderer} from '../../a2ui/SurfaceRenderer/SurfaceRenderer.js';
import styles from './AgentResponseBlock.module.css';

export interface AgentResponseBlockProps {
  agentResponse: AgentResponse;
  isStreaming: boolean;
  onAction: (text: string, type: string) => void;
}

export function AgentResponseBlock({
  agentResponse,
  isStreaming,
  onAction,
}: AgentResponseBlockProps) {
  const {messages, surfaces, reasoningSteps} = agentResponse;

  const showThinkingBlock = reasoningSteps.length > 0 || isStreaming;
  const showStreamingMessage = messages.some((m) => m.content.length > 0);
  const showSurfaceRenderer = surfaces.length > 0;

  return (
    <div className={styles.container}>
      {showThinkingBlock && (
        <ThinkingBlock
          reasoningSteps={reasoningSteps}
          isStreaming={isStreaming}
        />
      )}
      {showStreamingMessage && <StreamingMessage messages={messages} />}
      {showSurfaceRenderer && (
        <SurfaceRenderer surfaces={surfaces} onAction={onAction} />
      )}
    </div>
  );
}
