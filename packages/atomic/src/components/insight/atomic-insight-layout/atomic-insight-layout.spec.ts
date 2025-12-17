import {html} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import {beforeAll, describe, expect, it} from 'vitest';
import {page} from 'vitest/browser';
import '@/src/components/common/atomic-layout-section/atomic-layout-section';
import './atomic-insight-layout';
import {renderInAtomicInsightInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/insight/atomic-insight-interface-fixture';
import {AtomicInsightLayout} from './atomic-insight-layout';

describe('atomic-insight-layout', () => {
  const renderInsightLayout = async (
    widget?: boolean,
    mobileBreakpoint?: string
  ) => {
    const {element, atomicInterface} =
      await renderInAtomicInsightInterface<AtomicInsightLayout>({
        template: html`<atomic-insight-layout
          ?widget="${widget}"
          mobile-breakpoint="${ifDefined(mobileBreakpoint)}"
        >
          <atomic-layout-section data-testid="facets" section="facets">
            facets...
          </atomic-layout-section>
          <atomic-layout-section data-testid="results" section="results">
            results...
          </atomic-layout-section>
        </atomic-insight-layout>`,
        selector: 'atomic-insight-layout',
      });

    return {
      element,
      atomicInterface,
      get facets() {
        return page.getByTestId('facets');
      },
      get results() {
        return page.getByTestId('results');
      },
    };
  };

  it('should render the component', async () => {
    const {element} = await renderInsightLayout();
    expect(element).toBeTruthy();
  });

  it('should reflect widget property to attribute', async () => {
    const {element} = await renderInsightLayout(true);
    expect(element).toHaveAttribute('widget');
  });

  it('should not have widget attribute when false', async () => {
    const {element} = await renderInsightLayout(false);
    expect(element).not.toHaveAttribute('widget');
  });

  it('should reflect mobileBreakpoint property to attribute', async () => {
    const {element} = await renderInsightLayout(false, '900px');
    expect(element).toHaveAttribute('mobile-breakpoint', '900px');
  });

  it('should use default mobileBreakpoint if not set', async () => {
    const {element} = await renderInsightLayout();
    expect(element).toHaveAttribute('mobile-breakpoint', '1024px');
  });

  it('should add layout css on connectedCallback', async () => {
    await renderInsightLayout();
    expect(AtomicInsightLayout.styles.length).toBeGreaterThan(0);
  });

  describe('#layoutStylesController', () => {
    it('should initialize LayoutStylesController', async () => {
      const {element} = await renderInsightLayout();
      // biome-ignore lint/complexity/useLiteralKeys: <accessing private property for testing>
      expect(element['layoutStylesController']).toBeDefined();
    });
  });

  describe('when the viewport is larger than the mobile breakpoint', () => {
    beforeAll(async () => {
      await page.viewport(1500, 1200);
    });

    it('should render results section', async () => {
      const {results} = await renderInsightLayout(false, '900px');
      expect(results).toBeVisible();
    });
  });

  describe('when the viewport is smaller than the mobile breakpoint', () => {
    beforeAll(async () => {
      await page.viewport(800, 600);
    });

    it('should render results section', async () => {
      const {results} = await renderInsightLayout(false, '900px');
      expect(results).toBeVisible();
    });
  });

  describe('when widget mode is enabled', () => {
    it('should reflect widget attribute', async () => {
      const {element} = await renderInsightLayout(true);
      expect(element).toHaveAttribute('widget');
    });
  });
});
