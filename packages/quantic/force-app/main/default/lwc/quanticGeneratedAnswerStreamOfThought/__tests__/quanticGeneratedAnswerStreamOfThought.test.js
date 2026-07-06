import {buildCreateTestComponent, cleanup, flushPromises} from 'c/testUtils';
import QuanticGeneratedAnswerStreamOfThought from '../quanticGeneratedAnswerStreamOfThought';

jest.mock(
  '@salesforce/label/c.quantic_AgentGenerationStepSearchQuery',
  () => ({default: 'Searching for {{0}}.'}),
  {
    virtual: true,
  }
);
jest.mock(
  '@salesforce/label/c.quantic_AgentGenerationStepSearchQueryCompleted',
  () => ({default: 'Searched for {{0}}'}),
  {
    virtual: true,
  }
);

const selectors = {
  stepItem: '[data-testid="step-item"]',
  spinner: '[data-testid="spinner"]',
  checkmark: '[data-testid="checkmark"]',
  stepLabel: '[data-testid="step-label"]',
  collapseButton: '[data-testid="collapse-button"]',
  collapsedSummary: '[data-testid="collapsed-summary"]',
  collapsedSummaryLabel: '[data-testid="collapsed-summary-label"]',
  chevronUp: '[data-testid="chevron-up"]',
  chevronDown: '[data-testid="chevron-down"]',
};

const createTestComponent = buildCreateTestComponent(
  QuanticGeneratedAnswerStreamOfThought,
  'c-quantic-generated-answer-stream-of-thought',
  {agentSteps: [], isStreaming: false}
);

