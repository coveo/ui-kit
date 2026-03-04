import type {GenerationStep} from '@coveo/headless';
import type {i18n} from 'i18next';
import {html} from 'lit';
import {beforeAll, beforeEach, describe, expect, it} from 'vitest';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {
  getCurrentStepKey,
  type RenderAgentGenerationStepsProps,
  renderAgentGenerationSteps,
} from './render-agent-generation-steps';

const GENERATION_STEPS = {
  searching: 'searching',
  thinking: 'thinking',
  answering: 'answering',
} as const;
const STEP_STATUS = {
  completed: 'completed',
  active: 'active',
} as const;
describe('#renderAgentGenerationSteps', () => {
  let i18n: i18n;

  beforeEach(() => {
    getCurrentStepKey([]);
  });

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
      label: element.querySelector('[part="agent-generation-status"]'),
    };
  };

  const selectors = {
    generationStepsContainer: '.generation-steps-container',
    generationStepsValue: '.generation-steps-value',
  };

  const buildStep = (overrides: Partial<GenerationStep>): GenerationStep => ({
    name: GENERATION_STEPS.searching,
    status: STEP_STATUS.completed,
    startedAt: 0,
    ...overrides,
  });

  describe('#getCurrentStepKey', () => {
    it('should return undefined when no steps are provided', () => {
      expect(getCurrentStepKey([])).toBeUndefined();
    });

    it('should return the active step key when an active step exists', () => {
      const key = getCurrentStepKey([
        buildStep({
          name: GENERATION_STEPS.thinking,
          status: STEP_STATUS.active,
        }),
      ]);

      expect(key).toBe('agent-generation-step-think');
    });

    it('should return undefined when no active step exists', () => {
      const key = getCurrentStepKey([
        buildStep({
          name: GENERATION_STEPS.answering,
          status: STEP_STATUS.completed,
        }),
        buildStep({
          name: GENERATION_STEPS.searching,
          status: STEP_STATUS.completed,
        }),
      ]);

      expect(key).toBeUndefined();
    });
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
      agentSteps: [
        buildStep({
          name: GENERATION_STEPS.searching,
          status: STEP_STATUS.active,
        }),
      ],
      isStreaming: false,
    });

    expect(element.children.length).toBe(0);
  });

  it('should render the active search step label when streaming', async () => {
    const {element} = await renderComponent({
      agentSteps: [
        buildStep({
          name: GENERATION_STEPS.searching,
          status: STEP_STATUS.active,
        }),
      ],
      isStreaming: true,
    });

    await expect
      .element(element)
      .toHaveTextContent('Searching for relevant results...');
  });

  it('should render the active think step label when streaming', async () => {
    const {element} = await renderComponent({
      agentSteps: [
        buildStep({
          name: GENERATION_STEPS.thinking,
          status: STEP_STATUS.active,
        }),
      ],
      isStreaming: true,
    });

    await expect.element(element).toHaveTextContent('Thinking...');
  });

  it('should render the active answering step label when streaming', async () => {
    const {element} = await renderComponent({
      agentSteps: [
        buildStep({
          name: GENERATION_STEPS.answering,
          status: STEP_STATUS.active,
        }),
      ],
      isStreaming: true,
    });

    await expect.element(element).toHaveTextContent('Generating answer');
  });

  it('should not render anything when there is no active step', async () => {
    const {element} = await renderComponent({
      agentSteps: [
        buildStep({
          name: GENERATION_STEPS.searching,
          status: STEP_STATUS.completed,
        }),
        buildStep({
          name: GENERATION_STEPS.thinking,
          status: STEP_STATUS.completed,
        }),
      ],
      isStreaming: true,
    });

    expect(element.children.length).toBe(0);
  });

  it('should prioritize the active step over completed steps', async () => {
    const {element} = await renderComponent({
      agentSteps: [
        buildStep({
          name: GENERATION_STEPS.answering,
          status: STEP_STATUS.completed,
        }),
        buildStep({
          name: GENERATION_STEPS.searching,
          status: STEP_STATUS.active,
        }),
      ],
      isStreaming: true,
    });

    await expect
      .element(element)
      .toHaveTextContent('Searching for relevant results...');
  });

  it('should render the rolodex animation structure', async () => {
    const {element} = await renderComponent({
      agentSteps: [
        buildStep({
          name: GENERATION_STEPS.searching,
          status: STEP_STATUS.active,
        }),
      ],
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
