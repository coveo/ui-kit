// @ts-ignore
import { createElement } from 'lwc';
import QuanticResultAction from '../quanticResultAction';

let order;

const functionsMocks = {
  listener: jest.fn(() => {}),
};

const exampleLabel = 'example label';
const exampleLabelWhenOn = 'example label on';
const exampleIconName = 'example icon name';
const exampleEventName = 'example_event_name';

const defaultOptions = {
  label: exampleLabel,
  labelWhenOn: exampleLabelWhenOn,
  toggleMode: false,
  selected: false,
  iconName: exampleIconName,
  eventName: exampleEventName,
  loading: false,
};

function createTestComponent(options = defaultOptions) {
  const element = createElement('c-quantic-result-action', {
    is: QuanticResultAction,
  });

  for (const [key, value] of Object.entries(options)) {
    element[`${key}`] = value;
  }

  document.body.appendChild(element);
  return element;
}

// Helper function to wait until the microtask queue is empty.
function flushPromises() {
  // eslint-disable-next-line @lwc/lwc/no-async-operation
  return new Promise((resolve) => setTimeout(resolve, 0));
}

function clickButton(element) {
  const button = element.shadowRoot.querySelector('lightning-button-icon-stateful');
  expect(button).not.toBeNull();
  button.click();
}

function setupClickSimullation(element, eventName, newState) {
  const handler = (event) => {
    const { setLoading, setSelected, state } = event.detail;
    functionsMocks.listener();
    if (newState === 'loading') {
      setLoading(true);
    }
    if (newState === 'selected') {
      setSelected(!state);
    }
    element.removeEventListener(eventName, handler);
  };
  element.addEventListener(eventName, handler);
}

function setupRegisterEventDispatchTest() {
  const handler = (event) => {
    event.detail.applyCssOrderClass(order);
    functionsMocks.listener();
    document.removeEventListener('qunatic__resultactionregister', handler);
  };
  document.addEventListener('qunatic__resultactionregister', handler);
}

function expectLoadingState(element) {
  const resultActionButton = element.shadowRoot.querySelector('lightning-button-icon-stateful');
  const loadingResultActionButton = element.shadowRoot.querySelector('.slds-button_icon');

  expect(resultActionButton).toBeNull();
  expect(loadingResultActionButton).not.toBeNull();
}

function expectSelectedState(element) {
  const resultActionButton = element.shadowRoot.querySelector('lightning-button-icon-stateful');

  expect(resultActionButton).not.toBeNull();
  expect(resultActionButton.selected).toBe(true);
}

describe('c-quantic-result-action', () => {
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

  it('should display the result action button', async () => {
    const element = createTestComponent();
    await flushPromises();

    const resultActionButton = element.shadowRoot.querySelector('lightning-button-icon-stateful');

    expect(resultActionButton).not.toBeNull();
  });

  it('should display the correct tooltip', async () => {
    const element = createTestComponent();
    await flushPromises();

    const tooltip = element.shadowRoot.querySelector('.slds-popover_tooltip');

    expect(tooltip).not.toBeNull();
    expect(tooltip.textContent).toBe(exampleLabel);
  });

  it('should display the correct icon', async () => {
    const element = createTestComponent();
    await flushPromises();

    const resultActionButton = element.shadowRoot.querySelector('lightning-button-icon-stateful');

    expect(resultActionButton).not.toBeNull();
    expect(resultActionButton.iconName).toBe(exampleIconName);
  });

  it('should display the button properly when it is in the first position', async () => {
    order = 'first';
    setupRegisterEventDispatchTest();
    const element = createTestComponent();
    await flushPromises();

    const resultActionButton = element.shadowRoot.querySelector('lightning-button-icon-stateful');

    expect(functionsMocks.listener).toHaveBeenCalledTimes(1);
    expect(resultActionButton.className).toBe('result-action_button result-action_first');
  });

  it('should display the button properly when it is in a middle position', async () => {
    order = 'middle';
    setupRegisterEventDispatchTest();
    const element = createTestComponent();
    await flushPromises();

    const resultActionButton = element.shadowRoot.querySelector('lightning-button-icon-stateful');

    expect(functionsMocks.listener).toHaveBeenCalledTimes(1);
    expect(resultActionButton.className).toBe('result-action_button result-action_middle');
  });

  it('should display the button properly when it is in the last position', async () => {
    order = 'last';
    setupRegisterEventDispatchTest();
    const element = createTestComponent();
    await flushPromises();

    const resultActionButton = element.shadowRoot.querySelector('lightning-button-icon-stateful');

    expect(functionsMocks.listener).toHaveBeenCalledTimes(1);
    expect(resultActionButton.className).toBe('result-action_button result-action_last');
  });

  it('should display the button properly when it is the only result action displayed', async () => {
    order = null;
    setupRegisterEventDispatchTest();
    const element = createTestComponent();
    await flushPromises();

    const resultActionButton = element.shadowRoot.querySelector('lightning-button-icon-stateful');

    expect(functionsMocks.listener).toHaveBeenCalledTimes(1);
    expect(resultActionButton.className).toBe('result-action_button');
  });

  it('should display the result action button in the loading state when the lloading property is set to true', async () => {
    const element = createTestComponent({ ...defaultOptions, loading: true });
    await flushPromises();

    expectLoadingState(element);
  });

  describe('when the selected property is set to true', () => {
    it('should display the result action button in the selected state', async () => {
      const element = createTestComponent({ ...defaultOptions, selected: true });
      await flushPromises();

      expectSelectedState(element);
    });

    it('should display the correct tooltip', async () => {
      const element = createTestComponent({ ...defaultOptions, selected: true });
      await flushPromises();

      const tooltip = element.shadowRoot.querySelector('.slds-popover_tooltip');

      expect(tooltip).not.toBeNull();
      expect(tooltip.textContent).toBe(exampleLabelWhenOn);
    });
  });

  describe('when the result action is clicked', () => {
    it('should dispatch a the correct event and sets the loading state', async () => {
      const element = createTestComponent();
      await flushPromises();

      setupClickSimullation(element, exampleEventName, 'loading');

      clickButton(element);
      await flushPromises();

      expect(functionsMocks.listener).toHaveBeenCalledTimes(1);
      expectLoadingState(element);
    });

    it('should dispatch a the correct event and sets the selected state', async () => {
      const element = createTestComponent();
      await flushPromises();

      setupClickSimullation(element, exampleEventName, 'selected');

      clickButton(element);
      await flushPromises();

      expect(functionsMocks.listener).toHaveBeenCalledTimes(1);
      expectSelectedState(element);
    });
  });
});
