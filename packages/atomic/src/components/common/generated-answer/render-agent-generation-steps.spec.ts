import type {i18n} from 'i18next';
import {html} from 'lit';
import {beforeAll, describe, expect, it} from 'vitest';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {
  type RenderAgentGenerationStepsProps,
  renderAgentGenerationSteps,
} from './render-agent-generation-steps';

describe('#renderAgentGenerationSteps', () => {
  let i18n: i18n;

  beforeAll(async () => {
    i18n = await createTestI18n();
  });

  const renderComponent = async (
    overrides: Partial<RenderAgentGenerationStepsProps> = {}
  ) => {
    const defaultProps: RenderAgentGenerationStepsProps = {
      i18n,
      isStreaming: false,
      currentStep: undefined,
      showCompletedStep: false,
      ...overrides,
    };

    const element = await renderFunctionFixture(
      html`${renderAgentGenerationSteps({props: defaultProps})}`
    );

    return {
      element,
      label: element.querySelector('[part="is-generating"]'),
    };
  };

  const selectors = {
    statusLabel: '[part="is-generating"]',
    generationStepsContainer: '.generation-steps-container',
    generationStepsValue: '.generation-steps-value',
  };

  it('should not render anything when not streaming', async () => {
    const {element} = await renderComponent({isStreaming: false});

    expect(element.children.length).toBe(0);
  });

  it('should render the completed step label when streaming is finished and showCompletedStep is true', async () => {
    const {element} = await renderComponent({
      isStreaming: false,
      showCompletedStep: true,
      currentStep: 'generate',
      completedStepTranslationKeys: {
        generate: 'search',
      },
    });

    await expect.element(element).toHaveTextContent('Search');
  });

  it('should not render the completed step label when showCompletedStep is false', async () => {
    const {element} = await renderComponent({
      isStreaming: false,
      showCompletedStep: false,
      currentStep: 'generate',
    });

    expect(element.children.length).toBe(0);
  });

  it('should render the search label for the search step', async () => {
    const {element} = await renderComponent({
      isStreaming: true,
      currentStep: 'search',
    });

    await expect
      .element(element)
      .toHaveTextContent('Searching for relevant results...');
  });

  it('should render the loading label for the think step', async () => {
    const {element} = await renderComponent({
      isStreaming: true,
      currentStep: 'think',
    });

    await expect.element(element).toHaveTextContent('Thinking...');
  });

  it('should render the generating label for the generate step', async () => {
    const {element} = await renderComponent({
      isStreaming: true,
      currentStep: 'generate',
    });

    await expect
      .element(element)
      .toHaveTextContent('Generated answer: {{answer}}');
  });

  it('should fallback to generating answer label when step is unknown', async () => {
    const {element} = await renderComponent({
      isStreaming: true,
      currentStep: 'unknown-step',
    });

    await expect.element(element).toHaveTextContent('Generating answer...');
  });

  it('should render custom step labels when provided', async () => {
    const {element} = await renderComponent({
      isStreaming: true,
      currentStep: 'generate',
      stepTranslationKeys: {
        generate: 'search',
      },
    });

    await expect.element(element).toHaveTextContent('Search');
  });

  it('should render the rolodex animation structure', async () => {
    const {element} = await renderComponent({
      isStreaming: true,
      currentStep: 'search',
    });

    expect(
      element.querySelector(selectors.generationStepsContainer)
    ).toBeInTheDocument();
    expect(
      element.querySelector(selectors.generationStepsValue)
    ).toBeInTheDocument();
  });
});
