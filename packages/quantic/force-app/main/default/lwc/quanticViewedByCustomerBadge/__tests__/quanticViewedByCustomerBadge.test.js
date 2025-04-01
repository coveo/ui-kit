// @ts-ignore
import {createElement} from 'lwc';
import QuanticViewedByCustomerBadge from '../quanticViewedByCustomerBadge';

const viewedByCustomerLabel = 'Viewed by customer';
const viewedByCustomerIconName = 'utility:profile_alt';
const errorMessage =
  'The c-quantic-viewed-by-customer-badge requires the result attribute to be set.';

jest.mock(
  '@salesforce/label/c.quantic_ViewedByCustomer',
  () => ({default: viewedByCustomerLabel}),
  {
    virtual: true,
  }
);

const selectors = {
  errorComponent: 'c-quantic-component-error',
  label: '.viewed-by-customer__label',
  icon: 'lightning-icon',
};

function createTestComponent(options) {
  const element = createElement('c-quantic-viewed-by-customer-badge', {
    is: QuanticViewedByCustomerBadge,
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

describe('c-quantic-viewed-by-customer-badge', () => {
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

  describe('when no result is given', () => {
    let consoleError;

    beforeAll(() => {
      consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterAll(() => {
      consoleError.mockReset();
    });

    it('should show the component error and log an error message', async () => {
      const element = createTestComponent({});
      await flushPromises();

      const errorComponent = element.shadowRoot.querySelector(
        selectors.errorComponent
      );

      expect(errorComponent).not.toBeNull();
      expect(consoleError).toHaveBeenCalledWith(errorMessage);
    });
  });

  describe('when isUserActionView has the value true in the result', () => {
    it('should render the viewed by customer badge', async () => {
      const element = createTestComponent({result: {isUserActionView: true}});
      await flushPromises();

      const errorComponent = element.shadowRoot.querySelector(
        selectors.errorComponent
      );
      const label = element.shadowRoot.querySelector(selectors.label);
      const icon = element.shadowRoot.querySelector(selectors.icon);

      expect(errorComponent).toBeNull();
      expect(label).not.toBeNull();
      expect(label.textContent).toBe(viewedByCustomerLabel);
      expect(icon).not.toBeNull();
      expect(icon.iconName).toBe(viewedByCustomerIconName);
    });
  });

  describe('when isUserActionView has the value false in the result', () => {
    it('should not render the viewed by customer badge', async () => {
      const element = createTestComponent({result: {isUserActionView: false}});
      await flushPromises();

      const errorComponent = element.shadowRoot.querySelector(
        selectors.errorComponent
      );
      const label = element.shadowRoot.querySelector(selectors.label);
      const icon = element.shadowRoot.querySelector(selectors.icon);

      expect(errorComponent).toBeNull();
      expect(label).toBeNull();
      expect(icon).toBeNull();
    });
  });

  describe('when isUserActionView is undefined in the result', () => {
    it('should not render the viewed by customer badge', async () => {
      const element = createTestComponent({result: {}});
      await flushPromises();

      const errorComponent = element.shadowRoot.querySelector(
        selectors.errorComponent
      );
      const label = element.shadowRoot.querySelector(selectors.label);
      const icon = element.shadowRoot.querySelector(selectors.icon);

      expect(errorComponent).toBeNull();
      expect(label).toBeNull();
      expect(icon).toBeNull();
    });
  });
});
