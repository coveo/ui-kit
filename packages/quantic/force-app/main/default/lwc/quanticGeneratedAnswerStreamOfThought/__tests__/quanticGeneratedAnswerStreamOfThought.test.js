import {resolveSteps} from '../quanticGeneratedAnswerStreamOfThought.js';
import {buildCreateTestComponent, cleanup, flushPromises} from 'c/testUtils';
import QuanticGeneratedAnswerStreamOfThought from '../quanticGeneratedAnswerStreamOfThought';

describe('#resolveSteps', () => {
  it('should return empty array for empty input', () => {
    expect(resolveSteps([])).toEqual([]);
  });

  it('should resolve thinking before searching as thinking-before-search', () => {
    expect(resolveSteps([{name: 'thinking', status: 'active'}])[0]).toEqual({type: 'thinking-before-search', status: 'active'});
    expect(resolveSteps([{name: 'thinking', status: 'completed'}])[0]).toEqual({type: 'thinking-before-search', status: 'completed'});
  });

  it('should resolve searching as searching', () => {
    expect(resolveSteps([{name: 'searching', status: 'active'}])[0]).toEqual({type: 'searching', status: 'active'});
    expect(resolveSteps([{name: 'searching', status: 'completed'}])[0]).toEqual({type: 'searching', status: 'completed'});
  });

  it('should resolve thinking after searching as thinking-after-search', () => {
    expect(resolveSteps([
      {name: 'searching', status: 'completed'},
      {name: 'thinking', status: 'active'},
    ])[1]).toEqual({type: 'thinking-after-search', status: 'active'});
  });

  it('should resolve answering as answering', () => {
    expect(resolveSteps([{name: 'answering', status: 'active'}])[0]).toEqual({type: 'answering', status: 'active'});
    expect(resolveSteps([{name: 'answering', status: 'completed'}])[0]).toEqual({type: 'answering', status: 'completed'});
  });

  it('should resolve a full sequence correctly', () => {
    expect(resolveSteps([
      {name: 'thinking', status: 'completed'},
      {name: 'searching', status: 'completed'},
      {name: 'thinking', status: 'active'},
      {name: 'answering', status: 'active'},
    ])).toEqual([
      {type: 'thinking-before-search', status: 'completed'},
      {type: 'searching', status: 'completed'},
      {type: 'thinking-after-search', status: 'active'},
      {type: 'answering', status: 'active'},
    ]);
  });

  it('should handle repeated searching steps', () => {
    expect(resolveSteps([
      {name: 'thinking', status: 'completed'},
      {name: 'searching', status: 'completed'},
      {name: 'thinking', status: 'completed'},
      {name: 'searching', status: 'completed'},
      {name: 'thinking', status: 'active'},
    ])).toEqual([
      {type: 'thinking-before-search', status: 'completed'},
      {type: 'searching', status: 'completed'},
      {type: 'thinking-after-search', status: 'completed'},
      {type: 'searching', status: 'completed'},
      {type: 'thinking-after-search', status: 'active'},
    ]);
  });
});

const createTestComponent = buildCreateTestComponent(
  QuanticGeneratedAnswerStreamOfThought,
  'c-quantic-generated-answer-stream-of-thought',
  {agentSteps: [], isStreaming: false}
);

