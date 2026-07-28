import type {ReasoningStep, ToolCallStep} from '@coveo/thermidor';
import {renderMarkdown} from '../../utils.js';
import styles from './ThinkingBlock.module.css';

export interface ThinkingBlockProps {
  reasoningSteps: ReasoningStep[];
  isStreaming: boolean;
}

function isToolCall(step: ReasoningStep): step is ToolCallStep {
  return step.type === 'tool-call';
}

function formatArgs(args: string): string {
  try {
    return JSON.stringify(JSON.parse(args), null, 2);
  } catch {
    return args;
  }
}

function getSummaryContent(reasoningSteps: ReasoningStep[], isStreaming: boolean) {
  if (!isStreaming) {
    const toolCallCount = reasoningSteps.filter(isToolCall).length;
    const label =
      toolCallCount === 0
        ? 'Done.'
        : toolCallCount === 1
          ? '1 tool call'
          : `${toolCallCount} tool calls`;
    return <span className={styles.doneLabel}>{label}</span>;
  }

  if (reasoningSteps.length === 0) {
    return (
      <span>
        Working
        <span className={styles.animatedDots} aria-hidden="true" />
      </span>
    );
  }

  const lastStep = reasoningSteps[reasoningSteps.length - 1];

  if (isToolCall(lastStep) && lastStep.status === 'calling') {
    return (
      <span>
        Calling tool: {lastStep.name}
        <span className={styles.animatedDots} aria-hidden="true" />
      </span>
    );
  }

  return (
    <span>
      Reasoning
      <span className={styles.animatedDots} aria-hidden="true" />
    </span>
  );
}

export function ThinkingBlock({reasoningSteps, isStreaming}: ThinkingBlockProps) {
  const summaryContent = getSummaryContent(reasoningSteps, isStreaming);

  return (
    <details className={styles.details} aria-label="Agent reasoning process">
      <summary className={styles.summary}>
        <span className={styles.chevron} aria-hidden="true" />
        {summaryContent}
      </summary>
      <div className={styles.content}>
        {reasoningSteps.map((step, index) => {
          if (step.type === 'reasoning') {
            return (
              <div
                key={`reasoning-${index}`}
                className={styles.reasoningBlock}
                dangerouslySetInnerHTML={{
                  __html: renderMarkdown(step.content),
                }}
              />
            );
          }
          return <ToolCallDetails key={step.id} step={step} />;
        })}
      </div>
    </details>
  );
}

function ToolCallDetails({step}: {step: ToolCallStep}) {
  return (
    <details className={styles.toolCallDetails}>
      <summary className={styles.toolCallSummary}>
        <span className={styles.chevron} aria-hidden="true" />
        Tool call: {step.name}
      </summary>
      <div className={styles.toolCallContent}>
        <div className={styles.toolCallSection}>
          <span className={styles.toolCallLabel}>Arguments</span>
          <pre className={styles.toolCallPre}>{formatArgs(step.args)}</pre>
        </div>
        {step.status === 'completed' && step.result != null && (
          <div className={styles.toolCallSection}>
            <span className={styles.toolCallLabel}>Result</span>
            <pre className={styles.toolCallPre}>{step.result}</pre>
          </div>
        )}
      </div>
    </details>
  );
}
