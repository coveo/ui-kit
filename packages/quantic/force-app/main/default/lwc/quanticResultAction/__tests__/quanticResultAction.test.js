import { createElement } from 'lwc';
import QuanticResultAction from '../quanticResultAction';

let order;

const functionsMocks = {
  listener: jest.fn(() => {}),
};

const exampleLabelWhenHover = 'example label';
const exampleLabelWhenOn = 'example label on';
const exampleLabelWhenOff = 'example label off';
const exampleIconName = 'example icon name';

const defaultOptions = {
  labelWhenHover: exampleLabelWhenHover,
  labelWhenOn: exampleLabelWhenOn,
  labelWhenOff: exampleLabelWhenOff,
  toggleMode: false,
  selected: false,
  iconName: exampleIconName,
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
  // eslint-disable-next-line no-undef
  return new Promise((resolve) => setImmediate(resolve));
}

function clickButton(element, buttonSelector) {
  const button = element.shadowRoot.querySelector(buttonSelector);
  expect(button).not.toBeNull();
  button.click();
}

function setupClickEventDispatchTest() {
  const handler = () => {
    functionsMocks.listener();
    document.removeEventListener('click', handler);
  };
  document.addEventListener('click', handler);
}

function setupRegisterEventDispatchTest() {
  const handler = (event) => {
    event.detail.setOrder(order);
    functionsMocks.listener();
    document.removeEventListener('resultactionregister', handler);
  };
  document.addEventListener('resultactionregister', handler);
}

