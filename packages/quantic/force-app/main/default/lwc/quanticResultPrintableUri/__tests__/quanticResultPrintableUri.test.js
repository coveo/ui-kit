// @ts-ignore
import {
  // @ts-ignore
  getNavigateCalledWith, // @ts-ignore
  getGenerateUrlCalledWith,
} from 'lightning/navigation';
// @ts-ignore
import {createElement} from 'lwc';
import QuanticResultPrintableUri from '../quanticResultPrintableUri';
// @ts-ignore
import mockDefaultResult from './data/defaultResult.json';
// @ts-ignore
import mockKnowledgeArticleResult from './data/knowledgeArticleResult.json';
// @ts-ignore
import mockSalesforceResult from './data/salesforceResult.json';

const selectors = {
  link: '[data-test="link"]',
};

function createTestComponent(options) {
  const element = createElement('c-quantic-result-printable-uri', {
    is: QuanticResultPrintableUri,
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

describe('c-quantic-result-printable-uri', () => {
  function cleanup() {
    // The jsdom instance is shared across test cases in a single file so reset the DOM
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
    jest.clearAllMocks();
  }

  beforeEach(() => {
    // @ts-ignore
    global.Bueno = {
      isString: jest
        .fn()
        .mockImplementation(
          (value) => Object.prototype.toString.call(value) === '[object String]'
        ),
    };
  });

  afterEach(() => {
    cleanup();
  });

  describe('when displaying the url', () => {
    describe('when the result is of type Salesforce', () => {
      it('should call the navigation mixin to get the Salesforce record URL', async () => {
        createTestComponent({
          ...mockSalesforceResult,
        });
        await flushPromises();

        const {pageReference} = getGenerateUrlCalledWith();

        expect(pageReference.attributes.recordId).toBe(
          mockSalesforceResult.result.raw.sfid
        );
      });

      it('should open the result link in a Salesforce subtab', async () => {
        const element = createTestComponent({
          ...mockSalesforceResult,
        });
        await flushPromises();

        const linkSalesforce = element.shadowRoot.querySelector(selectors.link);
        linkSalesforce.click();

        const {pageReference} = getNavigateCalledWith();

        expect(pageReference.attributes.recordId).toBe(
          mockSalesforceResult.result.raw.sfid
        );
      });

      describe('when the result is a knowledge article', () => {
        it('should open the result link in a Salesforce console subtab', async () => {
          const element = createTestComponent({
            ...mockKnowledgeArticleResult,
          });
          await flushPromises();

          const LinkKnowledgeArticle = element.shadowRoot.querySelector(
            selectors.link
          );
          LinkKnowledgeArticle.click();

          const {pageReference} = getNavigateCalledWith();

          expect(pageReference.attributes.recordId).toBe(
            mockKnowledgeArticleResult.result.raw.sfkavid
          );
        });
      });
    });

    describe('when the result is not of type Salesforce', () => {
      it('should open the result link in a browser tab', async () => {
        const element = createTestComponent({
          ...mockDefaultResult,
        });
        await flushPromises();

        const link = element.shadowRoot.querySelector(selectors.link);

        expect(link.getAttribute('href')).toEqual(
          mockDefaultResult.result.printableUri
        );
        expect(link.getAttribute('target')).toEqual('_self');
      });
    });

    describe('with a custom value for the target property', () => {
      it('should open the result link based on the value of the target property', async () => {
        const customTarget = '_blank';
        const element = createTestComponent({
          ...mockDefaultResult,
          target: customTarget,
        });
        await flushPromises();

        const link = element.shadowRoot.querySelector(selectors.link);

        expect(link.getAttribute('href')).toEqual(
          mockDefaultResult.result.printableUri
        );
        expect(link.getAttribute('target')).toEqual(customTarget);
      });
    });
  });
});
