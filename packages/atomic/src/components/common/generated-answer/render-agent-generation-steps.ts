import type {i18n} from 'i18next';
import {html} from 'lit';
import {keyed} from 'lit/directives/keyed.js';
import {when} from 'lit/directives/when.js';
import type {FunctionalComponent} from '@/src/utils/functional-component-utils';

const defaultStepTranslationKeys: Record<string, string> = {
  search: 'agent-generation-step-search',
  think: 'agent-generation-step-think',
  generate: 'answer-generated',
};

const defaultCompletedStepTranslationKeys: Record<string, string> = {
  search: 'agent-generation-step-search',
  think: 'agent-generation-step-think',
  generate: 'answer-generated',
};

export interface RenderAgentGenerationStepsProps {
  i18n: i18n;
  isStreaming: boolean;
  currentStep?: string;
  stepTranslationKeys?: Record<string, string>;
  completedStepTranslationKeys?: Record<string, string>;
  showCompletedStep?: boolean;
}

export const renderAgentGenerationSteps: FunctionalComponent<
  RenderAgentGenerationStepsProps
> = ({props}) => {
  const {
    i18n,
    isStreaming,
    currentStep,
    stepTranslationKeys = {},
    completedStepTranslationKeys = {},
    showCompletedStep = false,
  } = props;

  const normalizedStep = currentStep?.trim().toLowerCase();
  const translationKeys = {
    ...defaultStepTranslationKeys,
    ...stepTranslationKeys,
  };
  const completedTranslationKeys = {
    ...defaultCompletedStepTranslationKeys,
    ...completedStepTranslationKeys,
  };

  const stepKey = normalizedStep ? translationKeys[normalizedStep] : null;
  const completedStepKey = normalizedStep
    ? completedTranslationKeys[normalizedStep]
    : null;

  const translationKey = isStreaming ? stepKey : completedStepKey;
  const statusLabel = translationKey
    ? i18n.t(translationKey)
    : `${i18n.t('generating-answer')}...`;
  const animationKey = `${normalizedStep ?? 'default'}-${isStreaming ? 'streaming' : 'done'}-${statusLabel}`;

  const canRender = isStreaming || (showCompletedStep && !!normalizedStep);

  return html`${when(
    canRender,
    () => html`
      <div
        part="is-generating"
        class="text-neutral-dark flex text-base font-light"
      >
        <span class="generation-steps-container">
          ${keyed(
            animationKey,
            html`<span class="generation-steps-value">${statusLabel}</span>`
          )}
        </span>
      </div>
    `
  )}`;
};
