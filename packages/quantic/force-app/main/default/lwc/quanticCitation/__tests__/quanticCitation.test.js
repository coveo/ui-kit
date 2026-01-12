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
  fields: {
    filetype: 'html',
  },
};

const exampleSalesforceCitation = {
  ...exampleCitation,
  fields: {
    filetype: 'SalesforceItem',
    sfid: '123',
  },
};
const exampleSalesforceKnowledgeArticleCitation = {
  ...exampleCitation,
  fields: {
    ...exampleCitation.fields,
    sfid: '123',
    sfkbid: 'foo',
    sfkavid: 'bar',
  },
};
const exampleSalesforceLink = 'https://www.example-salesforce.com';
const urlFragment = '#:~:text=text%2001';
const exampleCitationUrl = 'https://example.com/';

const activeCitationLinkClass = 'citation__link--active';
const activeCitationTitleClass = 'citation__title--active';
const activeCitationIconClass = 'citation__icon--active';
const testIconName = 'utility:attach';

const defaultOptions = {
  citation: exampleCitation,
  interactiveCitation: {
    select: () => functionsMocks.exampleSelect(),
    beginDelayedSelect: () => functionsMocks.exampleBeginDelayedSelect(),
    cancelPendingSelect: () => functionsMocks.exampleCancelPendingSelect(),
  },
  disableCitationAnchoring: false,
};