describe('during streaming', () => {
  afterEach(() => {
    cleanup();
  });

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

    const stepItems = element.shadowRoot.querySelectorAll(
      '[data-testid="step-item"]'
    );
    expect(stepItems).toHaveLength(2);
  });

  it('should show a spinner for the active step', async () => {
    const element = createTestComponent({
      agentSteps: [{name: 'thinking', status: 'active'}],
      isStreaming: true,
    });
    await flushPromises();

    const spinners = element.shadowRoot.querySelectorAll(
      '[data-testid="spinner"]'
    );
    expect(spinners).toHaveLength(1);
  });

  it('should show checkmarks for completed steps', async () => {
    const element = createTestComponent({
      agentSteps: [
        {name: 'thinking', status: 'completed'},
        {name: 'searching', status: 'active'},
      ],
      isStreaming: true,
    });
    await flushPromises();

    const checkmarks = element.shadowRoot.querySelectorAll(
      '[data-testid="checkmark"]'
    );
    const spinners = element.shadowRoot.querySelectorAll(
      '[data-testid="spinner"]'
    );
    expect(checkmarks).toHaveLength(1);
    expect(spinners).toHaveLength(1);
  });

  it('should not show a toggle button', async () => {
    const element = createTestComponent({
      agentSteps: [{name: 'thinking', status: 'active'}],
      isStreaming: true,
    });
    await flushPromises();

    const toggleButton = element.shadowRoot.querySelector(
      '[data-testid="toggle-button"]'
    );
    const collapsedSummary = element.shadowRoot.querySelector(
      '[data-testid="collapsed-summary"]'
    );

    expect(toggleButton).toBeNull();
    expect(collapsedSummary).toBeNull();
  });

  it('should display the correct label for thinking before search', async () => {
    const element = createTestComponent({
      agentSteps: [{name: 'thinking', status: 'active'}],
      isStreaming: true,
    });
    await flushPromises();

    const stepLabel = element.shadowRoot.querySelector(
      '[data-testid="step-label"]'
    );
    expect(stepLabel).not.toBeNull();
    expect(stepLabel.textContent).toBe(
      'c.quantic_AgentGenerationStepAnalyzingQuestion'
    );
  });

  it('should display the correct label for searching', async () => {
    const element = createTestComponent({
      agentSteps: [
        {name: 'thinking', status: 'completed'},
        {name: 'searching', status: 'active'},
      ],
      isStreaming: true,
    });
    await flushPromises();

    const stepLabels = element.shadowRoot.querySelectorAll(
      '[data-testid="step-label"]'
    );
    expect(stepLabels[1]).not.toBeNull();
    expect(stepLabels[1].textContent).toBe(
      'c.quantic_AgentGenerationStepSearch'
    );
  });

  it('should display the correct label for thinking after search', async () => {
    const element = createTestComponent({
      agentSteps: [
        {name: 'thinking', status: 'completed'},
        {name: 'searching', status: 'completed'},
        {name: 'thinking', status: 'active'},
      ],
      isStreaming: true,
    });
    await flushPromises();

    const stepLabels = element.shadowRoot.querySelectorAll(
      '[data-testid="step-label"]'
    );
    expect(stepLabels[2]).not.toBeNull();
    expect(stepLabels[2].textContent).toBe(
      'c.quantic_AgentGenerationStepAnalyzingResults'
    );
  });

  it('should display "Analyzing results…" for thinking after each search in iterative cycles', async () => {
    const element = createTestComponent({
      agentSteps: [
        {name: 'thinking', status: 'completed'},
        {name: 'searching', status: 'completed'},
        {name: 'thinking', status: 'completed'},
        {name: 'searching', status: 'completed'},
        {name: 'thinking', status: 'active'},
      ],
      isStreaming: true,
    });
    await flushPromises();

    const stepLabels = element.shadowRoot.querySelectorAll(
      '[data-testid="step-label"]'
    );
    expect(stepLabels[2].textContent).toBe(
      'c.quantic_AgentGenerationStepAnalyzingResultsCompleted'
    );
    expect(stepLabels[4].textContent).toBe(
      'c.quantic_AgentGenerationStepAnalyzingResults'
    );
  });

  it('should display the correct label for answering', async () => {
    const element = createTestComponent({
      agentSteps: [
        {name: 'thinking', status: 'completed'},
        {name: 'searching', status: 'completed'},
        {name: 'thinking', status: 'completed'},
        {name: 'answering', status: 'active'},
      ],
      isStreaming: true,
    });
    await flushPromises();

    const stepLabels = element.shadowRoot.querySelectorAll(
      '[data-testid="step-label"]'
    );
    expect(stepLabels[3]).not.toBeNull();
    expect(stepLabels[3].textContent).toBe(
      'c.quantic_AgentGenerationStepAnswering'
    );
  });

  it('should display completed label for completed steps', async () => {
    const element = createTestComponent({
      agentSteps: [
        {name: 'thinking', status: 'completed'},
        {name: 'searching', status: 'active'},
      ],
      isStreaming: true,
    });
    await flushPromises();

    const stepLabels = element.shadowRoot.querySelectorAll(
      '[data-testid="step-label"]'
    );
    expect(stepLabels[0]).not.toBeNull();
    expect(stepLabels[0].textContent).toBe(
      'c.quantic_AgentGenerationStepAnalyzingQuestionCompleted'
    );
  });
});

