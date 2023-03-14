// @ts-ignore
import {createElement} from 'lwc';
import QuanticResultChildren from '../quanticResultChildren';

jest.mock(
  '@salesforce/label/c.quantic_LoadThread',
  () => ({default: 'Load thread'}),
  {
    virtual: true,
  }
);
jest.mock(
  '@salesforce/label/c.quantic_ShowThread',
  () => ({default: 'Show thread'}),
  {
    virtual: true,
  }
);
jest.mock(
  '@salesforce/label/c.quantic_HideThread',
  () => ({default: 'Hide thread'}),
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
  toggleButton: '.folded-result__toggle-button lightning-button',
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
const foldedCollection = {
  result: {
    uniqueId: '789',
    title: 'example parent result',
  },
  children: [exampleFoldedResultOne],
  isLoadingMoreResults: false,
  moreResultsAvailable: true,
};
const foldedCollectionWithAllResultsLoaded = {
  ...foldedCollection,
  children: [exampleFoldedResultOne, exampleFoldedResultTwo],
  isLoadingMoreResults: false,
  moreResultsAvailable: false,
};

const defaultOptions = {
  engineId: exampleEngineId,
  templateId: exampleTemplateId,
  foldedResultListController: mockedFoldedResultListController,
  foldedCollection: foldedCollection,
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
    expect(childResults[index].foldedCollection).toEqual(foldedResult);
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
        foldedCollection: {
          ...foldedCollection,
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

  describe('when the child results are being loaded', () => {
    it('should display the result placeholder', async () => {
      const element = createTestComponent();
      await flushPromises();

      await clickFoldedResultToggleButton(element, 'Load thread');
      element.foldedCollection = {
        ...foldedCollection,
        isLoadingMoreResults: true,
      };
      await flushPromises();

      const placeholder = element.shadowRoot.querySelector(
        selectors.placeholder
      );
      expect(placeholder.numberOfRows).toBe(foldedCollection.children.length);
    });
  });

  describe('when there are no more child results available in the collection', () => {
    it('should display the first partition of the child results', async () => {
      const element = createTestComponent();
      await flushPromises();

      expectProperChildResultsDisplay(element, foldedCollection);
    });

    describe('when trying to load more child results', () => {
      it('should display the no more child results message', async () => {
        const element = createTestComponent();
        await flushPromises();

        await clickFoldedResultToggleButton(element, 'Load thread');
        element.foldedCollection = {
          ...foldedCollection,
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
        expectProperChildResultsDisplay(element, foldedCollection);
        expect(foldedResultToggleButton).toBeNull();
        expect(noMoreChildrenMessage).not.toBeNull();
      });
    });
  });

  describe('when there are more child results available in the collection', () => {
    it('should display the first partition of the child results', async () => {
      const element = createTestComponent();
      await flushPromises();

      expectProperChildResultsDisplay(element, foldedCollection);
    });

    describe('when more child results are expanded or collapsed', () => {
      it('should call the right actions and properly display the child results', async () => {
        const element = createTestComponent();
        await flushPromises();
        const foldedResultToggleButton = element.shadowRoot.querySelector(
          selectors.toggleButton
        );

        await clickFoldedResultToggleButton(element, 'Load thread');
        expect(functionsMocks.loadCollection).toHaveBeenCalledTimes(1);
        element.foldedCollection = foldedCollectionWithAllResultsLoaded;
        await flushPromises();
        expectProperChildResultsDisplay(
          element,
          foldedCollectionWithAllResultsLoaded
        );

        await clickFoldedResultToggleButton(element, 'Hide thread');
        expect(functionsMocks.logShowLessFoldedResults).toHaveBeenCalledTimes(
          1
        );
        expectProperChildResultsDisplay(element, foldedCollection);

        await clickFoldedResultToggleButton(element, 'Show thread');
        expect(functionsMocks.logShowMoreFoldedResults).toHaveBeenCalledTimes(
          1
        );
        expectProperChildResultsDisplay(
          element,
          foldedCollectionWithAllResultsLoaded
        );
        expect(foldedResultToggleButton.label).toBe('Hide thread');
      });
    });
  });
});
