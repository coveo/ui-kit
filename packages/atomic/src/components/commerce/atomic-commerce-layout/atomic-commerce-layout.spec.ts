import {page} from '@vitest/browser/context';
import {html} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import {beforeAll, beforeEach, describe, expect, it} from 'vitest';
import {fixture} from '@/vitest-utils/testing-helpers/fixture';
import '../atomic-commerce-interface/atomic-commerce-interface';
import './atomic-commerce-layout';

describe('atomic-commerce-layout', () => {
  const locators = {
    get layout() {
      return page.getByTestId('atomic-commerce-layout');
    },

    get facets() {
      return page.getByTestId('facets');
    },

    get main() {
      return page.getByTestId('main');
    },
  };

  const setupElement = async (props?: {mobileBreakpoint?: string}) => {
    return fixture(
      html`<atomic-commerce-interface>
        <atomic-commerce-layout
          data-testid="atomic-commerce-layout"
          mobile-breakpoint="${ifDefined(props?.mobileBreakpoint)}"
        >
          <atomic-layout-section data-testid="facets" section="facets">
            facets...
          </atomic-layout-section>
          <atomic-layout-section data-testid="main" section="main">
            main...
          </atomic-layout-section>
        </atomic-commerce-layout>
      </atomic-commerce-interface>`
    );
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
    beforeAll(async () => {
      await page.viewport(1200, 800);
    });

    beforeEach(async () => {
      await setupElement({mobileBreakpoint: '900px'});
    });

    it('should render facets section', async () => {
      await expect(locators.facets).toBeVisible();
    });

    it('should always render main section', async () => {
      await expect(locators.main).toBeVisible();
    });
  });

  describe('when the viewport is smaller than the mobile breakpoint', () => {
    beforeAll(async () => {
      await page.viewport(800, 600);
    });

    beforeEach(async () => {
      await setupElement({mobileBreakpoint: '900px'});
    });

    it('should not render facets section', async () => {
      await expect(locators.facets).not.toBeVisible();
    });

    it('should always render main section', async () => {
      await expect(locators.main).toBeVisible();
    });
  });
});
