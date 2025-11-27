import type {i18n} from 'i18next';
import {html} from 'lit';
import {beforeAll, describe, expect, it, vi} from 'vitest';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {POPOVER_ID, renderTabPopover} from './tab-popover';

describe('#renderTabPopover', () => {
  let i18n: i18n;

  beforeAll(async () => {
    i18n = await createTestI18n();
  });

  const renderComponent = async (overrides = {}) => {
    const defaultProps = {
      i18n,
      isOpen: false,
      show: true,
      onToggle: () => {},
      ...overrides,
    };

    const element = await renderFunctionFixture(
      html`${renderTabPopover({props: defaultProps})(html`
        <li><button>Tab 1</button></li>
        <li><button>Tab 2</button></li>
      `)}`
    );

    return {
      element,
      container: element.querySelector('div'),
      button: element.querySelector('button[part="popover-button"]'),
      popoverList: element.querySelector(`#${POPOVER_ID}`),
      backdrop: element.querySelector('[part="backdrop"]'),
    };
  };

  describe('when show is true', () => {
    it('should render the container without visibility-hidden class', async () => {
      const {container} = await renderComponent({show: true});

      expect(container?.classList.contains('visibility-hidden')).toBe(false);
    });

    it('should set aria-hidden to false', async () => {
      const {container} = await renderComponent({show: true});

      expect(container).toHaveAttribute('aria-hidden', 'false');
    });
  });

  describe('when show is false', () => {
    it('should render the container with visibility-hidden class', async () => {
      const {container} = await renderComponent({show: false});

      expect(container?.classList.contains('visibility-hidden')).toBe(true);
    });

    it('should set aria-hidden to true', async () => {
      const {container} = await renderComponent({show: false});

      expect(container).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('when popover is closed', () => {
    it('should render the popover list with hidden class', async () => {
      const {popoverList} = await renderComponent({isOpen: false});

      expect(popoverList?.classList.contains('hidden')).toBe(true);
      expect(popoverList?.classList.contains('flex')).toBe(false);
    });

    it('should set aria-expanded to false on button', async () => {
      const {button} = await renderComponent({isOpen: false});

      expect(button).toHaveAttribute('aria-expanded', 'false');
    });

    it('should not render the backdrop', async () => {
      const {backdrop} = await renderComponent({isOpen: false});

      expect(backdrop).toBeNull();
    });

    it('should not rotate the arrow icon', async () => {
      const {element} = await renderComponent({isOpen: false});
      const icon = element.querySelector('[part="arrow-icon"]');

      expect(icon?.classList.contains('rotate-180')).toBe(false);
    });
  });

  describe('when popover is open', () => {
    it('should render the popover list with flex class', async () => {
      const {popoverList} = await renderComponent({isOpen: true});

      expect(popoverList?.classList.contains('flex')).toBe(true);
      expect(popoverList?.classList.contains('hidden')).toBe(false);
    });

    it('should set aria-expanded to true on button', async () => {
      const {button} = await renderComponent({isOpen: true});

      expect(button).toHaveAttribute('aria-expanded', 'true');
    });

    it('should render the backdrop', async () => {
      const {backdrop} = await renderComponent({isOpen: true});

      expect(backdrop).not.toBeNull();
    });

    it('should rotate the arrow icon', async () => {
      const {element} = await renderComponent({isOpen: true});
      const icon = element.querySelector('[part="arrow-icon"]');

      expect(icon?.classList.contains('rotate-180')).toBe(true);
    });

    it('should add z-9999 class to relative container', async () => {
      const {element} = await renderComponent({isOpen: true});
      const relativeContainer = element.querySelector('.relative');

      expect(relativeContainer?.classList.contains('z-9999')).toBe(true);
    });
  });

  describe('button', () => {
    it('should render with correct aria-controls', async () => {
      const {button} = await renderComponent();

      expect(button).toHaveAttribute('aria-controls', POPOVER_ID);
    });

    it('should render with correct part', async () => {
      const {button} = await renderComponent();

      expect(button).toHaveAttribute('part', 'popover-button');
    });

    it('should render the "more" label text', async () => {
      const {element} = await renderComponent();
      const valueLabel = element.querySelector('[part="value-label"]');

      expect(valueLabel).toHaveTextContent('More');
    });

    it('should call onToggle when clicked', async () => {
      const onToggle = vi.fn();
      const {button} = await renderComponent({onToggle});

      button?.click();

      expect(onToggle).toHaveBeenCalled();
    });

    it('should call buttonRef with the button element', async () => {
      const buttonRef = vi.fn();
      await renderComponent({buttonRef});

      expect(buttonRef).toHaveBeenCalledWith(expect.any(HTMLButtonElement));
    });
  });

  describe('popover list', () => {
    it('should have the correct id', async () => {
      const {popoverList} = await renderComponent();

      expect(popoverList).toHaveAttribute('id', POPOVER_ID);
    });

    it('should have the overflow-tabs part', async () => {
      const {popoverList} = await renderComponent();

      expect(popoverList).toHaveAttribute('part', 'overflow-tabs');
    });

    it('should call popupRef with the list element', async () => {
      const popupRef = vi.fn();
      await renderComponent({popupRef});

      expect(popupRef).toHaveBeenCalledWith(expect.any(HTMLUListElement));
    });
  });

  describe('backdrop', () => {
    it('should call onToggle when clicked', async () => {
      const onToggle = vi.fn();
      const {backdrop} = await renderComponent({isOpen: true, onToggle});

      backdrop?.dispatchEvent(new MouseEvent('click', {bubbles: true}));

      expect(onToggle).toHaveBeenCalled();
    });
  });
});
