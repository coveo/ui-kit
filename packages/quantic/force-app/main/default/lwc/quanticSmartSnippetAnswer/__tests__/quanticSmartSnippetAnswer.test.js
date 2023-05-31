// @ts-ignore
import {createElement} from 'lwc';
import QuanticSmartSnippetAnswer from '../quanticSmartSnippetAnswer';

const functionsMocks = {
  exampleSelect: jest.fn(() => {}),
  exampleBeginDelayedSelect: jest.fn(() => {}),
  exampleCancelPendingSelect: jest.fn(() => {}),
};

const selectors = {
  smartSnippetAnswer: '.smart-snippet-answer',
};

const exampleAnswer =
  '<div><p>Example smart snippet answer</p><a href="#">Example inline link</a></div>';
const exampleAnswerWithInvalidLink =
  '<div><a>Example invalid inline link</a></div>';
const exampleActions = {
  select: functionsMocks.exampleSelect,
  beginDelayedSelect: functionsMocks.exampleBeginDelayedSelect,
  cancelPendingSelect: functionsMocks.exampleCancelPendingSelect,
};

const defaultOptions = {
  answer: exampleAnswer,
  actions: exampleActions,
};

function createTestComponent(options = defaultOptions) {
  const element = createElement('c-quantic-smart-snippet-answer', {
    is: QuanticSmartSnippetAnswer,
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

const bindingsMap = {
  contextmenu: functionsMocks.exampleSelect,
  click: functionsMocks.exampleSelect,
  mouseup: functionsMocks.exampleSelect,
  mousedown: functionsMocks.exampleSelect,
  touchstart: functionsMocks.exampleBeginDelayedSelect,
  touchend: functionsMocks.exampleCancelPendingSelect,
};

describe('c-quantic-smart-snippet-answer', () => {
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

  it('should properly display the smart snippet answer', async () => {
    const element = createTestComponent();
    await flushPromises();

    const answer = element.shadowRoot.querySelector(
      selectors.smartSnippetAnswer
    );

    expect(answer).not.toBeNull();
    // eslint-disable-next-line @lwc/lwc/no-inner-html
    expect(answer.innerHTML).toBe(exampleAnswer);
  });

  describe('the analytics bindings of the inline links within the smart snippet answer', () => {
    for (const [eventName, action] of Object.entries(bindingsMap)) {
      it(`should execute the proper action when the ${eventName} is triggered`, async () => {
        const element = createTestComponent();
        await flushPromises();

        const inlineLink = element.shadowRoot.querySelector('a');
        inlineLink.dispatchEvent(new CustomEvent(eventName));

        expect(action).toHaveBeenCalledTimes(1);
      });

      it(`should not execute the proper action when the ${eventName} is triggered on an ivalid link`, async () => {
        const element = createTestComponent({
          ...defaultOptions,
          answer: exampleAnswerWithInvalidLink,
        });
        await flushPromises();

        const inlineLink = element.shadowRoot.querySelector('a');
        inlineLink.dispatchEvent(new CustomEvent(eventName));

        expect(action).toHaveBeenCalledTimes(0);
      });
    }
  });

  describe('when invalid inline links are returned in the answer of the smart snippet', () => {
    const expectedRenderedAnswer =
      '<div><a class="inline-link--disabled">Example invalid inline link</a></div>';

    it('should properly assign the disabled CSS class to the invalid inline link', async () => {
      const element = createTestComponent({
        ...defaultOptions,
        answer: exampleAnswerWithInvalidLink,
      });
      await flushPromises();

      const answer = element.shadowRoot.querySelector(
        selectors.smartSnippetAnswer
      );

      expect(answer).not.toBeNull();
      // eslint-disable-next-line @lwc/lwc/no-inner-html
      expect(answer.innerHTML).toBe(expectedRenderedAnswer);
    });
  });
});
