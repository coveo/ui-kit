import {StreamingMessage} from '../StreamingMessage/StreamingMessage.js';
import {ThinkingBlock} from '../ThinkingBlock/ThinkingBlock.js';
import {SurfaceRenderer} from '../../a2ui/SurfaceRenderer/SurfaceRenderer.js';
import type {AgentResponse as AgentResponseState} from '@coveo/thermidor';
import styles from './AgentResponse.module.css';

export interface AgentResponseProps {
  agentResponse: AgentResponseState;
  isStreaming: boolean;
  onAction?: (text: string, type: string) => void;
}

export function AgentResponse({agentResponse, isStreaming, onAction}: AgentResponseProps) {
  const {messages, reasoningSteps, surfaces} = agentResponse;

  const hasContent = messages.length > 0 || reasoningSteps.length > 0 || surfaces.length > 0;

  if (!hasContent) {
    return null;
  }

  return (
    <div className={styles.container}>
      {reasoningSteps.length > 0 && (
        <ThinkingBlock reasoningSteps={reasoningSteps} isStreaming={isStreaming} />
      )}
      {messages.length > 0 && <StreamingMessage messages={messages} />}
      {surfaces.length > 0 && <SurfaceRenderer surfaces={surfaces} onAction={onAction} />}
    </div>
  );
}
