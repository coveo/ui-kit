// @ts-ignore
import QuanticResultLink from 'c/quanticResultLink';
import {getNavigateCalledWith} from 'lightning/navigation';
// @ts-ignore
import { createElement } from 'lwc';


const defaultOptions = {
  result: {
    clickUri: 'http://coveo.com/',
  },
};

const salesforceResultOptions = {
  result: {
    clickUri: 'http://coveo.com/',
    raw: {
      sfid: '123',
    },
  },
};

function createTestComponent(options = defaultOptions) {
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

// // Mock the NavigationMixin's Navigate method
// jest.mock('lightning/navigation', () => ({
//     NavigationMixin: {
//         Navigate: jest.fn()
//     }
// }));

describe('c-quantic-result-link', () => {
  const MOCK_RECORD_ID = '500DE00000W2jfnYAB';
  const MOCK_ACTION_NAME = 'view';
  const MOCK_OBJECT_API_NAME = 'Case';
  const MOCK_TYPE = 'standard__recordPage';

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

  describe('when the result is of type salesforce', () => {
    // const mockTargetPageRef = {
    //   type: 'standard__recordPage',
    //   attributes: {
    //     recordId: '123',
    //     objectApiName: 'Case',
    //     actionName: 'view',
    //   },
    // };
    it('should open the result link in a salesforce console subTab', async () => {
      const element = createTestComponent({...salesforceResultOptions});

      await flushPromises();

      const linkSalesforce = element.shadowRoot.querySelector('a');
      linkSalesforce.click();

      const { pageReference } = getNavigateCalledWith();
      expect(pageReference.type).toBe(MOCK_TYPE);
      expect(pageReference.attributes.apiName).toBe(MOCK_OBJECT_API_NAME);
    });

    describe('is a knowledge article', () => {
      // @ts-ignore
      it.skip('should also open the result link in a salesforce console subTab', async () => {
        // @ts-ignore
        const element = createTestComponent({...salesforceResultOptions}); // change sfid for sfkavid
        await flushPromises();

        const linkSalesforce = element.shadowRoot.querySelector('a');

        // @ts-ignore
        jest.spyOn(window, 'open').mockImplementation((url, target) => {
          expect(target).toEqual('_blank');
          expect(url).toEqual(linkSalesforce.href);
        });
        // @ts-ignore
        expect(linkSalesforce).toHaveAttribute('href', '#');
        // @ts-ignore
        expect(linkSalesforce).toHaveAttribute('target', 'something');
      });
    });
  });
  describe('when the result is NOT of type salesforce', () => {
    // @ts-ignore
    it.skip('should open the result link in the current browser tab', async () => {
      const element = createTestComponent({...defaultOptions});
      await flushPromises();

      const link = element.shadowRoot.querySelector('a');

      // @ts-ignore
      expect(link).toHaveAttribute('href', 'http://coveo.com/');
      // @ts-ignore
      expect(link).toHaveAttribute('target', '_self');
    });
  });
});