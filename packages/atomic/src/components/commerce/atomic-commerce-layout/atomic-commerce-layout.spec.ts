import {html} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import {beforeAll, describe, expect, it} from 'vitest';
import {page} from 'vitest/browser';
import '@/src/components/common/atomic-layout-section/atomic-layout-section';
import './atomic-commerce-layout';
import {renderInAtomicCommerceInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/commerce/atomic-commerce-interface-fixture';
import {AtomicCommerceLayout} from './atomic-commerce-layout';

describe('atomic-commerce-layout', () => {
  const renderCommerceLayout = async (mobileBreakpoint?: string) => {
    const {element, atomicInterface} =
      await renderInAtomicCommerceInterface<AtomicCommerceLayout>({
        template: html`<atomic-commerce-layout
        mobile-breakpoint="${ifDefined(mobileBreakpoint)}"
      >
        <atomic-layout-section data-testid="facets" section="facets">
          facets...
        </atomic-layout-section>
        <atomic-layout-section data-testid="main" section="main">
          main...
        </atomic-layout-section>
      </atomic-commerce-layout>`,
        selector: 'atomic-commerce-layout',
      });

    return {
      element,
      atomicInterface,
      get facets() {
        return page.getByTestId('facets');
      },
      get main() {
        return page.getByTestId('main');
      },
    };
  };

  it('should render the component', async () => {
    const {element} = await renderCommerceLayout();
    expect(element).toBeTruthy();
  });

  it('should reflect mobileBreakpoint property to attribute', async () => {
    const {element} = await renderCommerceLayout('900px');
    expect(element).toHaveAttribute('mobile-breakpoint', '900px');
  });

  it('should use default mobileBreakpoint if not set', async () => {
    const {element} = await renderCommerceLayout();
    expect(element).toHaveAttribute('mobile-breakpoint', '1024px');
  });

  it('should add layout css on connectedCallback', async () => {
    await renderCommerceLayout();
    expect(AtomicCommerceLayout.styles.length).toBeGreaterThan(0);
  });

  describe('#layoutStylesController', () => {
    it('should initialize LayoutStylesController', async () => {
      const {element} = await renderCommerceLayout();
      // biome-ignore lint/complexity/useLiteralKeys: <accessing private property for testing>
      expect(element['layoutStylesController']).toBeDefined();
    });
  });

  describe('#emitBreakpointChangeEvent', () => {
    it('should emit atomic-layout-breakpoint-change event on connectedCallback', async () => {
      const {element} = await renderCommerceLayout('768px');
      expect(element.mobileBreakpoint).toBe('768px');
    });
  });

  describe('when the viewport is larger than the mobile breakpoint', () => {
    beforeAll(async () => {
      await page.viewport(1500, 1200);
    });

    it('should render facets section', async () => {
      const {facets} = await renderCommerceLayout('900px');
      expect(facets).toBeVisible();
    });

    it('should render main section', async () => {
      const {main} = await renderCommerceLayout('900px');
      expect(main).toBeVisible();
    });
  });

  describe('when the viewport is smaller than the mobile breakpoint', () => {
    beforeAll(async () => {
      await page.viewport(800, 600);
    });

    it('should not render facets section', async () => {
      const {facets} = await renderCommerceLayout('900px');
      expect(facets).not.toBeVisible();
    });

    it('should render main section', async () => {
      const {main} = await renderCommerceLayout('900px');
      expect(main).toBeVisible();
    });
  });
});
