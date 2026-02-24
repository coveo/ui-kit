import type {AgentStep, StepName} from '@coveo/headless';
import {STEP_NAMES} from '@coveo/headless';
import type {i18n} from 'i18next';
import {html} from 'lit';
import {keyed} from 'lit/directives/keyed.js';
import {when} from 'lit/directives/when.js';
import type {FunctionalComponent} from '@/src/utils/functional-component-utils';

const stepLabelKeys: Record<StepName, string> = {
  search: 'agent-generation-step-search',
  think: 'agent-generation-step-think',
  generate: 'answer-generated',
};

export interface RenderAgentGenerationStepsProps {
  i18n: i18n;
  agentSteps: AgentStep[];
  isStreaming: boolean;
}

export const renderAgentGenerationSteps: FunctionalComponent<
  RenderAgentGenerationStepsProps
> = ({props}) => {
  const {i18n, agentSteps, isStreaming} = props;
  const currentStepKey = getCurrentStepKey(agentSteps);
  const currentStepLabel = currentStepKey
    ? i18n.t(
        currentStepKey,
        currentStepKey === 'answer-generated' ? {answer: ''} : undefined
      )
    : undefined;
  const canRender = isStreaming && !!currentStepLabel;

  return html`${when(canRender, () =>
    keyed(
      currentStepLabel,
      html`
        <div
          part="is-generating"
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

// Determines the current generation step key based on the active or most recently completed step.
function getCurrentStepKey(agentSteps: AgentStep[]): string | undefined {
  const activeStep = agentSteps.find((step) => step.status === 'active');

  if (activeStep) {
    return stepLabelKeys[activeStep.name];
  }

  // Finds the most recently completed step based on the predefined priority order.
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
