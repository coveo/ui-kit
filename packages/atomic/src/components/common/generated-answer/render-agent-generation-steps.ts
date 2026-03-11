import type {GenerationStep, GenerationStepName} from '@coveo/headless';
import type {i18n} from 'i18next';
import {html} from 'lit';
import {keyed} from 'lit/directives/keyed.js';
import {when} from 'lit/directives/when.js';
import type {FunctionalComponent} from '@/src/utils/functional-component-utils';

const stepLabelKeys: Record<GenerationStepName, string> = {
  searching: 'agent-generation-step-search',
  thinking: 'agent-generation-step-think',
  answering: 'generating-answer',
};

export interface RenderAgentGenerationStepsProps {
  i18n: i18n;
  agentSteps: GenerationStep[];
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
          class="text-neutral-dark flex text-sm font-light"
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
 */
export function getCurrentStepKey(
  generationSteps: GenerationStep[]
): string | undefined {
  const activeStep = generationSteps.findLast(
    (step) => step.status === 'active'
  );
  return activeStep ? stepLabelKeys[activeStep.name] : undefined;
}
