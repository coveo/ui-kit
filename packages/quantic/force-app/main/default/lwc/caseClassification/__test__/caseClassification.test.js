// @ts-nocheck
import { createElement } from 'lwc';
import CaseClassification from 'c/caseClassification';

function createTestComponent(props = {}) {
  const element = createElement('c-case-classification', {
    is: CaseClassification
  });
  document.body.appendChild(element);
  Object.keys(props).forEach((key) => {
    element[key] = props[key];
  });

  return element;
}

// Helper function to wait until the microtask queue is empty.
function allPromisesResolution() {
  // eslint-disable-next-line no-undef
  return new Promise((resolve) => setImmediate(resolve));
}

jest.mock(
  '@salesforce/label/c.cookbook_SubjectInputTitle',
  () => ({ default: 'Write a descriptive title' }),
  {
    virtual: true
  }
);

const mockedOptions = [
  { id: 0, label: 'Heart rate tracking', value: 'Heart rate tracking' },
  { id: 1, label: 'Run tracking', value: 'Run tracking' },
  { id: 2, label: 'Health Metrics', value: 'Health Metrics' }
];

describe('c-case-classification', () => {
  afterEach(() => {
    // The jsdom instance is shared across test cases in a single file so reset the DOM
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it('should display the case classification label', async () => {
    const expectedLabel = 'Expected Label';
    const element = createTestComponent({
      label: expectedLabel
    });

    await allPromisesResolution();
    const labelNode = element.shadowRoot.querySelector(
      '.slds-form-element__label'
    );
    expect(labelNode).toBeDefined();
    expect(labelNode.textContent).toBe(expectedLabel);
  });

  it('should display the localized case classification label', async () => {
    const expectedLabel = 'Which product is related to your problem?';
    const element = createTestComponent();

    await allPromisesResolution();
    const labelNode = element.shadowRoot.querySelector(
      '.slds-form-element__label'
    );
    expect(labelNode).toBeDefined();
    expect(labelNode.textContent).toBe(expectedLabel);
  });

  it('should have the correct value when an option is selected from the lightning combobox', async () => {
    const expectedValue = 'Expected Value';
    const element = createTestComponent({
      numberOfSuggestions: mockedOptions.length - 1,
      options: mockedOptions
    });

    await allPromisesResolution();
    const selectButtonNode = element.shadowRoot.querySelector(
      'lightning-button'
    );

    const clickEvent = new CustomEvent('click');
    await selectButtonNode.dispatchEvent(clickEvent);

    const selectNode = element.shadowRoot.querySelector('lightning-combobox');
    selectNode.value = expectedValue;
    const changeEvent = new CustomEvent('change');
    await selectNode.dispatchEvent(changeEvent);

    expect(element.value).toBe(expectedValue);
  });

  it('should have the correct value when a suggested option is clicked', async () => {
    const element = createTestComponent({
      numberOfSuggestions: mockedOptions.length - 1,
      options: mockedOptions
    });

    await allPromisesResolution();
    const suggestedOptionNode = element.shadowRoot.querySelector(
      '.slds-visual-picker input'
    );
    const suggestedOptionValueNode = element.shadowRoot.querySelector(
      '.slds-visual-picker'
    );

    const changeEvent = new CustomEvent('change');
    await suggestedOptionNode.dispatchEvent(changeEvent);

    expect(element.value).toBe(suggestedOptionValueNode.textContent);
  });

  it('should display the lightning combobox after clicking the select button for other options', async () => {
    const element = createTestComponent({
      numberOfSuggestions: mockedOptions.length - 1,
      options: mockedOptions
    });

    await allPromisesResolution();
    const selectButtonNode = element.shadowRoot.querySelector(
      'lightning-button'
    );

    const clickEvent = new CustomEvent('click');
    await selectButtonNode.dispatchEvent(clickEvent);

    const selectNode = element.shadowRoot.querySelector('lightning-combobox');
    expect(selectNode).not.toBeNull();
  });

  describe('When the number of suggestions is less than the total number of options', () => {
    it('should display the right number of the suggested options and the slect button for other options', async () => {
      const element = createTestComponent({
        numberOfSuggestions: mockedOptions.length - 1,
        options: mockedOptions
      });

      await allPromisesResolution();
      const suggestedOptionsNodes = element.shadowRoot.querySelectorAll(
        '.slds-visual-picker'
      );
      const selectButtonNode = element.shadowRoot.querySelector(
        'lightning-button'
      );
      expect(suggestedOptionsNodes.length).toBe(2);
      expect(selectButtonNode).toBeDefined();
    });

    it('should hide the suggestions after selecting an option in the lightning combobox', async () => {
      const element = createTestComponent({
        numberOfSuggestions: mockedOptions.length - 1,
        options: mockedOptions
      });

      await allPromisesResolution();
      const selectButtonNode = element.shadowRoot.querySelector(
        'lightning-button'
      );

      const clickEvent = new CustomEvent('click');
      await selectButtonNode.dispatchEvent(clickEvent);

      const selectNode = element.shadowRoot.querySelector('lightning-combobox');
      selectNode.value = 'Expected Value';
      const changeEvent = new CustomEvent('change');
      await selectNode.dispatchEvent(changeEvent);

      const suggestedOptionsNodes = element.shadowRoot.querySelectorAll(
        '.slds-visual-picker'
      );

      suggestedOptionsNodes.forEach((suggestion) => {
        expect(suggestion.classList.contains('visual-picker__hidden')).toBe(
          true
        );
      });
    });

    it('should display only the lightning combobox when the number of suggestions is zero', async () => {
      const element = createTestComponent({
        numberOfSuggestions: 0,
        options: mockedOptions
      });

      await allPromisesResolution();
      const suggestedOptionsNodes = element.shadowRoot.querySelector(
        '.slds-visual-picker'
      );
      const selectNode = element.shadowRoot.querySelector('lightning-combobox');
      expect(suggestedOptionsNodes).toBeNull();
      expect(selectNode).toBeDefined();
    });
  });

  describe('When the number of suggestions is equal to the  total number of options', () => {
    it('should display only the suggested options and not the slect button for other options', async () => {
      const element = createTestComponent({
        numberOfSuggestions: mockedOptions.length,
        options: mockedOptions
      });

      await allPromisesResolution();
      const suggestedOptionsNodes = element.shadowRoot.querySelectorAll(
        '.slds-visual-picker'
      );
      const selectButtonNode = element.shadowRoot.querySelector(
        'lightning-button'
      );
      expect(suggestedOptionsNodes.length).toBe(mockedOptions.length);
      expect(selectButtonNode).toBeNull();
    });
  });
});
