// @ts-nocheck
import '@testing-library/jest-dom';
import * as mockHeadlessLoader from 'c/quanticHeadlessLoader';
import {getNavigateCalledWith} from 'lightning/navigation';
import {createElement} from 'lwc';
import QuanticResultLink from '../quanticResultLink';
import mockDefaultResult from './data/defaultResult.json';
import mockKnowledgeArticleResult from './data/knowledgeArticleResult.json';
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
function mockHeadless() {
  const mockHeadlessBundle = {
    buildInteractiveResult: jest.fn(),
  };

  jest.mock('../../quanticHeadlessLoader/quanticHeadlessLoader.js', () => ({
    getHeadlessBundle: jest.fn().mockReturnValue(mockHeadlessBundle),
  }));

  jest.spyOn(mockHeadlessLoader, 'getHeadlessEnginePromise').mockReturnValue(
    new Promise((resolve) => {
      resolve();
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

  afterEach(() => {
    cleanup();
  });

  describe('when the result is of type salesforce', () => {
    it('should open the result link in a salesforce console subTab', async () => {
      let MOCK_RECORD_ID = '123';
      mockHeadless();

      const element = createTestComponent({...mockSalesforceResult});
      await flushPromises();

      const linkSalesforce = element.shadowRoot.querySelector('a');
      linkSalesforce.click();

      const {pageReference} = getNavigateCalledWith();

      expect(pageReference.attributes.recordId).toBe(MOCK_RECORD_ID);
    });

    describe('when the result is a knowledge article', () => {
      it('should open the result link in a salesforce console subTab', async () => {
        let MOCK_RECORD_ID = '1234';
        mockHeadless();

        const element = createTestComponent({...mockKnowledgeArticleResult});
        await flushPromises();

        const linkSalesforce = element.shadowRoot.querySelector('a');
        linkSalesforce.click();

        const {pageReference} = getNavigateCalledWith();

        expect(pageReference.attributes.recordId).toBe(MOCK_RECORD_ID);
      });
    });
  });
  describe('when the result is NOT of type salesforce', () => {
    it('should open the result link in the current browser tab', async () => {
      mockHeadless();

      const element = createTestComponent({...mockDefaultResult});
      await flushPromises();

      const link = element.shadowRoot.querySelector('a');
      link.click();

      expect(link).toHaveAttribute('href', 'http://coveo.com/');
      expect(link).toHaveAttribute('target', '_self');
    });
  });
});
