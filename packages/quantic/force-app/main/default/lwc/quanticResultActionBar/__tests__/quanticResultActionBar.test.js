// @ts-nocheck
// @ts-ignore
import {createElement} from 'lwc';
import QuanticResultActionBar from '../quanticResultActionBar';

const functionsMocks = {
  setOrderFirst: jest.fn(() => {}),
  setOrderMiddle: jest.fn(() => {}),
  setOrderLast: jest.fn(() => {}),
};

function createTestComponent() {
  const element = createElement('c-quantic-result-action-bar', {
    is: QuanticResultActionBar,
  });

  document.body.appendChild(element);

  return element;
}

function createExampleResultActionButton(element) {
  const resultActionButton = document.createElement('button');

  element.appendChild(resultActionButton);
  return resultActionButton;
}

function registerExampleResultActionButton(
  resultActionButton,
  setOrderCallback
) {
  const resultActionRegister = new CustomEvent(
    'quantic__resultactionregister',
    {
      bubbles: true,
      detail: {
        applyCssOrderClass: setOrderCallback,
      },
    }
  );

  resultActionButton.dispatchEvent(resultActionRegister);
}

function triggerSlotChange(element) {
  const slot = element.shadowRoot.querySelector('slot');

  const slotChange = new CustomEvent('slotchange');

  slot.dispatchEvent(slotChange);
}

// Helper function to wait until the microtask queue is empty.
function flushPromises() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

describe('c-quantic-result-action-bar', () => {
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

  it('should display the slot element', async () => {
    const element = createTestComponent();
    await flushPromises();

    const slot = element.shadowRoot.querySelector('slot');

    expect(slot).not.toBeNull();
  });

  it('should order the result actions correctly when they are registered in order', async () => {
    const element = createTestComponent();
    await flushPromises();

    const {setOrderFirst, setOrderMiddle, setOrderLast} = functionsMocks;

    const firstResultActionButton = createExampleResultActionButton(element);
    const middleResultActionButton = createExampleResultActionButton(element);
    const lastResultActionButton = createExampleResultActionButton(element);

    registerExampleResultActionButton(firstResultActionButton, setOrderFirst);
    registerExampleResultActionButton(middleResultActionButton, setOrderMiddle);
    registerExampleResultActionButton(lastResultActionButton, setOrderLast);
    triggerSlotChange(element);

    expect(setOrderFirst).toHaveBeenCalledTimes(1);
    expect(setOrderFirst.mock.calls[0][0]).toEqual('first');
    expect(setOrderMiddle).toHaveBeenCalledTimes(1);
    expect(setOrderMiddle.mock.calls[0][0]).toEqual('middle');
    expect(setOrderLast).toHaveBeenCalledTimes(1);
    expect(setOrderLast.mock.calls[0][0]).toEqual('last');
  });

  it('should order the result actions correctly when they are registered in an inverse order', async () => {
    const element = createTestComponent();
    await flushPromises();

    const {setOrderFirst, setOrderMiddle, setOrderLast} = functionsMocks;

    const firstResultActionButton = createExampleResultActionButton(element);
    const middleResultActionButton = createExampleResultActionButton(element);
    const lastResultActionButton = createExampleResultActionButton(element);

    registerExampleResultActionButton(lastResultActionButton, setOrderLast);
    registerExampleResultActionButton(middleResultActionButton, setOrderMiddle);
    registerExampleResultActionButton(firstResultActionButton, setOrderFirst);
    triggerSlotChange(element);

    expect(setOrderFirst).toHaveBeenCalledTimes(1);
    expect(setOrderFirst.mock.calls[0][0]).toEqual('first');
    expect(setOrderMiddle).toHaveBeenCalledTimes(1);
    expect(setOrderMiddle.mock.calls[0][0]).toEqual('middle');
    expect(setOrderLast).toHaveBeenCalledTimes(1);
    expect(setOrderLast.mock.calls[0][0]).toEqual('last');
  });

  it('should set the order correctly when there is only one result action', async () => {
    const element = createTestComponent();
    await flushPromises();

    const {setOrderFirst} = functionsMocks;

    const firstResultActionButton = createExampleResultActionButton(element);

    registerExampleResultActionButton(firstResultActionButton, setOrderFirst);
    triggerSlotChange(element);

    expect(setOrderFirst).toHaveBeenCalledTimes(1);
    expect(setOrderFirst.mock.calls[0][0]).toEqual(null);
  });
});
