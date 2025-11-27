import {html} from 'lit';
import {describe, expect, it} from 'vitest';
import {renderInAtomicSearchInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/search/atomic-search-interface-fixture';
import {buildFakeSearchEngine} from '@/vitest-utils/testing-helpers/fixtures/headless/search/engine';
import type {AtomicTabPopover} from './atomic-tab-popover';
import './atomic-tab-popover';

describe('atomic-tab-popover', () => {
  const mockedEngine = buildFakeSearchEngine();

  const renderTabPopover = async (options: {show?: boolean} = {}) => {
    const {show = true} = options;

    const {element} = await renderInAtomicSearchInterface<AtomicTabPopover>({
      template: html`<atomic-tab-popover></atomic-tab-popover>`,
      selector: 'atomic-tab-popover',
      bindings: (bindings) => {
        bindings.engine = mockedEngine;
        return bindings;
      },
    });

    element.setButtonVisibility(show);
    await element.updateComplete;

    return {
      element,
      getButton: () =>
        element.shadowRoot?.querySelector<HTMLButtonElement>(
          'button[part="popover-button"]'
        ),
      getPopoverList: () =>
        element.shadowRoot?.querySelector<HTMLUListElement>(
          '#atomic-tab-popover'
        ),
      getBackdrop: () =>
        element.shadowRoot?.querySelector<HTMLDivElement>('[part="backdrop"]'),
      getArrowIcon: () =>
        element.shadowRoot?.querySelector<HTMLElement>('[part="arrow-icon"]'),
      getValueLabel: () =>
        element.shadowRoot?.querySelector<HTMLSpanElement>(
          '[part="value-label"]'
        ),
    };
  };

  describe('when visible (show=true)', () => {
    it('should not have visibility-hidden class on host', async () => {
      const {element} = await renderTabPopover({show: true});

      expect(element.classList.contains('visibility-hidden')).toBe(false);
    });

    it('should set aria-hidden to false', async () => {
      const {element} = await renderTabPopover({show: true});

      expect(element).toHaveAttribute('aria-hidden', 'false');
    });
  });

  describe('when hidden (show=false)', () => {
    it('should have visibility-hidden class on host', async () => {
      const {element} = await renderTabPopover({show: false});

      expect(element.classList.contains('visibility-hidden')).toBe(true);
    });

    it('should set aria-hidden to true', async () => {
      const {element} = await renderTabPopover({show: false});

      expect(element).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('when popover is closed', () => {
    it('should render the popover list with hidden class', async () => {
      const {getPopoverList} = await renderTabPopover();
      const popoverList = getPopoverList();

      expect(popoverList?.classList.contains('hidden')).toBe(true);
      expect(popoverList?.classList.contains('flex')).toBe(false);
    });

    it('should set aria-expanded to false on button', async () => {
      const {getButton} = await renderTabPopover();
      const button = getButton();

      expect(button).toHaveAttribute('aria-expanded', 'false');
    });

    it('should not render the backdrop', async () => {
      const {getBackdrop} = await renderTabPopover();
      const backdrop = getBackdrop();

      expect(backdrop).toBeNull();
    });

    it('should not rotate the arrow icon', async () => {
      const {getArrowIcon} = await renderTabPopover();
      const icon = getArrowIcon();

      expect(icon?.classList.contains('rotate-180')).toBe(false);
    });
  });

  describe('when popover is open', () => {
    it('should render the popover list with flex class', async () => {
      const {element, getPopoverList} = await renderTabPopover();

      element.toggle();
      await element.updateComplete;

      const popoverList = getPopoverList();

      expect(popoverList?.classList.contains('flex')).toBe(true);
      expect(popoverList?.classList.contains('hidden')).toBe(false);
    });

    it('should set aria-expanded to true on button', async () => {
      const {element, getButton} = await renderTabPopover();

      element.toggle();
      await element.updateComplete;

      const button = getButton();

      expect(button).toHaveAttribute('aria-expanded', 'true');
    });

    it('should render the backdrop', async () => {
      const {element, getBackdrop} = await renderTabPopover();

      element.toggle();
      await element.updateComplete;

      const backdrop = getBackdrop();

      expect(backdrop).not.toBeNull();
    });

    it('should rotate the arrow icon', async () => {
      const {element, getArrowIcon} = await renderTabPopover();

      element.toggle();
      await element.updateComplete;

      const icon = getArrowIcon();

      expect(icon?.classList.contains('rotate-180')).toBe(true);
    });

    it('should add z-9999 class to relative container', async () => {
      const {element} = await renderTabPopover();

      element.toggle();
      await element.updateComplete;

      const relativeContainer = element.shadowRoot?.querySelector('.relative');

      expect(relativeContainer?.classList.contains('z-9999')).toBe(true);
    });
  });

  describe('button', () => {
    it('should render with correct aria-controls', async () => {
      const {getButton} = await renderTabPopover();
      const button = getButton();

      expect(button).toHaveAttribute('aria-controls', 'atomic-tab-popover');
    });

    it('should render with correct part', async () => {
      const {getButton} = await renderTabPopover();
      const button = getButton();

      expect(button).toHaveAttribute('part', 'popover-button');
    });

    it('should render the "more" label text', async () => {
      const {getValueLabel} = await renderTabPopover();
      const valueLabel = getValueLabel();

      expect(valueLabel).toHaveTextContent('More');
    });

    it('should toggle popover when clicked', async () => {
      const {element, getButton, getPopoverList} = await renderTabPopover();
      const button = getButton();

      button?.click();
      await element.updateComplete;

      const popoverList = getPopoverList();
      expect(popoverList?.classList.contains('flex')).toBe(true);
    });
  });

  describe('popover list', () => {
    it('should have the correct id', async () => {
      const {getPopoverList} = await renderTabPopover();
      const popoverList = getPopoverList();

      expect(popoverList).toHaveAttribute('id', 'atomic-tab-popover');
    });

    it('should have the overflow-tabs part', async () => {
      const {getPopoverList} = await renderTabPopover();
      const popoverList = getPopoverList();

      expect(popoverList).toHaveAttribute('part', 'overflow-tabs');
    });
  });

  describe('backdrop', () => {
    it('should close popover when clicked', async () => {
      const {element, getBackdrop, getPopoverList} = await renderTabPopover();

      element.toggle();
      await element.updateComplete;

      const backdrop = getBackdrop();
      backdrop?.click();
      await element.updateComplete;

      const popoverList = getPopoverList();
      expect(popoverList?.classList.contains('hidden')).toBe(true);
    });
  });

  describe('#toggle', () => {
    it('should open the popover when closed', async () => {
      const {element, getPopoverList} = await renderTabPopover();

      element.toggle();
      await element.updateComplete;

      const popoverList = getPopoverList();
      expect(popoverList?.classList.contains('flex')).toBe(true);
    });

    it('should close the popover when open', async () => {
      const {element, getPopoverList} = await renderTabPopover();

      element.toggle();
      await element.updateComplete;
      element.toggle();
      await element.updateComplete;

      const popoverList = getPopoverList();
      expect(popoverList?.classList.contains('hidden')).toBe(true);
    });
  });

  describe('#setButtonVisibility', () => {
    it('should show the component when called with true', async () => {
      const {element} = await renderTabPopover({show: false});

      element.setButtonVisibility(true);
      await element.updateComplete;

      expect(element.classList.contains('visibility-hidden')).toBe(false);
      expect(element).toHaveAttribute('aria-hidden', 'false');
    });

    it('should hide the component when called with false', async () => {
      const {element} = await renderTabPopover({show: true});

      element.setButtonVisibility(false);
      await element.updateComplete;

      expect(element.classList.contains('visibility-hidden')).toBe(true);
      expect(element).toHaveAttribute('aria-hidden', 'true');
    });
  });
});
