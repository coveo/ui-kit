import type {ReasoningStep, ToolCallStep} from '@coveo/thermidor';
import styles from './ThinkingBlock.module.css';

export interface ThinkingBlockProps {
  reasoningSteps: ReasoningStep[];
  isStreaming: boolean;
}

export function ThinkingBlock({
  reasoningSteps,
  isStreaming,
}: ThinkingBlockProps) {
  if (reasoningSteps.length === 0) {
    return null;
  }

  const isToolCall = (s: ReasoningStep): s is ToolCallStep =>
    s.type === 'tool-call';

  const toolCalls = reasoningSteps.filter(isToolCall);
  const allCompleted =
    toolCalls.length > 0 && toolCalls.every((tc) => tc.status === 'completed');
  const isProcessing = isStreaming && !allCompleted;
  const activeTool = toolCalls.findLast((tc) => tc.status === 'calling');
  const completedCount = toolCalls.filter(
    (tc) => tc.status === 'completed'
  ).length;

  let summaryText: string;
  if (allCompleted && toolCalls.length > 0) {
    summaryText = `✓ ${toolCalls.length} tool call${toolCalls.length > 1 ? 's' : ''} completed`;
  } else if (activeTool) {
    const progress =
      completedCount > 0 ? ` (${completedCount}/${toolCalls.length})` : '';
    summaryText = `⏳ ${activeTool.name}${progress}`;
  } else {
    summaryText = `⏳ Thinking…`;
  }

  const indicatorClass = isProcessing ? styles.processing : styles.success;

  return (
    <details className={styles.details}>
      <summary className={`${styles.summary} ${indicatorClass}`}>
        {summaryText}
      </summary>
      <div className={styles.content}>
        <ul className={styles.toolList}>
          {reasoningSteps.map((step, index) => {
            if (step.type === 'reasoning') {
              return (
                <li key={`reasoning-${index}`} className={styles.toolItem}>
                  <div className={styles.toolName}>Reasoning</div>
                  <pre className={styles.toolArgs}>{step.content}</pre>
                </li>
              );
            }
            return (
              <li key={step.id} className={styles.toolItem}>
                <div className={styles.toolName}>{step.name}</div>
                <pre className={styles.toolArgs}>{step.args}</pre>
                {step.status === 'completed' && step.result && (
                  <>
                    <div className={styles.resultLabel}>Result</div>
                    <pre className={styles.toolResult}>{step.result}</pre>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </details>
  );
}
