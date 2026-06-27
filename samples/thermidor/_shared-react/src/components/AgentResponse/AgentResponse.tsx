import {type ComponentType} from 'react';
import {StreamingMessage} from '../StreamingMessage/StreamingMessage.js';
import {ThinkingBlock} from '../ThinkingBlock/ThinkingBlock.js';
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

export interface SurfaceRendererProps {
  surfaces: Record<string, unknown>[];
  onAction?: (text: string, type: string) => void;
}

export interface AgentResponseProps {
  agentResponse: AgentResponseData;
  isStreaming: boolean;
  onAction?: (text: string, type: string) => void;
  SurfaceRenderer: ComponentType<SurfaceRendererProps>;
}

export function AgentResponse({
  agentResponse,
  isStreaming,
  onAction,
  SurfaceRenderer,
}: AgentResponseProps) {
  const {messages, toolCalls, surfaces} = agentResponse;

  const hasContent =
    messages.length > 0 || toolCalls.length > 0 || surfaces.length > 0;

  if (!hasContent) {
    return null;
  }

  return (
    <div className={styles.container}>
      {toolCalls.length > 0 && (
        <ThinkingBlock toolCalls={toolCalls} isStreaming={isStreaming} />
      )}
      {messages.length > 0 && <StreamingMessage messages={messages} />}
      {surfaces.length > 0 && (
        <SurfaceRenderer surfaces={surfaces} onAction={onAction} />
      )}
    </div>
  );
}