describe('c-quantic-search-box', () => {
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

  describe('when the toggle mode is disabled', () => {
    it('should display the lightning icon button', async () => {
      const element = createTestComponent();
      await flushPromises();

      const iconButton = element.shadowRoot.querySelector('lightning-button-icon');
      const statefulIconButton = element.shadowRoot.querySelector('lightning-button-icon-stateful');

      expect(iconButton).not.toBeNull();
      expect(statefulIconButton).toBeNull();
    });

    it('should display the correct tooltip', async () => {
      const element = createTestComponent();
      await flushPromises();

      const tooltip = element.shadowRoot.querySelector('.slds-popover_tooltip');

      expect(tooltip).not.toBeNull();
      expect(tooltip.textContent).toBe(exampleLabelWhenHover);
    });

    it('should display the correct icon', async () => {
      const element = createTestComponent();
      await flushPromises();

      const iconButton = element.shadowRoot.querySelector('lightning-button-icon');

      expect(iconButton).not.toBeNull();
      expect(iconButton.iconName).toBe(exampleIconName);
    });

    it('should dispatch a click event when the lightning button is clicked', async () => {
      const element = createTestComponent();
      await flushPromises();

      setupClickEventDispatchTest();

      clickButton(element, 'lightning-button-icon');
      expect(functionsMocks.listener).toHaveBeenCalledTimes(1);
    });

    it('should display the button properely when its in the first position', async () => {
      order = 'first';
      setupRegisterEventDispatchTest();
      const element = createTestComponent();
      await flushPromises();

      const iconButton = element.shadowRoot.querySelector('lightning-button-icon');

      clickButton(element, 'lightning-button-icon');
      expect(functionsMocks.listener).toHaveBeenCalledTimes(1);
      expect(iconButton.className).toBe('result-action_button result-action_first');
    });

    it('should display the button properely when its in a middle position', async () => {
      order = 'middle';
      setupRegisterEventDispatchTest();
      const element = createTestComponent();
      await flushPromises();

      const iconButton = element.shadowRoot.querySelector('lightning-button-icon');

      clickButton(element, 'lightning-button-icon');
      expect(functionsMocks.listener).toHaveBeenCalledTimes(1);
      expect(iconButton.className).toBe('result-action_button result-action_middle');
    });

    it('should display the button properely when its in the last position', async () => {
      order = 'last';
      setupRegisterEventDispatchTest();
      const element = createTestComponent();
      await flushPromises();

      const iconButton = element.shadowRoot.querySelector('lightning-button-icon');

      clickButton(element, 'lightning-button-icon');
      expect(functionsMocks.listener).toHaveBeenCalledTimes(1);
      expect(iconButton.className).toBe('result-action_button result-action_last');
    });

    it('should display the button properely when its the only result action displayed', async () => {
      order = null;
      setupRegisterEventDispatchTest();
      const element = createTestComponent();
      await flushPromises();

      const iconButton = element.shadowRoot.querySelector('lightning-button-icon');

      clickButton(element, 'lightning-button-icon');
      expect(functionsMocks.listener).toHaveBeenCalledTimes(1);
      expect(iconButton.className).toBe('result-action_button');
    });
  });

  describe('when the toggle mode is enabled', () => {
    it('should display the lightning stateful icon button', async () => {
      const element = createTestComponent({ ...defaultOptions, toggleMode: true });
      await flushPromises();

      const iconButton = element.shadowRoot.querySelector('lightning-button-icon');
      const statefulIconButton = element.shadowRoot.querySelector('lightning-button-icon-stateful');

      expect(iconButton).toBeNull();
      expect(statefulIconButton).not.toBeNull();
    });

    it('should display the correct tooltip when the button is off', async () => {
      const element = createTestComponent({ ...defaultOptions, toggleMode: true });
      await flushPromises();

      const tooltip = element.shadowRoot.querySelector('.slds-popover_tooltip');

      expect(tooltip).not.toBeNull();
      expect(tooltip.textContent).toBe(exampleLabelWhenOff);
    });

    it('should display the correct tooltip when the button is on', async () => {
      const element = createTestComponent({ ...defaultOptions, toggleMode: true, selected: true });
      await flushPromises();

      const tooltip = element.shadowRoot.querySelector('.slds-popover_tooltip');

      expect(tooltip).not.toBeNull();
      expect(tooltip.textContent).toBe(exampleLabelWhenOn);
    });

    it('should display the correct icon', async () => {
      const element = createTestComponent({ ...defaultOptions, toggleMode: true });
      await flushPromises();

      const statefulIconButton = element.shadowRoot.querySelector('lightning-button-icon-stateful');

      expect(statefulIconButton).not.toBeNull();
      expect(statefulIconButton.iconName).toBe(exampleIconName);
    });

    it('should dispatch a click event when the lightning button is clicked', async () => {
      const element = createTestComponent({ ...defaultOptions, toggleMode: true });
      await flushPromises();

      setupClickEventDispatchTest();

      clickButton(element, 'lightning-button-icon-stateful');
      expect(functionsMocks.listener).toHaveBeenCalledTimes(1);
    });

    it('should display the button properely when its in the first position', async () => {
      order = 'first';
      setupRegisterEventDispatchTest();
      const element = createTestComponent({ ...defaultOptions, toggleMode: true });
      await flushPromises();

      const statefulIconButton = element.shadowRoot.querySelector('lightning-button-icon-stateful');

      clickButton(element, 'lightning-button-icon-stateful');
      expect(functionsMocks.listener).toHaveBeenCalledTimes(1);
      expect(statefulIconButton.className).toBe('result-action_button result-action_first');
    });

    it('should display the button properely when its in a middle position', async () => {
      order = 'middle';
      setupRegisterEventDispatchTest();
      const element = createTestComponent({ ...defaultOptions, toggleMode: true });
      await flushPromises();

      const statefulIconButton = element.shadowRoot.querySelector('lightning-button-icon-stateful');

      clickButton(element, 'lightning-button-icon-stateful');
      expect(functionsMocks.listener).toHaveBeenCalledTimes(1);
      expect(statefulIconButton.className).toBe('result-action_button result-action_middle');
    });

    it('should display the button properely when its in the last position', async () => {
      order = 'last';
      setupRegisterEventDispatchTest();
      const element = createTestComponent({ ...defaultOptions, toggleMode: true });
      await flushPromises();

      const statefulIconButton = element.shadowRoot.querySelector('lightning-button-icon-stateful');

      clickButton(element, 'lightning-button-icon-stateful');
      expect(functionsMocks.listener).toHaveBeenCalledTimes(1);
      expect(statefulIconButton.className).toBe('result-action_button result-action_last');
    });

    it('should display the button properely when its the only result action displayed', async () => {
      order = null;
      setupRegisterEventDispatchTest();
      const element = createTestComponent({ ...defaultOptions, toggleMode: true });
      await flushPromises();

      const statefulIconButton = element.shadowRoot.querySelector('lightning-button-icon-stateful');

      clickButton(element, 'lightning-button-icon-stateful');
      expect(functionsMocks.listener).toHaveBeenCalledTimes(1);
      expect(statefulIconButton.className).toBe('result-action_button');
    });
  });
});
