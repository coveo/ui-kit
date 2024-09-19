// @ts-ignore
import {createElement} from 'lwc';
import QuanticStatefulButton from '../quanticStatefulButton';

const functionsMocks = {
  exampleHandleSelect: jest.fn(),
  exampleHandleDeselect: jest.fn(),
};

const exampleLabel = 'Example label';
const exampleIcon = 'utility:clear';
const exampleTooltip = 'Example tooltip';

const selectors = {
  statefulButton: '.stateful-button',
  icon: '.stateful-button__container lightning-icon',
  tooltip: '.stateful-button__container > c-quantic-tooltip',
  tooltipContent:
    '.stateful-button__container > c-quantic-tooltip > div[slot="content"]',
};

function setupEventListeners(element) {
  element.addEventListener(
    'quantic__select',
    functionsMocks.exampleHandleSelect
  );
  element.addEventListener(
    'quantic__deselect',
    functionsMocks.exampleHandleDeselect
  );
}

const exampleOptions = {
  label: exampleLabel,
  iconName: exampleIcon,
  tooltip: exampleTooltip,
  selected: false,
};

function createTestComponent(options = exampleOptions) {
  const element = createElement('c-quantic-stateful-button', {
    is: QuanticStatefulButton,
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

describe('c-quantic-stateful-button', () => {
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

  describe('when the stateful button is in the selected state', () => {
    it('should properly display the selected stateful button', async () => {
      const element = createTestComponent({...exampleOptions, selected: true});
      await flushPromises();

      const button = element.shadowRoot.querySelector(selectors.statefulButton);
      const icon = element.shadowRoot.querySelector(selectors.icon);
      const tooltip = element.shadowRoot.querySelector(selectors.tooltip);
      const tooltipContent = element.shadowRoot.querySelector(
        selectors.tooltipContent
      );

      expect(button).not.toBeNull();
      expect(icon).not.toBeNull();
      expect(tooltip).not.toBeNull();
      expect(tooltipContent).not.toBeNull();
      expect(button.ariaLabel).toBe(exampleTooltip);
      expect(button.textContent).toBe(exampleLabel);
      expect(icon.iconName).toBe(exampleIcon);
      expect(button.classList.contains('stateful-button--selected')).toBe(true);
      expect(button.classList.contains('stateful-button--unselected')).toBe(
        false
      );
      expect(
        button.classList.contains('stateful-button--without-borders')
      ).toBe(false);
      expect(tooltipContent.textContent).toBe(exampleTooltip);
    });

    describe('when the selected stateful button is clicked', () => {
      it('should dispatch the "unselect" event', async () => {
        const element = createTestComponent({
          ...exampleOptions,
          selected: true,
        });
        setupEventListeners(element);
        await flushPromises();

        const button = element.shadowRoot.querySelector(
          selectors.statefulButton
        );
        await button.click();

        expect(functionsMocks.exampleHandleDeselect).toHaveBeenCalledTimes(1);
      });
    });

    describe('when the withoutBorders property is set to true', () => {
      it('should display the button without border', async () => {
        const element = createTestComponent({
          ...exampleOptions,
          selected: true,
          withoutBorders: true,
        });
        setupEventListeners(element);
        await flushPromises();

        const button = element.shadowRoot.querySelector(
          selectors.statefulButton
        );

        expect(
          button.classList.contains('stateful-button--without-borders')
        ).toBe(true);
      });
    });

    describe('when a vlue of the selectedStateColor property is provided', () => {
      it('should display the button with the correct colors', async () => {
        const exampleColor = '#FFF';
        const element = createTestComponent({
          ...exampleOptions,
          selectedStateColor: exampleColor,
        });
        setupEventListeners(element);
        await flushPromises();

        expect(element.shadowRoot.host?.style?._values).toEqual({
          '--selected-state-color': exampleColor,
        });
      });
    });
  });

  describe('when the stateful button is in the unselected state', () => {
    it('should properly display the unselected stateful button', async () => {
      const element = createTestComponent();
      await flushPromises();

      const button = element.shadowRoot.querySelector(selectors.statefulButton);
      const icon = element.shadowRoot.querySelector(selectors.icon);
      const tooltip = element.shadowRoot.querySelector(selectors.tooltip);
      const tooltipContent = element.shadowRoot.querySelector(
        selectors.tooltipContent
      );

      expect(button).not.toBeNull();
      expect(icon).not.toBeNull();
      expect(tooltip).not.toBeNull();
      expect(tooltipContent).not.toBeNull();
      expect(button.ariaLabel).toBe(exampleTooltip);
      expect(button.textContent).toBe(exampleLabel);
      expect(icon.iconName).toBe(exampleIcon);
      expect(button.classList.contains('stateful-button--selected')).toBe(
        false
      );
      expect(button.classList.contains('stateful-button--unselected')).toBe(
        true
      );
      expect(
        button.classList.contains('stateful-button--without-borders')
      ).toBe(false);
      expect(tooltipContent.textContent).toBe(exampleTooltip);
    });

    describe('when the unselected stateful button is clicked', () => {
      it('should dispatch the "select" event', async () => {
        const element = createTestComponent();
        setupEventListeners(element);
        await flushPromises();

        const button = element.shadowRoot.querySelector(
          selectors.statefulButton
        );
        await button.click();

        expect(functionsMocks.exampleHandleSelect).toHaveBeenCalledTimes(1);
      });
    });

    describe('when the withoutBorders property is set to true', () => {
      it('should display the button without border', async () => {
        const element = createTestComponent({
          ...exampleOptions,
          selected: true,
          withoutBorders: true,
        });
        setupEventListeners(element);
        await flushPromises();

        const button = element.shadowRoot.querySelector(
          selectors.statefulButton
        );

        expect(
          button.classList.contains('stateful-button--without-borders')
        ).toBe(true);
      });
    });
  });
});
