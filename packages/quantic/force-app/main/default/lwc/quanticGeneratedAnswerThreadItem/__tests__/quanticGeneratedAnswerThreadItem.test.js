import {createElement} from 'lwc';
import QuanticGeneratedAnswerThreadItem from 'c/quanticGeneratedAnswerThreadItem';

function flushPromises() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

function createTestComponent(options = {}) {
  const element = createElement('c-quantic-generated-answer-thread-item', {
    is: QuanticGeneratedAnswerThreadItem,
  });

  Object.entries(options).forEach(([key, value]) => {
    element[key] = value;
  });

  document.body.appendChild(element);
  return element;
}

function cleanup() {
  while (document.body.firstChild) {
    document.body.removeChild(document.body.firstChild);
  }
  jest.clearAllMocks();
}

const selectors = {
  titleButton: 'button',
  titleText: '.thread-item__title',
  timelineDot: '.thread-item__timeline-dot',
  timelineLine: '.thread-item__timeline-line',
  content: '[id^="quantic-generated-answer-thread-item-content-"]',
  slot: 'slot',
};

describe('c-quantic-generated-answer-thread-item', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders the timeline dot and content container', async () => {
    const element = createTestComponent({
      title: 'Title',
      isExpanded: true,
    });
    await flushPromises();

    expect(
      element.shadowRoot.querySelector(selectors.timelineDot)
    ).not.toBeNull();
    expect(element.shadowRoot.querySelector(selectors.content)).not.toBeNull();
  });

  it('hides the timeline dot when showTimelineDot is false', async () => {
    const element = createTestComponent({
      title: 'Title',
      showTimelineDot: false,
    });
    await flushPromises();

    expect(element.shadowRoot.querySelector(selectors.timelineDot)).toBeNull();
  });

  it('hides the timeline line when hideLine is true', async () => {
    const element = createTestComponent({
      title: 'Title',
      hideLine: true,
    });
    await flushPromises();

    expect(element.shadowRoot.querySelector(selectors.timelineLine)).toBeNull();
  });

  it('renders a title button when collapsible', async () => {
    const element = createTestComponent({
      title: 'Title',
      disableCollapse: false,
      isExpanded: false,
    });
    await flushPromises();

    const button = element.shadowRoot.querySelector(selectors.titleButton);
    const content = element.shadowRoot.querySelector(selectors.content);

    expect(button).not.toBeNull();
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(content.hidden).toBe(true);
    expect(content.getAttribute('aria-hidden')).toBe('true');
  });

  it('renders a title span when collapse is disabled and keeps content visible', async () => {
    const element = createTestComponent({
      title: 'Title',
      disableCollapse: true,
      isExpanded: false,
    });
    await flushPromises();

    const button = element.shadowRoot.querySelector(selectors.titleButton);
    const title = element.shadowRoot.querySelector(selectors.titleText);
    const content = element.shadowRoot.querySelector(selectors.content);

    expect(button).toBeNull();
    expect(title).not.toBeNull();
    expect(content.hidden).toBe(false);
    expect(content.getAttribute('aria-hidden')).toBe('false');
  });

  it('toggles expanded state when clicking the title button', async () => {
    const element = createTestComponent({
      title: 'Title',
      disableCollapse: false,
      isExpanded: false,
    });
    await flushPromises();

    const button = element.shadowRoot.querySelector(selectors.titleButton);
    button.click();
    await flushPromises();

    const content = element.shadowRoot.querySelector(selectors.content);
    expect(button.getAttribute('aria-expanded')).toBe('true');
    expect(content.hidden).toBe(false);
    expect(content.getAttribute('aria-hidden')).toBe('false');
  });

  it('links the title button to the content region', async () => {
    const element = createTestComponent({
      title: 'Title',
      disableCollapse: false,
      isExpanded: false,
    });
    await flushPromises();

    const button = element.shadowRoot.querySelector(selectors.titleButton);
    const content = element.shadowRoot.querySelector(selectors.content);

    expect(content.id).toMatch(
      /^quantic-generated-answer-thread-item-content-/
    );
    expect(button.getAttribute('aria-controls')).toBe(content.id);
  });

  it('renders slotted content', async () => {
    const element = createElement('c-quantic-generated-answer-thread-item', {
      is: QuanticGeneratedAnswerThreadItem,
    });
    element.title = 'Title';
    element.disableCollapse = true;
    element.isExpanded = true;

    const child = document.createElement('div');
    child.textContent = 'Slotted content';
    HTMLSlotElement.prototype.assignedElements = jest.fn(() => [child]);
    document.body.appendChild(element);
    await flushPromises();

    const slot = element.shadowRoot.querySelector(selectors.slot);
    const assignedElements = slot.assignedElements();

    expect(slot).not.toBeNull();
    expect(assignedElements).toHaveLength(1);
    expect(assignedElements[0].textContent).toBe('Slotted content');
  });
});
