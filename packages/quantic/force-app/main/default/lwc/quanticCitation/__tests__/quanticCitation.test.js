// @ts-ignore
import {createElement} from 'lwc';
import QuanticCitation from '../quanticCitation';

const functionsMocks = {
  eventHandler: jest.fn((event) => event),
};

const exampleCitation = {
  index: '1',
  id: '123',
  title: 'Example title 1',
  uri: 'https://example.com/',
  clickUri: 'https://example.com/',
  permanentid: '1',
  text: 'text 01',
};

const defaultOptions = {
  citation: exampleCitation,
};

const selectors = {
  citation: '.citation',
  citationIndex: '.citation__index',
  citationLink: '.citation__badge',
  citationTitle: '.citation__title',
  citationTooltip: 'c-quantic-tooltip',
};

function createTestComponent(options = defaultOptions) {
  const element = createElement('c-quantic-citation', {
    is: QuanticCitation,
  });

  for (const [key, value] of Object.entries(options)) {
    element[key] = value;
  }

  document.body.appendChild(element);
  return element;
}

// Helper function to wait until the microtask queue is empty.
async function flushPromises() {
  return Promise.resolve();
}

function setupEventDispatchTest(eventName) {
  const handler = (event) => {
    functionsMocks.eventHandler(event);
    document.removeEventListener(eventName, handler);
  };
  document.addEventListener(eventName, handler);
}

describe('c-quantic-citation', () => {
  function cleanup() {
    // The jsdom instance is shared across test cases in a single file so reset the DOM
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
    jest.clearAllMocks();
  }

  afterEach(() => {
    cleanup();
  });

  it('should properly display the citation', async () => {
    const element = createTestComponent();
    await flushPromises();

    const citation = element.shadowRoot.querySelector(selectors.citation);
    const citationLink = element.shadowRoot.querySelector(
      selectors.citationLink
    );
    const citationIndex = element.shadowRoot.querySelector(
      selectors.citationIndex
    );
    const citationTitle = element.shadowRoot.querySelector(
      selectors.citationTitle
    );
    const citationTooltip = element.shadowRoot.querySelector(
      selectors.citationTooltip
    );

    expect(citation).not.toBeNull();
    expect(citationLink).not.toBeNull();
    expect(citationIndex).not.toBeNull();
    expect(citationTitle).not.toBeNull();
    expect(citationTooltip).not.toBeNull();

    expect(citationLink.href).toBe(exampleCitation.clickUri);
    expect(citationLink.target).toBe('_blank');
    expect(citationIndex.textContent).toBe(exampleCitation.index);
    expect(citationTitle.textContent).toBe(exampleCitation.title);
  });

  describe('clicking on the citation', () => {
    it('should dispatch a click event', async () => {
      const element = createTestComponent();
      await flushPromises();
      setupEventDispatchTest('click');

      const citationLink = element.shadowRoot.querySelector(
        selectors.citationLink
      );

      expect(citationLink).not.toBeNull();

      await citationLink.click();

      expect(functionsMocks.eventHandler).toHaveBeenCalledTimes(1);
    });
  });

  describe('hovering over the citation', () => {
    beforeAll(() => {
      jest.useFakeTimers();
    });

    afterAll(() => {
      jest.useRealTimers();
    });

    it('should dispatch a citation hover event after hovering over the the citation for more than 1200ms', async () => {
      const element = createTestComponent();
      await flushPromises();
      setupEventDispatchTest('citationhover');

      const citationLink = element.shadowRoot.querySelector(
        selectors.citationLink
      );
      expect(citationLink).not.toBeNull();

      await citationLink.dispatchEvent(
        new CustomEvent('mouseenter', {bubbles: true})
      );
      jest.advanceTimersByTime(1500);
      await citationLink.dispatchEvent(
        new CustomEvent('mouseleave', {bubbles: true})
      );

      expect(functionsMocks.eventHandler).toHaveBeenCalledTimes(1);
    });

    it('should not dispatch a citation hover event after hovering over the the citation for more than 1200ms', async () => {
      const element = createTestComponent();
      await flushPromises();
      setupEventDispatchTest('citationhover');

      const citationLink = element.shadowRoot.querySelector(
        selectors.citationLink
      );
      expect(citationLink).not.toBeNull();

      await citationLink.dispatchEvent(
        new CustomEvent('mouseenter', {bubbles: true})
      );
      jest.advanceTimersByTime(500);
      await citationLink.dispatchEvent(
        new CustomEvent('mouseleave', {bubbles: true})
      );

      expect(functionsMocks.eventHandler).toHaveBeenCalledTimes(0);
    });
  });
});