describe('quantic generated answer stream of thought component', () => {
  afterEach(() => {
    cleanup();
  });
  describe('during streaming', () => {
    it('should render nothing when there are no steps', async () => {
      const element = createTestComponent({
        agentSteps: [],
        isStreaming: true,
      });
      await flushPromises();

      expect(element.shadowRoot.firstChild).toBeNull();
    });

    it('should show all steps progressively', async () => {
      const element = createTestComponent({
        agentSteps: [
          {name: 'thinking', status: 'completed'},
          {name: 'searching', status: 'active'},
        ],
        isStreaming: true,
      });
      await flushPromises();

      const stepItems = element.shadowRoot.querySelectorAll(selectors.stepItem);
      expect(stepItems).toHaveLength(2);
    });

    it('should render steps in the correct order', async () => {
      const element = createTestComponent({
        agentSteps: [
          {name: 'thinking', status: 'completed', startedAt: 0},
          {name: 'searching', status: 'completed', startedAt: 10},
          {name: 'thinking', status: 'completed', startedAt: 20},
          {name: 'searching', status: 'completed', startedAt: 30},
          {name: 'thinking', status: 'completed', startedAt: 40},
          {name: 'answering', status: 'active', startedAt: 30},
        ],
        isStreaming: true,
      });
      await flushPromises();

      const stepItems = element.shadowRoot.querySelectorAll(selectors.stepItem);
      const names = Array.from(stepItems).map((el) =>
        el.getAttribute('data-step-name')
      );
      expect(names).toEqual([
        'thinking-before-search',
        'searching',
        'thinking-after-search',
        'searching',
        'thinking-after-search',
        'answering',
      ]);
    });

    it('should show checkmarks for completed steps and spinners for active steps', async () => {
      const element = createTestComponent({
        agentSteps: [
          {name: 'thinking', status: 'completed'},
          {name: 'searching', status: 'active'},
        ],
        isStreaming: true,
      });
      await flushPromises();

      const checkmarks = element.shadowRoot.querySelectorAll(
        selectors.checkmark
      );
      const spinners = element.shadowRoot.querySelectorAll(selectors.spinner);
      expect(checkmarks).toHaveLength(1);
      expect(spinners).toHaveLength(1);
    });

    it('should not show a collapse button', async () => {
      const element = createTestComponent({
        agentSteps: [{name: 'thinking', status: 'active'}],
        isStreaming: true,
      });
      await flushPromises();

      const collapseButton = element.shadowRoot.querySelector(
        selectors.collapseButton
      );
      const collapsedSummary = element.shadowRoot.querySelector(
        selectors.collapsedSummary
      );

      expect(collapseButton).toBeNull();
      expect(collapsedSummary).toBeNull();
    });

    it('should render a searching-with-query step when toolCall has a query', async () => {
      const element = createTestComponent({
        agentSteps: [
          {
            name: 'searching',
            status: 'active',
            startedAt: 0,
            toolCalls: [
              {
                toolCallName: 'search',
                toolCallId: 'tc-1',
                startedAt: 0,
                status: 'active',
                type: 'search',
                toolCallArgs: {q: 'how to reset password'},
              },
            ],
          },
        ],
        isStreaming: true,
      });
      await flushPromises();

      const stepItem = element.shadowRoot.querySelector(selectors.stepItem);
      expect(stepItem.getAttribute('data-step-name')).toBe(
        'searching-with-query'
      );

      const stepLabel = element.shadowRoot.querySelector(selectors.stepLabel);
      expect(stepLabel.textContent).toContain('how to reset password');
    });

    it('should expand multiple search toolCalls into separate step items', async () => {
      const element = createTestComponent({
        agentSteps: [
          {
            name: 'searching',
            status: 'completed',
            startedAt: 0,
            toolCalls: [
              {
                toolCallName: 'search',
                toolCallId: 'tc-1',
                startedAt: 0,
                finishedAt: 1,
                status: 'completed',
                type: 'search',
                toolCallArgs: {q: 'What is Quantic'},
              },
              {
                toolCallName: 'search',
                toolCallId: 'tc-2',
                startedAt: 1,
                finishedAt: 2,
                status: 'completed',
                type: 'search',
                toolCallArgs: {q: 'What is Atomic'},
              },
            ],
          },
        ],
        isStreaming: true,
      });
      await flushPromises();

      const stepItems = element.shadowRoot.querySelectorAll(selectors.stepItem);
      expect(stepItems).toHaveLength(2);
      stepItems.forEach((item) =>
        expect(item.getAttribute('data-step-name')).toBe('searching-with-query')
      );

      const stepLabelsText = Array.from(
        element.shadowRoot.querySelectorAll(selectors.stepLabel)
      )
        .map((el) => el.textContent ?? '')
        .join(' ');
      expect(stepLabelsText).toContain('What is Quantic');
      expect(stepLabelsText).toContain('What is Atomic');
    });
  });

  describe('after streaming completes', () => {
    const multipleSteps = [
      {name: 'thinking', status: 'completed'},
      {name: 'searching', status: 'completed'},
      {name: 'thinking', status: 'completed'},
      {name: 'answering', status: 'active'},
    ];

    it('should auto-collapse to show only the last step', async () => {
      const element = createTestComponent({
        agentSteps: multipleSteps,
        isStreaming: true,
      });
      await flushPromises();
      let collapsedSummary = element.shadowRoot.querySelector(
        selectors.collapsedSummary
      );
      let stepItems = element.shadowRoot.querySelectorAll(selectors.stepItem);

      expect(collapsedSummary).toBeNull();
      expect(stepItems).toHaveLength(multipleSteps.length);

      element.isStreaming = false;
      element.agentSteps = [
        {name: 'thinking', status: 'completed'},
        {name: 'searching', status: 'completed'},
        {name: 'thinking', status: 'completed'},
        {name: 'answering', status: 'completed'},
      ];
      await flushPromises();

      collapsedSummary = element.shadowRoot.querySelector(
        selectors.collapsedSummary
      );
      stepItems = element.shadowRoot.querySelectorAll(selectors.stepItem);
      const summaryLabel = element.shadowRoot.querySelector(
        selectors.collapsedSummaryLabel
      );
      const checkmark = collapsedSummary.querySelector(selectors.checkmark);

      expect(collapsedSummary).not.toBeNull();
      expect(summaryLabel).not.toBeNull();
      expect(checkmark).not.toBeNull();
      expect(stepItems).toHaveLength(0);
    });

    it('should have aria-expanded set to false when collapsed', async () => {
      const element = createTestComponent({
        agentSteps: multipleSteps,
        isStreaming: false,
      });
      await flushPromises();

      const collapsedSummary = element.shadowRoot.querySelector(
        selectors.collapsedSummary
      );

      expect(collapsedSummary).not.toBeNull();
      expect(collapsedSummary.getAttribute('aria-expanded')).toBe('false');
    });

    it('should render nothing when there are no steps and not streaming', async () => {
      const element = createTestComponent({
        agentSteps: [],
        isStreaming: false,
      });
      await flushPromises();

      expect(element.shadowRoot.firstChild).toBeNull();
    });
  });

  describe('expand/collapse interaction', () => {
    const multipleSteps = [
      {name: 'thinking', status: 'completed'},
      {name: 'searching', status: 'completed'},
      {name: 'thinking', status: 'completed'},
      {name: 'answering', status: 'completed'},
    ];

    it('should expand to show all steps and collapse button when collapsed summary row is clicked', async () => {
      const element = createTestComponent({
        agentSteps: multipleSteps,
        isStreaming: false,
      });
      await flushPromises();

      const collapsedSummary = element.shadowRoot.querySelector(
        selectors.collapsedSummary
      );
      expect(collapsedSummary).not.toBeNull();

      collapsedSummary.click();
      await flushPromises();

      const stepItems = element.shadowRoot.querySelectorAll(selectors.stepItem);
      const collapseButton = element.shadowRoot.querySelector(
        selectors.collapseButton
      );
      expect(stepItems).toHaveLength(multipleSteps.length);
      expect(collapseButton).not.toBeNull();
    });

    it('should collapse back when collapse button is clicked', async () => {
      const element = createTestComponent({
        agentSteps: multipleSteps,
        isStreaming: false,
      });
      await flushPromises();

      const collapsedSummary = element.shadowRoot.querySelector(
        selectors.collapsedSummary
      );
      collapsedSummary.click();
      await flushPromises();

      const collapseButton = element.shadowRoot.querySelector(
        selectors.collapseButton
      );
      expect(collapseButton).not.toBeNull();

      collapseButton.click();
      await flushPromises();

      expect(
        element.shadowRoot.querySelector(selectors.collapsedSummary)
      ).not.toBeNull();
      expect(
        element.shadowRoot.querySelectorAll(selectors.stepItem)
      ).toHaveLength(0);
      expect(
        element.shadowRoot.querySelector(selectors.collapseButton)
      ).toBeNull();
    });

    it('should set aria-expanded to true when expanded', async () => {
      const element = createTestComponent({
        agentSteps: multipleSteps,
        isStreaming: false,
      });
      await flushPromises();

      const collapsedSummary = element.shadowRoot.querySelector(
        selectors.collapsedSummary
      );
      collapsedSummary.click();
      await flushPromises();

      const collapseButton = element.shadowRoot.querySelector(
        selectors.collapseButton
      );
      expect(collapseButton).not.toBeNull();
      expect(collapseButton.getAttribute('aria-expanded')).toBe('true');
    });

    it('should set aria-expanded to false when collapsed', async () => {
      const element = createTestComponent({
        agentSteps: multipleSteps,
        isStreaming: false,
      });
      await flushPromises();

      const collapsedSummary = element.shadowRoot.querySelector(
        selectors.collapsedSummary
      );
      expect(collapsedSummary).not.toBeNull();
      expect(collapsedSummary.getAttribute('aria-expanded')).toBe('false');
    });
  });

  describe('single answering step', () => {
    it('should show the step without a collapse button when only answering exists', async () => {
      const element = createTestComponent({
        agentSteps: [{name: 'answering', status: 'completed'}],
        isStreaming: false,
      });
      await flushPromises();

      const stepItems = element.shadowRoot.querySelectorAll(selectors.stepItem);
      const collapseButton = element.shadowRoot.querySelector(
        selectors.collapseButton
      );
      const collapsedSummary = element.shadowRoot.querySelector(
        selectors.collapsedSummary
      );

      expect(stepItems).toHaveLength(1);
      expect(collapseButton).toBeNull();
      expect(collapsedSummary).toBeNull();
    });
  });
});