const selectors = {
  citation: '.citation',
  citationLink: '.citation__link',
  citationTitle: '.citation__title',
  citationTooltip: 'c-quantic-tooltip',
  citationTooltipUrl: '[data-testid="citation__tooltip-uri"]',
  citationIcon: '.citation__icon',
  actionsSlot: 'slot[name="actions"]',
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

function getActionsSlot(element) {
  return element.shadowRoot.querySelector(selectors.actionsSlot);
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

    expect(citationLink.href).toBe(`${exampleCitationUrl}${urlFragment}`);
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

    it('should display the citation tooltip after 200ms delay', async () => {
      const element = createTestComponent();
      await flushPromises();

      const citationLink = element.shadowRoot.querySelector(
        selectors.citationLink
      );
      const citationTooltip = element.shadowRoot.querySelector(
        selectors.citationTooltip
      );

      expect(citationLink).not.toBeNull();
      expect(citationTooltip).not.toBeNull();

      const showTooltipSpy = jest.spyOn(citationTooltip, 'showTooltip');

      await citationLink.dispatchEvent(
        new CustomEvent('mouseenter', {bubbles: true})
      );
      expect(showTooltipSpy).toHaveBeenCalledTimes(0);
      jest.advanceTimersByTime(200);
      expect(showTooltipSpy).toHaveBeenCalledTimes(1);
    });

    it('should dispatch a citation hover event after hovering over the the citation for more than 1200ms, 200ms delay before hover + 1000ms minimum hover duration', async () => {
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
      // Wait for show delay - this triggers the tooltip to show and sets hoverStartTimestamp
      jest.advanceTimersByTime(200);
      // Now wait for minimum hover time
      jest.advanceTimersByTime(1000);
      await citationLink.dispatchEvent(
        new CustomEvent('mouseleave', {bubbles: true})
      );
      // Additional 200ms delay for the hide tooltip logic
      jest.advanceTimersByTime(200);

      expect(functionsMocks.eventHandler).toHaveBeenCalledTimes(1);
      expect(functionsMocks.eventHandler).toHaveBeenCalledWith({
        citationHoverTimeMs: 1100,
      });
    });

    it('should not dispatch a citation hover event after hovering over the citation for less than 1200ms', async () => {
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
      // Additional 200ms delay for the new hide tooltip logic
      jest.advanceTimersByTime(200);

      expect(functionsMocks.eventHandler).toHaveBeenCalledTimes(0);
    });

    describe('when moving the cursor between the citation link and the tooltip', () => {
      it('should keep the tooltip displayed', async () => {
        const element = createTestComponent();
        await flushPromises();

        const citationLink = element.shadowRoot.querySelector(
          selectors.citationLink
        );
        const citationTooltip = element.shadowRoot.querySelector(
          selectors.citationTooltip
        );

        expect(citationLink).not.toBeNull();
        expect(citationTooltip).not.toBeNull();

        const hideTooltipSpy = jest.spyOn(citationTooltip, 'hideTooltip');

        // Hover over the citation - tooltip shows after 200ms delay
        await citationLink.dispatchEvent(
          new CustomEvent('mouseenter', {bubbles: true})
        );
        jest.advanceTimersByTime(200);

        // Move cursor to tooltip quickly (before hide delay expires)
        await citationLink.dispatchEvent(
          new CustomEvent('mouseleave', {bubbles: true})
        );

        await citationTooltip.dispatchEvent(
          new CustomEvent('mouseenter', {bubbles: true})
        );

        // Move cursor back to citation quickly (before hide delay expires)
        await citationTooltip.dispatchEvent(
          new CustomEvent('mouseleave', {bubbles: true})
        );

        await citationLink.dispatchEvent(
          new CustomEvent('mouseenter', {bubbles: true})
        );

        // Advance time beyond 100ms to see if tooltip is hidden
        jest.advanceTimersByTime(200);

        expect(hideTooltipSpy).toHaveBeenCalledTimes(0);
      });
    });
  });

  describe('when citation anchoring is enabled', () => {
    describe('when the citation source is of type Salesforce', () => {
      it('should not prevent default behavior and not call the navigation mixin to open the link', async () => {
        const element = createTestComponent({
          ...defaultOptions,
          citation: exampleSalesforceCitation,
        });
        await flushPromises();

        const link = element.shadowRoot.querySelector(selectors.citationLink);
        link.click();

        const {pageReference} = getNavigateCalledWith();
        expect(pageReference).toBeUndefined();

        expect(link.href).toBe(`${exampleSalesforceLink}/${urlFragment}`);
        expect(link.target).toBe('_blank');
      });
    });

    describe('when the citation filetype is HTML', () => {
      it('should generate a text fragment URL', async () => {
        const element = createTestComponent({
          ...defaultOptions,
          citation: {
            ...exampleCitation,
            fields: {
              ...exampleCitation.fields,
              filetype: 'html',
            },
          },
        });
        await flushPromises();

        const link = element.shadowRoot.querySelector(selectors.citationLink);
        expect(link.href).toBe(`${exampleCitationUrl}${urlFragment}`);
      });
    });

    describe('when the citation filetype is not HTML', () => {
      it('should not generate a text fragment URL', async () => {
        const element = createTestComponent({
          ...defaultOptions,
          citation: {
            ...exampleCitation,
            fields: {
              ...exampleCitation.fields,
              filetype: 'pdf',
            },
          },
        });
        await flushPromises();

        const link = element.shadowRoot.querySelector(selectors.citationLink);
        expect(link.href).toBe(exampleCitationUrl);
      });
    });

    describe('when the citation does not contain text', () => {
      it('should not generate a text fragment URL', async () => {
        const element = createTestComponent({
          ...defaultOptions,
          citation: {
            ...exampleCitation,
            text: '',
          },
        });
        await flushPromises();

        const link = element.shadowRoot.querySelector(selectors.citationLink);
        expect(link.href).toBe(exampleCitationUrl);
      });
    });
  });

  describe('when citation anchoring is disabled', () => {
    describe('when the citation source is not of type Salesforce', () => {
      it('should leave the hrefValue as the citation uri', async () => {
        const element = createTestComponent({
          ...defaultOptions,
          disableCitationAnchoring: true,
        });
        await flushPromises();

        const link = element.shadowRoot.querySelector(selectors.citationLink);
        expect(link.href).toBe(element.citation.uri);
      });
    });

    describe('when the citation source is of type Salesforce', () => {
      it('should call the navigation mixin to get the Salesforce record URL', async () => {
        const element = createTestComponent({
          ...defaultOptions,
          citation: exampleSalesforceCitation,
          disableCitationAnchoring: true,
        });
        await flushPromises();

        const link = element.shadowRoot.querySelector(selectors.citationLink);
        const {pageReference} = getGenerateUrlCalledWith();

        expect(pageReference.attributes.recordId).toBe(
          exampleSalesforceCitation.fields.sfid
        );
        expect(link.href).toBe(`${exampleSalesforceLink}/`);
      });

      it('should open the citation link inside Salesforce', async () => {
        const element = createTestComponent({
          ...defaultOptions,
          citation: exampleSalesforceCitation,
          disableCitationAnchoring: true,
        });
        await flushPromises();

        const link = element.shadowRoot.querySelector(selectors.citationLink);
        link.click();

        const {pageReference} = getNavigateCalledWith();

        expect(pageReference.attributes.recordId).toBe(
          exampleSalesforceCitation.fields.sfid
        );
      });

      it('should display the salesforce link inside the tooltip url', async () => {
        const element = createTestComponent({
          ...defaultOptions,
          citation: exampleSalesforceCitation,
          disableCitationAnchoring: true,
        });
        await flushPromises();

        const citationTooltipUrl = element.shadowRoot.querySelector(
          selectors.citationTooltipUrl
        );
        expect(citationTooltipUrl).not.toBeNull();
        expect(citationTooltipUrl.textContent).toBe(exampleSalesforceLink);
      });

      describe('when the result is a knowledge article', () => {
        it('should open the citation link inside Salesforce', async () => {
          const element = createTestComponent({
            ...defaultOptions,
            citation: exampleSalesforceKnowledgeArticleCitation,
            disableCitationAnchoring: true,
          });
          await flushPromises();

          const link = element.shadowRoot.querySelector(selectors.citationLink);
          link.click();

          const {pageReference} = getNavigateCalledWith();

          expect(pageReference.attributes.recordId).toBe(
            exampleSalesforceKnowledgeArticleCitation.fields.sfkavid
          );
          expect(link.href).toBe(`${exampleSalesforceLink}/`);
        });
      });
    });
  });

  describe('when the citation is active', () => {
    it('should apply the active styles to the citation link, title and icon', async () => {
      const element = createTestComponent({
        ...defaultOptions,
        citation: exampleCitation,
        isActive: true,
        iconName: testIconName,
      });
      await flushPromises();

      const citationLink = element.shadowRoot.querySelector(
        selectors.citationLink
      );
      const citationTitle = element.shadowRoot.querySelector(
        selectors.citationTitle
      );
      const citationIcon = element.shadowRoot.querySelector(selectors.citationIcon);

      expect(citationLink.classList).toContain(activeCitationLinkClass);
      expect(citationTitle.classList).toContain(activeCitationTitleClass);
      expect(citationIcon.classList).toContain(activeCitationIconClass);
    });
  });

  describe('when the citation is not active', () => {
    it('should not apply the active styles to the citation link, title and icon', async () => {
      const element = createTestComponent({
        ...defaultOptions,
        citation: exampleCitation,
        isActive: false,
        iconName: testIconName,
      });
      await flushPromises();

      const citationLink = element.shadowRoot.querySelector(
        selectors.citationLink
      );
      const citationTitle = element.shadowRoot.querySelector(
        selectors.citationTitle
      );
      const citationIcon = element.shadowRoot.querySelector(selectors.citationIcon);

      expect(citationLink.classList).not.toContain(activeCitationLinkClass);
      expect(citationTitle.classList).not.toContain(activeCitationTitleClass);
      expect(citationIcon.classList).not.toContain(activeCitationIconClass);
    });
  });

  describe('when the an icon name is provided', () => {
    it('should set the icon name on the citation icon', async () => {
      const element = createTestComponent({
        ...defaultOptions,
        citation: exampleCitation,
        iconName: testIconName,
      });
      await flushPromises();

      const citationIcon = element.shadowRoot.querySelector('lightning-icon');
      expect(citationIcon.iconName).toBe(testIconName);
    });
  });

  describe('when no icon name is provided', () => {
    it('should not display any icon in the citation', async () => {
      const element = createTestComponent({
        ...defaultOptions,
        citation: exampleCitation,
        iconName: undefined,
      });
      await flushPromises();

      const citationIcon = element.shadowRoot.querySelector('lightning-icon');
      expect(citationIcon).toBeNull();
    });
  });

  describe('citation actions slot', () => {
    it('should render provided actions in the slot', async () => {
      const element = createTestComponent();
      const action = document.createElement('span');
      action.slot = 'actions';
      action.textContent = 'Action';
      element.appendChild(action);

      await flushPromises();

      const slot = getActionsSlot(element);
      expect(slot).not.toBeNull();
    });

    it('should have no assigned actions when none are provided', async () => {
      const element = createTestComponent();
      await flushPromises();

      const slot = getActionsSlot(element);
      expect(slot).not.toBeNull();
      expect(slot.assignedElements()).toHaveLength(0);
    });
  });
});
