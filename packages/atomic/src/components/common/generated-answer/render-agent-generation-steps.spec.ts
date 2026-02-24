import type {i18n} from 'i18next';
import {html} from 'lit';
import {beforeAll, describe, expect, it} from 'vitest';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {
  type RenderAgentGenerationStepsProps,
  renderAgentGenerationSteps,
} from './render-agent-generation-steps';

type AgentStep = {
  name: 'search' | 'think' | 'generate';
  status: 'active' | 'completed';
  startedAt: number;
  finishedAt?: number;
};

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
      agentSteps: [],
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

  const buildStep = (overrides: Partial<AgentStep>): AgentStep => ({
    name: 'search',
    status: 'completed',
    startedAt: 0,
    ...overrides,
  });

  it('should not render anything when there are no steps', async () => {
    const {element} = await renderComponent({
      agentSteps: [],
      isStreaming: true,
    });

    expect(element.children.length).toBe(0);
  });

  it('should not render anything when not streaming', async () => {
    const {element} = await renderComponent({
      agentSteps: [buildStep({name: 'search', status: 'active'})],
      isStreaming: false,
    });

    expect(element.children.length).toBe(0);
  });

  it('should render the active search step label when streaming', async () => {
    const {element} = await renderComponent({
      agentSteps: [buildStep({name: 'search', status: 'active'})],
      isStreaming: true,
    });

    await expect
      .element(element)
      .toHaveTextContent('Searching for relevant results...');
  });

  it('should render the active think step label when streaming', async () => {
    const {element} = await renderComponent({
      agentSteps: [buildStep({name: 'think', status: 'active'})],
      isStreaming: true,
    });

    await expect.element(element).toHaveTextContent('Thinking...');
  });

  it('should render the active generate step label when streaming', async () => {
    const {element} = await renderComponent({
      agentSteps: [buildStep({name: 'generate', status: 'active'})],
      isStreaming: true,
    });

    await expect.element(element).toHaveTextContent('Generated answer: ');
  });

  it('should render the latest completed step when there is no active step', async () => {
    const {element} = await renderComponent({
      agentSteps: [
        buildStep({name: 'search', status: 'completed'}),
        buildStep({name: 'think', status: 'completed'}),
      ],
      isStreaming: true,
    });

    await expect.element(element).toHaveTextContent('Thinking...');
  });

  it('should prioritize the active step over completed steps', async () => {
    const {element} = await renderComponent({
      agentSteps: [
        buildStep({name: 'generate', status: 'completed'}),
        buildStep({name: 'search', status: 'active'}),
      ],
      isStreaming: true,
    });

    await expect
      .element(element)
      .toHaveTextContent('Searching for relevant results...');
  });

  it('should render the rolodex animation structure', async () => {
    const {element} = await renderComponent({
      agentSteps: [buildStep({name: 'search', status: 'active'})],
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
