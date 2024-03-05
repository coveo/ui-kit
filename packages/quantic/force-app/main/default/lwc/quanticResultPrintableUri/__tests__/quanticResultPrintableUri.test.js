// @ts-ignore
import * as mockHeadlessLoader from 'c/quanticHeadlessLoader';
// @ts-ignore
import {createElement} from 'lwc';
import QuanticResultPrintableUri from '../quanticResultPrintableUri';

const MIN_MAX_NUMBER_OF_PARTS = 3;

jest.mock('c/quanticHeadlessLoader');

// Helper function to mock Headless and Bueno for this suite of tests.
function mockHeadlessAndBueno() {
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

const selectors = {
  link: 'c-quantic-result-link',
  pathItem: '[data-test="path__item"]',
  pathExpandButton: '[data-test="path__expand-button"]',
  errorMessage: '[data-test="error"]',
};
const exampleEngineId = 'example engine id';

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

function generateExampleUri(id) {
  return `https://uri${id}.com/`;
}

function generateResultParents(numberOfParents) {
  let parents = '';
  for (let i = 1; i <= numberOfParents; i++) {
    parents += `<parent name="parent${i}" uri="${generateExampleUri(i)}" />`;
  }
  return `<parents>${parents}</parents>`;
}

function shouldProperlyDisplayAllPathItems(pathItems) {
  pathItems.forEach((item, index) => {
    expect(item.textContent).toBe(`parent${index + 1}`);
    expect(item.href).toBe(`${generateExampleUri(index + 1)}`);
  });
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
    console.error = jest.fn();
    mockHeadlessAndBueno();
  });

  afterEach(() => {
    cleanup();
  });

  describe('when displaying the result path', () => {
    describe('when the number of parents is lower than the maxNumberOfParts property', () => {
      const numberOfParents = 2;
      const exampleResultWithParents = {
        raw: {
          parents: generateResultParents(numberOfParents),
        },
      };
      it('should properly display all the result path', async () => {
        const element = createTestComponent({
          result: exampleResultWithParents,
          engineId: exampleEngineId,
          maxNumberOfParts: 3,
        });
        await flushPromises();

        const pathItems = element.shadowRoot.querySelectorAll(
          selectors.pathItem
        );
        expect(pathItems).not.toBeNull();
        expect(pathItems.length).toBe(numberOfParents);
        shouldProperlyDisplayAllPathItems(pathItems);
      });
    });

    describe('when the number of parents is greater than the maxNumberOfParts property', () => {
      const numberOfParents = 8;
      const exampleResultWithParents = {
        raw: {
          parents: generateResultParents(numberOfParents),
        },
      };

      describe('when the default value of the maxNumberOfParts property is used', () => {
        it('should properly display the result collapsed path', async () => {
          const defaultMaxNumberOfParts = 5;
          const element = createTestComponent({
            result: exampleResultWithParents,
            engineId: exampleEngineId,
          });
          await flushPromises();

          const pathItems = Array.from(
            element.shadowRoot.querySelectorAll(selectors.pathItem)
          );
          const expandButton = element.shadowRoot.querySelector(
            selectors.pathExpandButton
          );
          expect(pathItems).not.toBeNull();
          expect(pathItems.length).toBe(defaultMaxNumberOfParts);
          pathItems
            .slice(0, defaultMaxNumberOfParts - 1)
            .forEach((item, index) => {
              expect(item.textContent).toBe(`parent${index + 1}`);
              expect(item.href).toBe(`${generateExampleUri(index + 1)}`);
            });

          expect(expandButton).not.toBeNull();

          expect(pathItems[defaultMaxNumberOfParts - 1].textContent).toBe(
            `parent${numberOfParents}`
          );
          expect(pathItems[defaultMaxNumberOfParts - 1].href).toBe(
            `${generateExampleUri(numberOfParents)}`
          );
        });

        describe('when expanding the result collapsed path', () => {
          it('should properly display the result expanded path', async () => {
            const element = createTestComponent({
              result: exampleResultWithParents,
              engineId: exampleEngineId,
            });
            await flushPromises();

            let expandButton = element.shadowRoot.querySelector(
              selectors.pathExpandButton
            );

            expect(expandButton).not.toBeNull();

            await expandButton.click();

            const pathItems = element.shadowRoot.querySelectorAll(
              selectors.pathItem
            );
            expandButton = element.shadowRoot.querySelector(
              selectors.pathExpandButton
            );

            expect(expandButton).toBeNull();
            expect(pathItems).not.toBeNull();
            expect(pathItems.length).toBe(numberOfParents);
            shouldProperlyDisplayAllPathItems(pathItems);
          });
        });
      });

      describe('when a custom value of the maxNumberOfParts property is used', () => {
        const customMaxNumberOfParts = 3;

        it('should properly display the result collapsed path', async () => {
          const element = createTestComponent({
            result: exampleResultWithParents,
            engineId: exampleEngineId,
            maxNumberOfParts: customMaxNumberOfParts,
          });
          await flushPromises();

          const pathItems = Array.from(
            element.shadowRoot.querySelectorAll(selectors.pathItem)
          );
          const expandButton = element.shadowRoot.querySelector(
            selectors.pathExpandButton
          );
          expect(pathItems).not.toBeNull();
          expect(pathItems.length).toBe(customMaxNumberOfParts);
          pathItems
            .slice(0, customMaxNumberOfParts - 1)
            .forEach((item, index) => {
              expect(item.textContent).toBe(`parent${index + 1}`);
              expect(item.href).toBe(`${generateExampleUri(index + 1)}`);
            });

          expect(expandButton).not.toBeNull();

          expect(pathItems[customMaxNumberOfParts - 1].textContent).toBe(
            `parent${numberOfParents}`
          );
          expect(pathItems[customMaxNumberOfParts - 1].href).toBe(
            `${generateExampleUri(numberOfParents)}`
          );
        });

        describe('when expanding the result collapsed path', () => {
          it('should properly display the result expanded path', async () => {
            const element = createTestComponent({
              result: exampleResultWithParents,
              engineId: exampleEngineId,
              maxNumberOfParts: customMaxNumberOfParts,
            });
            await flushPromises();

            let expandButton = element.shadowRoot.querySelector(
              selectors.pathExpandButton
            );

            expect(expandButton).not.toBeNull();

            await expandButton.click();

            const pathItems = element.shadowRoot.querySelectorAll(
              selectors.pathItem
            );
            expandButton = element.shadowRoot.querySelector(
              selectors.pathExpandButton
            );

            expect(expandButton).toBeNull();
            expect(pathItems).not.toBeNull();
            expect(pathItems.length).toBe(numberOfParents);
            shouldProperlyDisplayAllPathItems(pathItems);
          });
        });
      });
    });
  });

  describe('when displaying the result url', () => {
    const exampleResult = {
      title: 'example title',
      clickUri: 'https://coveo.com/',
      raw: {
        parents: '',
      },
    };

    it('should display the printable uri using the quantic result link component', async () => {
      const customTarget = '_blank';
      const element = createTestComponent({
        result: exampleResult,
        target: customTarget,
        engineId: exampleEngineId,
      });
      await flushPromises();

      const link = element.shadowRoot.querySelector(selectors.link);

      expect(link).not.toBeNull();
      expect(link.engineId).toBe(exampleEngineId);
      expect(link.result).toEqual(exampleResult);
      expect(link.displayedField).toBe('printableUri');
      expect(link.target).toBe(customTarget);
    });
  });

  describe('when given invalid value of the property maxNumberOfParts', () => {
    const exampleResult = {
      title: 'example title',
      clickUri: 'https://coveo.com/',
      raw: {
        parents: '',
      },
    };
    const invalidMaxNumberOfParts = 1;

    it('should display an error message', async () => {
      const element = createTestComponent({
        engineId: exampleEngineId,
        result: exampleResult,
        maxNumberOfParts: invalidMaxNumberOfParts,
      });
      await flushPromises();

      const errorMessage = element.shadowRoot.querySelector(
        selectors.errorMessage
      );

      expect(errorMessage).not.toBeNull();
      expect(errorMessage.textContent).toBe(
        'c-quantic-result-printable-uri Error'
      );
      expect(console.error).toHaveBeenCalledWith(
        `The provided value of ${invalidMaxNumberOfParts} for the maxNumberOfParts option is inadequate. The provided value must be at least ${MIN_MAX_NUMBER_OF_PARTS}.`
      );
    });
  });
});
