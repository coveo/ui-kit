import type {GenerationStep} from '@coveo/headless';
import type {i18n} from 'i18next';
import {html} from 'lit';
import {beforeAll, describe, expect, it} from 'vitest';
import {fixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {
  AtomicAgentStreamOfThought,
  resolveSteps,
} from './atomic-agent-stream-of-thought';
import './atomic-agent-stream-of-thought';

const STEP_NAMES = {
  searching: 'searching',
  thinking: 'thinking',
  answering: 'answering',
} as const;

const STEP_STATUS = {
  completed: 'completed',
  active: 'active',
} as const;

describe('atomic-agent-stream-of-thought', () => {
  let i18n: i18n;

  beforeAll(async () => {
    i18n = await createTestI18n();
  });

  const buildStep = (overrides: Partial<GenerationStep>): GenerationStep => ({
    name: STEP_NAMES.searching,
    status: STEP_STATUS.completed,
    startedAt: 0,
    ...overrides,
  });

  const renderComponent = async (
    overrides: Partial<{
      agentSteps: GenerationStep[];
      isStreaming: boolean;
    }> = {}
  ) => {
    const agentSteps = overrides.agentSteps ?? [];
    const isStreaming = overrides.isStreaming ?? false;

    const element = await fixture<AtomicAgentStreamOfThought>(
      html`<atomic-agent-stream-of-thought
        .i18n=${i18n}
        .agentSteps=${agentSteps}
        .isStreaming=${isStreaming}
      ></atomic-agent-stream-of-thought>`
    );

    return {
      element,
      get timeline() {
        return element.shadowRoot?.querySelector(
          '[part="agent-stream-of-thought"]'
        );
      },
      get steps() {
        return element.shadowRoot?.querySelectorAll('.step') ?? [];
      },
      get spinners() {
        return element.shadowRoot?.querySelectorAll('.spinner') ?? [];
      },
      get checkmarks() {
        return element.shadowRoot?.querySelectorAll('.checkmark-icon') ?? [];
      },
      get toggleButton() {
        return (
          element.shadowRoot?.querySelector<HTMLButtonElement>(
            '.toggle-button'
          ) ??
          element.shadowRoot?.querySelector<HTMLButtonElement>(
            '.collapsed-timeline-summary'
          )
        );
      },
      get collapsedTimelineSummary() {
        return element.shadowRoot?.querySelector<HTMLButtonElement>(
          '.collapsed-timeline-summary'
        );
      },
      get chevron() {
        return element.shadowRoot?.querySelector('.chevron');
      },
    };
  };

  describe('#resolveSteps', () => {
    it('should return empty array for empty input', () => {
      expect(resolveSteps([])).toEqual([]);
    });

    it('should resolve thinking before searching as thinking-before-search', () => {
      const steps = [buildStep({name: 'thinking', status: 'active'})];
      expect(resolveSteps(steps)).toEqual([
        {type: 'thinking-before-search', status: 'active'},
      ]);
    });

    it('should resolve searching as searching', () => {
      const steps = [buildStep({name: 'searching', status: 'active'})];
      expect(resolveSteps(steps)).toEqual([
        {type: 'searching', status: 'active'},
      ]);
    });

    it('should resolve thinking after searching as thinking-after-search', () => {
      const steps = [
        buildStep({name: 'searching', status: 'completed'}),
        buildStep({name: 'thinking', status: 'active'}),
      ];
      expect(resolveSteps(steps)).toEqual([
        {type: 'searching', status: 'completed'},
        {type: 'thinking-after-search', status: 'active'},
      ]);
    });

    it('should resolve answering as answering', () => {
      const steps = [buildStep({name: 'answering', status: 'active'})];
      expect(resolveSteps(steps)).toEqual([
        {type: 'answering', status: 'active'},
      ]);
    });

    it('should resolve a full sequence correctly', () => {
      const steps = [
        buildStep({name: 'thinking', status: 'completed'}),
        buildStep({name: 'searching', status: 'completed'}),
        buildStep({name: 'thinking', status: 'completed'}),
        buildStep({name: 'answering', status: 'active'}),
      ];
      const result = resolveSteps(steps);
      expect(result).toEqual([
        {type: 'thinking-before-search', status: 'completed'},
        {type: 'searching', status: 'completed'},
        {type: 'thinking-after-search', status: 'completed'},
        {type: 'answering', status: 'active'},
      ]);
    });

    it('should handle repeated searching steps', () => {
      const steps = [
        buildStep({name: 'thinking', status: 'completed'}),
        buildStep({name: 'searching', status: 'completed'}),
        buildStep({name: 'thinking', status: 'completed'}),
        buildStep({name: 'searching', status: 'completed'}),
        buildStep({name: 'thinking', status: 'active'}),
      ];
      const result = resolveSteps(steps);
      expect(result).toEqual([
        {type: 'thinking-before-search', status: 'completed'},
        {type: 'searching', status: 'completed'},
        {type: 'thinking-after-search', status: 'completed'},
        {type: 'searching', status: 'completed'},
        {type: 'thinking-after-search', status: 'active'},
      ]);
    });
  });

  describe('during streaming', () => {
    it('should render nothing when there are no steps', async () => {
      const {timeline} = await renderComponent({
        agentSteps: [],
        isStreaming: true,
      });

      expect(timeline).toBeNull();
    });
    it('should show all steps progressively', async () => {
      const {steps} = await renderComponent({
        agentSteps: [
          buildStep({name: 'thinking', status: 'completed'}),
          buildStep({name: 'searching', status: 'active'}),
        ],
        isStreaming: true,
      });

      expect(steps.length).toBe(2);
    });

    it('should show a spinner for the active step', async () => {
      const {spinners} = await renderComponent({
        agentSteps: [buildStep({name: 'thinking', status: 'active'})],
        isStreaming: true,
      });

      expect(spinners.length).toBe(1);
    });

    it('should show checkmarks for completed steps', async () => {
      const {checkmarks, spinners} = await renderComponent({
        agentSteps: [
          buildStep({name: 'thinking', status: 'completed'}),
          buildStep({name: 'searching', status: 'active'}),
        ],
        isStreaming: true,
      });

      expect(checkmarks.length).toBe(1);
      expect(spinners.length).toBe(1);
    });

    it('should not show a toggle button', async () => {
      const {toggleButton} = await renderComponent({
        agentSteps: [buildStep({name: 'thinking', status: 'active'})],
        isStreaming: true,
      });

      expect(toggleButton).toBeNull();
    });

    it('should display the correct label for thinking before search', async () => {
      const {steps} = await renderComponent({
        agentSteps: [buildStep({name: 'thinking', status: 'active'})],
        isStreaming: true,
      });

      expect(steps[0].textContent).toContain(
        i18n.t('agent-generation-step-analyzing-question')
      );
    });

    it('should display the correct label for searching', async () => {
      const {steps} = await renderComponent({
        agentSteps: [
          buildStep({name: 'thinking', status: 'completed'}),
          buildStep({name: 'searching', status: 'active'}),
        ],
        isStreaming: true,
      });

      expect(steps[1].textContent).toContain(
        i18n.t('agent-generation-step-search')
      );
    });

    it('should display "Analyzing results…" for thinking after search', async () => {
      const {steps} = await renderComponent({
        agentSteps: [
          buildStep({name: 'thinking', status: 'completed'}),
          buildStep({name: 'searching', status: 'completed'}),
          buildStep({name: 'thinking', status: 'active'}),
        ],
        isStreaming: true,
      });

      expect(steps[2].textContent).toContain(
        i18n.t('agent-generation-step-analyzing-results')
      );
    });

    it('should display "Analyzing results…" for thinking after each search in iterative cycles', async () => {
      const {steps} = await renderComponent({
        agentSteps: [
          buildStep({name: 'thinking', status: 'completed'}),
          buildStep({name: 'searching', status: 'completed'}),
          buildStep({name: 'thinking', status: 'completed'}),
          buildStep({name: 'searching', status: 'completed'}),
          buildStep({name: 'thinking', status: 'active'}),
        ],
        isStreaming: true,
      });

      expect(steps[2].textContent).toContain(
        i18n.t('agent-generation-step-analyzing-results-completed')
      );
      expect(steps[4].textContent).toContain(
        i18n.t('agent-generation-step-analyzing-results')
      );
    });

    it('should display the correct label for answering', async () => {
      const {steps} = await renderComponent({
        agentSteps: [
          buildStep({name: 'thinking', status: 'completed'}),
          buildStep({name: 'searching', status: 'completed'}),
          buildStep({name: 'thinking', status: 'completed'}),
          buildStep({name: 'answering', status: 'active'}),
        ],
        isStreaming: true,
      });

      expect(steps[3].textContent).toContain(
        i18n.t('agent-generation-step-answering')
      );
    });

    it('should display completed label for completed steps', async () => {
      const {steps} = await renderComponent({
        agentSteps: [
          buildStep({name: 'thinking', status: 'completed'}),
          buildStep({name: 'searching', status: 'active'}),
        ],
        isStreaming: true,
      });

      expect(steps[0].textContent).toContain(
        i18n.t('agent-generation-step-analyzing-question-completed')
      );
    });
  });

  describe('after streaming completes', () => {
    it('should auto-collapse to show only the last step', async () => {
      const {collapsedTimelineSummary} = await renderComponent({
        agentSteps: [
          buildStep({name: 'thinking', status: 'completed'}),
          buildStep({name: 'searching', status: 'completed'}),
          buildStep({name: 'thinking', status: 'completed'}),
          buildStep({name: 'answering', status: 'completed'}),
        ],
        isStreaming: false,
      });

      expect(collapsedTimelineSummary).not.toBeNull();
      expect(collapsedTimelineSummary?.textContent).toContain(
        i18n.t('agent-generation-step-answering-completed')
      );
    });

    it('should show a chevron beside the last step when collapsed', async () => {
      const {collapsedTimelineSummary} = await renderComponent({
        agentSteps: [
          buildStep({name: 'thinking', status: 'completed'}),
          buildStep({name: 'answering', status: 'completed'}),
        ],
        isStreaming: false,
      });

      expect(collapsedTimelineSummary).not.toBeNull();
      expect(
        collapsedTimelineSummary?.querySelector('.chevron')
      ).not.toBeNull();
    });

    it('should show the last step completed label', async () => {
      const {collapsedTimelineSummary} = await renderComponent({
        agentSteps: [
          buildStep({name: 'thinking', status: 'completed'}),
          buildStep({name: 'searching', status: 'completed'}),
          buildStep({name: 'thinking', status: 'completed'}),
          buildStep({name: 'answering', status: 'completed'}),
        ],
        isStreaming: false,
      });

      expect(collapsedTimelineSummary?.textContent).toContain(
        i18n.t('agent-generation-step-answering-completed')
      );
    });

    it('should show a checkmark icon on the collapsed step', async () => {
      const {collapsedTimelineSummary} = await renderComponent({
        agentSteps: [
          buildStep({name: 'thinking', status: 'completed'}),
          buildStep({name: 'answering', status: 'completed'}),
        ],
        isStreaming: false,
      });

      expect(
        collapsedTimelineSummary?.querySelector('.checkmark-icon')
      ).not.toBeNull();
    });

    it('should have aria-expanded set to false when collapsed', async () => {
      const {collapsedTimelineSummary} = await renderComponent({
        agentSteps: [
          buildStep({name: 'thinking', status: 'completed'}),
          buildStep({name: 'answering', status: 'completed'}),
        ],
        isStreaming: false,
      });

      expect(collapsedTimelineSummary?.getAttribute('aria-expanded')).toBe(
        'false'
      );
    });

    it('should render nothing when there are no steps and not streaming', async () => {
      const {timeline} = await renderComponent({
        agentSteps: [],
        isStreaming: false,
      });

      expect(timeline).toBeNull();
    });
  });

  describe('expand/collapse interaction', () => {
    it('should expand to show all steps when collapsed row is clicked', async () => {
      const {element, collapsedTimelineSummary} = await renderComponent({
        agentSteps: [
          buildStep({name: 'thinking', status: 'completed'}),
          buildStep({name: 'searching', status: 'completed'}),
          buildStep({name: 'thinking', status: 'completed'}),
          buildStep({name: 'answering', status: 'completed'}),
        ],
        isStreaming: false,
      });

      collapsedTimelineSummary?.click();
      await element.updateComplete;

      const steps = element.shadowRoot?.querySelectorAll('.step') ?? [];
      expect(steps.length).toBe(4);
    });

    it('should show a toggle button with collapse label below steps when expanded', async () => {
      const {element, collapsedTimelineSummary} = await renderComponent({
        agentSteps: [
          buildStep({name: 'thinking', status: 'completed'}),
          buildStep({name: 'answering', status: 'completed'}),
        ],
        isStreaming: false,
      });

      collapsedTimelineSummary?.click();
      await element.updateComplete;

      const toggleButton = element.shadowRoot?.querySelector('.toggle-button');
      expect(toggleButton).not.toBeNull();
      expect(toggleButton?.textContent).toContain(i18n.t('collapse'));
    });

    it('should collapse back when toggle button is clicked', async () => {
      const {element, collapsedTimelineSummary} = await renderComponent({
        agentSteps: [
          buildStep({name: 'thinking', status: 'completed'}),
          buildStep({name: 'searching', status: 'completed'}),
          buildStep({name: 'answering', status: 'completed'}),
        ],
        isStreaming: false,
      });

      collapsedTimelineSummary?.click();
      await element.updateComplete;

      const expandedToggle =
        element.shadowRoot?.querySelector<HTMLButtonElement>('.toggle-button');
      expandedToggle?.click();
      await element.updateComplete;

      expect(
        element.shadowRoot?.querySelector('.collapsed-timeline-summary')
      ).not.toBeNull();
    });

    it('should show chevron pointing up when expanded', async () => {
      const {element, collapsedTimelineSummary} = await renderComponent({
        agentSteps: [
          buildStep({name: 'thinking', status: 'completed'}),
          buildStep({name: 'answering', status: 'completed'}),
        ],
        isStreaming: false,
      });

      collapsedTimelineSummary?.click();
      await element.updateComplete;

      const chevron = element.shadowRoot?.querySelector('.chevron');
      expect(chevron?.classList.contains('chevron-up')).toBe(true);
    });

    it('should show chevron pointing down when collapsed', async () => {
      const {chevron} = await renderComponent({
        agentSteps: [
          buildStep({name: 'thinking', status: 'completed'}),
          buildStep({name: 'answering', status: 'completed'}),
        ],
        isStreaming: false,
      });

      expect(chevron?.classList.contains('chevron-up')).toBe(false);
    });

    it('should set aria-expanded to true when expanded', async () => {
      const {element, collapsedTimelineSummary} = await renderComponent({
        agentSteps: [
          buildStep({name: 'thinking', status: 'completed'}),
          buildStep({name: 'answering', status: 'completed'}),
        ],
        isStreaming: false,
      });

      collapsedTimelineSummary?.click();
      await element.updateComplete;

      const expandedToggle =
        element.shadowRoot?.querySelector<HTMLButtonElement>('.toggle-button');
      expect(expandedToggle?.getAttribute('aria-expanded')).toBe('true');
    });
  });

  describe('streaming to complete transition', () => {
    it('should auto-collapse when isStreaming changes from true to false', async () => {
      const {element} = await renderComponent({
        agentSteps: [
          buildStep({name: 'thinking', status: 'completed'}),
          buildStep({name: 'searching', status: 'completed'}),
          buildStep({name: 'answering', status: 'active'}),
        ],
        isStreaming: true,
      });

      let steps = element.shadowRoot?.querySelectorAll('.step') ?? [];
      expect(steps.length).toBe(3);

      element.agentSteps = [
        buildStep({name: 'thinking', status: 'completed'}),
        buildStep({name: 'searching', status: 'completed'}),
        buildStep({name: 'answering', status: 'completed'}),
      ];
      element.isStreaming = false;
      await element.updateComplete;

      steps = element.shadowRoot?.querySelectorAll('.step') ?? [];
      expect(steps.length).toBe(0);
      expect(
        element.shadowRoot?.querySelector('.collapsed-timeline-summary')
      ).not.toBeNull();
    });
  });

  describe('single answering step', () => {
    it('should show the step without a toggle button when only answering exists', async () => {
      const {steps, toggleButton, collapsedTimelineSummary} =
        await renderComponent({
          agentSteps: [buildStep({name: 'answering', status: 'completed'})],
          isStreaming: false,
        });

      expect(steps.length).toBe(1);
      expect(toggleButton).toBeNull();
      expect(collapsedTimelineSummary).toBeNull();
    });

    it('should show the answering step with a spinner while streaming', async () => {
      const {steps, spinners, toggleButton} = await renderComponent({
        agentSteps: [buildStep({name: 'answering', status: 'active'})],
        isStreaming: true,
      });

      expect(steps.length).toBe(1);
      expect(spinners.length).toBe(1);
      expect(toggleButton).toBeNull();
    });

    it('should show the answering step with a checkmark after completion', async () => {
      const {steps, checkmarks} = await renderComponent({
        agentSteps: [buildStep({name: 'answering', status: 'completed'})],
        isStreaming: false,
      });

      expect(steps.length).toBe(1);
      expect(checkmarks.length).toBe(1);
      expect(steps[0].textContent).toContain(
        i18n.t('agent-generation-step-answering-completed')
      );
    });
  });
});
