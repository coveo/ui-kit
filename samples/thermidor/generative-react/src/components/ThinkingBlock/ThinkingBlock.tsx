import styles from './ThinkingBlock.module.css';

interface ToolCall {
  id: string;
  name: string;
  args: string;
  result?: string;
  status: 'calling' | 'completed';
}

export interface ThinkingBlockProps {
  toolCalls: ToolCall[];
  isStreaming: boolean;
}

export function ThinkingBlock({toolCalls, isStreaming}: ThinkingBlockProps) {
  if (toolCalls.length === 0) {
    return null;
  }

  const allCompleted = toolCalls.every((tc) => tc.status === 'completed');
  const isProcessing = isStreaming && !allCompleted;
  const activeTool = toolCalls.findLast((tc) => tc.status === 'calling');
  const completedCount = toolCalls.filter(
    (tc) => tc.status === 'completed'
  ).length;

  let summaryText: string;
  if (allCompleted) {
    summaryText = `✓ ${toolCalls.length} tool call${toolCalls.length > 1 ? 's' : ''} completed`;
  } else if (activeTool) {
    const progress =
      completedCount > 0 ? ` (${completedCount}/${toolCalls.length})` : '';
    summaryText = `⏳ ${activeTool.name}${progress}`;
  } else {
    summaryText = `⏳ ${toolCalls.length} tool call${toolCalls.length > 1 ? 's' : ''} in progress…`;
  }

  const indicatorClass = isProcessing ? styles.processing : styles.success;

  return (
    <details className={styles.details}>
      <summary className={`${styles.summary} ${indicatorClass}`}>
        {summaryText}
      </summary>
      <div className={styles.content}>
        <ul className={styles.toolList}>
          {toolCalls.map((tc) => (
            <li key={tc.id} className={styles.toolItem}>
              <div className={styles.toolName}>{tc.name}</div>
              <pre className={styles.toolArgs}>{tc.args}</pre>
              {tc.status === 'completed' && tc.result && (
                <>
                  <div className={styles.resultLabel}>Result</div>
                  <pre className={styles.toolResult}>{tc.result}</pre>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
    </details>
  );
}
