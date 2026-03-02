import type {AgentStep, StepName} from '@coveo/headless';
import {STEP_NAMES} from '@coveo/headless';
import type {i18n} from 'i18next';
import {html} from 'lit';
import {keyed} from 'lit/directives/keyed.js';
import {when} from 'lit/directives/when.js';
import type {FunctionalComponent} from '@/src/utils/functional-component-utils';

const MIN_STEP_DISPLAY_DURATION_MS = 1500;
let lastDisplayedStepKey: string | undefined;
let lastDisplayedStepAt: number = 0;

const stepLabelKeys: Record<StepName, string> = {
  searching: 'agent-generation-step-search',
  thinking: 'agent-generation-step-think',
  answering: 'generating-answer',
};

export interface RenderAgentGenerationStepsProps {
  i18n: i18n;
  agentSteps: AgentStep[];
  isStreaming: boolean;
}

/**
 * @internal
 */
export const renderAgentGenerationSteps: FunctionalComponent<
  RenderAgentGenerationStepsProps
> = ({props}) => {
  const {i18n, agentSteps, isStreaming} = props;
  const currentStepKey = getCurrentStepKey(agentSteps);
  const currentStepLabel = currentStepKey ? i18n.t(currentStepKey) : undefined;
  const canRender = isStreaming && !!currentStepLabel;

  return html`${when(canRender, () =>
    keyed(
      currentStepKey,
      html`
        <div
          part="agent-generation-status"
          class="text-neutral-dark flex text-base font-light"
        >
          <span class="generation-steps-container">
            <span class="generation-steps-value">${currentStepLabel}</span>
          </span>
        </div>
      `
    )
  )}`;
};

/**
 * Returns the current generation-step localization key.
 *
 * Selection priority:
 * 1) Timeline-based progression (minimum display duration per step for quick updates).
 * 2) Currently active step.
 * 3) Latest completed step by step priority.
 */
export function getCurrentStepKey(
  agentSteps: AgentStep[],
  now = Date.now()
): string | undefined {
  const nextStepKey =
    getActiveStepKey(agentSteps) ?? getLatestCompletedStepKey(agentSteps);

  if (!nextStepKey) {
    lastDisplayedStepKey = undefined;
    lastDisplayedStepAt = 0;
    return undefined;
  }

  if (!lastDisplayedStepKey || lastDisplayedStepKey === nextStepKey) {
    if (!lastDisplayedStepKey) {
      lastDisplayedStepKey = nextStepKey;
      lastDisplayedStepAt = now;
    }
    return lastDisplayedStepKey;
  }

  if (now - lastDisplayedStepAt < MIN_STEP_DISPLAY_DURATION_MS) {
    return lastDisplayedStepKey;
  }

  lastDisplayedStepKey = nextStepKey;
  lastDisplayedStepAt = now;

  return lastDisplayedStepKey;
}

/**
 * Returns the label key for the currently active step, when present.
 */
export function getActiveStepKey(agentSteps: AgentStep[]): string | undefined {
  const activeStep = agentSteps.find((step) => step.status === 'active');
  return activeStep ? stepLabelKeys[activeStep.name] : undefined;
}

/**
 * Returns the label key for the latest completed step using step priority.
 * Priority order is `answering` > `thinking` > `searching`.
 */
export function getLatestCompletedStepKey(
  agentSteps: AgentStep[]
): string | undefined {
  for (const stepName of [...STEP_NAMES].reverse()) {
    const completedStep = agentSteps.find(
      (step) => step.name === stepName && step.status === 'completed'
    );

    if (completedStep) {
      return stepLabelKeys[completedStep.name];
    }
  }

  return undefined;
}
