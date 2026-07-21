import {StreamingMessage} from '../StreamingMessage/StreamingMessage.js';
import {ThinkingBlock} from '../ThinkingBlock/ThinkingBlock.js';
import {SurfaceRenderer} from '../../a2ui/SurfaceRenderer/SurfaceRenderer.js';
import styles from './AgentResponse.module.css';

type ReasoningStep =
  | {type: 'reasoning'; content: string}
  | {
      type: 'tool-call';
      id: string;
      name: string;
      args: string;
      result?: string;
      status: 'calling' | 'completed';
    };

interface AgentResponseData {
  messages: {content: string; role: string}[];
  surfaces: Record<string, unknown>[];
  reasoningSteps: ReasoningStep[];
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
  const {messages, reasoningSteps, surfaces} = agentResponse;

  const hasContent =
    messages.length > 0 || reasoningSteps.length > 0 || surfaces.length > 0;

  if (!hasContent) {
    return null;
  }

  return (
    <div className={styles.container}>
      {reasoningSteps.length > 0 && (
        <ThinkingBlock
          reasoningSteps={reasoningSteps}
          isStreaming={isStreaming}
        />
      )}
      {messages.length > 0 && <StreamingMessage messages={messages} />}
      {surfaces.length > 0 && (
        <SurfaceRenderer surfaces={surfaces} onAction={onAction} />
      )}
    </div>
  );
}
