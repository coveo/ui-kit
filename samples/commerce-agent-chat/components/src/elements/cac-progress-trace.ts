import {css, html, LitElement} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {map} from 'lit/directives/map.js';
import {when} from 'lit/directives/when.js';
import type {ProgressTraceEntry} from '@coveo/commerce-agent-chat-core/types/agent';

/**
 * The `cac-progress-trace` component displays the structured reasoning and tool call trace.
 * Manages its own expansion and scroll state internally.
 */
@customElement('cac-progress-trace')
export class CacProgressTrace extends LitElement {
  private static readonly traceBottomThresholdPx = 8;

  static override styles = css`
    :host {
      display: block;
    }

    .agent-progress {
      margin: 0.5rem 0 0;
      border: 0;
      border-radius: 8px;
      padding: 0.55rem 0.65rem;
      width: 100%;
      box-sizing: border-box;
    }

    .agent-progress__toggle {
      margin: 0;
      width: 100%;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      border: 0;
      background: transparent;
      color: var(--ink-muted);
      font: inherit;
      font-size: 0.82rem;
      cursor: pointer;
      text-align: left;
      padding: 0;
    }

    .agent-progress__toggle:disabled {
      cursor: default;
    }

    .agent-progress__toggle-content {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
    }

    .agent-progress__toggle-caret {
      display: inline-block;
      font-size: 2rem;
      line-height: 1;
      transform: translateY(-0.08em) rotate(0deg);
      transition: transform 120ms ease;
    }

    .agent-progress__toggle-caret--expanded {
      transform: translateY(-0.08em) rotate(90deg);
    }

    .agent-progress__toggle-label {
      margin: 0;
      font-weight: 600;
    }

    .agent-progress__toggle-label--working {
      animation: agentProgressPulse 1.1s ease-in-out infinite;
    }

    .agent-progress__trace {
      margin-top: 0.55rem;
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 0.55rem 0.65rem;
      width: 100%;
      box-sizing: border-box;
    }

    .agent-progress__trace--collapsed {
      max-height: 200px;
      overflow-y: auto;
    }

    .agent-progress__trace--expanded {
      max-height: none;
      overflow: visible;
    }

    .agent-progress__steps {
      margin: 0;
      padding: 0 0 0 1rem;
      list-style: disc;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .agent-progress__item {
      color: var(--ink);
      font-size: 0.8rem;
      line-height: 1.45;
    }

    .agent-progress__item-title--current {
      animation: agentProgressPulse 1.1s ease-in-out infinite;
    }

    .agent-progress__item-title {
      margin: 0;
      font-weight: 600;
      color: var(--ink);
    }

    .agent-progress__item-text {
      margin: 0;
      font-size: 0.8rem;
      color: var(--ink);
      white-space: pre-line;
      overflow-wrap: anywhere;
    }

    @keyframes agentProgressPulse {
      0%,
      100% {
        opacity: 0.45;
      }
      50% {
        opacity: 1;
      }
    }
  `;

  /** The structured progress trace entries. */
  @property({attribute: false})
  public progressTrace: ProgressTraceEntry[] = [];

  /** The fallback progress steps when trace is empty. */
  @property({attribute: false})
  public progressSteps: string[] = [];

  /** Whether the current turn is streaming. */
  @property({attribute: false})
  public isStreaming = false;

  /** The message ID this trace belongs to. */
  @property({attribute: false})
  public messageId = '';

  /** Whether the trace is expanded (managed internally). */
  @state()
  private isExpanded = false;

  /** Whether auto-scroll is disabled by user (managed internally). */
  @state()
  private userDisabledAutoScroll = false;

  private traceElement: HTMLElement | null = null;
  private resizeObserver: ResizeObserver | null = null;

  override connectedCallback(): void {
    super.connectedCallback();
    this.resizeObserver = new ResizeObserver(() => this.autoScrollIfEnabled());
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.resizeObserver?.disconnect();
  }

  override updated(changedProperties: Map<PropertyKey, unknown>): void {
    // Collapse trace when new stream starts
    if (changedProperties.has('isStreaming') && this.isStreaming) {
      this.isExpanded = false;
      this.userDisabledAutoScroll = false;
    }

    // Set up resize observer for auto-scroll
    if (
      changedProperties.has('progressTrace') ||
      changedProperties.has('progressSteps')
    ) {
      this.setupTraceObserver();
      this.autoScrollIfEnabled();
    }
  }

  private setupTraceObserver(): void {
    if (!this.traceElement && this.resizeObserver) {
      this.traceElement = this.renderRoot.querySelector(
        '.agent-progress__trace'
      );
      if (this.traceElement) {
        this.resizeObserver.disconnect();
        this.resizeObserver.observe(this.traceElement);
      }
    }
  }

  private autoScrollIfEnabled(): void {
    if (this.userDisabledAutoScroll || !this.traceElement) {
      return;
    }

    this.traceElement.scrollTop = this.traceElement.scrollHeight;
  }

  private onToggleTrace(): void {
    this.isExpanded = !this.isExpanded;
    this.userDisabledAutoScroll = false;

    // Auto-scroll to bottom when expanding
    if (this.isExpanded) {
      this.updateComplete.then(() => this.autoScrollIfEnabled());
    }
  }

  private onTraceScroll(event: Event): void {
    const target = event.target as HTMLElement;
    const isAtBottom =
      Math.abs(target.scrollHeight - target.clientHeight - target.scrollTop) <=
      CacProgressTrace.traceBottomThresholdPx;

    this.userDisabledAutoScroll = !isAtBottom;
  }

