import {useMemo} from 'react';
import type {AgentResponse} from '@coveo/thermidor';
import {ThinkingBlock} from './ThinkingBlock.js';
import {StreamingMessage} from './StreamingMessage.js';
import {A2UISkeleton} from '../../a2ui/Skeleton/Skeleton.js';
import {parseSurfaceSnapshots} from '../../a2ui/types.js';
import {getA2UIMessages, ThermidorA2UISurfaces} from '../../a2ui/surfaces.js';
import styles from './AgentResponseBlock.module.css';

const KNOWN_COMPONENTS = new Set([
  'ProductCarousel',
  'BundleDisplay',
  'NextActionsBar',
  'ComparisonTable',
]);

const ROUTE_TO_COMPONENT: Record<string, string> = {
  discovery: 'ProductCarousel',
  comparison: 'ComparisonTable',
  bundle: 'BundleDisplay',
};

export interface AgentResponseBlockProps {
  agentResponse: AgentResponse;
  isStreaming: boolean;
}

export function AgentResponseBlock({agentResponse, isStreaming}: AgentResponseBlockProps) {
  const {messages, surfaces, reasoningSteps} = agentResponse;

  const showThinkingBlock = reasoningSteps.length > 0 || isStreaming;
  const showStreamingMessage = messages.some((m) => m.content.length > 0);

  const skeletonItems = useSkeletonItems(surfaces, reasoningSteps, isStreaming);

  const a2uiMessages = useMemo(
    () => getA2UIMessages(agentResponse.activities),
    [agentResponse.activities]
  );

  return (
    <div className={styles.container}>
      {showThinkingBlock && (
        <ThinkingBlock reasoningSteps={reasoningSteps} isStreaming={isStreaming} />
      )}
      {showStreamingMessage && <StreamingMessage messages={messages} />}
      {skeletonItems.map((item) => (
        <A2UISkeleton key={item.surfaceId} componentType={item.componentType} />
      ))}
      {a2uiMessages.length > 0 && <ThermidorA2UISurfaces messages={a2uiMessages} />}
    </div>
  );
}

/**
 * Computes which skeleton placeholders to show during streaming.
 *
 * Two sources feed into the skeleton list (aligned with demo-react):
 * 1. Tool calls: `store_render_plan` reasoning steps indicate which components are coming.
 * 2. Surface hints: surfaces with `skeleton-` prefix surfaceId or `isLoading: true` prop
 *    signal explicit skeleton requests from the backend.
 *
 * Real (non-skeleton) surfaces subtract from the count so skeletons disappear
 * as actual content arrives.
 */
function useSkeletonItems(
  surfaces: AgentResponse['surfaces'],
  reasoningSteps: AgentResponse['reasoningSteps'],
  isStreaming: boolean
) {
  return useMemo(() => {
    if (!isStreaming) return [];

    const allParsed = parseSurfaceSnapshots(surfaces);
    const known = allParsed.filter((s) => KNOWN_COMPONENTS.has(s.componentType));
    const realCountByType = new Map<string, number>();
    const skeletonIdsByType = new Map<string, Set<string>>();

    for (const s of known) {
      const props = s.componentProps;
      const isSkeleton = s.surfaceId.startsWith('skeleton-') || props.isLoading === true;

      if (isSkeleton) {
        const ids = skeletonIdsByType.get(s.componentType) ?? new Set();
        ids.add(s.surfaceId);
        skeletonIdsByType.set(s.componentType, ids);
      } else {
        realCountByType.set(s.componentType, (realCountByType.get(s.componentType) ?? 0) + 1);
      }
    }

    for (const [, ids] of skeletonIdsByType) {
      const hasSpecific = [...ids].some((id) => !id.endsWith('-default'));
      if (hasSpecific) {
        for (const id of [...ids]) {
          if (id.endsWith('-default')) ids.delete(id);
        }
      }
    }

    const items: Array<{surfaceId: string; componentType: string}> = [];

    for (const [componentType, skeletonIds] of skeletonIdsByType) {
      const realCount = realCountByType.get(componentType) ?? 0;
      const remaining = Math.max(0, skeletonIds.size - realCount);
      const exampleId = skeletonIds.values().next().value!;
      for (let i = 0; i < remaining; i++) {
        items.push({surfaceId: `${exampleId}-remaining-${i}`, componentType});
      }
    }

    const pendingFromToolCalls = extractPendingSkeletons(reasoningSteps);
    for (const componentType of pendingFromToolCalls) {
      const realCount = realCountByType.get(componentType) ?? 0;
      const alreadyHasSkeleton = skeletonIdsByType.has(componentType);
      if (realCount === 0 && !alreadyHasSkeleton) {
        items.push({surfaceId: `pending-${componentType}`, componentType});
      }
    }

    return items;
  }, [surfaces, reasoningSteps, isStreaming]);
}

function extractPendingSkeletons(reasoningSteps: AgentResponse['reasoningSteps']): string[] {
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
