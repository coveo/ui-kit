import type {AgentStep} from '@coveo/headless';
import type {i18n} from 'i18next';
import {html} from 'lit';
import {beforeAll, beforeEach, describe, expect, it} from 'vitest';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {
  getActiveStepKey,
  getCurrentStepKey,
  getLatestCompletedStepKey,
  type RenderAgentGenerationStepsProps,
  renderAgentGenerationSteps,
} from './render-agent-generation-steps';

const AGENT_STEPS = {
  search: 'search',
  think: 'think',
  answering: 'answering',
};
const STEP_STATUS = {
  completed: 'completed',
  active: 'active',
};
const BASE_TIME = 10_000;

describe('#renderAgentGenerationSteps', () => {
  let i18n: i18n;

  beforeEach(() => {
    getCurrentStepKey([], 0);
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

  const buildStep = (overrides: Partial<AgentStep>): AgentStep => ({
    name: AGENT_STEPS.search,
    status: STEP_STATUS.completed,
    startedAt: 0,
    ...overrides,
  });

  const mockedSteps = [
    buildStep({
      name: AGENT_STEPS.search,
      status: STEP_STATUS.completed,
      startedAt: BASE_TIME,
    }),
    buildStep({
      name: AGENT_STEPS.think,
      status: STEP_STATUS.completed,
      startedAt: BASE_TIME + 100,
    }),
    buildStep({
      name: AGENT_STEPS.answering,
      status: STEP_STATUS.active,
      startedAt: BASE_TIME + 200,
    }),
  ];

  describe('#getCurrentStepKey', () => {
    it('should return undefined when no steps are provided', () => {
      expect(getCurrentStepKey([])).toBeUndefined();
    });

    it('should return the active step key when an active step exists', () => {
      const key = getCurrentStepKey([
        buildStep({name: AGENT_STEPS.think, status: STEP_STATUS.active}),
      ]);

      expect(key).toBe('agent-generation-step-think');
    });

    it('should return the highest-priority completed step key when no active step exists', () => {
      const key = getCurrentStepKey([
        buildStep({name: AGENT_STEPS.search, status: STEP_STATUS.completed}),
        buildStep({name: AGENT_STEPS.think, status: STEP_STATUS.completed}),
      ]);

      expect(key).toBe('agent-generation-step-think');
    });

    it('should prioritize an active step over completed steps', () => {
      const key = getCurrentStepKey([
        buildStep({
          name: AGENT_STEPS.answering,
          status: STEP_STATUS.completed,
        }),
        buildStep({name: AGENT_STEPS.search, status: STEP_STATUS.active}),
      ]);

      expect(key).toBe('agent-generation-step-search');
    });

    it('should return the active answering step when multiple steps with timestamps are provided', () => {
      const key = getCurrentStepKey(mockedSteps, BASE_TIME + 500);

      expect(key).toBe('generating-answer');
    });

    it('should continue to return the active step regardless of elapsed time', () => {
      getCurrentStepKey(mockedSteps, BASE_TIME);

      const key = getCurrentStepKey(mockedSteps, BASE_TIME + 1_550);

      expect(key).toBe('generating-answer');
    });
  });

  describe('#getActiveStepKey', () => {
    it('should return undefined when there is no active step', () => {
      const key = getActiveStepKey([
        buildStep({name: AGENT_STEPS.search, status: STEP_STATUS.completed}),
      ]);

      expect(key).toBeUndefined();
    });

    it('should return the key of the active step', () => {
      const key = getActiveStepKey([
        buildStep({name: AGENT_STEPS.search, status: STEP_STATUS.completed}),
        buildStep({name: AGENT_STEPS.answering, status: STEP_STATUS.active}),
      ]);

      expect(key).toBe('generating-answer');
    });
  });

  describe('#getLatestCompletedStepKey', () => {
    it('should return undefined when there is no completed step', () => {
      const key = getLatestCompletedStepKey([
        buildStep({name: AGENT_STEPS.think, status: STEP_STATUS.active}),
      ]);

      expect(key).toBeUndefined();
    });

    it('should return the highest-priority completed key', () => {
      const key = getLatestCompletedStepKey([
        buildStep({name: AGENT_STEPS.search, status: STEP_STATUS.completed}),
        buildStep({name: AGENT_STEPS.think, status: STEP_STATUS.completed}),
        buildStep({
          name: AGENT_STEPS.answering,
          status: STEP_STATUS.completed,
        }),
      ]);

      expect(key).toBe('generating-answer');
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
        buildStep({name: AGENT_STEPS.search, status: STEP_STATUS.active}),
      ],
      isStreaming: false,
    });

    expect(element.children.length).toBe(0);
  });

  it('should render the active search step label when streaming', async () => {
    const {element} = await renderComponent({
      agentSteps: [
        buildStep({name: AGENT_STEPS.search, status: STEP_STATUS.active}),
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
        buildStep({name: AGENT_STEPS.think, status: STEP_STATUS.active}),
      ],
      isStreaming: true,
    });

    await expect.element(element).toHaveTextContent('Thinking...');
  });

  it('should render the active answering step label when streaming', async () => {
    const {element} = await renderComponent({
      agentSteps: [
        buildStep({name: AGENT_STEPS.answering, status: STEP_STATUS.active}),
      ],
      isStreaming: true,
    });

    await expect.element(element).toHaveTextContent('Generating answer');
  });

  it('should render the latest completed step when there is no active step', async () => {
    const {element} = await renderComponent({
      agentSteps: [
        buildStep({name: AGENT_STEPS.search, status: STEP_STATUS.completed}),
        buildStep({name: AGENT_STEPS.think, status: STEP_STATUS.completed}),
      ],
      isStreaming: true,
    });

    await expect.element(element).toHaveTextContent('Thinking...');
  });

  it('should prioritize the active step over completed steps', async () => {
    const {element} = await renderComponent({
      agentSteps: [
        buildStep({
          name: AGENT_STEPS.answering,
          status: STEP_STATUS.completed,
        }),
        buildStep({name: AGENT_STEPS.search, status: STEP_STATUS.active}),
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
        buildStep({name: AGENT_STEPS.search, status: STEP_STATUS.active}),
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
