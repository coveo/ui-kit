// @ts-ignore
import { createElement } from 'lwc';
import QuanticSourceCitations from '../quanticSourceCitations';


const defaultOptions = {};

function createTestComponent(options = defaultOptions) {
  const element = createElement('c-quantic-source-citations', {
    is: QuanticSourceCitations,
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

describe('c-quantic-source-citations', () => {
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

  describe('when there are citations found', () => {
    it('should properly display the citations', async () => {
      // @ts-ignore
      const element = createTestComponent();
      await flushPromises();
      expect(element).toBe();
    });

    describe('when a citation is clicked', () => {
      // @ts-ignore
      it('should properly open the citation in a new tab', async () => {
        // @ts-ignore
        const element = createTestComponent();
        await flushPromises();
        expect(element).toBe();
      });
      // @ts-ignore
      it('should send the proper analytics', async () => {
        // @ts-ignore
        const element = createTestComponent();
        await flushPromises();
        expect(element).toBe();
      });
    });
  });
  describe('when there are no citations found', () => {
    // @ts-ignore
    it('should not display the quantic-source-citations component', async () => {
      // @ts-ignore
      const element = createTestComponent();
      await flushPromises();
      expect(element).toBe();
    });
  });
});