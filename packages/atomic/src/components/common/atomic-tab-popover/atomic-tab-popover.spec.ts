import {html} from 'lit';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {page} from 'vitest/browser';
import {renderInAtomicSearchInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/search/atomic-search-interface-fixture';
import {buildFakeSearchEngine} from '@/vitest-utils/testing-helpers/fixtures/headless/search/engine';
import type {AtomicTabPopover} from './atomic-tab-popover';
import './atomic-tab-popover';

vi.mock('@coveo/headless', {spy: true});

describe('atomic-tab-popover', () => {
  const mockedEngine = buildFakeSearchEngine();

  beforeEach(async () => {
    console.error = vi.fn();
  });

  const renderTabPopover = async (
    options: {show?: boolean; slottedContent?: unknown} = {}
  ) => {
    const {element} = await renderInAtomicSearchInterface<AtomicTabPopover>({
      template: html`<atomic-tab-popover>
        ${options.slottedContent ?? html`<li><button>Tab 1</button></li><li><button>Tab 2</button></li>`}
      </atomic-tab-popover>`,
      selector: 'atomic-tab-popover',
      bindings: (bindings) => {
        bindings.engine = mockedEngine;
        return bindings;
      },
    });

    if (options.show) {
      element.setButtonVisibility(true);
    }

    await element.updateComplete;

    return {
      element,
      popoverButton: page.getByRole('button', {name: /popover menu/i}),
      parts: (el: AtomicTabPopover) => {
        const qs = (part: string) =>
          el?.shadowRoot?.querySelector(`[part="${part}"]`);
        return {
          popoverButton: qs('popover-button'),
          valueLabel: qs('value-label'),
          arrowIcon: qs('arrow-icon'),
          overflowTabs: qs('overflow-tabs'),
          backdrop: qs('backdrop'),
        };
      },
    };
  };

  describe('when not visible', () => {
    it('should render with visibility-hidden class', async () => {
      const {element} = await renderTabPopover();

      expect(element.classList.contains('visibility-hidden')).toBe(true);
    });

    it('should have aria-hidden true', async () => {
      const {element} = await renderTabPopover();

      expect(element.getAttribute('aria-hidden')).toBe('true');
    });
  });

  describe('when visible', () => {
    it('should render without visibility-hidden class when show is true', async () => {
      const {element} = await renderTabPopover({show: true});

      const container = element.shadowRoot?.querySelector('.visibility-hidden');
      expect(container).toBeNull();
    });

    it('should have aria-hidden false when show is true', async () => {
      const {element} = await renderTabPopover({show: true});

      expect(element.getAttribute('aria-hidden')).toBe('false');
    });

    it('should render the popover button', async () => {
      const {element, parts} = await renderTabPopover({show: true});

      const popoverButton = parts(element).popoverButton;
      expect(popoverButton).not.toBeNull();
    });

    it('should render the value label with "More" text', async () => {
      const {element, parts} = await renderTabPopover({show: true});

      const valueLabel = parts(element).valueLabel;
      expect(valueLabel).not.toBeNull();
      expect(valueLabel?.textContent?.trim()).toBe('More');
    });

    it('should render the arrow icon', async () => {
      const {element, parts} = await renderTabPopover({show: true});

      const arrowIcon = parts(element).arrowIcon;
      expect(arrowIcon).not.toBeNull();
    });

    it('should render the overflow tabs container', async () => {
      const {element, parts} = await renderTabPopover({show: true});

      const overflowTabs = parts(element).overflowTabs;
      expect(overflowTabs).not.toBeNull();
    });
  });

  describe('when popover is closed', () => {
    it('should have aria-expanded false on the button', async () => {
      const {element, parts} = await renderTabPopover({show: true});

      const popoverButton = parts(element).popoverButton;
      expect(popoverButton?.getAttribute('aria-expanded')).toBe('false');
    });

    it('should hide the overflow tabs', async () => {
      const {element, parts} = await renderTabPopover({show: true});

      const overflowTabs = parts(element).overflowTabs;
      expect(overflowTabs?.classList.contains('hidden')).toBe(true);
    });

    it('should not render backdrop', async () => {
      const {element, parts} = await renderTabPopover({show: true});

      const backdrop = parts(element).backdrop;
      expect(backdrop).toBeNull();
    });
  });

  describe('when popover is opened', () => {
    it('should have aria-expanded true on the button', async () => {
      const {element, parts} = await renderTabPopover({show: true});

      element.toggle();
      await element.updateComplete;

      const popoverButton = parts(element).popoverButton;
      expect(popoverButton?.getAttribute('aria-expanded')).toBe('true');
    });

    it('should show the overflow tabs', async () => {
      const {element, parts} = await renderTabPopover({show: true});

      element.toggle();
      await element.updateComplete;

      const overflowTabs = parts(element).overflowTabs;
      expect(overflowTabs?.classList.contains('flex')).toBe(true);
    });

    it('should render backdrop', async () => {
      const {element, parts} = await renderTabPopover({show: true});

      element.toggle();
      await element.updateComplete;

      const backdrop = parts(element).backdrop;
      expect(backdrop).not.toBeNull();
    });

    it('should rotate the arrow icon', async () => {
      const {element, parts} = await renderTabPopover({show: true});

      element.toggle();
      await element.updateComplete;

      const arrowIcon = parts(element).arrowIcon;
      expect(arrowIcon?.classList.contains('rotate-180')).toBe(true);
    });
  });

  it('should toggle isOpen state when toggle is called', async () => {
    const {element, parts} = await renderTabPopover({show: true});

    expect(parts(element).overflowTabs?.classList.contains('hidden')).toBe(
      true
    );

    element.toggle();
    await element.updateComplete;

    expect(parts(element).overflowTabs?.classList.contains('flex')).toBe(true);

    element.toggle();
    await element.updateComplete;

    expect(parts(element).overflowTabs?.classList.contains('hidden')).toBe(
      true
    );
  });

  describe('#setButtonVisibility', () => {
    it('should show component when set to true', async () => {
      const {element} = await renderTabPopover();

      element.setButtonVisibility(true);
      await element.updateComplete;

      const container = element.shadowRoot?.querySelector('.visibility-hidden');
      expect(container).toBeNull();
    });

    it('should hide component when set to false', async () => {
      const {element} = await renderTabPopover({show: true});

      element.setButtonVisibility(false);
      await element.updateComplete;

      expect(element.classList.contains('visibility-hidden')).toBe(true);
    });
  });

  it('should close popover when Escape key is pressed', async () => {
    const {element, parts} = await renderTabPopover({show: true});

    element.toggle();
    await element.updateComplete;
    expect(parts(element).overflowTabs?.classList.contains('flex')).toBe(true);

    // Focus the element before sending keyboard events
    element.focus();
    const keyEvent = new KeyboardEvent('keydown', {
      key: 'Escape',
      bubbles: true,
    });
    element.dispatchEvent(keyEvent);
    await element.updateComplete;

    expect(parts(element).overflowTabs?.classList.contains('hidden')).toBe(
      true
    );
  });
});