describe('after streaming completes', () => {
  afterEach(() => {
    cleanup();
  });

  const multipleSteps = [
    {name: 'thinking', status: 'completed'},
    {name: 'searching', status: 'completed'},
    {name: 'thinking', status: 'completed'},
    {name: 'answering', status: 'active'},
  ];

  async function createCollapsedComponent(steps = multipleSteps) {
    const element = createTestComponent({
      agentSteps: steps,
      isStreaming: true,
    });
    await flushPromises();
    element.isStreaming = false;
    await flushPromises();
    return element;
  }

  it('should auto-collapse to show only the last step', async () => {
    const element = await createCollapsedComponent();

    const collapsedSummary = element.shadowRoot.querySelector(
      '[data-testid="collapsed-summary"]'
    );
    const stepItems = element.shadowRoot.querySelectorAll(
      '[data-testid="step-item"]'
    );

    expect(collapsedSummary).not.toBeNull();
    expect(stepItems).toHaveLength(0);
  });

  it('should show the last step completed label', async () => {
    const element = await createCollapsedComponent();

    const summaryLabel = element.shadowRoot.querySelector(
      '[data-testid="collapsed-summary-label"]'
    );

    expect(summaryLabel).not.toBeNull();
    // The auto-mock resolves @salesforce/label/c.quantic_Foo to "c.quantic_Foo".
    expect(summaryLabel.textContent).toBe(
      'c.quantic_AgentGenerationStepAnsweringCompleted'
    );
  });

  it('should show a checkmark icon on the collapsed step', async () => {
    const element = await createCollapsedComponent();

    const collapsedSummary = element.shadowRoot.querySelector(
      '[data-testid="collapsed-summary"]'
    );
    const checkmark = collapsedSummary.querySelector(
      '[data-testid="checkmark"]'
    );

    expect(checkmark).not.toBeNull();
  });

  it('should have aria-expanded set to false when collapsed', async () => {
    const element = await createCollapsedComponent();

    const collapsedSummary = element.shadowRoot.querySelector(
      '[data-testid="collapsed-summary"]'
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

  afterEach(() => {
    cleanup();
  });

  async function createStreamingThenStop(steps) {
    const element = createTestComponent({
      agentSteps: steps,
      isStreaming: true,
    });
    await flushPromises();
    element.isStreaming = false;
    await flushPromises();
    return element;
  }

  it('should expand to show all steps when collapsed row is clicked', async () => {
    const element = await createStreamingThenStop(multipleSteps);

    const collapsedSummary = element.shadowRoot.querySelector(
      '[data-testid="collapsed-summary"]'
    );
    expect(collapsedSummary).not.toBeNull();

    collapsedSummary.click();
    await flushPromises();

    const stepItems = element.shadowRoot.querySelectorAll(
      '[data-testid="step-item"]'
    );
    expect(stepItems).toHaveLength(multipleSteps.length);
  });

  it('should show a toggle button with collapse label below steps when expanded', async () => {
    const element = await createStreamingThenStop(multipleSteps);

    const collapsedSummary = element.shadowRoot.querySelector(
      '[data-testid="collapsed-summary"]'
    );
    collapsedSummary.click();
    await flushPromises();

    const toggleButton = element.shadowRoot.querySelector(
      '[data-testid="toggle-button"]'
    );
    expect(toggleButton).not.toBeNull();
    expect(toggleButton.textContent).toContain('quantic_CollapseButton');
  });

  it('should collapse back when toggle button is clicked', async () => {
    const element = await createStreamingThenStop(multipleSteps);

    const collapsedSummary = element.shadowRoot.querySelector(
      '[data-testid="collapsed-summary"]'
    );
    collapsedSummary.click();
    await flushPromises();

    const toggleButton = element.shadowRoot.querySelector(
      '[data-testid="toggle-button"]'
    );
    expect(toggleButton).not.toBeNull();

    toggleButton.click();
    await flushPromises();

    expect(
      element.shadowRoot.querySelector('[data-testid="collapsed-summary"]')
    ).not.toBeNull();
    expect(
      element.shadowRoot.querySelectorAll('[data-testid="step-item"]')
    ).toHaveLength(0);
    expect(
      element.shadowRoot.querySelector('[data-testid="toggle-button"]')
    ).toBeNull();
  });

  it('should set aria-expanded to true when expanded', async () => {
    const element = await createStreamingThenStop(multipleSteps);

    const collapsedSummary = element.shadowRoot.querySelector(
      '[data-testid="collapsed-summary"]'
    );
    collapsedSummary.click();
    await flushPromises();

    const toggleButton = element.shadowRoot.querySelector(
      '[data-testid="toggle-button"]'
    );
    expect(toggleButton).not.toBeNull();
    expect(toggleButton.getAttribute('aria-expanded')).toBe('true');
  });

  it('should set aria-expanded to false when collapsed', async () => {
    const element = await createStreamingThenStop(multipleSteps);

    const collapsedSummary = element.shadowRoot.querySelector(
      '[data-testid="collapsed-summary"]'
    );
    expect(collapsedSummary).not.toBeNull();
    expect(collapsedSummary.getAttribute('aria-expanded')).toBe('false');
  });
});

describe('streaming to complete transition', () => {
  afterEach(() => {
    cleanup();
  });

  it('should auto-collapse when isStreaming changes from true to false', async () => {
    const element = createTestComponent({
      agentSteps: [
        {name: 'thinking', status: 'completed'},
        {name: 'searching', status: 'completed'},
        {name: 'answering', status: 'active'},
      ],
      isStreaming: true,
    });
    await flushPromises();

    let stepItems = element.shadowRoot.querySelectorAll(
      '[data-testid="step-item"]'
    );
    expect(stepItems).toHaveLength(3);

    element.agentSteps = [
      {name: 'thinking', status: 'completed'},
      {name: 'searching', status: 'completed'},
      {name: 'answering', status: 'completed'},
    ];
    element.isStreaming = false;
    await flushPromises();

    stepItems = element.shadowRoot.querySelectorAll('[data-testid="step-item"]');
    expect(stepItems).toHaveLength(0);
    expect(
      element.shadowRoot.querySelector('[data-testid="collapsed-summary"]')
    ).not.toBeNull();
  });
});

describe('single answering step', () => {
  afterEach(() => {
    cleanup();
  });

  it('should show the step without a toggle button when only answering exists', async () => {
    const element = createTestComponent({
      agentSteps: [{name: 'answering', status: 'completed'}],
      isStreaming: false,
    });
    await flushPromises();

    const stepItems = element.shadowRoot.querySelectorAll(
      '[data-testid="step-item"]'
    );
    const toggleButton = element.shadowRoot.querySelector(
      '[data-testid="toggle-button"]'
    );
    const collapsedSummary = element.shadowRoot.querySelector(
      '[data-testid="collapsed-summary"]'
    );

    expect(stepItems).toHaveLength(1);
    expect(toggleButton).toBeNull();
    expect(collapsedSummary).toBeNull();
  });

  it('should show the answering step with a spinner while streaming', async () => {
    const element = createTestComponent({
      agentSteps: [{name: 'answering', status: 'active'}],
      isStreaming: true,
    });
    await flushPromises();

    const stepItems = element.shadowRoot.querySelectorAll(
      '[data-testid="step-item"]'
    );
    const spinners = element.shadowRoot.querySelectorAll(
      '[data-testid="spinner"]'
    );
    const toggleButton = element.shadowRoot.querySelector(
      '[data-testid="toggle-button"]'
    );

    expect(stepItems).toHaveLength(1);
    expect(spinners).toHaveLength(1);
    expect(toggleButton).toBeNull();
  });

  it('should show the answering step with a checkmark after completion', async () => {
    const element = createTestComponent({
      agentSteps: [{name: 'answering', status: 'completed'}],
      isStreaming: false,
    });
    await flushPromises();

    const stepItems = element.shadowRoot.querySelectorAll(
      '[data-testid="step-item"]'
    );
    const checkmarks = element.shadowRoot.querySelectorAll(
      '[data-testid="checkmark"]'
    );
    const stepLabel = element.shadowRoot.querySelector(
      '[data-testid="step-label"]'
    );

    expect(stepItems).toHaveLength(1);
    expect(checkmarks).toHaveLength(1);
    expect(stepLabel.textContent).toBe(
      'c.quantic_AgentGenerationStepAnsweringCompleted'
    );
  });
});

describe('accessibility', () => {
  afterEach(() => {
    cleanup();
  });

  describe('aria-hidden on decorative icons', () => {
    it('spinner wrapper has aria-hidden="true" when a step is active', async () => {
      const element = createTestComponent({
        agentSteps: [{name: 'searching', status: 'active'}],
        isStreaming: true,
      });
      await flushPromises();

      const spinner = element.shadowRoot.querySelector(
        '[data-testid="spinner"]'
      );
      expect(spinner).not.toBeNull();
      expect(spinner.getAttribute('aria-hidden')).toBe('true');
    });

    it('checkmark has aria-hidden="true" when a step is completed', async () => {
      const element = createTestComponent({
        agentSteps: [{name: 'searching', status: 'completed'}],
        isStreaming: true,
      });
      await flushPromises();

      const checkmark = element.shadowRoot.querySelector(
        '[data-testid="checkmark"]'
      );
      expect(checkmark).not.toBeNull();
      const icon = checkmark.querySelector('lightning-icon');
      expect(icon).not.toBeNull();
      expect(icon.getAttribute('aria-hidden')).toBe('true');
    });

    it('chevron has aria-hidden="true" in the collapsed summary view', async () => {
      const element = createTestComponent({
        agentSteps: [
          {name: 'searching', status: 'completed'},
          {name: 'answering', status: 'active'},
        ],
        isStreaming: true,
      });
      await flushPromises();
      element.isStreaming = false;
      await flushPromises();

      const chevron = element.shadowRoot.querySelector(
        '[data-testid="chevron"]'
      );
      expect(chevron).not.toBeNull();
      expect(chevron.getAttribute('aria-hidden')).toBe('true');
    });

    it('chevron has aria-hidden="true" in the expanded toggle button', async () => {
      const element = createTestComponent({
        agentSteps: [
          {name: 'searching', status: 'completed'},
          {name: 'answering', status: 'completed'},
        ],
        isStreaming: true,
      });
      await flushPromises();
      element.isStreaming = false;
      await flushPromises();

      const collapsedSummary = element.shadowRoot.querySelector(
        '[data-testid="collapsed-summary"]'
      );
      expect(collapsedSummary).not.toBeNull();
      collapsedSummary.click();
      await flushPromises();

      const chevron = element.shadowRoot.querySelector(
        '[data-testid="chevron"]'
      );
      expect(chevron).not.toBeNull();
      expect(chevron.getAttribute('aria-hidden')).toBe('true');
    });
  });

  describe('empty, null, and undefined agentSteps render nothing', () => {
    it('renders no elements when agentSteps is null', async () => {
      const element = createTestComponent({
        agentSteps: null,
        isStreaming: true,
      });
      await flushPromises();

      expect(element.shadowRoot.firstChild).toBeNull();
    });

    it('renders no elements when agentSteps is not set (defaults to empty array)', async () => {
      const element = createTestComponent({isStreaming: true});
      await flushPromises();

      expect(element.shadowRoot.firstChild).toBeNull();
    });
  });
});
