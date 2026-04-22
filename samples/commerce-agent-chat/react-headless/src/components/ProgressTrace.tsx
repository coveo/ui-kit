import {useEffect, useMemo, useRef, useState} from 'react';
import {renderMarkdown} from '../lib/markdown.js';

import './ProgressTrace.css';

const TRACE_BOTTOM_THRESHOLD_PX = 8;

export interface ProgressTraceEntry {
  id: string;
  kind: 'reasoning' | 'tool';
  label: string;
  text: string;
  status: 'streaming' | 'completed';
}

interface ProgressTraceProps {
  progressTrace: ProgressTraceEntry[];
  progressSteps: string[];
  isStreaming: boolean;
  messageId: string;
}

interface DisplayProgressTraceEntry extends ProgressTraceEntry {
  isCurrent: boolean;
}

function normalizeProgressTraceText(text: string) {
  return text
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function formatProgressEntryTitle(entry: ProgressTraceEntry) {
  if (entry.kind !== 'tool') {
    return entry.label;
  }

  if (entry.label.startsWith('Tool call: ')) {
    return entry.label;
  }

  return `Tool call: ${entry.label}`;
}

export function ProgressTrace({
  progressTrace,
  progressSteps,
  isStreaming,
  messageId,
}: ProgressTraceProps): React.JSX.Element {
  const [isExpanded, setIsExpanded] = useState(false);
  const [userDisabledAutoScroll, setUserDisabledAutoScroll] = useState(false);
  const traceElementRef = useRef<HTMLDivElement | null>(null);

  const hasDoneStep = progressSteps.includes('Done');
  const hasStreamingProgress =
    progressTrace.length > 0 || progressSteps.length > 0;
  const turnComplete = hasDoneStep || !isStreaming;
  const shouldAnimateCurrentStep = isStreaming && !hasDoneStep;
  const showTrace =
    (isStreaming && hasStreamingProgress && !hasDoneStep) || isExpanded;
  const toggleDisabled = isStreaming && !hasDoneStep;

  useEffect(() => {
    if (!isStreaming) {
      return;
    }

    setIsExpanded(false);
    setUserDisabledAutoScroll(false);
  }, [isStreaming]);

  useEffect(() => {
    if (userDisabledAutoScroll || !traceElementRef.current) {
      return;
    }

    traceElementRef.current.scrollTop = traceElementRef.current.scrollHeight;
  }, [progressTrace, progressSteps, showTrace, userDisabledAutoScroll]);

  const displayTraceItems = useMemo(() => {
    if (progressTrace.length === 0) {
      const currentIndex = progressSteps.length - 1;

      return progressSteps.map((step, index) => ({
        id: `${messageId}-step-${index}`,
        kind: 'reasoning' as const,
        label: step,
        text: '',
        status: 'completed' as const,
        isCurrent: shouldAnimateCurrentStep && index === currentIndex,
      }));
    }

    const shouldAppendDone =
      hasDoneStep && progressTrace[progressTrace.length - 1]?.label !== 'Done';

    const traceWithDone = shouldAppendDone
      ? [
          ...progressTrace,
          {
            id: `${messageId}-done`,
            kind: 'reasoning' as const,
            label: 'Done',
            text: '',
            status: 'completed' as const,
          },
        ]
      : progressTrace;

    const currentIndex = traceWithDone.length - 1;

    return traceWithDone
      .map((entry, index) => {
        const normalizedText = normalizeProgressTraceText(entry.text);
        const shouldRenderEntry =
          entry.kind === 'tool' ||
          entry.label === 'Done' ||
          Boolean(normalizedText);

        if (!shouldRenderEntry) {
          return null;
        }

        return {
          ...entry,
          text: normalizedText,
          isCurrent: shouldAnimateCurrentStep && index === currentIndex,
        } satisfies DisplayProgressTraceEntry;
      })
      .filter((entry): entry is DisplayProgressTraceEntry => entry !== null);
  }, [
    hasDoneStep,
    messageId,
    progressSteps,
    progressTrace,
    shouldAnimateCurrentStep,
  ]);

  const handleToggleTrace = () => {
    setIsExpanded((value) => !value);
    setUserDisabledAutoScroll(false);
  };

  const handleTraceScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    const isAtBottom =
      Math.abs(target.scrollHeight - target.clientHeight - target.scrollTop) <=
      TRACE_BOTTOM_THRESHOLD_PX;

    setUserDisabledAutoScroll(!isAtBottom);
  };

  const toggleLabelClass = `rh-agent-progress__toggle-label${
    isStreaming && !hasStreamingProgress && !hasDoneStep
      ? ' rh-agent-progress__toggle-label--working'
      : ''
  }`;
  const toggleCaretClass = `rh-agent-progress__toggle-caret${
    isExpanded ? ' rh-agent-progress__toggle-caret--expanded' : ''
  }`;
  const traceContainerClass = `rh-agent-progress__trace ${
    isExpanded
      ? 'rh-agent-progress__trace--expanded'
      : 'rh-agent-progress__trace--collapsed'
  }`;

  return (
    <section className="rh-agent-progress" aria-label="Agent status">
      <button
        className="rh-agent-progress__toggle"
        type="button"
        disabled={toggleDisabled}
        aria-expanded={showTrace}
        aria-controls={`progress-trace-${messageId}`}
        onClick={handleToggleTrace}
      >
        <span className="rh-agent-progress__toggle-content">
          {turnComplete && (
            <span className={toggleCaretClass} aria-hidden="true">
              &#8250;
            </span>
          )}
          <span className={toggleLabelClass}>
            {turnComplete ? 'Status trace' : 'Working...'}
          </span>
        </span>
      </button>

      {showTrace && (
        <div
          id={`progress-trace-${messageId}`}
          ref={traceElementRef}
          className={traceContainerClass}
          data-progress-trace-message-id={messageId}
          onScroll={handleTraceScroll}
        >
          <ul className="rh-agent-progress__steps">
            {displayTraceItems.map((entry) => (
              <li key={entry.id} className="rh-agent-progress__item">
                <p
                  className={`rh-agent-progress__item-title${
                    entry.isCurrent
                      ? ' rh-agent-progress__item-title--current'
                      : ''
                  }`}
                >
                  {formatProgressEntryTitle(entry)}
                </p>
                {Boolean(entry.text) && (
                  <div
                    className="rh-agent-progress__item-markdown"
                    dangerouslySetInnerHTML={{
                      __html: renderMarkdown(entry.text),
                    }}
                  />
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
