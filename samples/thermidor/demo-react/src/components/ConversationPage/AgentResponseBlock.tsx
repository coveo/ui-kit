import type {AgentResponse} from '@coveo/thermidor';
import {ThinkingBlock} from './ThinkingBlock.js';
import {StreamingMessage} from './StreamingMessage.js';
import {SurfaceRenderer} from '../../a2ui/SurfaceRenderer/SurfaceRenderer.js';
import styles from './AgentResponseBlock.module.css';

const ROUTE_TO_COMPONENT: Record<string, string> = {
  discovery: 'ProductCarousel',
  comparison: 'ComparisonTable',
  bundle: 'BundleDisplay',
};

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

  const pendingSkeletons = extractPendingSkeletons(reasoningSteps, isStreaming);
  const showSurfaceRenderer = surfaces.length > 0 || pendingSkeletons.length > 0;

  return (
    <div className={styles.container}>
      {showThinkingBlock && (
        <ThinkingBlock reasoningSteps={reasoningSteps} isStreaming={isStreaming} />
      )}
      {showStreamingMessage && <StreamingMessage messages={messages} />}
      {showSurfaceRenderer && (
        <SurfaceRenderer
          surfaces={surfaces}
          onAction={onAction}
          isStreaming={isStreaming}
          pendingSkeletons={pendingSkeletons}
        />
      )}
    </div>
  );
}

function extractPendingSkeletons(
  reasoningSteps: AgentResponse['reasoningSteps'],
  isStreaming: boolean
): string[] {
  if (!isStreaming) return [];

  const componentTypes: string[] = [];
  for (const step of reasoningSteps) {
    if (step.type !== 'tool-call' || step.name !== 'store_render_plan') continue;
    try {
      const args = JSON.parse(step.args);
      const route = args.route as string;
      const componentType = ROUTE_TO_COMPONENT[route];
      if (componentType) {
        componentTypes.push(componentType);
      }
    } catch {
      // args may be incomplete while streaming
    }
  }
  return componentTypes;
}
