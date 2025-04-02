import QuanticRadioButtonsGroup from 'c/quanticRadioButtonsGroup';
// @ts-ignore
import {createElement} from 'lwc';

const selectors = {
  legend: 'legend.radio-buttons-group__legend',
  radioInputs: 'input[type="radio"]',
  radioLabels: 'label.radio-buttons-group__label',
  radioIcons: 'lightning-icon',
  radioContainers: '.slds-button.slds-radio_button.radio-button',
  radioTooltips: 'c-quantic-tooltip',
};

/**
 * @type {import('c/quanticRadioButtonsGroup').QuanticRadioButtonsGroupOption[]}
 */
const defaultOptionsList = [
  {
    value: 'value_option1',
    tooltip: 'tooltip_option1',
    label: 'label_option1',
  },
  {
    value: 'value_option2',
    tooltip: 'tooltip_option2',
    label: 'label_option2',
  },
  {
    value: 'value_option3',
    tooltip: 'tooltip_option3',
    label: 'label_option3',
  },
];

const exampleOptions = {
  legend: 'example-legend',
  options: defaultOptionsList,
};

function createTestComponent(options = exampleOptions) {
  const element = createElement('c-quantic-radio-buttons-group', {
    is: QuanticRadioButtonsGroup,
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

describe('c-quantic-radio-buttons-group', () => {
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

  describe('default rendering options', () => {
    it('should render correctly with default options, without labels, without icons, without tooltips', async () => {
      const minimalOptions = [
        {value: 'value_option1'},
        {value: 'value_option2'},
        {value: 'value_option3'},
      ];
      const element = createTestComponent({
        ...exampleOptions,
        options: minimalOptions,
      });
      await flushPromises();

      const legendElement = element.shadowRoot.querySelector(selectors.legend);
      const radioInputs = element.shadowRoot.querySelectorAll(
        selectors.radioInputs
      );
      const radioLabels = element.shadowRoot.querySelectorAll(
        selectors.radioLabels
      );
      const icons = element.shadowRoot.querySelectorAll(selectors.radioIcons);

      expect(legendElement).not.toBeNull();
      expect(legendElement.textContent).toBe(exampleOptions.legend);
      expect(radioInputs).toHaveLength(minimalOptions.length);
      expect(radioLabels).toHaveLength(0);
      expect(icons).toHaveLength(0);
      minimalOptions.forEach((option, index) => {
        expect(radioInputs[index].value).toBe(option.value);
      });
    });

    it('should render correctly with default options, without icons', async () => {
      const element = createTestComponent();
      await flushPromises();

      const legendElement = element.shadowRoot.querySelector(selectors.legend);
      const radioInputs = element.shadowRoot.querySelectorAll(
        selectors.radioInputs
      );
      const radioLabels = element.shadowRoot.querySelectorAll(
        selectors.radioLabels
      );
      const icons = element.shadowRoot.querySelectorAll(selectors.radioIcons);
      const tooltips = element.shadowRoot.querySelectorAll(
        selectors.radioTooltips
      );

      expect(legendElement).not.toBeNull();
      expect(legendElement.textContent).toBe(exampleOptions.legend);
      expect(radioInputs).toHaveLength(defaultOptionsList.length);
      expect(radioLabels).toHaveLength(defaultOptionsList.length);
      expect(tooltips).toHaveLength(defaultOptionsList.length);
      expect(icons).toHaveLength(0);
      defaultOptionsList.forEach((option, index) => {
        expect(radioInputs[index].value).toBe(option.value);
        expect(radioLabels[index].textContent).toBe(option.label);
        expect(tooltips[index].textContent).toBe(option.tooltip);
      });
    });

    it('should render correctly with default options', async () => {
      const optionsWithIcons = defaultOptionsList.map((option) => ({
        ...option,
        iconName: `utility:rows`,
      }));
      const element = createTestComponent({
        ...exampleOptions,
        options: optionsWithIcons,
      });
      await flushPromises();

      const legendElement = element.shadowRoot.querySelector(selectors.legend);
      const radioInputs = element.shadowRoot.querySelectorAll(
        selectors.radioInputs
      );
      const radioLabels = element.shadowRoot.querySelectorAll(
        selectors.radioLabels
      );
      const icons = element.shadowRoot.querySelectorAll(selectors.radioIcons);

      expect(legendElement).not.toBeNull();
      expect(legendElement.textContent).toBe(exampleOptions.legend);
      expect(radioInputs).toHaveLength(defaultOptionsList.length);
      expect(radioLabels).toHaveLength(defaultOptionsList.length);
      expect(icons).toHaveLength(defaultOptionsList.length);
      defaultOptionsList.forEach((_, index) => {
        expect(icons[index].iconName).toBe('utility:rows');
      });
    });
  });

  describe('hideLabels property', () => {
    const labelHiddenClass = 'slds-assistive-text';
    it('should render correctly with hideLabels set to true', async () => {
      const element = createTestComponent({
        ...exampleOptions,
        hideLabels: true,
      });
      await flushPromises();

      const radioLabels = element.shadowRoot.querySelectorAll(
        selectors.radioLabels
      );

      expect(radioLabels).toHaveLength(defaultOptionsList.length);
      for (const radioLabel of radioLabels) {
        expect(radioLabel.classList.contains(labelHiddenClass)).toBeTruthy();
      }
    });

    it('should render correctly with hideLabels set to false', async () => {
      const element = createTestComponent({
        ...exampleOptions,
        hideLabels: false,
      });
      await flushPromises();

      const radioLabels = element.shadowRoot.querySelectorAll(
        selectors.radioLabels
      );

      expect(radioLabels).toHaveLength(defaultOptionsList.length);
      for (const radioLabel of radioLabels) {
        expect(radioLabel.classList.contains(labelHiddenClass)).toBeFalsy();
      }
    });
  });

  describe('User interaction', () => {
    it('should dispatch the "quantic__change" event when a radio button is clicked', async () => {
      const element = createTestComponent();
      await flushPromises();

      const radioInputs = element.shadowRoot.querySelectorAll(
        selectors.radioInputs
      );
      const radioInput = radioInputs[0];
      const changeHandler = jest.fn();
      element.addEventListener('quantic__change', changeHandler);

      radioInput.click();

      expect(changeHandler).toHaveBeenCalledTimes(1);
      expect(changeHandler.mock.calls[0][0].detail).toEqual({
        value: radioInput.value,
      });
    });

    it('should update the selected radio button when a radio button is clicked', async () => {
      const element = createTestComponent();
      await flushPromises();

      const radioInputs = element.shadowRoot.querySelectorAll(
        selectors.radioInputs
      );
      const radioButtonContainers = element.shadowRoot.querySelectorAll(
        selectors.radioContainers
      );
      const radioInput = radioInputs[0];
      const radioContainer = radioButtonContainers[0];

      radioInput.click();
      await flushPromises();

      expect(radioInput.checked).toBeTruthy();
      expect(
        radioContainer.classList.contains('radio-button--selected')
      ).toBeTruthy();
    });

    it("shouldn't be possible to select multiple radio buttons", async () => {
      const element = createTestComponent();
      await flushPromises();

      const radioInputs = element.shadowRoot.querySelectorAll(
        selectors.radioInputs
      );
      const radioButtonContainers = element.shadowRoot.querySelectorAll(
        selectors.radioContainers
      );

      radioInputs[0].click();
      radioInputs[1].click();
      await flushPromises();

      const selectedRadioInputs = element.shadowRoot.querySelectorAll(
        `.radio-button--selected`
      );

      expect(radioInputs[0].checked).toBeFalsy();
      expect(radioInputs[1].checked).toBeTruthy();
      expect(
        radioButtonContainers[0].classList.contains('radio-button--selected')
      ).toBeFalsy();
      expect(
        radioButtonContainers[1].classList.contains('radio-button--selected')
      ).toBeTruthy();
      expect(selectedRadioInputs).toHaveLength(1);
    });
  });
});