  override render() {
    const hasDoneStep = this.hasDoneStep();
    const hasStreamingProgress = this.hasStreamingProgress();
    const turnComplete = this.isTurnComplete(hasDoneStep);
    const shouldAnimateCurrentStep = this.shouldAnimateCurrentStep(hasDoneStep);
    const showTrace = this.shouldShowTrace(hasDoneStep, hasStreamingProgress);
    const traceContainerClass = this.getTraceContainerClass();
    const traceId = this.getTraceId();

    return html`
      <section class="agent-progress" aria-label="Agent status">
        <button
          class="agent-progress__toggle"
          type="button"
          ?disabled=${this.isToggleDisabled(hasDoneStep)}
          aria-expanded=${showTrace ? 'true' : 'false'}
          aria-controls=${traceId}
          @click=${() => this.onToggleTrace()}
        >
          <span class="agent-progress__toggle-content">
            ${when(
              turnComplete,
              () =>
                html`<span
                  class=${this.getToggleCaretClass()}
                  aria-hidden="true"
                  >&#8250;</span
                >`
            )}
            <span
              class=${this.getToggleLabelClass(
                hasDoneStep,
                hasStreamingProgress
              )}
            >
              ${this.getToggleLabel(turnComplete)}</span
            >
          </span>
        </button>
        ${when(
          showTrace,
          () => html`
            <div
              id=${traceId}
              class=${traceContainerClass}
              data-progress-trace-message-id=${this.messageId}
              @scroll=${(event: Event) => this.onTraceScroll(event)}
            >
              <ul class="agent-progress__steps">
                ${this.renderProgressTraceItems(shouldAnimateCurrentStep)}
              </ul>
            </div>
          `
        )}
      </section>
    `;
  }

  private hasDoneStep() {
    return this.progressSteps.includes('Done');
  }

  private hasStreamingProgress() {
    return this.progressTrace.length > 0 || this.progressSteps.length > 0;
  }

  private isTurnComplete(hasDoneStep: boolean) {
    return hasDoneStep || !this.isStreaming;
  }

  private shouldAnimateCurrentStep(hasDoneStep: boolean) {
    return this.isStreaming && !hasDoneStep;
  }

  private shouldShowTrace(hasDoneStep: boolean, hasStreamingProgress: boolean) {
    return (
      (this.isStreaming && hasStreamingProgress && !hasDoneStep) ||
      this.isExpanded
    );
  }

  private getTraceContainerClass() {
    return `agent-progress__trace ${
      this.isExpanded
        ? 'agent-progress__trace--expanded'
        : 'agent-progress__trace--collapsed'
    }`;
  }

  private getTraceId() {
    return `progress-trace-${this.messageId}`;
  }

  private isToggleDisabled(hasDoneStep: boolean) {
    return this.isStreaming && !hasDoneStep;
  }

  private getToggleLabelClass(
    hasDoneStep: boolean,
    hasStreamingProgress: boolean
  ) {
    return `agent-progress__toggle-label${
      this.isStreaming && !hasStreamingProgress && !hasDoneStep
        ? ' agent-progress__toggle-label--working'
        : ''
    }`;
  }

  private getToggleCaretClass() {
    return `agent-progress__toggle-caret${
      this.isExpanded ? ' agent-progress__toggle-caret--expanded' : ''
    }`;
  }

  private getToggleLabel(turnComplete: boolean) {
    return turnComplete ? 'Status trace' : 'Working...';
  }

  private renderProgressTraceItems(shouldAnimateCurrentStep: boolean) {
    if (this.progressTrace.length === 0) {
      const currentIndex = this.progressSteps.length - 1;

      return map(
        this.progressSteps,
        (step, index) =>
          html`<li class="agent-progress__item">
            <p
              class=${`agent-progress__item-title${
                shouldAnimateCurrentStep && index === currentIndex
                  ? ' agent-progress__item-title--current'
                  : ''
              }`}
            >
              ${step}
            </p>
          </li>`
      );
    }

    const hasDoneStep = this.progressSteps.includes('Done');
    const shouldAppendDone =
      hasDoneStep &&
      this.progressTrace[this.progressTrace.length - 1]?.label !== 'Done';
    const displayTraceItems = shouldAppendDone
      ? [
          ...this.progressTrace,
          {
            id: 'done',
            kind: 'reasoning' as const,
            label: 'Done',
            text: '',
            status: 'completed' as const,
          },
        ]
      : this.progressTrace;
    const currentIndex = displayTraceItems.length - 1;

    return map(displayTraceItems, (entry, index) => {
      const normalizedText = this.normalizeProgressTraceText(entry.text);
      const shouldRenderEntry =
        entry.kind === 'tool' ||
        entry.label === 'Done' ||
        Boolean(normalizedText);

      if (!shouldRenderEntry) {
        return html``;
      }

      return html`
        <li class="agent-progress__item">
          <p
            class=${`agent-progress__item-title${
              shouldAnimateCurrentStep && index === currentIndex
                ? ' agent-progress__item-title--current'
                : ''
            }`}
          >
            ${this.formatProgressEntryTitle(entry)}
          </p>
          ${when(
            Boolean(normalizedText),
            () =>
              html`<p class="agent-progress__item-text">${normalizedText}</p>`
          )}
        </li>
      `;
    });
  }

  private normalizeProgressTraceText(text: string) {
    return text
      .replace(/\r\n?/g, '\n')
      .replace(/^[\s\uFEFF\xA0]+/, '')
      .replace(/[ \t]+\n/g, '\n')
      .replace(/\n{2,}/g, '\n')
      .trim();
  }

  private formatProgressEntryTitle(entry: ProgressTraceEntry) {
    if (entry.kind !== 'tool') {
      return entry.label;
    }

    if (entry.label.startsWith('Tool call: ')) {
      return entry.label;
    }

    return `Tool call: ${entry.label}`;
  }
}
