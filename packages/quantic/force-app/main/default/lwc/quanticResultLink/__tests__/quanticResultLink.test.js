import * as mockHeadlessLoader from 'c/quanticHeadlessLoader';
// @ts-ignore
import {getNavigateCalledWith} from 'lightning/navigation';
// @ts-ignore
import {createElement} from 'lwc';
import QuanticResultLink from '../quanticResultLink';
// @ts-ignore
import mockDefaultResult from './data/defaultResult.json';
// @ts-ignore
import mockKnowledgeArticleResult from './data/knowledgeArticleResult.json';
// @ts-ignore
import mockSalesforceResult from './data/salesforceResult.json';

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
    it('should open the result link in a Salesforce console subtab', async () => {
      const element = createTestComponent({...mockSalesforceResult});
      await flushPromises();

      const linkSalesforce = element.shadowRoot.querySelector('a');
      linkSalesforce.click();

      const {pageReference} = getNavigateCalledWith();

      expect(pageReference.attributes.recordId).toBe(
        mockSalesforceResult.result.raw.sfid
      );
    });

    describe('when the result is a knowledge article', () => {
      it('should open the result link in a Salesforce console subtab', async () => {
        const element = createTestComponent({...mockKnowledgeArticleResult});
        await flushPromises();

        const LinkKnowledgeArticle = element.shadowRoot.querySelector('a');
        LinkKnowledgeArticle.click();

        const {pageReference} = getNavigateCalledWith();

        expect(pageReference.attributes.recordId).toBe(
          mockKnowledgeArticleResult.result.raw.sfkavid
        );
      });
    });
  });

  describe('when the result is NOT of type salesforce', () => {
    it('should open the result link in the current browser tab', async () => {
      const element = createTestComponent({...mockDefaultResult});
      await flushPromises();

      const link = element.shadowRoot.querySelector('a');

      expect(link.getAttribute('href')).toEqual(
        mockDefaultResult.result.clickUri
      );
      expect(link.getAttribute('target')).toEqual('_self');
    });

    describe('with a custom value for the target property', () => {
      it('should open the result link based on the value of the target property', async () => {
        const customTarget = '_blank';
        const element = createTestComponent({
          ...mockDefaultResult,
          target: customTarget,
        });
        await flushPromises();

        const link = element.shadowRoot.querySelector('a');

        expect(link.getAttribute('href')).toEqual(
          mockDefaultResult.result.clickUri
        );
        expect(link.getAttribute('target')).toEqual(customTarget);
      });
    });
  });
});
