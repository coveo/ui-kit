import type {i18n} from 'i18next';
import {html} from 'lit';
import {beforeAll, beforeEach, describe, expect, it} from 'vitest';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {
  type AgentStep,
  getActiveStepKey,
  getCurrentStepKey,
  getLatestCompletedStepKey,
  type RenderAgentGenerationStepsProps,
  renderAgentGenerationSteps,
} from './render-agent-generation-steps';

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

  describe('#getCurrentStepKey', () => {
    it('should return undefined when no steps are provided', () => {
      expect(getCurrentStepKey([])).toBeUndefined();
    });

    it('should return the active step key when an active step exists', () => {
      const key = getCurrentStepKey([
        buildStep({name: 'think', status: 'active'}),
      ]);

      expect(key).toBe('agent-generation-step-think');
    });

    it('should return the highest-priority completed step key when no active step exists', () => {
      const key = getCurrentStepKey([
        buildStep({name: 'search', status: 'completed'}),
        buildStep({name: 'think', status: 'completed'}),
      ]);

      expect(key).toBe('agent-generation-step-think');
    });

    it('should prioritize an active step over completed steps', () => {
      const key = getCurrentStepKey([
        buildStep({name: 'generate', status: 'completed'}),
        buildStep({name: 'search', status: 'active'}),
      ]);

      expect(key).toBe('agent-generation-step-search');
    });

    it('should keep showing the first step when later steps arrive quickly', () => {
      const baseTime = 10_000;
      const key = getCurrentStepKey(
        [
          buildStep({name: 'search', status: 'completed', startedAt: baseTime}),
          buildStep({
            name: 'think',
            status: 'completed',
            startedAt: baseTime + 100,
          }),
          buildStep({
            name: 'generate',
            status: 'active',
            startedAt: baseTime + 200,
          }),
        ],
        baseTime + 500
      );

      expect(key).toBe('agent-generation-step-search');
    });

    it('should advance one step only after 1500ms elapsed', () => {
      const baseTime = 10_000;

      getCurrentStepKey(
        [
          buildStep({name: 'search', status: 'completed', startedAt: baseTime}),
          buildStep({
            name: 'think',
            status: 'completed',
            startedAt: baseTime + 100,
          }),
          buildStep({
            name: 'generate',
            status: 'active',
            startedAt: baseTime + 200,
          }),
        ],
        baseTime
      );

      const key = getCurrentStepKey(
        [
          buildStep({name: 'search', status: 'completed', startedAt: baseTime}),
          buildStep({
            name: 'think',
            status: 'completed',
            startedAt: baseTime + 100,
          }),
          buildStep({
            name: 'generate',
            status: 'active',
            startedAt: baseTime + 200,
          }),
        ],
        baseTime + 1_550
      );

      expect(key).toBe('agent-generation-step-think');
    });
  });

  describe('#getActiveStepKey', () => {
    it('should return undefined when there is no active step', () => {
      const key = getActiveStepKey([
        buildStep({name: 'search', status: 'completed'}),
      ]);

      expect(key).toBeUndefined();
    });

    it('should return the key of the active step', () => {
      const key = getActiveStepKey([
        buildStep({name: 'search', status: 'completed'}),
        buildStep({name: 'generate', status: 'active'}),
      ]);

      expect(key).toBe('generating-answer');
    });
  });

  describe('#getLatestCompletedStepKey', () => {
    it('should return undefined when there is no completed step', () => {
      const key = getLatestCompletedStepKey([
        buildStep({name: 'think', status: 'active'}),
      ]);

      expect(key).toBeUndefined();
    });

    it('should return the highest-priority completed key', () => {
      const key = getLatestCompletedStepKey([
        buildStep({name: 'search', status: 'completed'}),
        buildStep({name: 'think', status: 'completed'}),
        buildStep({name: 'generate', status: 'completed'}),
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

    await expect.element(element).toHaveTextContent('Generating answer');
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
