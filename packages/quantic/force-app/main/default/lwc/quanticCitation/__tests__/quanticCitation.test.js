import {
  getNavigateCalledWith,
  getGenerateUrlCalledWith,
} from 'lightning/navigation';
// @ts-ignore
import {createElement} from 'lwc';
import QuanticCitation from '../quanticCitation';

const functionsMocks = {
  eventHandler: jest.fn((event) => event),
  exampleSelect: jest.fn(() => {}),
  exampleBeginDelayedSelect: jest.fn(() => {}),
  exampleCancelPendingSelect: jest.fn(() => {}),
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

const exampleSalesforceCitation = {
  ...exampleCitation,
  fields: {
    sfid: '123',
  },
};
const exampleSalesforceKnowledgeArticleCitation = {
  ...exampleCitation,
  fields: {
    sfid: '123',
    sfkbid: 'foo',
    sfkavid: 'bar',
  },
};
const exampleSalesforceLink = 'https://www.example-salesforce.com/';

const defaultOptions = {
  citation: exampleCitation,
  interactiveCitation: {
    select: () => functionsMocks.exampleSelect(),
    beginDelayedSelect: () => functionsMocks.exampleBeginDelayedSelect(),
    cancelPendingSelect: () => functionsMocks.exampleCancelPendingSelect(),
  },
};

const selectors = {
  citation: '.citation',
  citationLink: '.citation__link',
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

const bindingsMap = {
  contextmenu: functionsMocks.exampleSelect,
  click: functionsMocks.exampleSelect,
  mouseup: functionsMocks.exampleSelect,
  mousedown: functionsMocks.exampleSelect,
  touchstart: functionsMocks.exampleBeginDelayedSelect,
  touchend: functionsMocks.exampleCancelPendingSelect,
};

function setupEventDispatchTest(eventName) {
  const handler = (event) => {
    functionsMocks.eventHandler(event?.detail);
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
    const citationTitle = element.shadowRoot.querySelector(
      selectors.citationTitle
    );
    const citationTooltip = element.shadowRoot.querySelector(
      selectors.citationTooltip
    );

    expect(citation).not.toBeNull();
    expect(citationLink).not.toBeNull();
    expect(citationTitle).not.toBeNull();
    expect(citationTooltip).not.toBeNull();

    expect(citationLink.href).toBe(exampleCitation.clickUri);
    expect(citationLink.target).toBe('_blank');
    expect(citationTitle.textContent).toBe(exampleCitation.title);
  });

  describe('the analytics bindings of the link within the citation', () => {
    for (const [eventName, action] of Object.entries(bindingsMap)) {
      it(`should execute the proper action when the ${eventName} is triggered on the link`, async () => {
        const element = createTestComponent();
        await flushPromises();

        const link = element.shadowRoot.querySelector(selectors.citationLink);
        link.dispatchEvent(new CustomEvent(eventName));

        expect(action).toHaveBeenCalledTimes(1);
      });
    }
  });

  describe('hovering over the citation', () => {
    beforeAll(() => {
      jest.useFakeTimers();
    });

    afterAll(() => {
      jest.useRealTimers();
    });

    it('should dispatch a citation hover event after hovering over the the citation for more than 1200ms, 200ms debounce duration before hover + 1000ms minimum hover duration', async () => {
      const element = createTestComponent();
      await flushPromises();
      setupEventDispatchTest('quantic__citationhover');

      const citationLink = element.shadowRoot.querySelector(
        selectors.citationLink
      );
      expect(citationLink).not.toBeNull();

      await citationLink.dispatchEvent(
        new CustomEvent('mouseenter', {bubbles: true})
      );
      jest.advanceTimersByTime(1200);
      await citationLink.dispatchEvent(
        new CustomEvent('mouseleave', {bubbles: true})
      );

      expect(functionsMocks.eventHandler).toHaveBeenCalledTimes(1);
      expect(functionsMocks.eventHandler).toHaveBeenCalledWith({
        citationHoverTimeMs: 1000,
      });
    });

    it('should not dispatch a citation hover event after hovering over the the citation for more than 1200ms', async () => {
      const element = createTestComponent();
      await flushPromises();
      setupEventDispatchTest('quantic__citationhover');

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

  describe('when the citation source is of type Salesforce', () => {
    it('should call the navigation mixin to get the Salesforce record URL', async () => {
      const element = createTestComponent({
        ...defaultOptions,
        citation: exampleSalesforceCitation,
      });
      await flushPromises();

      const link = element.shadowRoot.querySelector(selectors.citationLink);
      const {pageReference} = getGenerateUrlCalledWith();

      expect(pageReference.attributes.recordId).toBe(
        exampleSalesforceCitation.fields.sfid
      );
      expect(link.href).toBe(exampleSalesforceLink);
    });

    it('should open the citation link inside Salesforce', async () => {
      const element = createTestComponent({
        ...defaultOptions,
        citation: exampleSalesforceCitation,
      });
      await flushPromises();

      const link = element.shadowRoot.querySelector(selectors.citationLink);
      link.click();

      const {pageReference} = getNavigateCalledWith();

      expect(pageReference.attributes.recordId).toBe(
        exampleSalesforceCitation.fields.sfid
      );
    });

    describe('when the result is a knowledge article', () => {
      it('should open the citation link inside Salesforce', async () => {
        const element = createTestComponent({
          ...defaultOptions,
          citation: exampleSalesforceKnowledgeArticleCitation,
        });
        await flushPromises();

        const link = element.shadowRoot.querySelector(selectors.citationLink);
        link.click();

        const {pageReference} = getNavigateCalledWith();

        expect(pageReference.attributes.recordId).toBe(
          exampleSalesforceKnowledgeArticleCitation.fields.sfkavid
        );
        expect(link.href).toBe(exampleSalesforceLink);
      });
    });
  });
});
