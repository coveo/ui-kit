import type {ToolCall} from '@coveo/converse';
import styles from './ThinkingBlock.module.css';

export interface ThinkingBlockProps {
  toolCalls: ToolCall[];
  isStreaming: boolean;
}

function formatArgs(args: string): string {
  try {
    return JSON.stringify(JSON.parse(args), null, 2);
  } catch {
    return args;
  }
}

function getSummaryContent(toolCalls: ToolCall[], isStreaming: boolean) {
  if (!isStreaming) {
    const label =
      toolCalls.length === 0
        ? 'Done.'
        : toolCalls.length === 1
          ? '1 tool call'
          : `${toolCalls.length} tool calls`;
    return <span className={styles.doneLabel}>{label}</span>;
  }

  const lastToolCall = toolCalls[toolCalls.length - 1];
  const label =
    lastToolCall?.status === 'calling' ? `Calling tool: ${lastToolCall.name}` : 'Thinking';
  return (
    <span>
      {label}
      <span className={styles.animatedDots} aria-hidden="true" />
    </span>
  );
}

export function ThinkingBlock({toolCalls, isStreaming}: ThinkingBlockProps) {
  return (
    <details className={styles.details} aria-label="Agent progress">
      <summary className={styles.summary}>
        <span className={styles.chevron} aria-hidden="true" />
        {getSummaryContent(toolCalls, isStreaming)}
      </summary>
      <div className={styles.content}>
        {toolCalls.map((toolCall) => (
          <ToolCallDetails key={toolCall.id} toolCall={toolCall} />
        ))}
      </div>
    </details>
  );
}

function ToolCallDetails({toolCall}: {toolCall: ToolCall}) {
  return (
    <details className={styles.toolCallDetails}>
      <summary className={styles.toolCallSummary}>
        <span className={styles.chevron} aria-hidden="true" />
        Tool call: {toolCall.name}
      </summary>
      <div className={styles.toolCallContent}>
        <div className={styles.toolCallSection}>
          <span className={styles.toolCallLabel}>Arguments</span>
          <pre className={styles.toolCallPre}>{formatArgs(toolCall.args)}</pre>
        </div>
        {toolCall.status === 'completed' && toolCall.result != null && (
          <div className={styles.toolCallSection}>
            <span className={styles.toolCallLabel}>Result</span>
            <pre className={styles.toolCallPre}>{toolCall.result}</pre>
          </div>
        )}
      </div>
    </details>
  );
}
