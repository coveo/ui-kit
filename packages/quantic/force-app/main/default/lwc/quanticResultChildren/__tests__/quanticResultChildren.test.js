/* eslint-disable jest/expect-expect */
// @ts-ignore
import {createElement} from 'lwc';
import QuanticResultChildren from '../quanticResultChildren';

const loadAllResultsLabel = 'Load all results';
const collapseResults = 'Collapse results';
jest.mock(
  '@salesforce/label/c.quantic_LoadAllResults',
  () => ({default: loadAllResultsLabel}),
  {
    virtual: true,
  }
);
jest.mock(
  '@salesforce/label/c.quantic_CollapseResults',
  () => ({default: collapseResults}),
  {
    virtual: true,
  }
);

const functionsMocks = {
  loadCollection: jest.fn(() => {}),
  logShowLessFoldedResults: jest.fn(() => {}),
  logShowMoreFoldedResults: jest.fn(() => {}),
};

const mockedFoldedResultListController = {
  loadCollection: functionsMocks.loadCollection,
  logShowLessFoldedResults: functionsMocks.logShowLessFoldedResults,
  logShowMoreFoldedResults: functionsMocks.logShowMoreFoldedResults,
};

const selectors = {
  quanticResult: 'c-quantic-result',
  toggleButton: '.result-children__toggle-button lightning-button',
  placeholder: 'c-quantic-placeholder',
  noMoreChildrenMessage: '.result-children__no-more-children-message',
};

const exampleFoldedResultOne = {
  result: {
    uniqueId: '123',
    title: 'example result one',
  },
  children: [],
};
const exampleFoldedResultTwo = {
  result: {
    uniqueId: '456',
    title: 'example result two',
  },
  children: [],
};
const exampleEngineId = 'example engine id';
const exampleTemplateId = 'example template id';
const exampleCollection = {
  result: {
    uniqueId: '789',
    title: 'example parent result',
  },
  children: [exampleFoldedResultOne],
  isLoadingMoreResults: false,
  moreResultsAvailable: true,
};
const exampleCollectionWithAllResultsLoaded = {
  ...exampleCollection,
  children: [exampleFoldedResultOne, exampleFoldedResultTwo],
  isLoadingMoreResults: false,
  moreResultsAvailable: false,
};

const defaultOptions = {
  engineId: exampleEngineId,
  templateId: exampleTemplateId,
  foldedResultListController: mockedFoldedResultListController,
  collection: exampleCollection,
};

function createTestComponent(options = defaultOptions) {
  const element = createElement('c-quantic-result-children', {
    is: QuanticResultChildren,
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

function cleanup() {
  jest.clearAllMocks();
  // The jsdom instance is shared across test cases in a single file so reset the DOM
  while (document.body.firstChild) {
    document.body.removeChild(document.body.firstChild);
  }
}

function expectProperChildResultsDisplay(element, collection) {
  const childResults = element.shadowRoot.querySelectorAll(
    selectors.quanticResult
  );
  expect(childResults.length).toBe(collection.children.length);
  collection.children.forEach((foldedResult, index) => {
    expect(childResults[index].engineId).toBe(exampleEngineId);
    expect(childResults[index].templateId).toBe(exampleTemplateId);
    expect(childResults[index].result).toEqual(foldedResult.result);
    expect(childResults[index].collection).toEqual(foldedResult);
  });
}

async function clickFoldedResultToggleButton(element, label) {
  const foldedResultToggleButton = element.shadowRoot.querySelector(
    selectors.toggleButton
  );
  expect(foldedResultToggleButton).not.toBeNull();
  expect(foldedResultToggleButton.label).toBe(label);
  foldedResultToggleButton.click();
  await flushPromises();
}

describe('c-quantic-result-children', () => {
  afterEach(() => {
    cleanup();
  });

  describe('when there are no child results available in the collection', () => {
    it('should not display any child results and display the no more child results message', async () => {
      const element = createTestComponent({
        ...defaultOptions,
        collection: {
          ...exampleCollection,
          moreResultsAvailable: false,
          children: [],
        },
      });
      await flushPromises();

      const childResult = element.shadowRoot.querySelector(
        selectors.quanticResult
      );
      const noMoreChildrenMessage = element.shadowRoot.querySelector(
        selectors.noMoreChildrenMessage
      );

      expect(childResult).toBeNull();
      expect(noMoreChildrenMessage).not.toBeNull();
    });
  });

  describe('when there are more child results available in the collection', () => {
    it('should display the first partition of the child results', async () => {
      const element = createTestComponent();
      await flushPromises();

      expectProperChildResultsDisplay(element, exampleCollection);
    });

    describe('when more child results are expanded or collapsed', () => {
      describe('when the child results are being loaded', () => {
        it('should display the result placeholder', async () => {
          const element = createTestComponent();
          await flushPromises();

          await clickFoldedResultToggleButton(element, loadAllResultsLabel);
          element.collection = {
            ...exampleCollection,
            isLoadingMoreResults: true,
          };
          await flushPromises();

          const placeholder = element.shadowRoot.querySelector(
            selectors.placeholder
          );
          expect(placeholder.numberOfRows).toBe(
            exampleCollection.children.length
          );
        });
      });

      it('should call the right actions and properly display the child results', async () => {
        const element = createTestComponent();
        await flushPromises();
        const foldedResultToggleButton = element.shadowRoot.querySelector(
          selectors.toggleButton
        );

        await clickFoldedResultToggleButton(element, loadAllResultsLabel);
        expect(functionsMocks.loadCollection).toHaveBeenCalledTimes(1);
        element.collection = exampleCollectionWithAllResultsLoaded;
        await flushPromises();
        expectProperChildResultsDisplay(
          element,
          exampleCollectionWithAllResultsLoaded
        );

        await clickFoldedResultToggleButton(element, collapseResults);
        expect(functionsMocks.logShowLessFoldedResults).toHaveBeenCalledTimes(
          1
        );
        expectProperChildResultsDisplay(element, exampleCollection);

        await clickFoldedResultToggleButton(element, loadAllResultsLabel);
        expect(functionsMocks.logShowMoreFoldedResults).toHaveBeenCalledTimes(
          1
        );
        expectProperChildResultsDisplay(
          element,
          exampleCollectionWithAllResultsLoaded
        );
        expect(foldedResultToggleButton.label).toBe(collapseResults);
      });
    });
  });

  describe('when there are no more child results available in the collection', () => {
    it('should display the first partition of the child results', async () => {
      const element = createTestComponent();
      await flushPromises();

      expectProperChildResultsDisplay(element, exampleCollection);
    });

    describe('when trying to load more child results', () => {
      it('should display the no more child results message', async () => {
        const element = createTestComponent();
        await flushPromises();

        await clickFoldedResultToggleButton(element, loadAllResultsLabel);
        element.collection = {
          ...exampleCollection,
          moreResultsAvailable: false,
        };
        await flushPromises();

        const foldedResultToggleButton = element.shadowRoot.querySelector(
          selectors.toggleButton
        );
        const noMoreChildrenMessage = element.shadowRoot.querySelector(
          selectors.noMoreChildrenMessage
        );

        expect(functionsMocks.loadCollection).toHaveBeenCalledTimes(1);
        expectProperChildResultsDisplay(element, exampleCollection);
        expect(foldedResultToggleButton).toBeNull();
        expect(noMoreChildrenMessage).not.toBeNull();
      });
    });
  });
});
