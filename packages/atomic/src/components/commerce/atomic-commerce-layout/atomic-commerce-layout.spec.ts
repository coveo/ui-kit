import {renderInAtomicCommerceInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/commerce/atomic-commerce-interface-fixture';
import {page} from '@vitest/browser/context';
import {html} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import {beforeEach, describe, expect, it} from 'vitest';
import {AtomicCommerceLayout} from './atomic-commerce-layout';

describe('atomic-commerce-layout', () => {
  const locators = {
    get layout() {
      return page.getByTestId('atomic-commerce-layout');
    },

    get facets() {
      return page.getByTestId('facets');
    },

    get filterButton() {
      return page.getByText('Sort & Filter');
    },
  };

  const setupElement = async (props?: {mobileBreakpoint?: string}) => {
    const {element} =
      await renderInAtomicCommerceInterface<AtomicCommerceLayout>({
        template: html`<atomic-commerce-layout
          data-testid="atomic-commerce-layout"
          mobile-breakpoint="${ifDefined(props?.mobileBreakpoint)}"
        >
          <atomic-layout-section
            data-testid="facets"
            section="facets"
          ></atomic-layout-section>
        </atomic-commerce-layout>`,
        selector: 'atomic-commerce-layout',
      });

    return element;

    // expect(element).toBeInstanceOf(AtomicCommerceLayout);
  };

  it('should reflects mobileBreakpoint property to attribute', async () => {
    await setupElement({mobileBreakpoint: '900px'});
    await expect(locators.layout).toHaveAttribute('mobile-breakpoint', '900px');
  });

  it('uses default mobileBreakpoint if not set', async () => {
    await setupElement();
    await expect(locators.layout).toHaveAttribute(
      'mobile-breakpoint',
      '1024px'
    );
  });

  describe('when the viewport is larger than the mobile breakpoint', () => {
    beforeEach(async () => {
      await page.viewport(1200, 800);
      await setupElement({mobileBreakpoint: '900px'});
    });

    it('should not render filter button', async () => {
      await expect(locators.filterButton).not.toBeVisible();
    });

    it('should render facets section', async () => {
      await expect(locators.facets).toBeVisible();
    });
  });

  describe('when the viewport is smaller than the mobile breakpoint', () => {
    beforeEach(async () => {
      await page.viewport(800, 600);
      await setupElement({mobileBreakpoint: '900px'});
    });

    it('should render filter button', async () => {
      await expect(locators.filterButton).toBeVisible();
    });

    it('should not render facets section', async () => {
      await expect(locators.facets).not.toBeVisible();
    });
  });
});
