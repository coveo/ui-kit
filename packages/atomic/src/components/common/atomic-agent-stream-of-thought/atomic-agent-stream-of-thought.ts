import type {GenerationStep} from '@coveo/headless';
import type {i18n} from 'i18next';
import {html, LitElement, nothing, type PropertyValues} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {classMap} from 'lit/directives/class-map.js';
import {map} from 'lit/directives/map.js';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles';
import styles from './atomic-agent-stream-of-thought.tw.css.js';

type ResolvedStepType =
  | 'thinking-before-search'
  | 'searching'
  | 'thinking-after-search'
  | 'answering';

interface ResolvedStep {
  type: ResolvedStepType;
  status: 'active' | 'completed';
}

const stepLabelKeys: Record<
  ResolvedStepType,
  {active: string; completed: string}
> = {
  'thinking-before-search': {
    active: 'agent-generation-step-analyzing-question',
    completed: 'agent-generation-step-analyzing-question-completed',
  },
  searching: {
    active: 'agent-generation-step-search',
    completed: 'agent-generation-step-search-completed',
  },
  'thinking-after-search': {
    active: 'agent-generation-step-analyzing-results',
    completed: 'agent-generation-step-analyzing-results-completed',
  },
  answering: {
    active: 'agent-generation-step-answering',
    completed: 'agent-generation-step-answering-completed',
  },
};

/**
 * The `atomic-agent-stream-of-thought` component displays a timeline of agent reasoning
 * steps during answer generation, showing real-time progress and completion status.
 *
 * @internal
 */
@customElement('atomic-agent-stream-of-thought')
@withTailwindStyles
export class AtomicAgentStreamOfThought extends LitElement {
  static styles = [styles];

  /**
   * The i18next instance used to translate step labels.
   */
  @property({attribute: false})
  public i18n!: i18n;

  /**
   * The array of generation steps from the headless engine.
   */
  @property({attribute: false})
  public agentSteps: GenerationStep[] = [];

  /**
   * Whether the answer is currently being streamed.
   */
  @property({attribute: false})
  public isStreaming = false;

  @state()
  private expanded = true;

  public override willUpdate(changed: PropertyValues): void {
    if (changed.has('isStreaming')) {
      this.expanded = this.isStreaming;
    }
  }

  public override render() {
    const resolvedSteps = resolveSteps(this.agentSteps);
    if (resolvedSteps.length === 0) {
      return nothing;
    }

    const isComplete = !this.isStreaming;
    const isCollapsible = resolvedSteps.length > 1;

    if (isComplete && !this.expanded && isCollapsible) {
      return html`
        <div class="timeline">${this.renderCollapsedTimelineSummary()}</div>
      `;
    }

    return html`
      <div class="timeline">
        ${map(resolvedSteps, (step) => this.renderStep(step))}
        ${isComplete && isCollapsible ? this.renderToggleButton() : nothing}
      </div>
    `;
  }

  private renderStep(step: ResolvedStep) {
    const labelKey =
      step.status === 'active'
        ? stepLabelKeys[step.type].active
        : stepLabelKeys[step.type].completed;
    const label = this.i18n.t(labelKey);

    return html`
      <div class="step">
        ${step.status === 'active'
          ? this.renderSpinner()
          : this.renderCheckmark()}
        <span class="step-label">${label}</span>
      </div>
    `;
  }

  private renderCollapsedTimelineSummary() {
    const resolvedSteps = resolveSteps(this.agentSteps);
    if (resolvedSteps.length === 0) {
      return nothing;
    }

    const step = resolvedSteps[resolvedSteps.length - 1];
    const labelKey = stepLabelKeys[step.type].completed;
    const label = this.i18n.t(labelKey);

    return html`
      <button
        class="collapsed-timeline-summary"
        @click=${this.handleToggle}
        aria-expanded=${this.expanded}
      >
        ${this.renderCheckmark()}
        <span class="step-label">${label}</span>
        ${this.renderChevron()}
      </button>
    `;
  }

  private renderToggleButton() {
    return html`
      <button
        class="toggle-button"
        @click=${this.handleToggle}
        aria-expanded=${this.expanded}
      >
        <span class="toggle-label">${this.i18n.t('collapse')}</span>
        ${this.renderChevron()}
      </button>
    `;
  }

  private renderSpinner() {
    return html`<span class="step-icon"
      ><span class="spinner" role="status"></span
    ></span>`;
  }

  private renderCheckmark() {
    return html`
      <span class="step-icon checkmark-icon">
        <svg
          width="12"
          height="9"
          viewBox="0 0 12 9"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M1 4.33333L4.33333 7.66667L11 1"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </span>
    `;
  }

  private renderChevron() {
    return html`
      <span class=${classMap({chevron: true, 'chevron-up': this.expanded})}>
        <svg
          width="11"
          height="6"
          viewBox="0 0 11 6"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M1.18998 0.52682L5.43262 4.76946L9.67526 0.526821"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </span>
    `;
  }

  private handleToggle() {
    this.expanded = !this.expanded;
  }
}

export function resolveSteps(steps: GenerationStep[]): ResolvedStep[] {
  let searchWasPerformed = false;
  return steps.map((step) => {
    let type: ResolvedStepType;
    if (step.name === 'searching') {
      searchWasPerformed = true;
      type = 'searching';
    } else if (step.name === 'answering') {
      type = 'answering';
    } else {
      type = searchWasPerformed
        ? 'thinking-after-search'
        : 'thinking-before-search';
    }
    return {type, status: step.status};
  });
}
