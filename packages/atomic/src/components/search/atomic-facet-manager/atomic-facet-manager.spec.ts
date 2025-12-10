import type {FacetManager} from '@coveo/headless';
import {buildFacetManager} from '@coveo/headless';
import {html} from 'lit';
import {beforeEach, describe, expect, it, type MockInstance, vi} from 'vitest';
import {page} from 'vitest/browser';
import {renderInAtomicSearchInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/search/atomic-search-interface-fixture';
import {buildFakeFacetManager} from '@/vitest-utils/testing-helpers/fixtures/headless/search/facet-manager';
import {AtomicFacetManager} from './atomic-facet-manager';
import './atomic-facet-manager';

vi.mock('@coveo/headless', {spy: true});

describe('atomic-facet-manager', () => {
  let mockFacetManager: FacetManager;
  let consoleWarnSpy: MockInstance;

  const renderComponent = async ({
    props = {},
    slottedContent = '',
    controllerState = {},
  }: {
    props?: Partial<AtomicFacetManager>;
    slottedContent?: string;
    controllerState?: Partial<typeof mockFacetManager.state>;
  } = {}) => {
    vi.mocked(buildFacetManager).mockReturnValue(
      buildFakeFacetManager({state: controllerState})
    );

    const template = html`
      <atomic-facet-manager
        .collapseFacetsAfter=${props.collapseFacetsAfter ?? 4}
      >
        ${slottedContent}
      </atomic-facet-manager>
    `;

    const {element, atomicInterface} =
      await renderInAtomicSearchInterface<AtomicFacetManager>({
        template,
        selector: 'atomic-facet-manager',
        bindings: (bindings) => {
          bindings.store = {
            ...bindings.store,
            getAllFacets: vi.fn(() => ({})),
          } as never;
          return bindings;
        },
      });

    await atomicInterface.updateComplete;
    await element?.updateComplete;

    return {
      element,
      atomicInterface,
    };
  };

  beforeEach(() => {
    mockFacetManager = buildFakeFacetManager();
  });

  it('should be defined', () => {
    const el = document.createElement('atomic-facet-manager');
    expect(el).toBeInstanceOf(AtomicFacetManager);
  });

  describe('when initialized', () => {
    it('should build a facet manager controller', async () => {
      await renderComponent();
      expect(buildFacetManager).toHaveBeenCalled();
    });

    it('should have default collapseFacetsAfter property of 4', async () => {
      const {element} = await renderComponent();
      expect(element?.collapseFacetsAfter).toBe(4);
    });
  });

  describe('when collapseFacetsAfter prop is set', () => {
    it('should accept valid values', async () => {
      const {element} = await renderComponent({
        props: {collapseFacetsAfter: 2},
      });
      expect(element?.collapseFacetsAfter).toBe(2);
    });

    it('should accept 0 to collapse all facets', async () => {
      const {element} = await renderComponent({
        props: {collapseFacetsAfter: 0},
      });
      expect(element?.collapseFacetsAfter).toBe(0);
    });

    it('should accept -1 to disable auto-collapse', async () => {
      const {element} = await renderComponent({
        props: {collapseFacetsAfter: -1},
      });
      expect(element?.collapseFacetsAfter).toBe(-1);
    });

    describe('when value is invalid', () => {
      beforeEach(() => {
        consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      });

      it('should warn when collapseFacetsAfter is less than -1', async () => {
        await renderComponent({props: {collapseFacetsAfter: -2}});
        expect(consoleWarnSpy).toHaveBeenCalled();
      });
    });
  });

  describe('when rendering', () => {
    it('should render a slot for facets', async () => {
      const {element} = await renderComponent();
      const slot = element?.shadowRoot?.querySelector('slot');
      expect(slot).toBeDefined();
    });

    it('should allow slotted content', async () => {
      await renderComponent({
        slottedContent: '<div class="test-content">Test</div>',
      });
      await expect.element(page.getByText('Test')).toBeInTheDocument();
    });
  });

  describe('lifecycle', () => {
    it('should listen to i18n language changes on initialization', async () => {
      const {atomicInterface} = await renderComponent();
      const i18n = atomicInterface.bindings.i18n;

      expect(i18n.listenerCount('languageChanged')).toBeGreaterThan(0);
    });

    it('should clean up i18n listener on disconnection', async () => {
      const {element, atomicInterface} = await renderComponent();
      const i18n = atomicInterface.bindings.i18n;
      const initialListenerCount = i18n.listenerCount('languageChanged');

      element?.remove();
      await element?.updateComplete;

      expect(i18n.listenerCount('languageChanged')).toBeLessThan(
        initialListenerCount
      );
    });
  });
});
