import * as mockHeadlessLoader from 'c/quanticHeadlessLoader';
import {
  getNavigateCalledWith,
  getGenerateUrlCalledWith,
} from 'lightning/navigation';
// @ts-ignore
import {createElement} from 'lwc';
import QuanticResultLink from '../quanticResultLink';

const exampleResult = {
  clickUri: 'https://coveo.com/',
};

const selectors = {
  quanticTextField: 'c-quantic-result-highlighted-text-field',
};

jest.mock('c/quanticHeadlessLoader');

function createTestComponent(options) {
  const element = createElement('c-quantic-result-link', {
    is: QuanticResultLink,
  });

  for (const [key, value] of Object.entries(options)) {
    element[key] = value;
  }

  document.body.appendChild(element);
  return element;
}

// Helper function to wait until the microtask queue is empty.
function flushPromises() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

// Helper function to mock headless for this suite of tests.
function mockHeadlessAndBueno() {
  jest.spyOn(mockHeadlessLoader, 'getHeadlessBundle').mockReturnValue({
    buildInteractiveResult: () => ({
      select: jest.fn(),
      beginDelayedSelect: jest.fn(),
      cancelPendingSelect: jest.fn(),
    }),
  });

  jest.spyOn(mockHeadlessLoader, 'getHeadlessEnginePromise').mockReturnValue(
    new Promise((resolve) => {
      resolve();
    })
  );

  jest.spyOn(mockHeadlessLoader, 'getBueno').mockReturnValue(
    new Promise(() => {
      // @ts-ignore
      global.Bueno = {
        isString: jest
          .fn()
          .mockImplementation(
            (value) =>
              Object.prototype.toString.call(value) === '[object String]'
          ),
      };
    })
  );
}

describe('c-quantic-result-link', () => {
  function cleanup() {
    // The jsdom instance is shared across test cases in a single file so reset the DOM.
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
    jest.clearAllMocks();
  }

  beforeEach(() => {
    mockHeadlessAndBueno();
  });

  afterEach(() => {
    cleanup();
  });

  describe('when the result is of type Salesforce', () => {
    const exampleSalesforceResult = {
      ...exampleResult,
      raw: {
        sfid: '123',
      },
    };
    it('should call the navigation mixin to get the Salesforce record URL', async () => {
      createTestComponent({result: exampleSalesforceResult});
      await flushPromises();

      const {pageReference} = getGenerateUrlCalledWith();

      expect(pageReference.attributes.recordId).toBe(
        exampleSalesforceResult.raw.sfid
      );
    });

    it('should open the result link in a Salesforce console subtab', async () => {
      const element = createTestComponent({result: exampleSalesforceResult});
      await flushPromises();

      const linkSalesforce = element.shadowRoot.querySelector('a');
      linkSalesforce.click();

      const {pageReference} = getNavigateCalledWith();

      expect(pageReference.attributes.recordId).toBe(
        exampleSalesforceResult.raw.sfid
      );
    });

    describe('when the result is a knowledge article', () => {
      const exampleKnowledgeArticleResult = {
        ...exampleResult,
        raw: {
          sfid: '1234',
          sfkavid: '1234',
        },
      };
      it('should open the result link in a Salesforce console subtab', async () => {
        const element = createTestComponent({
          result: exampleKnowledgeArticleResult,
        });
        await flushPromises();

        const LinkKnowledgeArticle = element.shadowRoot.querySelector('a');
        LinkKnowledgeArticle.click();

        const {pageReference} = getNavigateCalledWith();

        expect(pageReference.attributes.recordId).toBe(
          exampleKnowledgeArticleResult.raw.sfkavid
        );
      });
    });

    describe('when the result is a case comment', () => {
      const exampleCaseCommentResult = {
        ...exampleResult,
        raw: {
          sfid: '1234',
          sfparentid: '5678',
          documenttype: 'CaseComment',
        },
      };
      it('should open the parent of the result in a Salesforce console subtab', async () => {
        const element = createTestComponent({result: exampleCaseCommentResult});
        await flushPromises();

        const link = element.shadowRoot.querySelector('a');
        link.click();

        const {pageReference} = getNavigateCalledWith();

        expect(pageReference.attributes.recordId).toBe(
          exampleCaseCommentResult.raw.sfparentid
        );
      });
    });
  });

  describe('when the result is NOT of type salesforce', () => {
    it('should open the result link in the current browser tab', async () => {
      const element = createTestComponent({result: exampleResult});
      await flushPromises();

      const link = element.shadowRoot.querySelector('a');

      expect(link.getAttribute('href')).toEqual(exampleResult.clickUri);
      expect(link.getAttribute('target')).toEqual('_self');
    });

    describe('with a custom value for the target property', () => {
      it('should open the result link based on the value of the target property', async () => {
        const customTarget = '_blank';
        const element = createTestComponent({
          result: exampleResult,
          target: customTarget,
        });
        await flushPromises();

        const link = element.shadowRoot.querySelector('a');

        expect(link.getAttribute('href')).toEqual(exampleResult.clickUri);
        expect(link.getAttribute('target')).toEqual(customTarget);
      });
    });
  });

  describe('with a custom value for the displayed field property', () => {
    it('should display the correct field as the link text', async () => {
      const customFieldToDisplay = 'exampleField';

      const element = createTestComponent({
        result: {
          ...exampleResult,
          raw: {[customFieldToDisplay]: 'exampleValue'},
        },
        displayedField: customFieldToDisplay,
      });
      await flushPromises();

      const quanticTextFieldComponent = element.shadowRoot.querySelector(
        selectors.quanticTextField
      );

      expect(quanticTextFieldComponent).not.toBeNull();
      expect(quanticTextFieldComponent.field).toBe(customFieldToDisplay);
    });
  });

  describe('with the default value for the displayed field property', () => {
    describe('when the title field exists on the result', () => {
      it('should display the title field as the link text', async () => {
        const defaultFieldToDisplay = 'title';

        const element = createTestComponent({
          result: {
            ...exampleResult,
            [defaultFieldToDisplay]: 'example title',
          },
        });
        await flushPromises();

        const quanticTextFieldComponent = element.shadowRoot.querySelector(
          selectors.quanticTextField
        );

        expect(quanticTextFieldComponent).not.toBeNull();
        expect(quanticTextFieldComponent.field).toBe(defaultFieldToDisplay);
      });
    });

    describe('when the title field does not exist on the result', () => {
      it('should fall back to display the click uri field as the link text', async () => {
        const fallbackFieldToDisplay = 'clickUri';

        const element = createTestComponent({
          result: {
            ...exampleResult,
            [fallbackFieldToDisplay]: 'example clickUri',
          },
        });
        await flushPromises();

        const quanticTextFieldComponent = element.shadowRoot.querySelector(
          selectors.quanticTextField
        );

        expect(quanticTextFieldComponent).not.toBeNull();
        expect(quanticTextFieldComponent.field).toBe(fallbackFieldToDisplay);
      });
    });
  });
});
