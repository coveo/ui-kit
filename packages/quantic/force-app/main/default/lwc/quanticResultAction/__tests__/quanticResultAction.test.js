// @ts-ignore
import {createElement} from 'lwc';
import QuanticResultAction from '../quanticResultAction';

const functionsMocks = {
  listener: jest.fn(() => {}),
};

const exampleLabel = 'example label';
const exampleSelectedLabel = 'example label on';
const exampleIconName = 'example icon name';
const exampleEventName = 'example_event_name';
const exampleSelectedIconName = 'example selected icon name';

const defaultOptions = {
  label: exampleLabel,
  selectedLabel: exampleSelectedLabel,
  selected: false,
  iconName: exampleIconName,
  eventName: exampleEventName,
  loading: false,
  selectedIconName: exampleSelectedIconName,
};

function createTestComponent(options = defaultOptions) {
  const element = createElement('c-quantic-result-action', {
    is: QuanticResultAction,
  });

  for (const [key, value] of Object.entries(options)) {
    element[key] = value;
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
  const button = element.shadowRoot.querySelector(
    'lightning-button-icon-stateful'
  );
  expect(button).not.toBeNull();
  button.click();
}

function setupClickSimulation(element, eventName, newState) {
  const handler = (event) => {
    const {setLoading, setSelected, isSelected} = event.detail;
    functionsMocks.listener();
    if (newState === 'loading') {
      setLoading(true);
    }
    if (newState === 'selected') {
      setSelected(!isSelected);
    }
    element.removeEventListener(eventName, handler);
  };
  element.addEventListener(eventName, handler);
}

function setupRegisterEventDispatchTest(order) {
  const handler = (event) => {
    event.detail.applyCssOrderClass(order);
    functionsMocks.listener();
    document.removeEventListener('quantic__resultactionregister', handler);
  };
  document.addEventListener('quantic__resultactionregister', handler);
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

  it('should display the result action button properly', async () => {
    const element = createTestComponent();
    await flushPromises();

    const resultActionButton = element.shadowRoot.querySelector(
      'lightning-button-icon-stateful'
    );
    const tooltip = element.shadowRoot.querySelector('.slds-popover_tooltip');

    expect(resultActionButton).not.toBeNull();
    expect(tooltip).not.toBeNull();
    expect(tooltip.textContent).toBe(exampleLabel);
    expect(resultActionButton.iconName).toBe(exampleIconName);
  });

  it('should display the button properly when it is in the first position', async () => {
    setupRegisterEventDispatchTest('first');
    const element = createTestComponent();
    await flushPromises();

    const resultActionButton = element.shadowRoot.querySelector(
      'lightning-button-icon-stateful'
    );

    expect(functionsMocks.listener).toHaveBeenCalledTimes(1);
    expect(resultActionButton.className).toBe(
      'result-action_button result-action_first'
    );
  });

  it('should display the button properly when it is in a middle position', async () => {
    setupRegisterEventDispatchTest('middle');
    const element = createTestComponent();
    await flushPromises();

    const resultActionButton = element.shadowRoot.querySelector(
      'lightning-button-icon-stateful'
    );

    expect(functionsMocks.listener).toHaveBeenCalledTimes(1);
    expect(resultActionButton.className).toBe(
      'result-action_button result-action_middle'
    );
  });

  it('should display the button properly when it is in the last position', async () => {
    setupRegisterEventDispatchTest('last');
    const element = createTestComponent();
    await flushPromises();

    const resultActionButton = element.shadowRoot.querySelector(
      'lightning-button-icon-stateful'
    );

    expect(functionsMocks.listener).toHaveBeenCalledTimes(1);
    expect(resultActionButton.className).toBe(
      'result-action_button result-action_last'
    );
  });

  it('should display the button properly when it is the only result action displayed', async () => {
    setupRegisterEventDispatchTest(null);
    const element = createTestComponent();
    await flushPromises();

    const resultActionButton = element.shadowRoot.querySelector(
      'lightning-button-icon-stateful'
    );

    expect(functionsMocks.listener).toHaveBeenCalledTimes(1);
    expect(resultActionButton.className).toBe('result-action_button');
  });

  describe('when the loading property is set to true', () => {
    it('should display the result action button in the loading state', async () => {
      const element = createTestComponent({...defaultOptions, loading: true});
      await flushPromises();

      const resultActionButton = element.shadowRoot.querySelector(
        'lightning-button-icon-stateful'
      );
      const loadingResultActionButton =
        element.shadowRoot.querySelector('.slds-button_icon');

      expect(resultActionButton).toBeNull();
      expect(loadingResultActionButton).not.toBeNull();
    });
  });

  describe('when the selected property is set to true', () => {
    it('should display the result action button in the selected state', async () => {
      const element = createTestComponent({...defaultOptions, selected: true});
      await flushPromises();

      const resultActionButton = element.shadowRoot.querySelector(
        'lightning-button-icon-stateful'
      );

      expect(resultActionButton).not.toBeNull();
      expect(resultActionButton.selected).toBe(true);
    });

    it('should display the correct tooltip', async () => {
      const element = createTestComponent({...defaultOptions, selected: true});
      await flushPromises();

      const tooltip = element.shadowRoot.querySelector('.slds-popover_tooltip');

      expect(tooltip).not.toBeNull();
      expect(tooltip.textContent).toBe(exampleSelectedLabel);
    });

    it('should display the correct icon', async () => {
      const element = createTestComponent({...defaultOptions, selected: true});
      await flushPromises();

      const resultActionButton = element.shadowRoot.querySelector(
        'lightning-button-icon-stateful'
      );

      expect(resultActionButton).not.toBeNull();
      expect(resultActionButton.iconName).toBe(exampleSelectedIconName);
    });
  });

  describe('when the result action is clicked', () => {
    it('should dispatch the correct event and set the loading state', async () => {
      const element = createTestComponent();
      await flushPromises();

      setupClickSimulation(element, exampleEventName, 'loading');

      clickButton(element);
      await flushPromises();
      const resultActionButton = element.shadowRoot.querySelector(
        'lightning-button-icon-stateful'
      );
      const loadingResultActionButton =
        element.shadowRoot.querySelector('.slds-button_icon');

      expect(functionsMocks.listener).toHaveBeenCalledTimes(1);
      expect(resultActionButton).toBeNull();
      expect(loadingResultActionButton).not.toBeNull();
    });

    it('should dispatch the correct event and set the selected state', async () => {
      const element = createTestComponent();
      await flushPromises();

      setupClickSimulation(element, exampleEventName, 'selected');
      const resultActionButton = element.shadowRoot.querySelector(
        'lightning-button-icon-stateful'
      );

      clickButton(element);
      await flushPromises();

      expect(functionsMocks.listener).toHaveBeenCalledTimes(1);
      expect(resultActionButton).not.toBeNull();
      expect(resultActionButton.selected).toBe(true);
    });
  });
});
