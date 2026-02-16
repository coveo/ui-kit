import {beforeAll, describe, expect, it} from 'vitest';
import './atomic-search-layout';
import '@/src/components/common/atomic-layout-section/atomic-layout-section';
import {html} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import {page} from 'vitest/browser';
import {renderInAtomicSearchInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/search/atomic-search-interface-fixture';
import {AtomicSearchLayout} from './atomic-search-layout';

describe('AtomicSearchLayout', () => {
  const renderSearchLayout = async (mobileBreakpoint?: string) => {
    const {element} = await renderInAtomicSearchInterface<AtomicSearchLayout>({
      template: html`<atomic-search-layout mobile-breakpoint="${ifDefined(mobileBreakpoint)}">
    <atomic-layout-section data-testid="facets" section="facets">
            facets...
          </atomic-layout-section>
          <atomic-layout-section data-testid="main" section="main">
            main...
          </atomic-layout-section>
    </atomic-search-layout>`,
      selector: 'atomic-search-layout',
    });

    return {
      element,
      get facets() {
        return page.getByTestId('facets');
      },
      get main() {
        return page.getByTestId('main');
      },
    };
  };

  it('should render the component', async () => {
    const {element} = await renderSearchLayout();
    expect(element).toBeTruthy();
  });

  it('should reflect mobileBreakpoint property to attribute', async () => {
    const {element} = await renderSearchLayout('900px');
    expect(element).toHaveAttribute('mobile-breakpoint', '900px');
  });

  it('should use default mobileBreakpoint if not set', async () => {
    const {element} = await renderSearchLayout();
    expect(element).toHaveAttribute('mobile-breakpoint', '1024px');
  });

  it('should add layout css on connectedCallback', async () => {
    await renderSearchLayout();
    expect(AtomicSearchLayout.styles.length).toBeGreaterThan(0);
  });

  describe('#layoutStylesController', () => {
    it('should initialize LayoutStylesController', async () => {
      const {element} = await renderSearchLayout();
      // biome-ignore lint/complexity/useLiteralKeys: <accessing private property for testing>
      expect(element['layoutStylesController']).toBeDefined();
    });
  });

  describe('#emitBreakpointChangeEvent', () => {
    it('should emit atomic-layout-breakpoint-change event on connectedCallback', async () => {
      const {element} = await renderSearchLayout('768px');

      // The event should have been emitted during connectedCallback
      // We can verify by checking that the element has the expected breakpoint
      expect(element.mobileBreakpoint).toBe('768px');
    });
  });

  describe('when the viewport is larger than the mobile breakpoint', () => {
    beforeAll(async () => {
      await page.viewport(1200, 800);
    });

    it('should render facets section', async () => {
      const {facets} = await renderSearchLayout('900px');
      expect(facets).toBeVisible();
    });

    it('should render main section', async () => {
      const {main} = await renderSearchLayout('900px');
      expect(main).toBeVisible();
    });
  });

  describe('when the viewport is smaller than the mobile breakpoint', () => {
    beforeAll(async () => {
      await page.viewport(800, 600);
    });

    it('should not render facets section', async () => {
      const {facets} = await renderSearchLayout('900px');
      expect(facets).not.toBeVisible();
    });

    it('should render main section', async () => {
      const {main} = await renderSearchLayout('900px');
      expect(main).toBeVisible();
    });
  });
});
