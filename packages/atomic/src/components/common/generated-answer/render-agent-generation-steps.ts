import {html} from 'lit';
import {keyed} from 'lit/directives/keyed.js';
import {when} from 'lit/directives/when.js';
import type {FunctionalComponent} from '@/src/utils/functional-component-utils';

export interface RenderAgentGenerationStepsProps {
  currentStepLabel: string;
  isStreaming: boolean;
}

export const renderAgentGenerationSteps: FunctionalComponent<
  RenderAgentGenerationStepsProps
> = ({props}) => {
  const {currentStepLabel, isStreaming} = props;
  const canRender = currentStepLabel !== '' && !isStreaming;

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
