import {html} from 'lit';
import {describe, expect, it} from 'vitest';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {
  type RenderAgentGenerationStepsProps,
  renderAgentGenerationSteps,
} from './render-agent-generation-steps';

describe('#renderAgentGenerationSteps', () => {
  const renderComponent = async (
    overrides: Partial<RenderAgentGenerationStepsProps> = {}
  ) => {
    const defaultProps: RenderAgentGenerationStepsProps = {
      currentStepLabel: '',
      isStreaming: false,
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
    generationStepsContainer: '.generation-steps-container',
    generationStepsValue: '.generation-steps-value',
  };

  it('should not render anything when label is an empty string', async () => {
    const {element} = await renderComponent({
      currentStepLabel: '',
      isStreaming: true,
    });

    expect(element.children.length).toBe(0);
  });

  it('should render when label contains whitespace', async () => {
    const {element} = await renderComponent({
      currentStepLabel: ' ',
      isStreaming: true,
    });

    expect(element.children.length).toBe(1);
    expect(
      element.querySelector(selectors.generationStepsContainer)
    ).toBeInTheDocument();
  });

  it('should render the provided label when streaming', async () => {
    const {element} = await renderComponent({
      currentStepLabel: 'Searching for relevant results...',
      isStreaming: true,
    });

    await expect
      .element(element)
      .toHaveTextContent('Searching for relevant results...');
  });

  it('should render the provided label when not streaming', async () => {
    const {element} = await renderComponent({
      currentStepLabel: 'Thinking...',
      isStreaming: false,
    });

    await expect.element(element).toHaveTextContent('Thinking...');
  });

  it('should render the rolodex animation structure', async () => {
    const {element} = await renderComponent({
      currentStepLabel: 'Searching for relevant results...',
      isStreaming: true,
    });

    expect(
      element.querySelector(selectors.generationStepsContainer)
    ).toBeInTheDocument();
    expect(
      element.querySelector(selectors.generationStepsValue)
    ).toBeInTheDocument();
  });
});
